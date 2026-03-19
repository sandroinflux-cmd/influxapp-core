'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'

// 💠 შიდა კომპონენტი: GridDealCard
function GridDealCard({ deal }: { deal: any }) {
  const [isGridCardFlipped, setIsGridCardFlipped] = useState(false)
  return (
    <motion.div 
      className="relative cursor-pointer h-full"
      style={{ transformStyle: 'preserve-3d', perspective: "1000px" }}
      animate={{ rotateY: isGridCardFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      onClick={(e) => { e.stopPropagation(); setIsGridCardFlipped(!isGridCardFlipped); }}
    >
      {/* FRONT - დავამატეთ Webkit და translateZ */}
      <div 
        className="absolute inset-0 bg-[#020502] border border-white/10 rounded-[45px] p-6 flex flex-col justify-between shadow-inner relative overflow-hidden group/deal" 
        style={{ 
          backfaceVisibility: 'hidden', 
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(1px)' 
        }}
      >
        <div className="flex flex-col items-center gap-2 relative z-10 text-center">
            <div className="h-12 w-12 rounded-full bg-white/[0.03] border-2 border-white/10 flex items-center justify-center overflow-hidden">
               {deal.logo?.startsWith('http') ? <img src={deal.logo} alt="brand" className="h-full w-full object-cover" /> : <span className="text-xl">{deal.logo || '💎'}</span>}
            </div>
            <h3 className="text-[9px] text-white tracking-widest truncate w-full opacity-60 uppercase font-black italic">{deal.brand}</h3>
        </div>
        <h2 className="text-4xl text-center py-4 text-emerald-500 text-glow leading-none uppercase font-black italic">{deal.offer}</h2>
        <div className="text-[7px] text-gray-700 text-center tracking-[0.4em] uppercase font-black italic">Tap to INSPECT</div>
      </div>

      {/* BACK - დავამატეთ rotateY-სთან ერთად translateZ */}
      <div 
        className="absolute inset-0 bg-black border border-emerald-500/20 rounded-[45px] p-8 flex flex-col justify-between shadow-inner" 
        style={{ 
          backfaceVisibility: 'hidden', 
          WebkitBackfaceVisibility: 'hidden', 
          transform: 'rotateY(180deg) translateZ(1px)' 
        }}
      >
        <div className="space-y-4 text-center italic font-black uppercase leading-none">
           <div className="border-b border-white/10 pb-2"><h4 className="text-[10px] text-emerald-500 tracking-[0.5em]">INTEL</h4></div>
           <p className="text-xs text-white">{deal.backIntelPhone || 'CLASSIFIED'}</p>
        </div>
      </div>
    </motion.div>
  )
}

interface InfluXCardProps {
  profile?: any;
  liveDeals?: any[];
  deal?: any;
  children?: React.ReactNode;
  disableRotation?: boolean;
}

export default function InfluXCard({ profile, liveDeals = [], deal, children, disableRotation = false }: InfluXCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const x = useMotionValue(0), y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 60, damping: 50 }), mouseYSpring = useSpring(y, { stiffness: 60, damping: 50 })
  
  const rotateX = useTransform(mouseYSpring, [-300, 300], disableRotation ? [0, 0] : [5, -5])
  const rotateY = useTransform(mouseXSpring, [-300, 300], disableRotation ? [0, 0] : [-5, 5])

  if (!profile && !deal) return null

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-full" onMouseMove={(e) => { if(!disableRotation) { const rect = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - (rect.left + rect.width / 2)); y.set(e.clientY - (rect.top + rect.height / 2)) } }} onMouseLeave={() => { x.set(0); y.set(0) }} onDoubleClick={() => setIsFlipped(!isFlipped)}>
        
        <motion.div 
          style={{ 
            rotateX: isFlipped ? 0 : rotateX, 
            rotateY: isFlipped ? 180 : rotateY, 
            transformStyle: "preserve-3d", 
            perspective: "2000px",
            WebkitTransformStyle: "preserve-3d" // Safari-სთვის
          }} 
          animate={{ rotateY: isFlipped ? 180 : 0 }} 
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }} 
          className="w-full aspect-[1/1.6] relative cursor-pointer"
        >
          {/* === FRONT === */}
          <div 
            className="absolute inset-0 bg-[#040d08]/98 border-2 border-emerald-500/10 rounded-[45px] p-6 pt-10 flex flex-col items-center shadow-2xl overflow-hidden" 
            style={{ 
              backfaceVisibility: "hidden", 
              WebkitBackfaceVisibility: "hidden", // Safari-სთვის კრიტიკულია
              transform: "translateZ(1px)" // აიძულებს წინა ფენას წინ იყოს
            }}
          >
              <div className="mt-2 w-full relative flex flex-col items-center z-10">
                {profile?.avatar_url && (
                  <motion.img 
                    src={profile.avatar_url} 
                    className="w-[85%] aspect-square object-cover rounded-[35px] filter brightness-110 drop-shadow-[0_0_50px_#10b98166]" 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} 
                  />
                )}
                <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter text-glow text-center w-full px-4 mt-6 leading-tight">
                  {profile?.full_name || deal?.brands?.name || 'SYNC NODE MASTER'}
                </h3>
              </div>
          </div>

          {/* === BACK === */}
          <div 
            className="absolute inset-0 bg-[#010201] border-2 border-white/10 rounded-[45px] overflow-hidden" 
            style={{ 
              backfaceVisibility: "hidden", 
              WebkitBackfaceVisibility: "hidden",
              // rotateY-სთან ერთად translateZ აუცილებელია Safari-სთვის
              transform: "rotateY(180deg) translateZ(1px)" 
            }}
          >
            <div className="w-full h-full p-6 pt-8 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-3">
                {liveDeals.map((d) => <GridDealCard key={d.id} deal={d} />)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="w-full relative z-20">{children}</div>
    </div>
  )
}