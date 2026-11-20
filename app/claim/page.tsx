'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import InfluXCard from '@/components/InfluXCard'
import { trackTokenEvent } from '@/lib/trackTokenEvent'

function priceOffPct(deal: any) {
  const price = Number(deal?.price || 0)
  const original = Number(deal?.original_price || 0)
  return original > price ? Math.round((1 - price / original) * 100) : 0
}

function formatOffer(deal: any) {
  const price = Number(deal?.price || 0)
  const limit = Number(deal?.stock_limit || 0)
  const sold = Number(deal?.stock_sold || 0)
  const exhausted = deal?.is_active !== true || (limit > 0 && sold >= limit)
  if (exhausted) return 'SOLD'
  const off = priceOffPct(deal)
  if (off > 0) return `${off}% OFF`
  if (price > 0) return Number.isInteger(price) ? `${price}₾` : `${price.toFixed(2)}₾`
  return 'PAY'
}

function ClaimContent() {
  const searchParams = useSearchParams()
  const influencerRef = searchParams.get('ref')
  const username = searchParams.get('username')

  const [profile, setProfile] = useState<any>(null)
  const [liveDeals, setLiveDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const viewTracked = useRef(false)

  useEffect(() => {
    if (influencerRef || username) fetchData()
    else setLoading(false)
  }, [influencerRef, username])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (influencerRef) params.set('ref', influencerRef)
      else if (username) params.set('username', username)

      const response = await fetch(`/api/public/claim?${params.toString()}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.profile?.id) {
        setProfile(null)
        setLiveDeals([])
        return
      }

      setProfile(data.profile)
      const trackedId = data.profile.id as string
      if (!viewTracked.current) {
        viewTracked.current = true
        trackTokenEvent({ influencerId: trackedId, eventType: 'view', source: 'claim' })
      }

      const rows = Array.isArray(data.partnerships) ? data.partnerships : []
      setLiveDeals(rows.flatMap((row: any, index: number) => {
        if (row.status !== 'active' || row.is_pushed_to_token !== true) return []
        const deal = row.deal
        const dealId = row.deal_id || deal?.id || null
        if (!dealId) return []
        return [{
          id: row.id || index,
          brandId: row.brand_id || deal?.brand_id || null,
          partnershipId: row.id || null,
          dealId,
          brand: deal?.title || 'MATRIX NODE',
          offer: formatOffer(deal),
          logo: deal?.image_url || deal?.logo || '💎',
          backIntelPhone: deal?.description || deal?.intel?.phone || 'Secret Node',
          intel: deal?.intel || {},
        }]
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010201] text-emerald-500 font-black uppercase tracking-[0.5em] animate-pulse flex items-center justify-center italic">
        Intercepting Signal...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b98108,transparent_70%)] pointer-events-none" />

      <div className="z-10 flex flex-col items-center w-full max-w-[340px]">
        {!profile?.id ? (
          <p className="text-center text-[11px] font-black uppercase tracking-[0.28em] text-white/50 italic">
            ბმული არასწორია
          </p>
        ) : (
          <InfluXCard
            profile={profile}
            liveDeals={liveDeals}
            disableRotation={false}
            onFlip={() => {
              trackTokenEvent({ influencerId: profile.id, eventType: 'flip', source: 'claim' })
            }}
            onDealClick={(deal) => {
              if (!deal?.dealId) return
              void trackTokenEvent({
                influencerId: profile.id,
                eventType: 'deal_click',
                brandId: deal.brandId,
                partnershipId: deal.partnershipId,
                dealId: deal.dealId,
                source: 'claim',
              })
              const params = new URLSearchParams({
                deal: String(deal.dealId),
                ref: profile.id,
              })
              window.location.assign(`/pay?${params.toString()}`)
            }}
          />
        )}
      </div>
    </main>
  )
}

export default function ClaimPage() {
  return (
    <Suspense fallback={null}>
      <ClaimContent />
    </Suspense>
  )
}
