'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState } from 'react'

export default function MatrixDashboard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 25 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 25 })
  const rotateX = useTransform(mouseYSpring, [-200, 200], [15, -15])
  const rotateY = useTransform(mouseXSpring, [-200, 200], [-15, 15])

  const handleTouch = (e: React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    x.set(e.touches[0].clientX - (rect.left + rect.width / 2))
    y.set(e.touches[0].clientY - (rect.top + rect.height / 2))
  }

  return (
    <main className="p-4 md:p-8 max-w-[500px] mx-auto flex flex-col gap-6 pb-20">
      
      {/* 1. Header - Compact for Mobile */}
      <header className="text-center py-4">
        <h1 className="text-3xl font-black tracking-tighter italic uppercase leading-none">
          Vault <span className="text-emerald-500 font-normal italic">X</span>
        </h1>
        <p className="text-[7px] font-black tracking-[0.4em] text-gray-700 uppercase mt-2">Node v1.0 Active</p>
      </header>

      {/* 2. Responsive Token - Sized for Mobile */}
      <div 
        className="relative w-full aspect-[1/1.5] touch-none"
        onTouchMove={handleTouch}
        onDoubleClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          style={{ rotateX, rotateY: isFlipped ? 180 : rotateY, transformStyle: "preserve-3d", perspective: "1500px" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          className="w-full h-full relative"
        >
          {/* FRONT */}
          <div className="absolute inset-0 bg-[#040d08] border border-white/10 rounded-[35px] p-6 flex flex-col items-center overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
            <div className="w-full h-[75%] rounded-[25px] bg-black/40 border border-white/5 relative flex items-center justify-center overflow-hidden backdrop-blur-xl">
               <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute inset-0 bg-emerald-500/10 blur-3xl" />
               <span className="text-[160px] relative z-10 brightness-125">🤖</span>
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white mt-6 leading-none">Influencer X</h3>
            <div className="h-[1px] w-8 bg-emerald-500/40 mt-4" />
          </div>
          {/* BACK (Content removed for brevity, keep the same structure) */}
          <div className="absolute inset-0 bg-black border border-emerald-500/20 rounded-[35px] overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
             <div className="h-full w-full p-4 overflow-y-auto scrollbar-hide text-center flex items-center justify-center text-[10px] text-gray-500 font-black italic uppercase tracking-widest">Encrypted Deals Matrix</div>
          </div>
        </motion.div>
      </div>

      {/* 3. Metrics Section - Mobile Scale */}
      <div className="space-y-4">
        <div className="bg-[#030804] border border-white/5 rounded-[30px] p-6 relative overflow-hidden">
          <span className="text-emerald-500 text-[8px] font-black uppercase tracking-[0.4em] italic block mb-2">Net Profit</span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black tracking-tighter italic">1,282.50</h2>
            <span className="text-lg font-black text-emerald-500/40 italic uppercase">GEL</span>
          </div>
          <button className="w-full bg-white text-black py-4 rounded-[20px] font-black text-[10px] tracking-[0.4em] uppercase mt-6 active:scale-95 transition-transform">
            Transfer to Bank
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#030804] border border-white/5 rounded-[25px] p-5 text-center">
            <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest block mb-1 italic">Brands</span>
            <p className="text-3xl font-black italic tracking-tighter">12</p>
          </div>
          <div className="bg-[#030804] border border-white/5 rounded-[25px] p-5 text-center">
            <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest block mb-1 italic">Scans</span>
            <p className="text-3xl font-black italic tracking-tighter">842</p>
          </div>
        </div>
      </div>

    </main>
  )
}