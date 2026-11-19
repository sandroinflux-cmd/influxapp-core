import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PAID_STATUSES = ['approved', 'completed', 'success', 'paid']
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

export async function GET(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return noStore({ error: 'INVALID_TOKEN' }, 404)
    }

    const token = new URL(request.url).searchParams.get('token')?.trim()
    if (!token) return noStore({ error: 'INVALID_TOKEN' }, 404)

    const supabase = adminClient()
    const { data: brand, error: brandError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('monitor_token', token)
      .maybeSingle()

    if (brandError || !brand || String(brand.role || '').toLowerCase() !== 'brand') {
      return noStore({ error: 'INVALID_TOKEN' }, 404)
    }

    const { data: rows, error: txError } = await supabase
      .from('transactions')
      .select('id, amount, bill_amount, final_amount, discount_percent, status, created_at, customer_phone, gift_unlocked, gift_description, deal_id, influencer_id')
      .eq('brand_id', brand.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (txError) throw new Error(txError.message)

    const transactions = rows || []
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
        .select('final_amount, status, created_at')
        .eq('brand_id', brand.id)
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
        timezone: 'Asia/Tbilisi',
      },
      transactions: transactions.map((row) => ({
        id: row.id,
        amount: row.amount ?? null,
        bill_amount: row.bill_amount ?? null,
        final_amount: row.final_amount ?? null,
        discount_percent: row.discount_percent ?? null,
        status: row.status || 'pending',
        created_at: row.created_at,
        customer_phone: row.customer_phone || null,
        gift_unlocked: Boolean(row.gift_unlocked),
        gift_description: row.gift_description || null,
        deal_id: row.deal_id || null,
        influencer_id: row.influencer_id || null,
        deal_title: row.deal_id ? dealTitle.get(row.deal_id) || null : null,
        influencer_name: row.influencer_id ? influencerName.get(row.influencer_id) || null : null,
      })),
    })
  } catch {
    return noStore({ error: 'MONITOR_UNAVAILABLE' }, 500)
  }
}
