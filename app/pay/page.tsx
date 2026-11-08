'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import AmountModal from '@/components/AmountModal'
import { motion } from 'framer-motion'

const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-white/[0.02] border border-white/5 animate-pulse rounded-[40px] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] italic">Initializing Optic Sensor...</p>
    </div>
  )
})

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const brandFromUrl = searchParams.get('brand') || searchParams.get('brandId')
  const autoResolved = useRef(false)

  const [step, setStep] = useState<'scan' | 'select-token' | 'amount' | 'no-partnership'>('scan')
  const [scannedBrand, setScannedBrand] = useState<string | null>(null)
  const [activeDeal, setActiveDeal] = useState<any>(null)
  const [availableOptions, setAvailableOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(!!brandFromUrl)

  const applyPartnership = (p: any) => {
    const dealObj = Array.isArray(p.deals) ? p.deals[0] : p.deals
    const totalShare = Number(p.total_percentage ?? dealObj?.totalShare ?? 0)
    let userDiscountPct = Number(p.user_discount_pct ?? 0)
    let influencerCutPct = Number(p.influencer_cut_pct ?? 0)

    // ✅ მკაცრი სისტემური წესი: თუ ბაზაში ორივე 0-ია, ვიყენებთ მთლიან totalShare-ს სრულ ფასდაკლებაში
    if (userDiscountPct === 0 && influencerCutPct === 0 && totalShare > 0) {
      userDiscountPct = totalShare
      influencerCutPct = 0
    }

    setActiveDeal({
      ...p,
      user_discount_pct: userDiscountPct,
      influencer_cut_pct: influencerCutPct,
      brand: dealObj?.title || 'MATRIX PARTNER',
      logo: dealObj?.logo || '💎'
    })
    setStep('amount')
  }

  const resolvePartnership = async (brandId: string) => {
    try {
      setLoading(true)
      setScannedBrand(brandId)

      const { data: allBrandPartnerships, error } = await supabase
        .from('partnerships')
        .select('*, deals(*)')
        .eq('brand_id', brandId)
        .eq('status', 'active')

      if (error || !allBrandPartnerships || allBrandPartnerships.length === 0) {
        setStep('no-partnership')
        return
      }

      const pushedPartnerships = allBrandPartnerships.filter((p: any) => p.is_pushed_to_token)
      const candidates = pushedPartnerships.length > 0 ? pushedPartnerships : allBrandPartnerships

      const activeTokenRaw = localStorage.getItem('matrix_active_token')
      if (activeTokenRaw) {
        const token = JSON.parse(activeTokenRaw)
        const influencerId = token.profile?.id || token.id
        const matched = candidates.find((p: any) => p.influencer_id === influencerId)
        if (matched) {
          applyPartnership(matched)
          return
        }
      }

      const walletRaw = localStorage.getItem('matrix_user_wallet')
      const wallet = walletRaw ? JSON.parse(walletRaw) : []
      const walletInfIds = [...new Set(wallet.map((t: any) => t.profile?.id || t.id).filter(Boolean))]

      const walletMatches = candidates.filter((p: any) => walletInfIds.includes(p.influencer_id))

      if (walletMatches.length === 1) {
        const chosen = walletMatches[0]
        const matchedToken = wallet.find((t: any) => (t.profile?.id || t.id) === chosen.influencer_id)
        if (matchedToken) {
          localStorage.setItem('matrix_active_token', JSON.stringify(matchedToken))
        }
        applyPartnership(chosen)
        return
      }

      const poolToShow = walletMatches.length > 1 ? walletMatches : candidates

      if (poolToShow.length === 1) {
        applyPartnership(poolToShow[0])
        return
      }

      const infIds = [...new Set(poolToShow.map((p: any) => p.influencer_id).filter(Boolean))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', infIds)

      const enriched = poolToShow.map((p: any) => ({
        ...p,
        influencerProfile: profiles?.find((prof: any) => prof.id === p.influencer_id) || null
      }))

      setAvailableOptions(enriched)
      setStep('select-token')
    } catch (err) {
      setStep('no-partnership')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!brandFromUrl || autoResolved.current) return
    autoResolved.current = true
    resolvePartnership(brandFromUrl)
  }, [brandFromUrl])

  const handleScanSuccess = async (decodedText: string) => {
    let brandId = decodedText.trim()
    if (brandId.includes('/')) brandId = brandId.split('/').filter(p => p.length > 0).pop() || brandId
    if (brandId.includes('brand=')) brandId = brandId.split('brand=').pop() || brandId
    brandId = brandId.split('?')[0]
    await resolvePartnership(brandId)
  }

  const handlePaymentConfirm = async (
    finalPayable: number,
    splitMeta?: { rawAmount?: number; discountPct?: number; commissionPct?: number }
  ) => {
    setLoading(true)
    try {
      const discountPct = Number(splitMeta?.discountPct ?? activeDeal?.user_discount_pct ?? 0)
      const commissionPct = Number(splitMeta?.commissionPct ?? activeDeal?.influencer_cut_pct ?? 0)

      const rawAmount =
        splitMeta?.rawAmount ??
        (discountPct > 0 && discountPct < 100
          ? finalPayable / (1 - discountPct / 100)
          : finalPayable)

      const influencerEarned = Number(((rawAmount * commissionPct) / 100).toFixed(2))
      const brandEarned = Number((finalPayable - influencerEarned).toFixed(2))

      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(rawAmount.toFixed(2)),
          finalAmount: Number(finalPayable.toFixed(2)),
          brandId: scannedBrand,
          influencerId: activeDeal?.influencer_id || null,
          dealId: activeDeal?.deal_id || null,
          discountPercent: discountPct,
          commissionPercent: commissionPct,
          brandEarned,
          influencerEarned
        })
      })

      const data = await response.json()
      if (data.checkoutUrl) {
        router.push(data.checkoutUrl)
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      alert('MATRIX ERROR: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && step === 'scan') return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-emerald-500 font-black animate-pulse tracking-[0.5em] uppercase italic text-[10px]">Analyzing Node Connection...</p>
    </div>
  )

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      {step === 'scan' && (
        <div className="space-y-10 animate-in fade-in zoom-in duration-700">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Scan <span className="text-emerald-500 text-glow">Brand</span></h1>
            <p className="text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase italic text-glow-none">Verify partnership within the matrix</p>
          </div>
          <QRScanner onScanSuccess={handleScanSuccess} />
          <button onClick={() => router.back()} className="w-full py-4 text-[9px] font-black text-gray-700 uppercase tracking-[0.5em] italic hover:text-white transition-colors">[ Abort ]</button>
        </div>
      )}

      {step === 'select-token' && (
        <div className="bg-[#050505] border border-emerald-500/30 rounded-[35px] p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Select <span className="text-emerald-500">Token</span></h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Choose which creator token to apply</p>
          </div>

          <div className="space-y-3">
            {availableOptions.map((opt) => {
              const dealObj = Array.isArray(opt.deals) ? opt.deals[0] : opt.deals
              const totalShare = Number(opt.total_percentage ?? dealObj?.totalShare ?? 0)
              const discount =
                opt.user_discount_pct === 0 && opt.influencer_cut_pct === 0 && totalShare > 0
                  ? totalShare
                  : Number(opt.user_discount_pct ?? 0)

              return (
                <button
                  key={opt.id}
                  onClick={() => applyPartnership(opt)}
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 flex items-center justify-between transition-all text-left"
                >
                  <div>
                    <p className="text-sm font-black uppercase italic text-white">
                      {opt.influencerProfile?.full_name || opt.influencerProfile?.username || 'Creator Token'}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                      {dealObj?.title || 'Partner Offer'}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs">
                    -{discount}% OFF
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 'no-partnership' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center border-2 border-red-500/20 rounded-[45px] bg-black/40 p-12 text-center gap-8 shadow-[0_0_80px_rgba(239,68,68,0.05)]"
        >
          <div className="h-16 w-16 rounded-full border-2 border-red-500/30 flex items-center justify-center">
            <span className="text-red-500 text-3xl font-mono">!</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Access Denied</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest italic leading-relaxed">
              Partnership not found. <br />
              This offer is not linked to your Node.
            </p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('matrix_active_token'); router.push('/wallet') }}
            className="w-full py-4 bg-red-600/10 border border-red-500/50 text-red-500 rounded-full font-black text-[10px] uppercase tracking-[0.4em] italic hover:bg-red-600 hover:text-white transition-all active:scale-95"
          >
            Return to Wallet
          </button>
        </motion.div>
      )}

      {step === 'amount' && (
        <AmountModal
          deal={activeDeal}
          onConfirm={handlePaymentConfirm}
          onCancel={() => { localStorage.removeItem('matrix_active_token'); router.push('/wallet') }}
        />
      )}
    </div>
  )
}

export default function PaymentFlowPage() {
  return (
    <main className="min-h-screen bg-[#010201] text-white flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98105,transparent_70%)] pointer-events-none" />
      <Suspense fallback={null}>
        <PaymentContent />
      </Suspense>
    </main>
  )
}