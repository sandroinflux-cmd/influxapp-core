import type { SupabaseClient } from '@supabase/supabase-js'
import { bogStatusKey, fetchBogOrder } from '@/lib/bog'

const APPROVED = new Set(['completed', 'approved', 'success'])
const REJECTED = new Set(['rejected', 'failed', 'error', 'cancelled', 'canceled'])
const AMOUNT_TOLERANCE_GEL = 0.02

export type BogVerifyOutcome =
  | 'approved'
  | 'already_approved'
  | 'rejected'
  | 'pending'
  | 'amount_mismatch'
  | 'order_mismatch'
  | 'missing_order'

type TransactionRow = {
  id: string
  status?: string | null
  bog_order_id?: string | null
  payout_status?: string | null
  final_amount?: number | string | null
  deal_id?: string | null
  brand_id?: string | null
  influencer_id?: string | null
  gift_description?: string | null
  customer_name?: string | null
  customer_phone?: string | null
  customer_city?: string | null
  customer_address?: string | null
  delivery_note?: string | null
}

function asText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function shortOrderId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

function readAmount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** Paid amount from the BOG order payload, when the bank includes one. */
function bogPaidAmount(order: any): number | null {
  const purchase = order?.purchase_units
  const payment = order?.payment_detail
  const candidates = [
    purchase?.transfer_amount,
    purchase?.request_amount,
    purchase?.total_amount,
    purchase?.paid_amount,
    payment?.transfer_amount,
    payment?.amount,
    order?.transfer_amount,
    order?.paid_amount,
    order?.amount,
    order?.total_amount,
  ]
  for (const candidate of candidates) {
    const amount = readAmount(candidate)
    if (amount !== null) return amount
  }
  return null
}

function stockWasRejected(result: unknown): boolean {
  if (result === false) return true
  if (Array.isArray(result)) return result.some((row) => stockWasRejected(row))
  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>
    if ('increment_deal_stock_if_available' in record) {
      return stockWasRejected(record.increment_deal_stock_if_available)
    }
  }
  return false
}

async function notifyAdmin(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chatId) return

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
    })
    if (!response.ok) console.error('Telegram alert failed', response.status)
  } catch {
    console.error('Telegram alert failed')
  }
}

export async function verifyBogTransaction(
  supabase: SupabaseClient,
  tx: TransactionRow
): Promise<{ outcome: BogVerifyOutcome }> {
  if (tx.status === 'approved') return { outcome: 'already_approved' }
  if (!tx.bog_order_id) return { outcome: 'missing_order' }

  const verified = await fetchBogOrder(String(tx.bog_order_id))
  const verifiedExternal = asText(verified?.external_order_id)
  if (verifiedExternal && verifiedExternal !== tx.id) {
    return { outcome: 'order_mismatch' }
  }

  const statusKey = bogStatusKey(verified)

  if (REJECTED.has(statusKey)) {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'rejected' })
      .eq('id', tx.id)
      .neq('status', 'approved')
    if (error) throw error
    return { outcome: 'rejected' }
  }

  if (!APPROVED.has(statusKey)) {
    return { outcome: 'pending' }
  }

  const paidAmount = bogPaidAmount(verified)
  const expectedAmount = Number(tx.final_amount || 0)
  if (paidAmount !== null && Math.abs(paidAmount - expectedAmount) > AMOUNT_TOLERANCE_GEL) {
    console.error(
      `BOG amount mismatch for ${tx.id}: paid ${paidAmount} GEL, expected ${expectedAmount} GEL`
    )
    return { outcome: 'amount_mismatch' }
  }

  const patch: Record<string, string> = { status: 'approved' }
  // Settled means every required split leg was sent. Partial and held ledgers stay as recorded.
  if (tx.payout_status === 'split_sent') patch.payout_status = 'settled'

  const { data: updated, error: updateError } = await supabase
    .from('transactions')
    .update(patch)
    .eq('id', tx.id)
    .neq('status', 'approved')
    .select('id')
    .maybeSingle()

  if (updateError) throw updateError
  if (!updated) return { outcome: 'already_approved' }

  let oversell = false
  if (tx.deal_id) {
    try {
      const { data: stockResult, error: stockError } = await supabase.rpc('increment_deal_stock_if_available', {
        p_deal_id: tx.deal_id,
      })
      if (stockError || stockWasRejected(stockResult)) {
        oversell = true
        console.error(
          '⚠️ OVERSELL ALERT: stock_limit exceeded!',
          stockError?.message || stockResult
        )
      }
    } catch (error) {
      oversell = true
      console.error('⚠️ OVERSELL ALERT: stock_limit exceeded!', error)
    }
  }

  try {
    const [brandResult, influencerResult, dealResult] = await Promise.all([
      tx.brand_id
        ? supabase.from('profiles').select('full_name').eq('id', tx.brand_id).maybeSingle()
        : Promise.resolve({ data: null }),
      tx.influencer_id
        ? supabase.from('profiles').select('full_name').eq('id', tx.influencer_id).maybeSingle()
        : Promise.resolve({ data: null }),
      tx.deal_id
        ? supabase.from('deals').select('title, stock_limit, stock_sold').eq('id', tx.deal_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    const dealTitle = dealResult.data?.title || '—'
    const limit = Number(dealResult.data?.stock_limit || 0)
    const sold = Number(dealResult.data?.stock_sold || 0)
    const remainingLabel = limit > 0 ? `${Math.max(0, limit - sold)} / ${limit}` : '—'
    const paid = Number(tx.final_amount || 0).toFixed(2)
    const lines = [
      'InfluX — ახალი შეკვეთა',
      `Order: ${shortOrderId(tx.id)}`,
      `Brand: ${brandResult.data?.full_name || '—'}`,
      `Influencer: ${influencerResult.data?.full_name || '—'}`,
      `Deal: ${dealTitle}`,
      `Paid: ${paid} GEL`,
      `Gift: ${tx.gift_description || '—'}`,
      `Customer: ${tx.customer_name || '—'}`,
      `Phone: ${tx.customer_phone || '—'}`,
      `City: ${tx.customer_city || '—'}`,
      `Address: ${tx.customer_address || '—'}`,
      `Note: ${tx.delivery_note || '—'}`,
      `Remaining stock: ${remainingLabel}`,
    ]
    if (oversell) lines.unshift('⚠️ OVERSELL ALERT: stock_limit exceeded!')

    await notifyAdmin(lines.join('\n'))
  } catch {
    console.error('Telegram alert failed')
  }

  return { outcome: 'approved' }
}
