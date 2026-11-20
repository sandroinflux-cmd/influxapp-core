import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEAL_FIELDS = 'id, brand_id, title, description, image_url, logo, price, original_price, gift_description, free_delivery_tbilisi, delivery_estimate, stock_limit, stock_sold, is_active'

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
      return noStore({ error: 'Server configuration error' }, 500)
    }

    const url = new URL(request.url)
    const dealId = asText(url.searchParams.get('deal'))
    const influencerId = asText(url.searchParams.get('ref'))
    if (!dealId) return noStore({ error: 'deal is required' }, 400)

    const supabase = adminClient()
    const { data: dealRow, error: dealError } = await supabase
      .from('deals')
      .select(DEAL_FIELDS)
      .eq('id', dealId)
      .maybeSingle()

    if (dealError) {
      if (invalidLookup(dealError.message)) return noStore({ error: 'შეთავაზება ვერ მოიძებნა' }, 404)
      throw dealError
    }

    const deal = publicDeal(dealRow)
    if (!deal) return noStore({ error: 'შეთავაზება ვერ მოიძებნა' }, 404)

    let partnershipQuery = supabase
      .from('partnerships')
      .select('id, status, influencer_cut_pct, total_percentage, influencer_id')
      .eq('deal_id', dealId)
      .eq('status', 'active')

    if (influencerId) partnershipQuery = partnershipQuery.eq('influencer_id', influencerId)

    const { data: partnerships, error: partnershipError } = await partnershipQuery.limit(2)
    if (partnershipError) {
      if (invalidLookup(partnershipError.message)) return noStore({ error: 'ეს შეთავაზება არ არის აქტიური' }, 404)
      throw partnershipError
    }
    if (!partnerships || partnerships.length === 0) {
      return noStore({ error: 'ეს შეთავაზება არ არის აქტიური' }, 404)
    }
    if (!influencerId && partnerships.length > 1) {
      return noStore({ error: 'გახსენი ინფლუენსერის ბმული' }, 400)
    }

    const partnershipRow = partnerships[0]
    if (partnershipRow.status !== 'active') {
      return noStore({ error: 'ეს შეთავაზება არ არის აქტიური' }, 404)
    }

    const [brandResult, influencerResult] = await Promise.all([
      deal.brand_id
        ? supabase.from('profiles').select('id, full_name, avatar_url, bio, sector').eq('id', deal.brand_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      partnershipRow.influencer_id
        ? supabase.from('profiles').select('id, full_name, username, avatar_url').eq('id', partnershipRow.influencer_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    if (brandResult.error) throw brandResult.error
    if (influencerResult.error) throw influencerResult.error

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

    return noStore({
      deal,
      partnership: {
        id: partnershipRow.id,
        status: partnershipRow.status,
        influencer_cut_pct: partnershipRow.influencer_cut_pct ?? null,
        total_percentage: partnershipRow.total_percentage ?? null,
      },
      brand,
      influencer,
    })
  } catch (error: any) {
    console.error('Public checkout lookup failed:', error?.message || error)
    return noStore({ error: 'შეთავაზება ვერ მოიძებნა' }, 500)
  }
}
