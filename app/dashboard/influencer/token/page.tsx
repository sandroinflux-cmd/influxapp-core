'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState } from 'react'

const generateDeals = (count: number) => {
  const baseDeals = [
    { brand: 'Nike', offer: '20% OFF', color: '#10b981', glow: 'rgba(16,185,129,0.5)', logo: '👟' },
    { brand: 'Tesla', offer: '15% OFF', color: '#3b82f6', glow: 'rgba(59,130,246,0.5)', logo: '🚗' },
    { brand: 'Apple', offer: 'ACCESS', color: '#a855f7', glow: 'rgba(168,85,247,0.5)', logo: '🍎' },
    { brand: 'Adidas', offer: '10% OFF', color: '#06b6d4', glow: 'rgba(6,182,212,0.5)', logo: '👟' },
    { brand: 'Hublot', offer: 'VIP Access', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', logo: '⌚' },
  ]
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    ...baseDeals[i % baseDeals.length],
  }))
}

const matrixDeals = generateDeals(116)

export default function TokenForge() {
  const [isFlipped, setIsFlipped] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-300, 300], [25, -25])
  const rotateY = useTransform(mouseXSpring, [-300, 300], [-25, 25])

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 lg:ml-0 overflow-hidden font-sans relative flex flex-col items-center">
      
      {/* Matrix Header */}
      <header className="w-full mb-8 relative z-10 self-start">
        <span className="text-emerald-500/40 text-[9px] font-black tracking-[0.8em] uppercase mb-4 block italic leading-none">Matrix Node Asset v1.0</span>
        <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">
          Token <span className="text-emerald-500 text-glow">Forge</span>
        </h1>
      </header>

      {/* Interactive Asset Controller */}
      <div 
        className="flex-1 flex flex-col items-center justify-center relative z-10 cursor-none pb-20 w-full"
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
          className="w-[380px] h-[620px] relative"
        >
          
          {/* === FRONT SIDE (Influencer X Identity) === */}
          <div 
            className="absolute inset-0 bg-[#040d08]/95 border-2 border-emerald-500/10 rounded-[45px] p-8 flex flex-col items-center shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98110,transparent_70%)]" />
            
            <div className="w-full h-[75%] rounded-[35px] bg-black/40 border border-white/5 relative overflow-hidden group shadow-inner flex items-center justify-center backdrop-blur-3xl">
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

                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute inset-0 bg-emerald-500 blur-3xl"
                />
                
                <motion.div 
                    animate={{ y: [0, -20, 0], rotateY: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="relative flex items-center justify-center pointer-events-none"
                >
                    <span className="text-[250px] relative z-10 filter drop-shadow-[0_0_60px_#10b98166] opacity-90 select-none brightness-150">🤖</span>
                    <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full scale-150 blur-xl animate-pulse" />
                    <motion.div 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.1, delay: 2 }}
                      className="absolute top-[35%] right-[28%] h-2 w-2 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399]"
                    />
                </motion.div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                <h3 className="text-4xl font-black italic tracking-[1px] uppercase text-white leading-none mt-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  Influencer X
                </h3>
                <div className="h-[1px] w-12 bg-emerald-500/40 mt-4" />
            </div>
          </div>

          {/* === BACK SIDE (Synchronized Matrix Deals) === */}
          <div 
            className="absolute inset-0 bg-[#020302] border-2 border-white/5 rounded-[45px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)" 
            }}
          >
            <div className="w-full h-full overflow-y-auto scrollbar-hide p-6 bg-[radial-gradient(circle_at_0%_0%,#ffffff03,transparent_50%)]">
              <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                {matrixDeals.map((deal) => (
                  <motion.div 
                    key={deal.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="aspect-[0.85/1] bg-white/[0.02] border border-white/5 rounded-[30px] p-6 flex flex-col justify-between group relative overflow-hidden transition-all duration-700 h-full"
                  >
                    <div className="flex flex-col items-center text-center gap-3 relative z-10">
                        <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/5 group-hover:border-emerald-500/30 transition-all">
                          {deal.logo}
                        </div>
                        <h3 className="text-[10px] font-black italic uppercase text-white tracking-widest leading-none truncate w-full">{deal.brand}</h3>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center flex-1 relative z-10 py-4">
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase text-center leading-none"
                        style={{ color: deal.color, textShadow: `0 0 25px ${deal.glow}` }}
                      >
                        {deal.offer}
                      </h2>
                    </div>

                    <div className="text-[6px] font-black uppercase tracking-[0.4em] text-gray-700 border-t border-white/5 pt-3 relative z-10 w-full text-center">
                        Auth Node
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}