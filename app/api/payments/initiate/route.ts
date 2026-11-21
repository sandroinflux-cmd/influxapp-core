import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getBogToken } from '@/lib/bog'
import { compactPhone, isGeorgianMobilePhone } from '@/lib/phone'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Server configuration error')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

function readText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function sanitizeIban(iban?: string | null) {
  return (iban || '').replace(/\s+/g, '').toUpperCase()
}

function isGeorgianIban(iban: string) {
  return /^GE[0-9A-Z]{20}$/.test(iban)
}

async function createBogOrder(
  token: string,
  txId: string,
  amount: number,
  splits: Array<{ amount: number; iban: string; description: string }>,
  productId: string,
  description: string,
  failQuery: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const finalPayable = Number(amount.toFixed(2))

  const requestBody: any = {
    callback_url: `${siteUrl}/api/payments/callback`,
    external_order_id: txId,
    purchase_units: {
      currency: 'GEL',
      total_amount: finalPayable,
      basket: [
        {
          product_id: productId,
          description: description.slice(0, 50) || 'INFLUX Payment',
          quantity: 1,
          unit_price: finalPayable,
        },
      ],
    },
    redirect_urls: {
      success: `${siteUrl}/payment/success?txid=${txId}`,
      fail: `${siteUrl}/payment/fail?${failQuery}`,
    },
  }

  // Approved merchant split payload. Amounts are server-computed; the shape stays the same.
  if (splits && splits.length > 0) {
    requestBody.config = {
      split: {
        split_payments: splits,
      },
    }
  }

  const response = await fetch('https://api.bog.ge/payments/v1/ecommerce/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept-Language': 'ka',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('BOG Order Creation Error:', errorData?.error_message || errorData?.message || response.status)
    throw new Error(`BOG Rejected: ${errorData?.error_message || errorData?.message || 'Check server logs'}`)
  }

  return response.json()
}

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return bad('Invalid JSON')
    }

    const dealId = readText(body?.dealId)
    const influencerId = readText(body?.influencerId)
    const customerPhone = readText(body?.customerPhone)
    const customerAddress = readText(body?.customerAddress)

    if (!dealId) return bad('dealId is required')
    if (!isGeorgianMobilePhone(customerPhone)) return bad('Invalid phone')
    if (!customerAddress || customerAddress.length > 400) return bad('Invalid customerAddress')

    const supabase = adminClient()

    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .maybeSingle()

    if (dealError) throw dealError
    if (!deal) return bad('Deal not found', 404)

    const { data: partnershipRows, error: partnershipError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('deal_id', dealId)

    if (partnershipError) throw partnershipError
    const activePartnerships = (partnershipRows || []).filter((row) => {
      return String(row.status || '').trim().toLowerCase() === 'active'
    })
    const partnerships = influencerId
      ? activePartnerships.filter((row) => row.influencer_id === influencerId)
      : activePartnerships
    if (partnerships.length === 0) return bad('Active partnership required')
    if (!influencerId && partnerships.length > 1) return bad('influencerId required')

    const partnership = partnerships[0]
    const finalAmount = Number(Number(deal.price).toFixed(2))
    const billAmount = Number(Number(deal.original_price || deal.price).toFixed(2))
    const stockLimit = Number(deal.stock_limit || 0)
    const stockSold = Number(deal.stock_sold || 0)
    const inStock = !deal.stock_limit || stockLimit === 0 || stockSold < stockLimit

    if (deal.is_active === false || !inStock) {
      return NextResponse.json({ error: 'SOLD_OUT' }, { status: 409 })
    }
    if (!(finalAmount > 0)) return bad('Invalid deal price')

    const commissionPct = Number(partnership?.influencer_cut_pct || 0)
    const totalPct = Number(partnership?.total_percentage ?? deal.totalShare ?? 0)
    const influencerEarned = Number(((finalAmount * commissionPct) / 100).toFixed(2))
    const platformCutPct = Math.max(0, totalPct - commissionPct)
    const systemFee = Number(((finalAmount * platformCutPct) / 100).toFixed(2))
    const brandEarned = Number((finalAmount - influencerEarned - systemFee).toFixed(2))

    if (brandEarned < 0 || influencerEarned < 0 || systemFee < 0) {
      return bad('Invalid split')
    }

    const [{ data: brand }, { data: influencer }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, iban').eq('id', deal.brand_id).maybeSingle(),
      supabase.from('profiles').select('id, full_name, iban').eq('id', partnership.influencer_id).maybeSingle(),
    ])

    const brandIban = sanitizeIban(brand?.iban)
    const influencerIban = sanitizeIban(influencer?.iban)

    const brandNeedsSplit = brandEarned > 0
    const influencerNeedsSplit = influencerEarned > 0
    const brandLegAdded = brandNeedsSplit && isGeorgianIban(brandIban)
    const influencerLegAdded = influencerNeedsSplit && isGeorgianIban(influencerIban)

    const splitPayments: Array<{ amount: number; iban: string; description: string }> = []
    if (brandLegAdded) {
      splitPayments.push({
        amount: Number(brandEarned.toFixed(2)),
        iban: brandIban,
        description: 'InfluX Brand Payout',
      })
    }
    if (influencerLegAdded) {
      splitPayments.push({
        amount: Number(influencerEarned.toFixed(2)),
        iban: influencerIban,
        description: 'InfluX Partner Payout',
      })
    }

    const requiredLegs = Number(brandNeedsSplit) + Number(influencerNeedsSplit)
    const addedLegs = Number(brandLegAdded) + Number(influencerLegAdded)
    const payoutStatus = requiredLegs > 0 && addedLegs === requiredLegs
      ? 'split_sent'
      : addedLegs > 0
        ? 'partial_split'
        : 'held'
    const discountPercent = billAmount > finalAmount && billAmount > 0
      ? Number((((billAmount - finalAmount) / billAmount) * 100).toFixed(2))
      : 0
    const phone = compactPhone(customerPhone)

    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert([{
        bill_amount: Number(billAmount.toFixed(2)),
        final_amount: Number(finalAmount.toFixed(2)),
        // Payable price. A transactions trigger copies `amount` onto final_amount and rebuilds the split from it.
        amount: Number(finalAmount.toFixed(2)),
        brand_id: deal.brand_id,
        influencer_id: partnership.influencer_id,
        deal_id: deal.id,
        discount_percent: discountPercent,
        commission_percent: commissionPct,
        brand_earned: brandEarned,
        influencer_earned: influencerEarned,
        system_fee: systemFee,
        brand_iban: brandIban || '',
        influencer_iban: influencerIban || '',
        status: 'pending',
        fulfillment_status: 'pending',
        payout_status: payoutStatus,
        category: deal.category ?? null,
        customer_name: null,
        customer_phone: phone,
        customer_city: null,
        customer_address: customerAddress,
        delivery_note: null,
        marketing_opt_in: false,
        gift_unlocked: Boolean(deal.gift_description),
        gift_description: deal.gift_description || null,
      }])
      .select()
      .single()

    if (txError) throw txError

    const failParams = new URLSearchParams({ txid: tx.id, deal: deal.id })
    if (partnership.influencer_id) failParams.set('ref', partnership.influencer_id)

    const bogToken = await getBogToken()
    const bogOrder = await createBogOrder(
      bogToken,
      tx.id,
      finalAmount,
      splitPayments,
      deal.id,
      deal.title || 'INFLUX Payment',
      failParams.toString()
    )

    const bogOrderId = readText(bogOrder?.id) || readText(bogOrder?.order_id) || readText(bogOrder?.body?.id)
    if (!bogOrderId) {
      console.error('BOG order id missing', {
        txId: tx.id,
        keys: bogOrder && typeof bogOrder === 'object' ? Object.keys(bogOrder) : [],
      })
      throw new Error('BOG order id missing')
    }

    const { data: saved, error: bogIdError } = await supabase
      .from('transactions')
      .update({ bog_order_id: bogOrderId })
      .eq('id', tx.id)
      .select('id, bog_order_id')
      .maybeSingle()

    if (bogIdError || saved?.bog_order_id !== bogOrderId) {
      console.error('Failed to save bog_order_id', {
        txId: tx.id,
        bogOrderId,
        message: bogIdError?.message || 'transactions row was not updated',
      })
      throw bogIdError || new Error('Failed to save bog_order_id')
    }

    const checkoutUrl = bogOrder?._links?.redirect?.href
    if (!checkoutUrl) throw new Error('BOG checkout URL missing')

    return NextResponse.json({ checkoutUrl })
  } catch (error: any) {
    const message = error?.message || 'Payment initiation failed'
    const status = /invalid input syntax/i.test(message) ? 400 : 500
    console.error('API Payment Initiation Error:', message)
    return NextResponse.json({ error: message }, { status })
  }
}
