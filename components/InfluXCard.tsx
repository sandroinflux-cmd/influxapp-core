'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, ReactNode } from 'react'

const matrixDeals = Array.from({ length: 116 }, (_, i) => ({
  id: i + 1,
  brand: ['Nike', 'Tesla', 'Apple', 'Adidas', 'Hublot'][i % 5],
  offer: ['20% OFF', '15% OFF', 'ACCESS', '10% OFF', 'VIP Access'][i % 5],
  color: ['#10b981', '#3b82f6', '#a855f7', '#06b6d4', '#f59e0b'][i % 5],
  glow: ['rgba(16,185,129,0.5)', 'rgba(59,130,246,0.5)', 'rgba(168,85,247,0.5)', 'rgba(6,182,212,0.5)', 'rgba(245,158,11,0.5)'][i % 5],
  logo: ['👟', '🚗', '🍎', '👟', '⌚'][i % 5],
}))

export default function InfluXCard({ deal, children }: { deal: any, children?: ReactNode }) {
  const [isFlipped, setIsFlipped] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // 🚀 მსუბუქი ფიზიკა მობილურისთვის (stiffness 100)
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30, mass: 0.5 })
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30, mass: 0.5 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [20, -20])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-20, 20])

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    x.set((clientX - rect.left) / rect.width - 0.5)
    y.set((clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[340px] mx-auto">
      <motion.div
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={() => { x.set(0); y.set(0) }}
        onDoubleClick={() => setIsFlipped(!isFlipped)}
        style={{ 
            rotateX: isFlipped ? 0 : rotateX, 
            rotateY: isFlipped ? 180 : rotateY, 
            transformStyle: "preserve-3d",
            perspective: "1200px"
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full aspect-[1/1.6] group cursor-pointer mb-8"
      >
        {/* FRONT SIDE (Cyborg) */}
        <div className="absolute inset-0 bg-[#040d08]/95 border-2 border-emerald-500/10 rounded-[40px] p-6 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
          <div className="w-full h-[72%] rounded-[25px] bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center backdrop-blur-3xl">
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-4 text-[7px] font-black uppercase tracking-widest text-emerald-500/60 z-20">Double Tap to Flip</motion.div>
              <span className="text-[180px] relative z-10 filter drop-shadow-[0_0_40px_#10b98144] opacity-90 select-none">🤖</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center w-full mt-4 text-center">
              <h3 className="text-2xl font-black italic tracking-wider uppercase text-white leading-none">Influencer X</h3>
              <div className="h-[1px] w-8 bg-emerald-500/30 my-3" />
              <p className="text-[7px] text-emerald-500/50 font-black uppercase tracking-[0.4em] italic">{deal?.brands?.name || 'Verified Node'}</p>
          </div>
        </div>

        {/* BACK SIDE (Matrix Grid) */}
        <div className="absolute inset-0 bg-[#020302] border-2 border-white/5 rounded-[40px] shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <div className="w-full h-full overflow-y-auto scrollbar-hide p-4 bg-[radial-gradient(circle_at_0%_0%,#ffffff03,transparent_50%)]">
            <div className="grid grid-cols-2 gap-3 auto-rows-fr">
              {matrixDeals.map((mDeal) => (
                <div key={mDeal.id} className="aspect-[0.85/1] bg-white/[0.02] border border-white/5 rounded-[20px] p-3 flex flex-col justify-between h-full">
                  <div className="flex flex-col items-center gap-1 truncate">
                      <span className="text-sm">{mDeal.logo}</span>
                      <h3 className="text-[7px] font-black italic uppercase text-white/80 truncate w-full text-center">{mDeal.brand}</h3>
                  </div>
                  <h2 className="text-lg font-black italic tracking-tighter uppercase text-center leading-none my-1" style={{ color: mDeal.color, textShadow: `0 0 15px ${mDeal.glow}` }}>{mDeal.offer}</h2>
                  <div className="text-[4px] font-black uppercase tracking-[0.3em] text-gray-700 border-t border-white/5 pt-1 text-center">Node</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      <div className="w-full relative z-20 flex flex-col items-center">{children}</div>
    </div>
  )
}