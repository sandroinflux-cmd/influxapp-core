import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PROFILE_FIELDS = 'id, full_name, username, avatar_url, bio, token_limit, token_claims'
const DEAL_FIELDS = 'id, brand_id, title, description, image_url, logo, price, original_price, gift_description, intel, stock_limit, stock_sold, is_active'

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

function publicProfile(row: any) {
  if (!row?.id) return null
  return {
    id: row.id,
    full_name: row.full_name ?? null,
    username: row.username ?? null,
    avatar_url: row.avatar_url ?? null,
    bio: row.bio ?? null,
    token_limit: row.token_limit ?? null,
    token_claims: row.token_claims ?? null,
  }
}

function publicDeal(row: any) {
  const deal = Array.isArray(row) ? row[0] : row
  if (!deal?.id) return null
  return {
    id: deal.id,
    brand_id: deal.brand_id ?? null,
    title: deal.title ?? null,
    description: deal.description ?? null,
    image_url: deal.image_url ?? null,
    logo: deal.logo ?? null,
    price: deal.price ?? null,
    original_price: deal.original_price ?? null,
    gift_description: deal.gift_description ?? null,
    intel: deal.intel ?? null,
    stock_limit: deal.stock_limit ?? null,
    stock_sold: deal.stock_sold ?? null,
    is_active: deal.is_active ?? null,
  }
}

export async function GET(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return noStore({ error: 'Server configuration error' }, 500)
    }

    const url = new URL(request.url)
    const ref = asText(url.searchParams.get('ref'))
    const username = asText(url.searchParams.get('username')).toLowerCase()
    if (!ref && !username) return noStore({ error: 'ref or username is required' }, 400)

    const supabase = adminClient()
    const profileQuery = supabase.from('profiles').select(PROFILE_FIELDS)
    const profileResult = ref
      ? await profileQuery.eq('id', ref).maybeSingle()
      : await profileQuery.eq('username', username).maybeSingle()

    if (profileResult.error) {
      if (invalidLookup(profileResult.error.message)) return noStore({ error: 'Profile not found' }, 404)
      throw profileResult.error
    }

    const profile = publicProfile(profileResult.data)
    if (!profile) return noStore({ error: 'Profile not found' }, 404)

    const { data: rows, error: partnershipError } = await supabase
      .from('partnerships')
      .select(`id, status, is_pushed_to_token, brand_id, deal_id, deals(${DEAL_FIELDS})`)
      .eq('influencer_id', profile.id)
      .eq('is_pushed_to_token', true)

    if (partnershipError) throw partnershipError

    const partnerships = (rows || []).flatMap((row: any) => {
      const status = String(row.status || '').trim().toLowerCase()
      if (status !== 'active' || row.is_pushed_to_token !== true) return []
      const deal = publicDeal(row.deals)
      if (!deal) return []
      return [{
        id: row.id,
        status: 'active' as const,
        is_pushed_to_token: true,
        brand_id: row.brand_id ?? deal.brand_id ?? null,
        deal_id: row.deal_id ?? deal.id,
        deal,
      }]
    })

    return noStore({ profile, partnerships })
  } catch (error: any) {
    console.error('Public claim lookup failed:', error?.message || error)
    return noStore({ error: 'Claim lookup failed' }, 500)
  }
}
