'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import AmountModal from '@/components/AmountModal'
import { motion } from 'framer-motion'

// 📸 Dynamic Scanner Loading
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
  // Added 'no-partnership' step
  const [step, setStep] = useState<'scan' | 'amount' | 'no-partnership'>('scan')
  const [scannedBrand, setScannedBrand] = useState<string | null>(null)
  const [activeDeal, setActiveDeal] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 📸 QR Scanning Logic
  const handleScanSuccess = async (decodedText: string) => {
    try {
      setLoading(true)
      let brandId = decodedText.trim();
      if (brandId.includes('/')) brandId = brandId.split('/').filter(p => p.length > 0).pop() || brandId;
      if (brandId.includes('brand=')) brandId = brandId.split('brand=').pop() || brandId;
      brandId = brandId.split('?')[0];

      setScannedBrand(brandId);
      const activeTokenRaw = localStorage.getItem('matrix_active_token');
      
      if (activeTokenRaw) {
        const token = JSON.parse(activeTokenRaw);
        const influencerId = token.profile?.id || token.id;

        // 🔍 Checking Partnership
        const { data: p, error } = await supabase
          .from('partnerships')
          .select('*, deals(*)')
          .eq('influencer_id', influencerId)
          .eq('brand_id', brandId)
          .single();

        if (!p || error) {
          // ❌ Partnership not found
          setStep('no-partnership');
        } else {
          // ✅ Partnership exists
          setActiveDeal(p);
          setStep('amount');
        }
      } else {
        // If no token is selected at all
        setStep('no-partnership');
      }
    } catch (err) { 
      setStep('no-partnership');
    } finally {
      setLoading(false)
    }
  }

  // 💸 Payment Initiation (for bank integration)
  const handlePaymentConfirm = async (finalPayable: number) => {
    setLoading(true)
    try {
      const discountPct = activeDeal?.user_discount_pct || 0;
      const commissionPct = activeDeal?.commission_percent || 15;
      
      const rawAmount = discountPct < 100 ? (finalPayable / (1 - (discountPct / 100))) : finalPayable;
      const influencerEarned = (rawAmount * commissionPct) / 100;
      const brandEarned = finalPayable - influencerEarned;

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
          brandEarned: Number(brandEarned.toFixed(2)),
          influencerEarned: Number(influencerEarned.toFixed(2))
        })
      })

      const data = await response.json()
      if (data.checkoutUrl) {
        // Redirecting to bank page here
        router.push(data.checkoutUrl)
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      alert("MATRIX ERROR: " + err.message);
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
      
      {/* 1. Scanning Step */}
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

      {/* 2. Error Step (when no partnership exists) */}
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
               Partnership not found. <br/> 
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

      {/* 3. Payment Step (only if partnership exists) */}
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