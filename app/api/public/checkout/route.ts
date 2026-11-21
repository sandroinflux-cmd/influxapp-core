import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEAL_FIELDS = 'id, brand_id, title, description, image_url, logo, price, original_price, gift_description, free_delivery_tbilisi, delivery_estimate, stock_limit, stock_sold, is_active'

type CheckoutErrorCode =
  | 'DEAL_NOT_FOUND'
  | 'PARTNERSHIP_INACTIVE'
  | 'REF_REQUIRED'
  | 'DEAL_INACTIVE'
  | 'PRICE_NOT_SET'
  | 'SOLD_OUT'
  | 'DB_ERROR'

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

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function invalidLookup(message?: string) {
  return /invalid input syntax/i.test(message || '')
}

function isActiveStatus(status: unknown) {
  return String(status || '').trim().toLowerCase() === 'active'
}

function fail(code: CheckoutErrorCode, status: number, error: string, detail?: string) {
  const body: { error: string; code: CheckoutErrorCode; detail?: string } = { error, code }
  if (detail) body.detail = detail
  return noStore(body, status)
}

function publicDeal(row: any) {
  if (!row?.id) return null
  return {
    id: row.id,
    brand_id: row.brand_id ?? null,
    title: row.title ?? null,
    description: row.description ?? null,
    image_url: row.image_url ?? null,
    logo: row.logo ?? null,
    price: row.price ?? null,
    original_price: row.original_price ?? null,
    gift_description: row.gift_description ?? null,
    free_delivery_tbilisi: row.free_delivery_tbilisi ?? null,
    delivery_estimate: row.delivery_estimate ?? null,
    stock_limit: row.stock_limit ?? null,
    stock_sold: row.stock_sold ?? null,
    is_active: row.is_active ?? null,
  }
}

export async function GET(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return fail('DB_ERROR', 500, 'შეთავაზება დროებით მიუწვდომელია', 'Missing Supabase configuration')
    }

    const url = new URL(request.url)
    const dealId = asText(url.searchParams.get('deal'))
    const influencerId = asText(url.searchParams.get('ref'))
    if (!dealId) {
      return fail('DEAL_NOT_FOUND', 404, 'შეთავაზება ვერ მოიძებნა', 'deal is required')
    }

    const supabase = adminClient()
    const { data: dealRow, error: dealError } = await supabase
      .from('deals')
      .select(DEAL_FIELDS)
      .eq('id', dealId)
      .maybeSingle()

    if (dealError) {
      if (invalidLookup(dealError.message)) {
        return fail('DEAL_NOT_FOUND', 404, 'შეთავაზება ვერ მოიძებნა', dealError.message)
      }
      return fail('DB_ERROR', 500, 'შეთავაზება დროებით მიუწვდომელია', dealError.message)
    }

    const deal = publicDeal(dealRow)
    if (!deal) return fail('DEAL_NOT_FOUND', 404, 'შეთავაზება ვერ მოიძებნა')

    if (deal.is_active === false) {
      return fail('DEAL_INACTIVE', 400, 'შეთავაზება დროებით გათიშულია')
    }

    const price = Number(deal.price)
    if (!Number.isFinite(price) || price <= 0) {
      return fail('PRICE_NOT_SET', 400, 'ფასი ჯერ არ არის დაყენებული')
    }

    const { data: partnershipRows, error: partnershipError } = await supabase
      .from('partnerships')
      .select('id, status, influencer_cut_pct, total_percentage, influencer_id')
      .eq('deal_id', dealId)

    if (partnershipError) {
      if (invalidLookup(partnershipError.message)) {
        return fail('PARTNERSHIP_INACTIVE', 404, 'ეს შეთავაზება არ არის აქტიური', partnershipError.message)
      }
      return fail('DB_ERROR', 500, 'შეთავაზება დროებით მიუწვდომელია', partnershipError.message)
    }

    const activePartnerships = (partnershipRows || []).filter((row) => isActiveStatus(row.status))
    const matched = influencerId
      ? activePartnerships.filter((row) => row.influencer_id === influencerId)
      : activePartnerships

    if (matched.length === 0) {
      return fail(
        'PARTNERSHIP_INACTIVE',
        404,
        'ეს შეთავაზება არ არის აქტიური',
        influencerId ? 'No active partnership for deal and ref' : 'No active partnership for deal'
      )
    }
    if (!influencerId && matched.length > 1) {
      return fail('REF_REQUIRED', 400, 'გახსენი ინფლუენსერის ბმული', 'ref is required when multiple active partnerships exist')
    }

    const partnershipRow = matched[0]
    const [brandResult, influencerResult] = await Promise.all([
      deal.brand_id
        ? supabase.from('profiles').select('id, full_name, avatar_url, bio, sector').eq('id', deal.brand_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      partnershipRow.influencer_id
        ? supabase.from('profiles').select('id, full_name, username, avatar_url').eq('id', partnershipRow.influencer_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    if (brandResult.error) {
      return fail('DB_ERROR', 500, 'შეთავაზება დროებით მიუწვდომელია', brandResult.error.message)
    }
    if (influencerResult.error) {
      return fail('DB_ERROR', 500, 'შეთავაზება დროებით მიუწვდომელია', influencerResult.error.message)
    }

    const brand = brandResult.data
      ? {
          id: brandResult.data.id,
          full_name: brandResult.data.full_name ?? null,
          avatar_url: brandResult.data.avatar_url ?? null,
          bio: brandResult.data.bio ?? null,
          sector: brandResult.data.sector ?? null,
        }
      : null

    const influencer = influencerResult.data
      ? {
          id: influencerResult.data.id,
          full_name: influencerResult.data.full_name ?? null,
          username: influencerResult.data.username ?? null,
          avatar_url: influencerResult.data.avatar_url ?? null,
        }
      : null

    const stockLimit = Number(deal.stock_limit ?? 0)
    const stockSold = Number(deal.stock_sold ?? 0)
    const isSoldOut = Number.isFinite(stockLimit) && stockLimit > 0 && Number.isFinite(stockSold) && stockSold >= stockLimit

    const payload = {
      deal,
      partnership: {
        id: partnershipRow.id,
        status: partnershipRow.status,
        influencer_cut_pct: partnershipRow.influencer_cut_pct ?? null,
        total_percentage: partnershipRow.total_percentage ?? null,
      },
      brand,
      influencer,
      isSoldOut,
    }

    if (isSoldOut) {
      return noStore({
        ...payload,
        error: 'ამოიწურა',
        code: 'SOLD_OUT' satisfies CheckoutErrorCode,
      }, 409)
    }

    return noStore(payload)
  } catch (error: any) {
    const detail = error?.message || 'Public checkout lookup failed'
    console.error('Public checkout lookup failed:', detail)
    return fail('DB_ERROR', 500, 'შეთავაზება დროებით მიუწვდომელია', detail)
  }
}
