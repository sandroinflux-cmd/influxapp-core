'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, ReactNode } from 'react'

// 116 დილის გენერაცია უკანა მხარისთვის
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
  
  // 🚀 Spring Physics for "InfluX Style" Movement
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [25, -25])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-25, 25])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div className="relative w-full max-w-[380px] mb-10" style={{ perspective: "2000px" }}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={() => setIsFlipped(!isFlipped)} // Double Tap ამოტრიალება
        style={{ 
            rotateX: isFlipped ? 0 : rotateX, 
            rotateY: isFlipped ? 180 : rotateY, 
            transformStyle: "preserve-3d" 
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
        className="relative h-[620px] group cursor-pointer"
      >
        
        {/* === FRONT SIDE (Cyborg Influencer Identity) === */}
        <div 
            className="absolute inset-0 bg-[#040d08]/95 border-2 border-emerald-500/10 rounded-[45px] p-8 flex flex-col items-center shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98110,transparent_70%)] pointer-events-none" />
          
          <div className="w-full h-[75%] rounded-[35px] bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center backdrop-blur-3xl shadow-inner">
              <div className="absolute top-6 w-full px-6 flex justify-center z-20">
                <motion.div 
                    animate={{ 
                      color: ["#10b981", "#3b82f6", "#a855f7", "#06b6d4", "#f59e0b", "#10b981"],
                      textShadow: ["0 0 10px #10b981", "0 0 10px #3b82f6", "0 0 10px #a855f7", "0 0 10px #06b6d4", "0 0 10px #f59e0b", "0 0 10px #10b981"]
                    }}
                    transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                    className="text-[9px] font-black uppercase tracking-[0.5em] italic opacity-80"
                >
                  Double Tap to Flip
                </motion.div>
              </div>

              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute inset-0 bg-emerald-500 blur-3xl" />
              
              <motion.div animate={{ y: [0, -20, 0], rotateY: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="relative flex items-center justify-center pointer-events-none">
                  <span className="text-[250px] relative z-10 filter drop-shadow-[0_0_60px_#10b98166] opacity-90 select-none brightness-150">🤖</span>
              </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
              <h3 className="text-4xl font-black italic tracking-[1px] uppercase text-white leading-none mt-4">Influencer X</h3>
              <div className="h-[1px] w-12 bg-emerald-500/40 mt-4 mb-2" />
              <p className="text-[7px] text-emerald-500/50 font-black uppercase tracking-[0.4em] italic leading-none truncate">
                {deal?.brands?.name || 'Authorized Node'}
              </p>
          </div>
        </div>

        {/* === BACK SIDE (Liquid Deals Matrix) === */}
        <div 
          className="absolute inset-0 bg-[#020302] border-2 border-white/5 rounded-[45px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full overflow-y-auto scrollbar-hide p-6 bg-[radial-gradient(circle_at_0%_0%,#ffffff03,transparent_50%)]">
            <div className="grid grid-cols-2 gap-4 auto-rows-fr">
              {matrixDeals.map((mDeal) => (
                <div key={mDeal.id} className="aspect-[0.85/1] bg-white/[0.02] border border-white/5 rounded-[30px] p-5 flex flex-col justify-between group/deal relative overflow-hidden transition-all duration-700 h-full">
                  <div className="flex flex-col items-center text-center gap-3 relative z-10">
                      <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/5 group-hover/deal:border-emerald-500/30 transition-all">{mDeal.logo}</div>
                      <h3 className="text-[10px] font-black italic uppercase text-white tracking-widest leading-none truncate w-full">{mDeal.brand}</h3>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1 relative z-10 py-4">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-center leading-none" style={{ color: mDeal.color, textShadow: `0 0 25px ${mDeal.glow}` }}>{mDeal.offer}</h2>
                  </div>
                  <div className="text-[6px] font-black uppercase tracking-[0.4em] text-gray-700 border-t border-white/5 pt-3 relative z-10 w-full text-center">Auth Node</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats/Children Overlay */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}