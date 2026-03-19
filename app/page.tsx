'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import InfluXCard from '@/components/InfluXCard'

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
    <main className="min-h-screen bg-[#010201] text-white flex flex-col items-center p-4">
      
      <header className="w-full max-w-[340px] mt-10 mb-10 border-b border-white/5 pb-6 font-black italic uppercase text-center">
        <h1 className="text-3xl tracking-tighter">InfluX <span className="text-emerald-500 text-glow">Wallet</span></h1>
      </header>

      <div className="w-full flex flex-col items-center gap-16 pb-20">
        {tokens.length === 0 ? (
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em] italic">No Nodes Detected</p>
        ) : (
          tokens.map((token, idx) => (
            // 🏷️ კონტეინერი, რომელიც განსაზღვრავს ზომას (340px - ყველა ტელეფონზე ეტევა)
            <div key={idx} className="relative w-full max-w-[340px] mx-auto flex flex-col items-center">
              
              <InfluXCard profile={token.profile} liveDeals={token.liveDeals} disableRotation={true} />

              {/* 🚀 ღილაკი: იდეალურად სიმეტრიული და ცენტრში */}
              <div className="absolute top-[85%] left-1/2 -translate-x-1/2 z-50">
                <button 
                  onClick={(e) => handleScanToPay(e, token)}
                  className="px-12 py-4 bg-emerald-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-white/10 active:scale-90 transition-all italic whitespace-nowrap"
                >
                  SCAN TO PAY
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </main>
  )
}