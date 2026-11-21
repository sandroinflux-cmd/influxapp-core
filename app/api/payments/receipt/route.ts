import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { maskGeorgianPhone } from '@/lib/phone'
import { verifyBogTransaction } from '@/lib/verifyBogTransaction'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' }

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE })
}

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

  for (const column of ['bog_order_id', 'external_order_id', 'order_id', 'reference']) {
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
      return json({ error: 'Server configuration error' }, 500)
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id') || url.searchParams.get('txid') || url.searchParams.get('tx')
    if (!id) return json({ error: 'Transaction id is required' }, 400)

    const supabase = adminClient()
    let tx = await findTransaction(supabase, id)
    if (!tx) return json({ error: 'Transaction not found' }, 404)

    if (tx.status === 'pending' && tx.bog_order_id) {
      try {
        await verifyBogTransaction(supabase, tx)
        const refreshed = await findTransaction(supabase, String(tx.id))
        if (refreshed) tx = refreshed
      } catch (healError: any) {
        console.error('BOG self-heal failed:', healError?.message || healError)
      }
    }

    const dealQuery = tx.deal_id
      ? await supabase.from('deals').select('title, delivery_estimate').eq('id', tx.deal_id).maybeSingle()
      : { data: null }

    const brandQuery = tx.brand_id
      ? await supabase.from('profiles').select('full_name').eq('id', tx.brand_id).maybeSingle()
      : { data: null }

    return json({
      id: tx.id,
      status: tx.status ?? null,
      final_amount: Number(tx.final_amount || 0),
      deal_title: dealQuery.data?.title || null,
      brand_name: brandQuery.data?.full_name || null,
      gift_description: tx.gift_description || null,
      delivery_estimate: dealQuery.data?.delivery_estimate || null,
      customer_city: tx.customer_city || null,
      customer_phone: tx.customer_phone ? maskGeorgianPhone(tx.customer_phone) : null,
    })
  } catch (error: any) {
    return json({ error: error.message || 'Receipt lookup failed' }, 500)
  }
}
