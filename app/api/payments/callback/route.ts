import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { verifyBogTransaction } from '@/lib/verifyBogTransaction'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

function asText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

export async function POST(request: Request) {
  try {
    let payload: any = {}
    try {
      const text = await request.text()
      payload = text ? JSON.parse(text) : {}
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const eventData = payload?.body || payload || {}
    const externalId = asText(eventData.external_order_id) || asText(eventData.shop_order_id)
    const payloadOrderId = asText(eventData.order_id) || asText(eventData.id)

    if (!externalId && !payloadOrderId) {
      return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 })
    }

    const supabase = adminClient()

    let tx: any = null
    if (externalId) {
      const byId = await supabase.from('transactions').select('*').eq('id', externalId).maybeSingle()
      if (byId.error && !/invalid input syntax/i.test(byId.error.message || '')) throw byId.error
      tx = byId.data
    }
    if (!tx && payloadOrderId) {
      const byBog = await supabase.from('transactions').select('*').eq('bog_order_id', payloadOrderId).maybeSingle()
      if (byBog.error && !/column|schema cache/i.test(byBog.error.message || '')) throw byBog.error
      tx = byBog.data
    }

    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    if (tx.status === 'approved') return NextResponse.json({ message: 'OK' }, { status: 200 })
    if (!tx.bog_order_id) return NextResponse.json({ error: 'Missing bank order id' }, { status: 409 })

    const result = await verifyBogTransaction(supabase, tx)

    if (result.outcome === 'order_mismatch') {
      return NextResponse.json({ error: 'Order mismatch' }, { status: 409 })
    }
    if (result.outcome === 'amount_mismatch') {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 409 })
    }
    if (result.outcome === 'missing_order') {
      return NextResponse.json({ error: 'Missing bank order id' }, { status: 409 })
    }
    if (result.outcome === 'already_approved') {
      return NextResponse.json({ message: 'OK' }, { status: 200 })
    }

    return NextResponse.json({ message: 'Callback processed successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Webhook error:', error?.message || 'Server Error')
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}
