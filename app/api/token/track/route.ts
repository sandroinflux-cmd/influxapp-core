import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EVENT_TYPES = ['view', 'flip', 'deal_click', 'claim'] as const
type EventType = (typeof EVENT_TYPES)[number]

type ProfileCounters = {
  token_views: number
  token_flips: number
  token_claims: number
  token_limit: number | null
}

type PartnershipRow = {
  id: string
  brand_id: string | null
  deal_id: string | null
  views_count: number | null
  claims_count: number | null
  clicks_count: number | null
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function nullableId(value: unknown) {
  const text = asText(value)
  return text || null
}

function countersFrom(row: any): ProfileCounters {
  return {
    token_views: Number(row?.token_views || 0),
    token_flips: Number(row?.token_flips || 0),
    token_claims: Number(row?.token_claims || 0),
    token_limit: row?.token_limit === null || row?.token_limit === undefined ? null : Number(row.token_limit),
  }
}

async function readProfile(supabase: SupabaseClient, influencerId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('token_views, token_flips, token_claims, token_limit')
    .eq('id', influencerId)
    .single()

  if (error || !data) throw new Error(error?.message || 'Profile not found')
  return { raw: data, counters: countersFrom(data) }
}

async function activePartnerships(supabase: SupabaseClient, influencerId: string) {
  const { data, error } = await supabase
    .from('partnerships')
    .select('id, brand_id, deal_id, views_count, claims_count, clicks_count')
    .eq('influencer_id', influencerId)
    .eq('is_pushed_to_token', true)

  if (error) throw new Error(error.message)
  return (data || []) as PartnershipRow[]
}

function eventRows(
  partnerships: PartnershipRow[],
  base: {
    influencerId: string
    visitorId: string
    source: 'claim' | 'wallet'
    eventType: 'view' | 'claim'
  }
) {
  if (partnerships.length === 0) {
    return [{
      influencer_id: base.influencerId,
      brand_id: null,
      partnership_id: null,
      deal_id: null,
      visitor_id: base.visitorId,
      source: base.source,
      event_type: base.eventType,
    }]
  }

  return partnerships.map((partnership) => ({
    influencer_id: base.influencerId,
    brand_id: partnership.brand_id,
    partnership_id: partnership.id,
    deal_id: partnership.deal_id,
    visitor_id: base.visitorId,
    source: base.source,
    event_type: base.eventType,
  }))
}

async function bumpProfileColumn(
  supabase: SupabaseClient,
  influencerId: string,
  column: 'token_views' | 'token_flips'
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { raw } = await readProfile(supabase, influencerId)
    const current = Number(raw[column] || 0)
    let update = supabase
      .from('profiles')
      .update({ [column]: current + 1 })
      .eq('id', influencerId)

    update = raw[column] === null || raw[column] === undefined
      ? update.is(column, null)
      : update.eq(column, raw[column])

    const { data, error } = await update.select('id').maybeSingle()
    if (error) throw new Error(error.message)
    if (data) return
  }

  throw new Error(`Could not update ${column}`)
}

async function bumpPartnershipColumn(
  supabase: SupabaseClient,
  rows: PartnershipRow[],
  column: 'views_count' | 'claims_count' | 'clicks_count'
) {
  await Promise.all(rows.map(async (row) => {
    const next = Number(row[column] || 0) + 1
    const { error } = await supabase.from('partnerships').update({ [column]: next }).eq('id', row.id)
    if (error) console.error(`${column} update failed`, row.id, error.message)
  }))
}

async function reserveClaim(supabase: SupabaseClient, influencerId: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { raw, counters } = await readProfile(supabase, influencerId)
    const limit = counters.token_limit
    if (limit !== null && limit > 0 && counters.token_claims >= limit) {
      return { ok: false as const, limitReached: true as const }
    }

    const nextClaims = counters.token_claims + 1
    let update = supabase
      .from('profiles')
      .update({ token_claims: nextClaims })
      .eq('id', influencerId)

    update = raw.token_claims === null || raw.token_claims === undefined
      ? update.is('token_claims', null)
      : update.eq('token_claims', raw.token_claims)

    const { data: updated, error } = await update
      .select('token_views, token_flips, token_claims, token_limit')
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (updated) return { ok: true as const, claims: Number(updated.token_claims || nextClaims) }
  }

  throw new Error('Claim counter busy')
}

async function releaseClaim(supabase: SupabaseClient, influencerId: string, expectedClaims: number) {
  const next = Math.max(0, expectedClaims - 1)
  await supabase
    .from('profiles')
    .update({ token_claims: next })
    .eq('id', influencerId)
    .eq('token_claims', expectedClaims)
}

function okProfile(counters: ProfileCounters) {
  return NextResponse.json({
    ok: true,
    token_views: counters.token_views,
    token_flips: counters.token_flips,
    token_claims: counters.token_claims,
    token_limit: counters.token_limit,
  })
}

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const influencerId = asText(body?.influencerId)
    const eventType = asText(body?.eventType) as EventType
    const visitorId = asText(body?.visitorId) || `anon-${crypto.randomUUID()}`
    const source = body?.source === 'wallet' ? 'wallet' : 'claim'
    const brandId = nullableId(body?.brandId)
    const partnershipId = nullableId(body?.partnershipId)
    const dealId = nullableId(body?.dealId)

    if (!influencerId) {
      return NextResponse.json({ error: 'influencerId required' }, { status: 400 })
    }
    if (!EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: 'invalid eventType' }, { status: 400 })
    }

    const supabase = adminClient()

    if (eventType === 'view') {
      const since = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const [{ data: recentViews, error: recentError }, partnerships] = await Promise.all([
        supabase
          .from('token_events')
          .select('id')
          .eq('influencer_id', influencerId)
          .eq('visitor_id', visitorId)
          .eq('event_type', 'view')
          .gte('created_at', since)
          .limit(1),
        activePartnerships(supabase, influencerId),
      ])

      if (recentError) throw new Error(recentError.message)

      const { error: insertError } = await supabase.from('token_events').insert(
        eventRows(partnerships, { influencerId, visitorId, source, eventType: 'view' })
      )
      if (insertError) throw new Error(insertError.message)

      const countThisView = !recentViews || recentViews.length === 0
      if (countThisView) {
        await bumpProfileColumn(supabase, influencerId, 'token_views')
        await bumpPartnershipColumn(supabase, partnerships, 'views_count')
      }

      return NextResponse.json({ ok: true })
    }

    if (eventType === 'flip') {
      const { error: insertError } = await supabase.from('token_events').insert({
        influencer_id: influencerId,
        event_type: 'flip',
        visitor_id: visitorId,
        source,
      })
      if (insertError) throw new Error(insertError.message)

      await bumpProfileColumn(supabase, influencerId, 'token_flips')
      return NextResponse.json({ ok: true })
    }

    if (eventType === 'deal_click') {
      const { error: insertError } = await supabase.from('token_events').insert({
        influencer_id: influencerId,
        brand_id: brandId,
        partnership_id: partnershipId,
        deal_id: dealId,
        event_type: 'deal_click',
        visitor_id: visitorId,
        source,
      })
      if (insertError) throw new Error(insertError.message)

      if (partnershipId) {
        const { data: partnership, error: partnershipError } = await supabase
          .from('partnerships')
          .select('id, clicks_count')
          .eq('id', partnershipId)
          .maybeSingle()

        if (partnershipError) throw new Error(partnershipError.message)
        if (partnership) {
          const { error: updateError } = await supabase
            .from('partnerships')
            .update({ clicks_count: Number(partnership.clicks_count || 0) + 1 })
            .eq('id', partnershipId)
          if (updateError) console.error('clicks_count update failed', partnershipId, updateError.message)
        }
      }

      return NextResponse.json({ ok: true })
    }

    const { data: priorClaims, error: priorError } = await supabase
      .from('token_events')
      .select('id')
      .eq('influencer_id', influencerId)
      .eq('visitor_id', visitorId)
      .eq('event_type', 'claim')
      .limit(1)

    if (priorError) throw new Error(priorError.message)
    const alreadyClaimed = !!priorClaims && priorClaims.length > 0

    if (!alreadyClaimed) {
      const { counters } = await readProfile(supabase, influencerId)
      if (counters.token_limit !== null && counters.token_limit > 0 && counters.token_claims >= counters.token_limit) {
        return NextResponse.json({ error: 'LIMIT_REACHED', limitReached: true }, { status: 400 })
      }

      const reserved = await reserveClaim(supabase, influencerId)
      if (!reserved.ok) {
        return NextResponse.json({ error: 'LIMIT_REACHED', limitReached: true }, { status: 400 })
      }

      const partnerships = await activePartnerships(supabase, influencerId)
      const { error: insertError } = await supabase.from('token_events').insert(
        eventRows(partnerships, { influencerId, visitorId, source, eventType: 'claim' })
      )

      if (insertError) {
        await releaseClaim(supabase, influencerId, reserved.claims)
        throw new Error(insertError.message)
      }

      await bumpPartnershipColumn(supabase, partnerships, 'claims_count')
    }

    const { counters } = await readProfile(supabase, influencerId)
    return okProfile(counters)
  } catch (error: any) {
    console.error('token track error', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Server Error' }, { status: 500 })
  }
}
