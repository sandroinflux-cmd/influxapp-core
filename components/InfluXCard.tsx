'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'

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
      {/* FRONT */}
      <div className="absolute inset-0 bg-[#020502] border border-white/10 rounded-[45px] p-6 flex flex-col justify-between shadow-inner hover:border-emerald-500/20 transition-all duration-700 relative overflow-hidden group/deal" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
        <div className="absolute inset-0 bg-emerald-500/[0.01] opacity-0 group-hover/deal:opacity-100 transition-opacity blur-xl rounded-full" />
        <div className="flex flex-col items-center gap-2 relative z-10 text-center">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-white/[0.03] border-2 border-white/10 flex items-center justify-center mb-1 shadow-inner overflow-hidden">
               {deal.logo?.startsWith('http') ? <img src={deal.logo} alt="brand" className="h-full w-full object-cover" /> : <span className="text-xl md:text-2xl">{deal.logo || '💎'}</span>}
            </div>
            <h3 className="text-[10px] md:text-[11px] text-white tracking-widest truncate w-full text-center leading-none opacity-60 mt-1 uppercase font-black italic">{deal.brand}</h3>
        </div>
        <h2 className="text-5xl md:text-6xl text-center py-4 text-emerald-500 text-glow leading-none relative z-10 tracking-tighter uppercase font-black italic">{deal.offer}</h2>
        <div className="relative z-10 opacity-0 group-hover/deal:opacity-100 transition-opacity">
           <button className="text-[7px] text-gray-700 pt-3 text-center tracking-[0.4em] leading-none uppercase font-black italic hover:text-emerald-500 transition-colors">Tap to INSPECT INTEL</button>
        </div>
      </div>
      {/* BACK */}
      <div className="absolute inset-0 bg-black border border-emerald-500/20 rounded-[45px] p-8 flex flex-col justify-between shadow-inner" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
        <div className="space-y-6 text-center italic font-black uppercase leading-none break-words">
           <div className="border-b border-white/10 pb-4 mb-2"><h4 className="text-[11px] text-emerald-500 tracking-[0.5em]">AUTH NODE INTEL</h4></div>
           <div className="space-y-3 px-2">
             <div className="group/item"><span className="text-[8px] text-gray-600 uppercase tracking-widest block mb-1 italic">INTEL PHONE</span><p className="text-md text-white">{deal.backIntelPhone || 'CLASSIFIED'}</p></div>
             <div className="group/item"><span className="text-[8px] text-gray-600 uppercase tracking-widest block mb-1 italic">Status</span><p className="text-md text-emerald-500">SECURED</p></div>
           </div>
        </div>
      </div>
    </motion.div>
  )
}

// 💠 მთავარი კომპონენტი: InfluXCard
export default function InfluXCard({ profile, liveDeals, children }: { profile: any, liveDeals: any[], children?: React.ReactNode }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const x = useMotionValue(0), y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 60, damping: 50 }), mouseYSpring = useSpring(y, { stiffness: 60, damping: 50 })
  const rotateX = useTransform(mouseYSpring, [-300, 300], [5, -5]), rotateY = useTransform(mouseXSpring, [-300, 300], [-5, 5])

  if (!profile) return null

  return (
    <div className="relative w-full max-w-[420px] flex flex-col items-center z-10">
      <div className="relative w-full" onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - (rect.left + rect.width / 2)); y.set(e.clientY - (rect.top + rect.height / 2)) }} onMouseLeave={() => { x.set(0); y.set(0) }} onDoubleClick={() => setIsFlipped(!isFlipped)}>
        <motion.div style={{ rotateX: isFlipped ? 0 : rotateX, rotateY: isFlipped ? 180 : rotateY, transformStyle: "preserve-3d", perspective: "2000px" }} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }} className="w-[420px] h-[680px] relative cursor-pointer">
          
          {/* === FRONT === */}
          <div className="absolute inset-0 bg-[#040d08]/98 border-2 border-emerald-500/10 rounded-[55px] p-8 pt-12 flex flex-col items-center shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98115,transparent_75%)]" />
              
              <div className="mt-2 w-full relative flex flex-col items-center z-10">
                <motion.img src={profile.avatar_url || ''} className="h-96 w-96 object-cover rounded-[40px] filter brightness-110 drop-shadow-[0_0_80px_#10b981cc]" animate={{ y: [0, -20, 0], rotateY: [0, 15, -15, 0], scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} />
                <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none text-glow text-center w-full px-4 break-words mt-6">{profile.full_name || 'SYNC NODE MASTER'}</h3>
              </div>

              {/* 🚀 ABSOLUTE POSITIONING - აქედან ვეღარ გაიქცევა! */}
              <div className="absolute bottom-10 left-0 w-full flex justify-center z-20 pointer-events-none">
                <p className="text-[10px] text-white/50 tracking-[0.4em] font-black uppercase leading-none animate-pulse">
                  Double Tap to Flip
                </p>
              </div>
          </div>

          {/* === BACK === */}
          <div className="absolute inset-0 bg-[#010201] border-2 border-white/10 rounded-[55px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <div className="w-full h-full p-8 pt-10 bg-[radial-gradient(circle_at_0%_0%,#ffffff03,transparent_60%)] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-4 auto-rows-fr h-full">
                {liveDeals.length > 0 ? liveDeals.map((deal) => <GridDealCard key={deal.id} deal={deal} />) : <div className="col-span-2 py-40 text-center opacity-20 italic font-black uppercase"><p className="text-[11px] tracking-widest">No Sync Detected</p></div>}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="w-full relative z-20 mt-8">{children}</div>
    </div>
  )
}