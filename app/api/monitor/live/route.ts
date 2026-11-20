import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PAID_STATUSES = ['approved', 'completed', 'success', 'paid']
const FULFILLMENT_STATUSES = ['pending', 'shipped', 'delivered']
const TBILISI_OFFSET_MS = 4 * 60 * 60 * 1000

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function tbilisiDayStart(now = new Date()) {
  const shifted = new Date(now.getTime() + TBILISI_OFFSET_MS)
  return new Date(Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  ) - TBILISI_OFFSET_MS)
}

function isPaid(status: unknown) {
  return PAID_STATUSES.includes(String(status || '').toLowerCase())
}

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

async function brandForToken(token: string) {
  const supabase = adminClient()
  const { data: brand, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .eq('monitor_token', token)
    .maybeSingle()

  if (error || !brand || String(brand.role || '').toLowerCase() !== 'brand') return null
  return { supabase, brand }
}

export async function GET(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return noStore({ error: 'INVALID_TOKEN' }, 404)
    }

    const token = new URL(request.url).searchParams.get('token')?.trim()
    if (!token) return noStore({ error: 'INVALID_TOKEN' }, 404)

    const authorized = await brandForToken(token)
    if (!authorized) return noStore({ error: 'INVALID_TOKEN' }, 404)
    const { supabase, brand } = authorized

    const { data: rows, error: txError } = await supabase
      .from('transactions')
      .select('id, final_amount, brand_earned, status, created_at, customer_name, customer_phone, customer_city, customer_address, delivery_note, gift_description, fulfillment_status, payout_status, deal_id, influencer_id')
      .eq('brand_id', brand.id)
      .in('status', PAID_STATUSES)
      .order('created_at', { ascending: false })
      .limit(500)

    if (txError) throw new Error(txError.message)

    const transactions = (rows || []).filter((row) => isPaid(row.status))
    const dealIds = [...new Set(transactions.map((row) => row.deal_id).filter(Boolean))]
    const influencerIds = [...new Set(transactions.map((row) => row.influencer_id).filter(Boolean))]

    const [dealsResult, influencersResult, todayResult] = await Promise.all([
      dealIds.length
        ? supabase.from('deals').select('id, title').in('id', dealIds)
        : Promise.resolve({ data: [] as { id: string; title: string | null }[], error: null }),
      influencerIds.length
        ? supabase.from('profiles').select('id, full_name').in('id', influencerIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string | null }[], error: null }),
      supabase
        .from('transactions')
        .select('final_amount, brand_earned, status, created_at')
        .eq('brand_id', brand.id)
        .in('status', PAID_STATUSES)
        .gte('created_at', tbilisiDayStart().toISOString()),
    ])

    const dealTitle = new Map((dealsResult.data || []).map((deal) => [deal.id, deal.title || null]))
    const influencerName = new Map((influencersResult.data || []).map((profile) => [profile.id, profile.full_name || null]))
    const todaySource = todayResult.error ? transactions : (todayResult.data || [])
    const dayStart = tbilisiDayStart().getTime()
    const todayRows = todaySource.filter((row) => isPaid(row.status) && new Date(row.created_at).getTime() >= dayStart)

    return noStore({
      brand: {
        id: brand.id,
        full_name: brand.full_name || 'Brand',
        avatar_url: brand.avatar_url || null,
      },
      stats: {
        todayCount: todayRows.length,
        todayTotal: Number(todayRows.reduce((sum, row) => sum + Number(row.final_amount || 0), 0).toFixed(2)),
        todayBrand: Number(todayRows.reduce((sum, row) => sum + Number(row.brand_earned || 0), 0).toFixed(2)),
        timezone: 'Asia/Tbilisi',
      },
      transactions: transactions.map((row) => ({
        id: row.id,
        created_at: row.created_at,
        final_amount: row.final_amount ?? null,
        brand_earned: row.brand_earned ?? null,
        deal_title: row.deal_id ? dealTitle.get(row.deal_id) || null : null,
        influencer_name: row.influencer_id ? influencerName.get(row.influencer_id) || null : null,
        gift_description: row.gift_description || null,
        customer_name: row.customer_name || null,
        customer_phone: row.customer_phone || null,
        customer_city: row.customer_city || null,
        customer_address: row.customer_address || null,
        delivery_note: row.delivery_note || null,
        fulfillment_status: row.fulfillment_status || 'pending',
        payout_status: row.payout_status || null,
        status: row.status || 'approved',
      })),
    })
  } catch {
    return noStore({ error: 'MONITOR_UNAVAILABLE' }, 500)
  }
}

export async function PATCH(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return noStore({ error: 'INVALID_TOKEN' }, 404)
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return noStore({ error: 'INVALID_BODY' }, 400)
    }

    const token = asText(body?.token) || new URL(request.url).searchParams.get('token')?.trim() || ''
    const transactionId = asText(body?.transactionId)
    const fulfillmentStatus = asText(body?.fulfillment_status).toLowerCase()

    if (!token) return noStore({ error: 'INVALID_TOKEN' }, 404)
    if (!transactionId || !FULFILLMENT_STATUSES.includes(fulfillmentStatus)) {
      return noStore({ error: 'INVALID_UPDATE' }, 400)
    }

    const authorized = await brandForToken(token)
    if (!authorized) return noStore({ error: 'INVALID_TOKEN' }, 404)
    const { supabase, brand } = authorized

    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('id, brand_id')
      .eq('id', transactionId)
      .maybeSingle()

    if (txError) throw new Error(txError.message)
    if (!tx || tx.brand_id !== brand.id) return noStore({ error: 'NOT_FOUND' }, 404)

    const { data: updated, error: updateError } = await supabase
      .from('transactions')
      .update({ fulfillment_status: fulfillmentStatus })
      .eq('id', transactionId)
      .eq('brand_id', brand.id)
      .select('id, fulfillment_status')
      .maybeSingle()

    if (updateError) throw new Error(updateError.message)
    return noStore({ ok: true, transaction: updated })
  } catch {
    return noStore({ error: 'MONITOR_UNAVAILABLE' }, 500)
  }
}
