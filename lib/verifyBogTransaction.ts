import type { SupabaseClient } from '@supabase/supabase-js'
import { bogStatusKey, fetchBogOrder, unwrapBogOrder } from '@/lib/bog'

const APPROVED = new Set(['completed', 'approved', 'success', 'paid'])
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
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function shortOrderId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

function readAmount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const normalized = value.trim().replace(/\s/g, '').replace(',', '.')
    if (!normalized) return null
    const numeric = normalized.replace(/[^\d.-]/g, '')
    if (!/\d/.test(numeric)) return null
    const parsed = Number(numeric)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    for (const key of ['value', 'amount', 'total', 'total_amount', 'transfer_amount', 'request_amount']) {
      if (!(key in record)) continue
      const nested = readAmount(record[key])
      if (nested !== null) return nested
    }
  }
  return null
}

function purchaseUnits(order: any) {
  const units = order?.purchase_units ?? order?.purchaseUnits
  if (Array.isArray(units)) return units[0] ?? null
  return units ?? null
}

/**
 * Paid amount from the BOG order payload.
 * A zero `transfer_amount` (refund placeholder) must not hide a matching `request_amount`.
 */
function bogPaidAmount(order: any, expectedAmount: number): number | null {
  const source = unwrapBogOrder(order)
  const purchase = purchaseUnits(source)
  const payment = source?.payment_detail
  const candidates = [
    purchase?.transfer_amount,
    purchase?.request_amount,
    purchase?.total_amount,
    purchase?.paid_amount,
    payment?.transfer_amount,
    payment?.amount,
    source?.transfer_amount,
    source?.paid_amount,
    source?.amount,
    source?.total_amount,
  ]
  const amounts = candidates
    .map((candidate) => readAmount(candidate))
    .filter((amount): amount is number => amount !== null)

  if (amounts.length === 0) return null
  const close = amounts.find((amount) => Math.abs(amount - expectedAmount) <= AMOUNT_TOLERANCE_GEL)
  if (close !== undefined) return close
  const positive = amounts.find((amount) => amount > 0)
  return positive !== undefined ? positive : amounts[0]
}

function bogExternalOrderId(order: any) {
  const source = unwrapBogOrder(order)
  return asText(source?.external_order_id) || asText(source?.shop_order_id)
}

/** Equal, or a BOG-truncated prefix (statement text keeps the first 25 characters). */
function sameExternalOrder(externalId: string, txId: string) {
  const left = externalId.trim().toLowerCase()
  const right = txId.trim().toLowerCase()
  if (!left || !right) return true
  if (left === right) return true
  const shorter = left.length <= right.length ? left : right
  const longer = left.length <= right.length ? right : left
  return shorter.length >= 8 && longer.startsWith(shorter)
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

function logSkip(
  tx: TransactionRow,
  reason: BogVerifyOutcome,
  statusKey: string,
  paidAmount: number | null,
  externalOrderId?: string
) {
  const payload = {
    txId: tx.id,
    bogOrderId: tx.bog_order_id ?? null,
    statusKey: statusKey || null,
    paidAmount,
    expectedAmount: Number(tx.final_amount || 0),
    externalOrderId: externalOrderId || null,
    reason,
  }
  if (reason === 'amount_mismatch' || reason === 'order_mismatch' || reason === 'missing_order') {
    console.error('[BOG verify] skipped approval', payload)
    return
  }
  console.warn('[BOG verify] skipped approval', payload)
}

export async function verifyBogTransaction(
  supabase: SupabaseClient,
  tx: TransactionRow
): Promise<{ outcome: BogVerifyOutcome }> {
  if (tx.status === 'approved') return { outcome: 'already_approved' }
  if (!tx.bog_order_id) {
    logSkip(tx, 'missing_order', '', null)
    return { outcome: 'missing_order' }
  }

  const verified = await fetchBogOrder(String(tx.bog_order_id))
  const verifiedExternal = bogExternalOrderId(verified)
  const statusKey = bogStatusKey(verified)
  const expectedAmount = Number(tx.final_amount || 0)
  const paidAmount = bogPaidAmount(verified, expectedAmount)

  if (verifiedExternal && !sameExternalOrder(verifiedExternal, tx.id)) {
    logSkip(tx, 'order_mismatch', statusKey, paidAmount, verifiedExternal)
    return { outcome: 'order_mismatch' }
  }

  if (REJECTED.has(statusKey)) {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'rejected' })
      .eq('id', tx.id)
      .neq('status', 'approved')
    if (error) throw error
    logSkip(tx, 'rejected', statusKey, paidAmount, verifiedExternal)
    return { outcome: 'rejected' }
  }

  if (!APPROVED.has(statusKey)) {
    logSkip(tx, 'pending', statusKey, paidAmount, verifiedExternal)
    return { outcome: 'pending' }
  }

  if (paidAmount !== null && Math.abs(paidAmount - expectedAmount) > AMOUNT_TOLERANCE_GEL) {
    logSkip(tx, 'amount_mismatch', statusKey, paidAmount, verifiedExternal)
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
    const customerName = asText(tx.customer_name)
    const customerPhone = asText(tx.customer_phone)
    const customerCity = asText(tx.customer_city)
    const customerAddress = asText(tx.customer_address)
    const deliveryNote = asText(tx.delivery_note)
    const lines = [
      'InfluX — ახალი შეკვეთა',
      `Order: ${shortOrderId(tx.id)}`,
      `Brand: ${brandResult.data?.full_name || '—'}`,
      `Influencer: ${influencerResult.data?.full_name || '—'}`,
      `Deal: ${dealTitle}`,
      `Paid: ${paid} GEL`,
      `Gift: ${tx.gift_description || '—'}`,
    ]
    if (customerName) lines.push(`Customer: ${customerName}`)
    lines.push(`Phone: ${customerPhone}`)
    if (customerCity) lines.push(`City: ${customerCity}`)
    lines.push(`Address: ${customerAddress}`)
    if (deliveryNote) lines.push(`Note: ${deliveryNote}`)
    lines.push(`Remaining stock: ${remainingLabel}`)
    if (oversell) lines.unshift('⚠️ OVERSELL ALERT: stock_limit exceeded!')

    await notifyAdmin(lines.join('\n'))
  } catch {
    console.error('Telegram alert failed')
  }

  return { outcome: 'approved' }
}
