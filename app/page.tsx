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
    // 🌍 p-6-დან დავიყვანეთ p-4-ზე მობილურისთვის, რომ სივიწროვე არ შეიქმნას
    <main className="min-h-screen bg-[#010201] text-white p-4 md:p-14 overflow-x-hidden relative flex flex-col items-center">
      
      {/* 🔝 HEADER: დავაპატარავეთ მობილურისთვის (text-4xl და mb-10), რომ ბარათი მალე გამოჩნდეს */}
      <header className="mb-10 md:mb-20 border-b border-white/5 pb-6 md:pb-12 font-black italic uppercase w-full max-w-7xl">
        <h1 className="text-4xl md:text-6xl tracking-tighter">InfluX <span className="text-emerald-500 text-glow">Wallet</span></h1>
      </header>

      {tokens.length === 0 ? (
        <div className="h-64 flex items-center justify-center border border-white/5 rounded-[50px] bg-white/[0.01] w-full max-w-[320px]">
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em] italic">No Nodes Detected</p>
        </div>
      ) : (
        // 🌀 GRID: justify-items-center არის, მაგრამ mx-auto-ც დავამატეთ safe-სთვის
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16 justify-items-center w-full max-w-7xl">
          {tokens.map((token, idx) => (
            // 🏷️ TOKEN WRAPPER: აი აქ არის ძაღლის თავი დამარხული.
            // max-w-[420px] შევცვალე [320px]-ით (ქვითრის/Pass-ის ზომა).
            // დავამატე mx-auto, რომ გრიდში იდეალურად ცენტრში დაჯდეს.
            <div key={idx} className="w-full max-w-[320px] mx-auto flex flex-col items-center">
              
              {/* ⚠️ InfluXCard-ის შიგნით Transform-ები (rotate) უნდა გაითიშოს [username] გვერდიდან თუ მოდის, თორემ tilted გამოჩნდება მაინც */}
              <InfluXCard profile={token.profile} liveDeals={token.liveDeals}>
                
                {/* 🚀 ღილაკი: ცენტრში, compact ზომით (-mt-8) */}
                <div className="-mt-8 flex justify-center w-full relative z-30 px-4">
                  <button 
                    onClick={(e) => handleScanToPay(e, token)}
                    className="px-10 py-3.5 bg-emerald-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] italic active:scale-95 whitespace-nowrap"
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