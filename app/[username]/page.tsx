'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import InfluXCard from '@/components/InfluXCard'

export default function MobileInfluencerPublicProfile() {
  const { username } = useParams()
  const router = useRouter()
  const [isClaimed, setIsClaimed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const influencerName = username ? username.toString().toUpperCase() : 'ANDRO'

  const handleClaim = () => {
    setIsLoading(true)
    
    // 💾 Storage Protocol: ტოკენის შენახვა ვოლეტისთვის
    const newToken = {
      id: Date.now(),
      name: `${influencerName} Protocol`,
      user_discount_pct: 20,
      logo: '🤖',
      token: `$${influencerName}`,
      brands: { name: influencerName }
    }

    const existingTokens = JSON.parse(localStorage.getItem('influx_tokens') || '[]')
    localStorage.setItem('influx_tokens', JSON.stringify([...existingTokens, newToken]))

    setTimeout(() => {
      setIsLoading(false)
      setIsClaimed(true)
    }, 1500)
  }

  return (
    <main className="min-h-screen w-full bg-[#020202] text-white flex flex-col items-center overflow-hidden font-sans relative">
      
      {/* 💠 1. Header Block */}
      <header className="w-full text-center pt-10 pb-2 z-10 shrink-0">
         <span className="text-[9px] font-black text-[#059669] uppercase tracking-[0.6em] italic block mb-1">Verified Matrix Node</span>
         <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
            {influencerName} <span className="text-[#059669]">/</span> <span className="opacity-20">VLT</span>
         </h1>
      </header>

      {/* 🦾 2. Main Token Area */}
      <div className="flex-1 w-full flex items-center justify-center px-6 relative z-10">
         <div className="w-full max-w-[380px] flex items-center justify-center transform scale-[0.88] sm:scale-100 transition-transform origin-center">
            <InfluXCard deal={{ brands: { name: influencerName } }} />
         </div>
      </div>

      {/* ⚡ 3. Refined GET IT Action */}
      <footer className="w-full max-w-[360px] px-8 pb-10 z-20 shrink-0 mt-[-20px]">
        <AnimatePresence mode="wait">
          {!isClaimed ? (
            <motion.div 
              key="claim-btn" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex justify-center"
            >
              <motion.button 
                onClick={handleClaim}
                disabled={isLoading}
                // 🚀 Instant Glow Protocol: მუქი მწვანე და სწრაფი რეაქცია
                whileHover={{ 
                  backgroundColor: "#059669", 
                  color: "#ffffff", 
                  boxShadow: "0 0 50px rgba(5, 150, 105, 0.5)",
                  transition: { duration: 0.1 } // მყისიერი ანთება
                }}
                whileTap={{ scale: 0.94, backgroundColor: "#047857" }}
                className="w-full bg-white text-black py-7 rounded-[30px] font-black text-[15px] uppercase tracking-[0.8em] italic transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden pl-4"
              >
                {isLoading ? (
                  <span className="animate-pulse tracking-[0.4em]">SYNCING...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    GET IT <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>→</motion.span>
                  </span>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="success" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-center space-y-4"
            >
              <div className="bg-[#059669]/10 border border-[#059669]/20 py-6 rounded-[30px] backdrop-blur-md">
                <p className="text-[10px] font-black text-[#059669] uppercase tracking-[0.4em] italic">Vault Synchronized</p>
              </div>
              <button 
                onClick={() => router.push('/dashboard/user/wallet')}
                className="w-full bg-blue-600 py-6 rounded-[30px] font-black text-[11px] uppercase tracking-[0.5em] italic shadow-2xl hover:bg-blue-500 transition-all"
              >
                VIEW WALLET →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </main>
  )
}