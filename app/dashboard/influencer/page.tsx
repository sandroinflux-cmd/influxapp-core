'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState } from 'react'

export default function MatrixDashboard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // 🚀 მსუბუქი ფიზიკა ჭედვის საწინააღმდეგოდ
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 25 })
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 25 })
  const rotateX = useTransform(mouseYSpring, [-200, 200], [15, -15])
  const rotateY = useTransform(mouseXSpring, [-200, 200], [-15, 15])

  const handleTouch = (e: React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    x.set(e.touches[0].clientX - (rect.left + rect.width / 2))
    y.set(e.touches[0].clientY - (rect.top + rect.height / 2))
  }

  return (
    <div className="p-4 md:p-10 max-w-[500px] mx-auto flex flex-col gap-6 pb-20">
      
      {/* 1. Header - Ultra Compact */}
      <header className="text-center pt-4">
        <h1 className="text-3xl font-black tracking-tighter italic uppercase leading-none">
          Vault <span className="text-emerald-500 italic">X</span>
        </h1>
        <p className="text-[7px] font-black tracking-[0.5em] text-gray-700 uppercase mt-2 italic">Secure Matrix Protocol</p>
      </header>

      {/* 2. Responsive Token */}
      <div 
        className="relative w-full aspect-[1/1.55] touch-none"
        onTouchMove={handleTouch}
        onDoubleClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          style={{ rotateX, rotateY: isFlipped ? 180 : rotateY, transformStyle: "preserve-3d", perspective: "1500px" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          className="w-full h-full relative"
        >
          {/* FRONT */}
          <div className="absolute inset-0 bg-[#040d08] border border-white/10 rounded-[40px] p-6 flex flex-col items-center overflow-hidden shadow-2xl" style={{ backfaceVisibility: "hidden" }}>
            <div className="w-full h-[74%] rounded-[30px] bg-black/50 border border-white/5 relative flex items-center justify-center overflow-hidden backdrop-blur-2xl shadow-inner">
               <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute inset-0 bg-emerald-500/10 blur-3xl" />
               <span className="text-[170px] relative z-10 brightness-110 drop-shadow-[0_0_30px_#10b98133]">🤖</span>
               <div className="absolute top-4 text-[7px] font-black uppercase tracking-[0.4em] text-emerald-500/40 italic">Double Tap to Flip</div>
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white mt-8 leading-none">Influencer X</h3>
            <div className="h-[1px] w-10 bg-emerald-500/30 mt-4" />
          </div>

          {/* BACK */}
          <div className="absolute inset-0 bg-black border border-emerald-500/20 rounded-[40px] overflow-hidden p-6" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
             <div className="h-full w-full overflow-y-auto scrollbar-hide text-center flex flex-col items-center justify-center gap-4">
                <span className="text-[8px] text-emerald-500/60 font-black tracking-widest uppercase italic">Secure Node Storage</span>
                <p className="text-[10px] text-gray-500 font-black italic uppercase leading-relaxed tracking-wider">Matrix deals data is encrypted. Scan to access privilege nodes.</p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Metrics Section - Mobile Proximity */}
      <div className="space-y-4">
        <div className="bg-[#030804] border border-white/5 rounded-[35px] p-8 relative overflow-hidden group shadow-xl">
          <span className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.4em] italic block mb-3 opacity-70">Net Profit</span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-6xl font-black tracking-tighter italic">1,282.50</h2>
            <span className="text-xl font-black text-emerald-500/40 italic uppercase">GEL</span>
          </div>
          <button className="w-full bg-white text-black py-5 rounded-[22px] font-black text-[11px] tracking-[0.4em] uppercase mt-8 active:scale-95 transition-all shadow-2xl">
            Transfer to Bank
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#030804] border border-white/5 rounded-[30px] p-6 text-center shadow-lg">
            <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest block mb-2 italic">Partner Brands</span>
            <p className="text-4xl font-black italic tracking-tighter">12</p>
          </div>
          <div className="bg-[#030804] border border-white/5 rounded-[30px] p-6 text-center shadow-lg">
            <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest block mb-2 italic">Token Scans</span>
            <p className="text-4xl font-black italic tracking-tighter">842</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}