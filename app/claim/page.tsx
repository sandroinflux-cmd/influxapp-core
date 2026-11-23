'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import BrandMark from '@/components/BrandMark'
import InfluXCard from '@/components/InfluXCard'
import { trackTokenEvent } from '@/lib/trackTokenEvent'

function priceOffPct(deal: any) {
  const price = Number(deal?.price || 0)
  const original = Number(deal?.original_price || 0)
  return original > price && price > 0 ? Math.round(((original - price) / original) * 100) : 0
}

function formatOffer(deal: any) {
  const price = Number(deal?.price || 0)
  const limit = Number(deal?.stock_limit || 0)
  const sold = Number(deal?.stock_sold || 0)
  const exhausted = deal?.is_active === false || (limit > 0 && sold >= limit)
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
        if (String(row.status || '').trim().toLowerCase() !== 'active' || row.is_pushed_to_token !== true) return []
        const deal = row.deal
        const dealId = row.deal_id || deal?.id || null
        if (!dealId) return []
        return [{
          id: row.id || index,
          brandId: row.brand_id || deal?.brand_id || null,
          partnershipId: row.id || null,
          dealId,
          brand: deal?.title || 'VIP',
          offer: formatOffer(deal),
          logo: deal?.image_url || deal?.logo || '💎',
          price: deal?.price ?? null,
          original_price: deal?.original_price ?? null,
          gift_description: deal?.gift_description ?? null,
          stock_limit: deal?.stock_limit ?? null,
          stock_sold: deal?.stock_sold ?? null,
          is_active: deal?.is_active ?? null,
          backIntelPhone: deal?.description || deal?.intel?.phone || '',
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
      <div className="flex min-h-screen items-center justify-center bg-[#090808]">
        <div className="h-8 w-8 animate-spin rounded-full border border-[#C9B087]/25 border-t-[#C9B087]" />
      </div>
    )
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#090808] px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,24,39,0.28),transparent_62%)]" />
      <div className="relative my-auto flex w-full max-w-[380px] flex-col items-center">
        <BrandMark size="sm" className="mb-6" />
        {!profile?.id ? (
          <p className="text-center font-sans text-sm text-[#8C8580]">
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
