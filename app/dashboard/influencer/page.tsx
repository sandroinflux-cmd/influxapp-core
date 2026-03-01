'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState } from 'react'

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
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // 🚀 Performance Fix: მობილურისთვის Stiffness შემცირებულია ჭედვის თავიდან ასაცილებლად
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 25, mass: 0.5 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 25, mass: 0.5 })

  const rotateX = useTransform(mouseYSpring, [-300, 300], [20, -20])
  const rotateY = useTransform(mouseXSpring, [-300, 300], [-20, 20])

  const handleMouseMove = (event: React.MouseEvent | React.TouchEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as React.MouseEvent).clientY
    
    x.set(clientX - (rect.left + rect.width / 2))
    y.set(clientY - (rect.top + rect.height / 2))
  }

  return (
    // 📱 პადინგები შემცირებულია მობილურისთვის (p-4), დესკტოპისთვის რჩება p-14
    <main className="min-h-screen w-full bg-[#010201] text-white p-4 md:p-14 lg:ml-0 overflow-x-hidden font-sans">
      
      {/* 1. Matrix Header */}
      <header className="mb-10 md:mb-14 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase">
          Influ<span className="text-emerald-500 not-italic">X</span> Vault
        </h1>
        <p className="text-[7px] md:text-[8px] font-black tracking-[0.5em] text-gray-600 uppercase mt-2 italic">Secure Command Center</p>
      </header>

      {/* 📱 Grid-ი იცვლება მობილურზე (flex-col), დესკტოპზე (grid-cols-12) */}
      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8 md:gap-10 items-center xl:items-start">
        
        {/* 2. Integrated Token Section */}
        <div className="w-full xl:col-span-5 flex flex-col items-center max-w-[400px]">
          <span className="text-[8px] md:text-[9px] font-black text-gray-600 uppercase tracking-[0.6em] mb-6 italic xl:self-start xl:ml-4">Active Matrix Asset</span>
          
          <div 
            className="relative cursor-pointer w-full flex justify-center touch-none"
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
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
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="w-full aspect-[1/1.6] max-w-[340px] md:max-w-[380px] relative"
            >
              
              {/* === FRONT SIDE (Cyborg Influencer X) === */}
              <div 
                className="absolute inset-0 bg-[#040d08]/95 border-2 border-emerald-500/10 rounded-[40px] md:rounded-[45px] p-6 md:p-8 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98110,transparent_70%)]" />
                <div className="w-full h-[72%] rounded-[30px] bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center backdrop-blur-3xl">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-4 text-[7px] font-black uppercase tracking-widest text-emerald-500/60 z-20">Double Tap to Flip</motion.div>
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute inset-0 bg-emerald-500 blur-3xl" />
                    <span className="text-[180px] md:text-[240px] relative z-10 filter drop-shadow-[0_0_60px_#10b98166] opacity-90 select-none">🤖</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 mt-4">
                    <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase text-white">Influencer X</h3>
                    <div className="h-[1px] w-10 bg-emerald-500/40 mt-3" />
                </div>
              </div>

              {/* === BACK SIDE (Synchronized Matrix Deals) === */}
              <div 
                className="absolute inset-0 bg-[#020302] border-2 border-white/5 rounded-[40px] md:rounded-[45px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="w-full h-full overflow-y-auto scrollbar-hide p-4 md:p-6 bg-[radial-gradient(circle_at_0%_0%,#ffffff03,transparent_50%)]">
                  <div className="grid grid-cols-2 gap-3 md:gap-4 auto-rows-fr">
                    {matrixDeals.map((deal) => (
                      <div key={deal.id} className="aspect-[0.85/1] bg-white/[0.02] border border-white/5 rounded-[20px] md:rounded-[30px] p-4 flex flex-col justify-between group relative overflow-hidden h-full">
                        <div className="flex flex-col items-center text-center gap-2 relative z-10">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center text-lg md:text-xl border border-white/5 transition-all">{deal.logo}</div>
                            <h3 className="text-[7px] md:text-[10px] font-black italic uppercase text-white tracking-widest truncate w-full">{deal.brand}</h3>
                        </div>
                        <h2 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase text-center leading-none mt-2" style={{ color: deal.color, textShadow: `0 0 20px ${deal.glow}` }}>{deal.offer}</h2>
                        <div className="text-[5px] md:text-[6px] font-black uppercase tracking-[0.4em] text-gray-700 border-t border-white/5 pt-2 text-center mt-2">Auth Node</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3. Profit & Metrics Section */}
        <div className="w-full xl:col-span-7 space-y-6 md:space-y-10">
          {/* Net Profit Card */}
          <div className="bg-[#040d08] border border-white/5 rounded-[35px] md:rounded-[50px] p-8 md:p-16 relative overflow-hidden group">
            <span className="text-emerald-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] italic block mb-4 md:mb-6">Net Profit ( 9% )</span>
            <div className="flex items-baseline gap-2 md:gap-4 flex-wrap">
              <h2 className="text-5xl md:text-7xl lg:text-[120px] font-black tracking-tighter italic leading-none">1,282.50</h2>
              <span className="text-xl md:text-4xl font-black text-emerald-500 italic opacity-40">GEL</span>
            </div>
            
            <button className="w-full bg-white text-black py-5 md:py-8 rounded-[25px] md:rounded-[35px] font-black text-[10px] md:text-sm tracking-[0.4em] md:tracking-[0.6em] uppercase mt-10 md:mt-16 hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95">
              Transfer to Bank
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-10">
            <div className="bg-[#040d08] border border-white/5 rounded-[30px] md:rounded-[45px] p-6 md:p-12 text-center md:text-left">
              <span className="text-[7px] md:text-[8px] text-gray-700 font-black uppercase tracking-widest block mb-2 md:mb-4 italic">Brands</span>
              <p className="text-4xl md:text-6xl font-black italic tracking-tighter">12</p>
            </div>
            <div className="bg-[#040d08] border border-white/5 rounded-[30px] md:rounded-[45px] p-6 md:p-12 text-center md:text-left">
              <span className="text-[7px] md:text-[8px] text-gray-700 font-black uppercase tracking-widest block mb-2 md:mb-4 italic">Scans</span>
              <p className="text-4xl md:text-6xl font-black italic tracking-tighter">842</p>
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