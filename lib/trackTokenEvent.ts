export type TokenEventType = 'view' | 'flip' | 'deal_click' | 'claim'
export type TokenEventSource = 'claim' | 'wallet'

export type TrackTokenPayload = {
  influencerId: string
  eventType: TokenEventType
  brandId?: string | null
  partnershipId?: string | null
  dealId?: string | null
  source?: TokenEventSource
}

export type TrackTokenResponse = {
  ok?: boolean
  error?: string
  limitReached?: boolean
  token_views?: number
  token_flips?: number
  token_claims?: number
  token_limit?: number | null
}

const VISITOR_STORAGE_KEY = 'influx_visitor_id'
let memoryVisitorId: string | null = null

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    if (!memoryVisitorId) memoryVisitorId = createId()
    return memoryVisitorId
  }

  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY)
    if (existing) return existing
    const id = createId()
    window.localStorage.setItem(VISITOR_STORAGE_KEY, id)
    memoryVisitorId = id
    return id
  } catch {
    if (!memoryVisitorId) memoryVisitorId = createId()
    return memoryVisitorId
  }
}

export async function trackTokenEvent(payload: TrackTokenPayload): Promise<TrackTokenResponse> {
  const isClaim = payload.eventType === 'claim'

  try {
    const response = await fetch('/api/token/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        influencerId: payload.influencerId,
        eventType: payload.eventType,
        brandId: payload.brandId ?? null,
        partnershipId: payload.partnershipId ?? null,
        dealId: payload.dealId ?? null,
        source: payload.source ?? 'claim',
        visitorId: getVisitorId(),
      }),
      keepalive: !isClaim,
    })

    return (await response.json().catch(() => ({ ok: response.ok }))) as TrackTokenResponse
  } catch {
    return isClaim ? { ok: false, error: 'NETWORK' } : { ok: false }
  }
}
