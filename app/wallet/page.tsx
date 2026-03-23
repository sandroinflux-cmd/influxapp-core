'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import InfluXCard from '@/components/InfluXCard'
import { motion } from 'framer-motion' 

export default function UnifiedWallet() {
  const router = useRouter()
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('matrix_user_wallet')
    if (saved) setTokens(JSON.parse(saved))
    setLoading(false)
  }, [])

  const handleScanToPay = (e: React.MouseEvent, token: any) => {
    e.stopPropagation() 
    localStorage.setItem('matrix_active_token', JSON.stringify(token))
    router.push('/pay') 
  }

  if (loading) return <div className="min-h-screen bg-[#010201] text-emerald-500 font-black animate-pulse flex items-center justify-center uppercase tracking-widest italic">Decrypting Vault...</div>

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center p-4 selection:bg-red-500 selection:text-black">
      
      {/* 🛰️ HEADER: CLEAN & CENTERED */}
      <header className="w-full max-w-[340px] mt-10 mb-10 border-b border-white/5 pb-6 font-black italic uppercase text-center relative">
        <h1 className="text-3xl tracking-tighter">InfluX <span className="text-emerald-500 text-glow">TOKENS</span></h1>
      </header>

      <div className="w-full flex flex-col items-center gap-16 pb-20">
        {tokens.length === 0 ? (
          // 📭 Empty State: Aggressive & Provocative
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center border-2 border-white/5 rounded-[40px] bg-black/40 w-full max-w-[340px] p-10 text-center gap-6 shadow-[0_0_80px_rgba(255,255,255,0.01)]"
          >
            {/* პატარა აგრესიული დეკორატიული ელემენტი (Raw Red Pulse) */}
            <div className="h-10 w-10 rounded-full border-2 border-gray-800 flex items-center justify-center mb-2">
              <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_#dc2626]" />
            </div>
            
            {/* 🔥 AGGRESSIVE ENGLISH TEXT */}
            <p className="text-[14px] md:text-base text-white font-bold uppercase tracking-[0.15em] italic leading-relaxed">
              ZERO TOKENS FOUND. Either you&apos;re lagging behind, or your &quot;favorite&quot; creator hasn&apos;t created yet.
            </p>
            
            {/* 🔴 RED GLOW CTA BUTTON */}
            <button 
              onClick={() => router.push('/')}
              className="mt-6 px-10 py-3 bg-transparent text-gray-500 rounded-full font-black text-[10px] uppercase tracking-[0.5em] italic border-2 border-gray-800 hover:border-red-600 hover:text-red-600 transition-all active:scale-95 text-glow-red"
            >
              DEMAND VALUE
            </button>
          </motion.div>
        ) : (
          // 💳 Populated State: როცა ტოკენები არის (უნაცვლელი)
          tokens.map((token, idx) => (
            <div key={idx} className="relative w-full max-w-[340px] mx-auto flex flex-col items-center group">
              <InfluXCard profile={token.profile} liveDeals={token.liveDeals} disableRotation={true}>
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
    </main>
  )
}