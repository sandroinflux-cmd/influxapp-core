import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

function missingColumn(message?: string) {
  return /column|schema cache/i.test(message || '')
}

async function findTransaction(supabase: ReturnType<typeof adminClient>, id: string) {
  const byId = await supabase.from('transactions').select('*').eq('id', id).maybeSingle()
  if (byId.data) return byId.data
  if (byId.error && !/invalid input syntax/i.test(byId.error.message || '')) {
    throw new Error(byId.error.message)
  }

  for (const column of ['external_order_id', 'order_id', 'reference']) {
    const attempt = await supabase.from('transactions').select('*').eq(column, id).maybeSingle()
    if (attempt.data) return attempt.data
    if (attempt.error && !missingColumn(attempt.error.message) && !/invalid input syntax/i.test(attempt.error.message || '')) {
      throw new Error(attempt.error.message)
    }
  }

  return null
}

export async function GET(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id') || url.searchParams.get('txid') || url.searchParams.get('tx')
    if (!id) {
      return NextResponse.json({ error: 'Transaction id is required' }, { status: 400 })
    }

    const supabase = adminClient()
    const tx = await findTransaction(supabase, id)
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const dealQuery = tx.deal_id
      ? await supabase
          .from('deals')
          .select('title, gift_description, gift_threshold, gift_image_url, logo')
          .eq('id', tx.deal_id)
          .maybeSingle()
      : { data: null }

    const brandQuery = tx.brand_id
      ? await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', tx.brand_id)
          .maybeSingle()
      : { data: null }

    const amount = Number(tx.bill_amount ?? tx.amount ?? 0)
    const finalAmount = Number(tx.final_amount ?? 0)

    return NextResponse.json({
      transaction: {
        id: tx.id,
        amount,
        final_amount: finalAmount,
        bill_amount: amount,
        discount_percent: tx.discount_percent ?? null,
        status: tx.status ?? null,
        created_at: tx.created_at ?? null,
        gift_unlocked: Boolean(tx.gift_unlocked),
        gift_description: tx.gift_description || null,
        customer_phone: tx.customer_phone || null,
      },
      deal: dealQuery.data
        ? {
            title: dealQuery.data.title || null,
            gift_description: dealQuery.data.gift_description || null,
            gift_threshold: Number(dealQuery.data.gift_threshold || 0),
            gift_image_url: dealQuery.data.gift_image_url || null,
            logo: dealQuery.data.logo || null,
          }
        : null,
      brand: brandQuery.data
        ? {
            full_name: brandQuery.data.full_name || null,
            avatar_url: brandQuery.data.avatar_url || null,
          }
        : null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Receipt lookup failed' }, { status: 500 })
  }
}
