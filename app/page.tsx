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

  // 🚀 მთავარი ფუნქცია: ინახავს აქტიურ ტოკენს და მიდის სკანერზე
  const handleScanToPay = (e: React.MouseEvent, token: any) => {
    e.stopPropagation() // ბარათს არ ვაძლევთ გადაბრუნების უფლებას
    localStorage.setItem('matrix_active_token', JSON.stringify(token))
    router.push('/pay') // 👈 გადადის შენს მიერ მოწოდებულ PaymentFlowPage-ზე
  }

  if (loading) return <div className="min-h-screen bg-[#010201] text-emerald-500 font-black animate-pulse flex items-center justify-center uppercase tracking-widest italic">Decrypting Vault...</div>

  return (
    <main className="min-h-screen bg-[#010201] text-white p-6 md:p-14 overflow-x-hidden relative">
      <header className="mb-20 border-b border-white/5 pb-12 font-black italic uppercase">
        <h1 className="text-6xl tracking-tighter">InfluX <span className="text-emerald-500 text-glow">Wallet</span></h1>
      </header>

      {tokens.length === 0 ? (
        <div className="h-64 flex items-center justify-center border border-white/5 rounded-[50px] bg-white/[0.01]">
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em] italic">No Nodes Detected</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 justify-items-center">
          {tokens.map((token, idx) => (
            <div key={idx} className="w-full max-w-[420px]">
              <InfluXCard profile={token.profile} liveDeals={token.liveDeals}>
                
                {/* 🚀 აწეული (-mt-6), დაპატარავებული და ფუნქციური ღილაკი */}
                <div className="-mt-6 flex justify-center w-full relative z-30">
                  <button 
                    onClick={(e) => handleScanToPay(e, token)}
                    className="px-12 py-4 bg-emerald-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] italic active:scale-95"
                  >
                    SCAN TO PAY
                  </button>
                </div>

              </InfluXCard>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}