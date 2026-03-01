'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState } from 'react'

// ტოკენის დილების გენერაცია
const matrixDeals = Array.from({ length: 116 }, (_, i) => ({
  id: i + 1,
  brand: ['Nike', 'Tesla', 'Apple', 'Adidas', 'Hublot'][i % 5],
  offer: ['20% OFF', '15% OFF', 'ACCESS', '10% OFF', 'VIP Access'][i % 5],
  color: ['#10b981', '#3b82f6', '#a855f7', '#06b6d4', '#f59e0b'][i % 5],
  glow: ['rgba(16,185,129,0.5)', 'rgba(59,130,246,0.5)', 'rgba(168,85,247,0.5)', 'rgba(6,182,212,0.5)', 'rgba(245,158,11,0.5)'][i % 5],
  logo: ['👟', '🚗', '🍎', '👟', '⌚'][i % 5],
}))

export default function MatrixDashboard() {
  const [isFlipped, setIsFlipped] = useState(false)
  
  // 🚀 Spring Physics for Smooth Movement
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-300, 300], [20, -20])
  const rotateY = useTransform(mouseXSpring, [-300, 300], [-20, 20])

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 lg:ml-0 overflow-hidden font-sans">
      
      {/* 1. Matrix Header */}
      <header className="mb-14">
        <h1 className="text-4xl font-black tracking-tighter italic uppercase">
          Influ<span className="text-emerald-500 not-italic">X</span> Vault
        </h1>
        <p className="text-[8px] font-black tracking-[0.5em] text-gray-600 uppercase mt-2 italic">Secure Command Center</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* 2. 🚀 The New Integrated Token (Replacing image_f52219.png red circle) */}
        <div className="xl:col-span-5 flex flex-col items-center">
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.6em] mb-8 italic self-start ml-4">Active Matrix Asset</span>
          
          <div 
            className="relative cursor-pointer w-full flex justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0) }}
            onDoubleClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              style={{ 
                rotateX: isFlipped ? 0 : rotateX, 
                rotateY: isFlipped ? 180 : rotateY, 
                transformStyle: "preserve-3d",
                perspective: "2000px"
              }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
              className="w-[380px] h-[600px] relative"
            >
              
              {/* === FRONT SIDE (Cyborg Influencer X) === */}
              <div 
                className="absolute inset-0 bg-[#040d08]/95 border-2 border-emerald-500/10 rounded-[45px] p-8 flex flex-col items-center shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98110,transparent_70%)]" />
                
                <div className="w-full h-[75%] rounded-[35px] bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center backdrop-blur-3xl">
                    <div className="absolute top-6 w-full px-6 flex justify-center z-20">
                      <motion.div 
                          animate={{ color: ["#10b981", "#3b82f6", "#a855f7", "#06b6d4", "#f59e0b", "#10b981"], textShadow: ["0 0 10px #10b981", "0 0 10px #3b82f6", "0 0 10px #a855f7", "0 0 10px #06b6d4", "0 0 10px #f59e0b", "0 0 10px #10b981"] }}
                          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                          className="text-[9px] font-black uppercase tracking-[0.5em] italic opacity-80"
                      >
                        Double Tap to Flip
                      </motion.div>
                    </div>

                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute inset-0 bg-emerald-500 blur-3xl" />
                    
                    <motion.div animate={{ y: [0, -20, 0], rotateY: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="relative flex items-center justify-center">
                        <span className="text-[240px] relative z-10 filter drop-shadow-[0_0_60px_#10b98166] opacity-90 select-none brightness-150">🤖</span>
                    </motion.div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                    <h3 className="text-4xl font-black italic tracking-[1px] uppercase text-white leading-none mt-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Influencer X</h3>
                    <div className="h-[1px] w-12 bg-emerald-500/40 mt-4" />
                </div>
              </div>

              {/* === BACK SIDE (Synchronized Matrix Deals) === */}
              <div 
                className="absolute inset-0 bg-[#020302] border-2 border-white/5 rounded-[45px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="w-full h-full overflow-y-auto scrollbar-hide p-6 bg-[radial-gradient(circle_at_0%_0%,#ffffff03,transparent_50%)]">
                  <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                    {matrixDeals.map((deal) => (
                      <div key={deal.id} className="aspect-[0.85/1] bg-white/[0.02] border border-white/5 rounded-[30px] p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-700 h-full">
                        <div className="flex flex-col items-center text-center gap-3 relative z-10">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/5 group-hover:border-emerald-500/30 transition-all">{deal.logo}</div>
                            <h3 className="text-[10px] font-black italic uppercase text-white tracking-widest leading-none truncate w-full">{deal.brand}</h3>
                        </div>
                        <div className="flex flex-col items-center justify-center flex-1 relative z-10 py-4">
                          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-center leading-none" style={{ color: deal.color, textShadow: `0 0 25px ${deal.glow}` }}>{deal.offer}</h2>
                        </div>
                        <div className="text-[6px] font-black uppercase tracking-[0.4em] text-gray-700 border-t border-white/5 pt-3 relative z-10 w-full text-center">Auth Node</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3. Profit & Metrics Section */}
        <div className="xl:col-span-7 space-y-10">
          {/* Net Profit Card */}
          <div className="bg-[#040d08] border border-white/5 rounded-[50px] p-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] italic block mb-6">Net Profit ( 9% )</span>
            <div className="flex items-baseline gap-4">
              <h2 className="text-[120px] font-black tracking-tighter italic leading-none">1,282.50</h2>
              <span className="text-4xl font-black text-emerald-500 italic opacity-40">GEL</span>
            </div>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mt-8 italic">Authorized for immediate bank settlement</p>
            
            <button className="w-full bg-white text-black py-8 rounded-[35px] font-black text-sm tracking-[0.6em] uppercase mt-16 hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95">
              Transfer to Bank
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-10">
            <div className="bg-[#040d08] border border-white/5 rounded-[45px] p-12">
              <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest block mb-4 italic">Partner Brands</span>
              <p className="text-6xl font-black italic tracking-tighter">12</p>
            </div>
            <div className="bg-[#040d08] border border-white/5 rounded-[45px] p-12">
              <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest block mb-4 italic">Token Scans</span>
              <p className="text-6xl font-black italic tracking-tighter">842</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}