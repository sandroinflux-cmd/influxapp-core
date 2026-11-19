'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import InfluXCard from '@/components/InfluXCard'
import { trackTokenEvent } from '@/lib/trackTokenEvent'

function walletOwns(influencerId: string) {
  try {
    const existing = localStorage.getItem('matrix_user_wallet')
    const wallet = existing ? JSON.parse(existing) : []
    return Array.isArray(wallet) && wallet.some((token: any) => token?.profile?.id === influencerId)
  } catch {
    return false
  }
}

function ClaimContent() {
  const searchParams = useSearchParams()
  const influencerId = searchParams.get('ref')
  
  const [profile, setProfile] = useState<any>(null)
  const [liveDeals, setLiveDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [owned, setOwned] = useState(false)
  const [soldOut, setSoldOut] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimNote, setClaimNote] = useState<string | null>(null)
  const viewTracked = useRef(false)
  const claimingRef = useRef(false)

  useEffect(() => {
    if (!influencerId || viewTracked.current) return
    viewTracked.current = true
    trackTokenEvent({ influencerId, eventType: 'view', source: 'claim' })
  }, [influencerId])

  useEffect(() => {
    if (influencerId) fetchData()
    else setLoading(false)
  }, [influencerId])

  const fetchData = async () => {
    try {
      let { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, token_limit, token_claims')
        .eq('id', influencerId)
        .single()
      if (profError) {
        const fallback = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', influencerId)
          .single()
        prof = fallback.data as typeof prof
      }
      if (prof) setProfile(prof)

      const { data: dealsData } = await supabase.from('partnerships').select('*, deals(*)').eq('influencer_id', influencerId).eq('is_pushed_to_token', true)
      
      if (dealsData) {
        setLiveDeals(dealsData.map((d: any, i: number) => ({
          id: d.id || i,
          brandId: d.brand_id || null,
          partnershipId: d.id || null,
          dealId: d.deal_id || null,
          brand: d.deals?.title || 'MATRIX NODE',
          offer: `${d.user_discount_pct || 0}% OFF`,
          logo: d.deals?.logo || '💎',
          backIntelPhone: d.deals?.intel?.phone || 'Secret Node',
          intel: d.deals?.intel || {}
        })))
      }

      if (influencerId) setOwned(walletOwns(influencerId))
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const limitValue = Number(profile?.token_limit || 0)
  const claimsValue = Number(profile?.token_claims || 0)
  const atLimit = limitValue > 0 && claimsValue >= limitValue
  const blocked = soldOut || (atLimit && !owned)

  const handleSync = async () => {
    if (!profile?.id || !influencerId || blocked || claimingRef.current) return
    claimingRef.current = true
    setClaiming(true)
    setClaimNote(null)

    try {
      const result = await trackTokenEvent({
        influencerId,
        eventType: 'claim',
        source: 'claim',
      })

      if (result?.limitReached || result?.error === 'LIMIT_REACHED') {
        setSoldOut(true)
        setProfile((prev: any) => prev ? { ...prev, token_claims: prev.token_limit } : prev)
        return
      }

      if (!result?.ok) {
        setClaimNote('SIGNAL FAILED — TRY AGAIN')
        return
      }

      if (typeof result.token_claims === 'number') {
        setProfile((prev: any) => prev ? {
          ...prev,
          token_claims: result.token_claims,
          token_limit: result.token_limit ?? prev.token_limit,
        } : prev)
      }

      const existing = localStorage.getItem('matrix_user_wallet')
      let wallet = existing ? JSON.parse(existing) : []
      if (!Array.isArray(wallet)) wallet = []

      const tokenToSave = { profile, liveDeals }
      if (!wallet.find((token: any) => token?.profile?.id === profile.id)) {
        wallet.push(tokenToSave)
        localStorage.setItem('matrix_user_wallet', JSON.stringify(wallet))
      }

      window.location.href = '/wallet'
    } catch {
      setClaimNote('SIGNAL FAILED — TRY AGAIN')
    } finally {
      claimingRef.current = false
      setClaiming(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#010201] text-emerald-500 font-black uppercase tracking-[0.5em] animate-pulse flex items-center justify-center italic">Intercepting Signal...</div>

  return (
    <main className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b98108,transparent_70%)] pointer-events-none" />
      
      {/* 🚀 ზომა გასწორებულია 340px-ზე, როგორც ვოლეტში */}
      <div className="z-10 flex flex-col items-center w-full max-w-[340px]">
        {limitValue > 0 && (
          <div className="mb-5 px-5 py-2 rounded-full border border-emerald-500/30 bg-[#040d08] text-emerald-400 text-[9px] font-black uppercase tracking-[0.35em] italic">
            {`${claimsValue} / ${profile.token_limit} CLAIMED`}
          </div>
        )}

        <InfluXCard
          profile={profile}
          liveDeals={liveDeals}
          disableRotation={false}
          onFlip={() => {
            if (!influencerId) return
            trackTokenEvent({ influencerId, eventType: 'flip', source: 'claim' })
          }}
          onDealClick={(deal) => {
            if (!influencerId) return
            trackTokenEvent({
              influencerId,
              eventType: 'deal_click',
              brandId: deal.brandId,
              partnershipId: deal.partnershipId,
              dealId: deal.dealId,
              source: 'claim',
            })
          }}
        >
          
          {/* 🚀 ღილაკი იდენტურია ვოლეტის სტილის */}
          <button 
            onClick={handleSync}
            onDoubleClick={(e) => e.stopPropagation()}
            disabled={blocked || claiming}
            className={`rounded-full font-black uppercase italic whitespace-nowrap transition-all duration-500 ${
              blocked
                ? 'px-6 py-3.5 bg-white/10 text-white/50 text-[9px] tracking-[0.18em] cursor-not-allowed'
                : 'px-12 py-3.5 bg-white text-black text-[11px] tracking-[0.4em] hover:bg-emerald-500 hover:text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95'
            }`}
          >
            {blocked ? 'SOLD OUT / LIMIT REACHED' : claiming ? 'SYNCING...' : 'GET IT'}
          </button>
          
        </InfluXCard>
        {claimNote && (
          <p className="mt-4 text-[9px] text-white/40 font-black uppercase tracking-[0.35em] italic">{claimNote}</p>
        )}
      </div>
    </main>
  )
}

export default function ClaimPage() { 
  return <Suspense fallback={null}><ClaimContent /></Suspense> 
}
