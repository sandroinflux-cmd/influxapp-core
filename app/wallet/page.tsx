'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import InfluXCard from '@/components/InfluXCard'
import { motion, AnimatePresence } from 'framer-motion' 
import { supabase } from '@/lib/supabase'

export default function UnifiedWallet() {
  const router = useRouter()
  const [tokens, setTokens] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [totalSaved, setTotalSaved] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeWallet = async () => {
      // 1. ტრანზაქციების ისტორიის ამოღება (ლოკალური მეხსიერებიდან)
      const savedHistory = localStorage.getItem('matrix_user_transactions')
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        setHistory(parsedHistory)
        const savedAmount = parsedHistory.reduce((acc: number, tx: any) => acc + (tx.saved || 0), 0)
        setTotalSaved(savedAmount)
      }

      // 2. ტოკენების ამოღება და 🔄 ავტომატური სინქრონიზაცია ბაზასთან
      const savedTokens = localStorage.getItem('matrix_user_wallet')
      if (savedTokens) {
        const parsedTokens = JSON.parse(savedTokens)
        
        // სათითაოდ ვამოწმებთ თითოეული ტოკენის (ინფლუენსერის) ახალ მონაცემებს
        const syncedTokens = await Promise.all(parsedTokens.map(async (token: any) => {
          const infId = token.profile?.id
          if (!infId) return token

          try {
            // ახალი პროფილის და დილების ამოღება
            const { data: prof } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', infId).single()
            const { data: dealsData } = await supabase.from('partnerships').select('*, deals(*)').eq('influencer_id', infId).eq('is_pushed_to_token', true)
            
            // 🚀 გასწორდა: დაემატა : any[]
            let freshLiveDeals: any[] = []
            
            if (dealsData) {
              freshLiveDeals = dealsData.map((d: any, i: number) => ({
                id: d.id || i,
                brand: d.deals?.title || 'MATRIX NODE',
                offer: `${d.user_discount_pct || 0}% OFF`,
                logo: d.deals?.logo || '💎',
                backIntelPhone: d.deals?.intel?.phone || 'Secret Node',
                intel: d.deals?.intel || {}
              }))
            }

            return { profile: prof || token.profile, liveDeals: freshLiveDeals }
          } catch (e) {
            return token // თუ ინტერნეტი არ აქვს, ძველ ვერსიას დატოვებს
          }
        }))

        setTokens(syncedTokens)
        localStorage.setItem('matrix_user_wallet', JSON.stringify(syncedTokens)) // ვინახავთ განახლებულ ვერსიას
      }
      
      setLoading(false)
    }

    initializeWallet()
  }, [])

  const handleScanToPay = (e: React.MouseEvent, token: any) => {
    e.stopPropagation() 
    localStorage.setItem('matrix_active_token', JSON.stringify(token))
    router.push('/pay') 
  }

  if (loading) return <div className="min-h-screen bg-[#010201] text-emerald-500 font-black animate-pulse flex items-center justify-center uppercase tracking-widest italic">Decrypting Vault...</div>

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center p-4 selection:bg-emerald-500 selection:text-black">
      
      {/* 🛰️ HEADER */}
      <header className="w-full max-w-[340px] mt-8 mb-6 font-black italic uppercase text-center relative">
        <h1 className="text-3xl tracking-tighter">Personal <span className="text-emerald-500 text-glow">Vault</span></h1>
      </header>

      {/* 💸 FINANCIAL DASHBOARD (ისტორია და დანაზოგი) */}
      <div className="w-full max-w-[340px] mb-10">
        <div className="bg-[#040d08] border border-white/5 rounded-[40px] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.05)]">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <span className="text-8xl italic font-black">₾</span>
          </div>
          
          <span className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.5em] italic block mb-2">Total Matrix Savings</span>
          <h2 className="text-6xl font-black italic tracking-tighter text-white leading-none">
            {totalSaved.toFixed(2)} <span className="text-2xl text-emerald-500 opacity-50">₾</span>
          </h2>
        </div>

        {/* Recent Transactions List */}
        {history.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-[9px] text-gray-500 uppercase tracking-widest font-black italic px-4 py-2">Recent Activity</h3>
            {history.slice(0, 3).map((tx, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[20px] p-4 flex justify-between items-center hover:border-emerald-500/20 transition-all">
                <div>
                  <span className="text-xs font-black text-white uppercase italic tracking-widest block">{tx.brandName}</span>
                  <span className="text-[8px] text-gray-600 uppercase tracking-widest font-bold block mt-0.5">{tx.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-500 font-black italic text-sm block">Saved: {tx.saved.toFixed(2)}₾</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold block mt-0.5">Paid: {tx.paid.toFixed(2)}₾</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-[340px] border-t border-white/10 pt-8 mb-6 flex items-center justify-between px-2">
        <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.5em] italic">Active Tokens</span>
      </div>

      {/* 💳 TOKENS AREA */}
      <div className="w-full flex flex-col items-center gap-16 pb-20">
        {tokens.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center border-2 border-white/5 rounded-[40px] bg-black/40 w-full max-w-[340px] p-10 text-center gap-6 shadow-[0_0_80px_rgba(255,255,255,0.01)]"
          >
            <div className="h-10 w-10 rounded-full border-2 border-gray-800 flex items-center justify-center mb-2">
              <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_#dc2626]" />
            </div>
            <p className="text-[14px] md:text-base text-white font-bold uppercase tracking-[0.15em] italic leading-relaxed">
              ZERO TOKENS FOUND. EITHER YOU'RE LAGGING BEHIND, OR YOUR FAVORITE CREATOR HASN'T CREATED YET.
            </p>
          </motion.div>
        ) : (
          tokens.map((token, idx) => (
            <div key={idx} className="relative w-full max-w-[340px] mx-auto flex flex-col items-center group">
              <InfluXCard profile={token.profile} liveDeals={token.liveDeals} disableRotation={false}>
                <button 
                  onClick={(e) => handleScanToPay(e, token)}
                  className="px-10 py-3.5 bg-emerald-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:bg-emerald-500 border border-white/10 active:scale-90 transition-all italic whitespace-nowrap"
                >
                  SCAN TO PAY
                </button>
              </InfluXCard>
            </div>
          ))
        )}
      </div>

      <style jsx global>{`
        .text-glow { text-shadow: 0 0 20px rgba(16,185,129,0.5); }
      `}</style>
    </main>
  )
}