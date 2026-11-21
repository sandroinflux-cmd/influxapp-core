'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'

function buyerDealMark(deal: any): { kind: 'discount'; pct: number } | { kind: 'gift'; text: string } | null {
  const limit = Number(deal?.stock_limit || 0)
  const sold = Number(deal?.stock_sold || 0)
  if (deal?.offer === 'SOLD' || deal?.is_active === false || (limit > 0 && sold >= limit)) return null

  const price = Number(deal?.price)
  const originalPrice = Number(deal?.original_price)
  const discounted = Number.isFinite(originalPrice) && Number.isFinite(price) && originalPrice > price && price > 0
  if (discounted) {
    const discountPct = Math.round(((originalPrice - price) / originalPrice) * 100)
    return discountPct > 0 ? { kind: 'discount', pct: discountPct } : null
  }

  const gift = typeof deal?.gift_description === 'string' ? deal.gift_description.trim() : ''
  return gift ? { kind: 'gift', text: gift } : null
}

export function DealValueMark({ deal }: { deal: any }) {
  const mark = buyerDealMark(deal)

  if (mark?.kind === 'discount') {
    return (
      <div className="relative z-10 flex w-full min-w-0 flex-col items-center px-0.5 py-1">
        <span className="text-[28px] font-black italic leading-none tracking-tighter text-emerald-400">-{mark.pct}%</span>
        <span className="mt-1 max-w-full truncate text-[7px] font-black uppercase tracking-[0.12em] text-emerald-300/80">ფასდაკლება</span>
      </div>
    )
  }

  if (mark?.kind === 'gift') {
    return (
      <div className="relative z-10 flex w-full min-w-0 flex-col items-center gap-1 px-0.5 py-1">
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-[8px] font-black leading-none tracking-[0.06em] text-amber-200">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <rect x="3" y="10" width="18" height="10" rx="1.5" />
            <path d="M3 14.5h18M12 10v10" />
            <path d="M12 10c-2 0-4.2-1-4.2-3.1C7.8 5.2 9.4 4.4 12 6.6 14.6 4.4 16.2 5.2 16.2 6.9 16.2 9 14 10 12 10z" />
          </svg>
          <span className="truncate">საჩუქარი</span>
        </span>
        <span className="line-clamp-2 max-w-full break-words text-center text-[8px] font-bold normal-case not-italic leading-tight text-amber-100/70">
          {mark.text}
        </span>
      </div>
    )
  }

  return (
    <h2 className="text-4xl text-center py-2 text-emerald-500 text-glow leading-none relative z-10 tracking-tighter uppercase font-black italic">
      {deal.offer}
    </h2>
  )
}

function GridDealCard({ deal, onDealClick }: { deal: any; onDealClick?: (deal: any) => void }) {
  const stopCardFlip = (e: React.SyntheticEvent) => {
    e.stopPropagation()
  }

  return (
    <motion.div 
      className="relative cursor-pointer h-[240px] group/deal"
      style={{ transformStyle: 'preserve-3d', perspective: "1000px" }}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => {
        e.stopPropagation()
        onDealClick?.(deal)
      }}
      onDoubleClick={stopCardFlip}
      onPointerDown={stopCardFlip}
      onMouseDown={stopCardFlip}
    >
      {/* 💠 FRONT SIDE */}
      <div 
        className="absolute inset-0 bg-[#020502] border border-white/10 rounded-[35px] p-5 flex flex-col justify-between shadow-inner relative overflow-hidden transition-colors group-hover/deal:border-emerald-500/40 group-active/deal:bg-white/[0.03]" 
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}
      >
        <div className="flex flex-col items-center gap-2 relative z-10 text-center">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border-2 border-white/10 flex items-center justify-center overflow-hidden">
               {deal.logo?.startsWith('http') 
                  ? <img src={deal.logo} alt="brand" className="h-full w-full object-cover" /> 
                  : <span className="text-xl">{deal.logo || '💎'}</span>}
            </div>
            <h3 className="text-[8px] text-white tracking-widest truncate w-full opacity-60 uppercase font-black italic mt-1">
              {deal.brand}
            </h3>
        </div>
        
        <DealValueMark deal={deal} />
        
        <div className="flex items-center justify-end relative z-10">
          <span className="text-[7px] text-emerald-500/70 group-hover/deal:text-emerald-400 tracking-[0.28em] uppercase font-black italic transition-colors">
            PAY →
          </span>
        </div>
      </div>

      {/* 💠 BACK SIDE (Passport Intel Style) */}
      <div 
        className="absolute inset-0 bg-black border border-emerald-500/20 rounded-[35px] p-5 flex flex-col justify-between shadow-inner pointer-events-none" 
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}
      >
        <div className="space-y-3 font-black italic uppercase leading-none">
          <h4 className="text-[8px] text-emerald-500 tracking-[0.4em] border-b border-white/10 pb-2 text-center">Brand Intel</h4>
          
          <div className="space-y-2">
            <div>
              <span className="text-[6px] text-gray-600 tracking-widest block mb-0.5">Sector</span>
              <p className="text-[10px] text-white truncate">{deal.intel?.type || 'Active Node'}</p>
            </div>
            <div>
              <span className="text-[6px] text-gray-600 tracking-widest block mb-0.5">Location</span>
              <p className="text-[10px] text-white truncate">{deal.intel?.location || 'Digital'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-[15px] p-3 shadow-inner">
          <span className="text-[5px] text-emerald-500 tracking-[0.3em] block mb-1 font-black uppercase">Message</span>
          <p className="text-[9px] text-white leading-tight italic font-black uppercase line-clamp-3">
            {deal.backIntelPhone || deal.intel?.phone || 'Classified.'}
          </p>
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
  onFlip?: () => void;
  onDealClick?: (deal: any) => void;
}

export default function InfluXCard({ profile, liveDeals = [], deal, children, disableRotation = false, onFlip, onDealClick }: InfluXCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const x = useMotionValue(0), y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 60, damping: 50 }), mouseYSpring = useSpring(y, { stiffness: 60, damping: 50 })
  
  const rotateX = useTransform(mouseYSpring, [-300, 300], disableRotation ? [0, 0] : [5, -5])
  const rotateY = useTransform(mouseXSpring, [-300, 300], disableRotation ? [0, 0] : [-5, 5])

  if (!profile && !deal) return null

  const nameParts = (profile?.full_name || deal?.brands?.name || 'SYNC NODE').split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-full" 
           onMouseMove={(e) => { if(!disableRotation) { const rect = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - (rect.left + rect.width / 2)); y.set(e.clientY - (rect.top + rect.height / 2)) } }} 
           onMouseLeave={() => { x.set(0); y.set(0) }} 
           onDoubleClick={() => {
             const opening = !isFlipped
             setIsFlipped(opening)
             if (opening) onFlip?.()
           }}>
        
        <motion.div 
          style={{ rotateX: isFlipped ? 0 : rotateX, rotateY: isFlipped ? 180 : rotateY, transformStyle: "preserve-3d", perspective: "2000px", WebkitTransformStyle: "preserve-3d" }} 
          animate={{ rotateY: isFlipped ? 180 : 0 }} 
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }} 
          className="w-full aspect-[1/1.6] relative cursor-pointer"
        >
          {/* === FRONT === */}
          <div 
            className="absolute inset-0 bg-[#040d08]/98 border-2 border-emerald-950/30 rounded-[45px] p-5 pt-6 flex flex-col shadow-2xl overflow-hidden" 
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translateZ(1px)" }}
          >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98110,transparent_75%)] pointer-events-none" />
              
              <div className="w-full relative flex flex-col items-center z-10">
                {profile?.avatar_url && (
                  <motion.img 
                    src={profile.avatar_url} 
                    className="w-[96%] aspect-square object-cover rounded-[32px] filter brightness-105 drop-shadow-[0_0_60px_#10b98144]" 
                    animate={{ y: [0, -6, 0] }} 
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} 
                  />
                )}
                
                <h3 className="font-black italic uppercase text-white tracking-tighter leading-[0.85] text-glow text-center w-full px-2 mt-7 flex flex-col">
                  <span className="text-[34px]">{firstName}</span>
                  {lastName && <span className="text-[34px]">{lastName}</span>}
                </h3>
              </div>

              <div className="absolute bottom-[90px] left-0 w-full flex justify-center z-20 pointer-events-none">
                <p className="text-[10px] text-white/50 tracking-[0.4em] font-black uppercase animate-pulse">
                  Double Tap to Flip
                </p>
              </div>

              {children && (
                <div className="absolute bottom-5 left-0 w-full flex justify-center z-30">
                  {children}
                </div>
              )}
          </div>

          {/* === BACK === */}
          <div 
            className="absolute inset-0 bg-[#010201] border-2 border-white/10 rounded-[45px] overflow-hidden" 
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(1px)" }}
          >
            <div className="w-full h-full p-6 pt-8 overflow-y-auto scrollbar-hide bg-[radial-gradient(circle_at_0%_0%,#ffffff03,transparent_60%)]">
              <div className="grid grid-cols-2 gap-3 pb-4">
                {liveDeals.length > 0 ? liveDeals.map((d) => (
                  <GridDealCard key={d.id} deal={d} onDealClick={onDealClick} />
                )) : (
                  <div className="col-span-2 text-center py-20 opacity-20 font-black italic uppercase text-[10px] tracking-widest">
                    No Deals Linked
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}