'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const allBrands = [
  { id: 1, name: 'Nike Energy', category: 'Sportswear', isPartner: true, logo: '👟', match: 98 },
  { id: 2, name: 'Tesla Motors', category: 'Tech', isPartner: false, logo: '⚡', match: 85 },
  { id: 3, name: 'Apple Digital', category: 'Electronics', isPartner: true, logo: '🍎', match: 92 },
  { id: 4, name: 'Starbucks Prime', category: 'F&B', isPartner: false, logo: '☕', match: 74 },
  { id: 5, name: 'Rolex Elite', category: 'Luxury', isPartner: false, logo: '⌚', match: 91 },
  { id: 6, name: 'Red Bull Gear', category: 'Lifestyle', isPartner: true, logo: '🥤', match: 88 },
]

export default function MarketplacePage() {
  const [filter, setFilter] = useState<'partners' | 'new'>('new')

  const filteredBrands = allBrands.filter(brand => 
    filter === 'partners' ? brand.isPartner : !brand.isPartner
  )

  // 🧪 ინტენსივობის გამომთვლელი ფუნქცია
  const getIntensity = (match: number) => {
    if (match >= 95) return { opacity: [0.4, 1, 0.4], glow: '25px', speed: 2.5 }
    if (match >= 90) return { opacity: [0.3, 0.8, 0.3], glow: '15px', speed: 3.5 }
    return { opacity: [0.2, 0.6, 0.2], glow: '8px', speed: 5 }
  }

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-8 md:p-12">
      
      {/* Header & Filter */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">
            Brand <span className="text-emerald-500 text-glow">Marketplace</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-black tracking-[0.5em] uppercase mt-3 opacity-60">
            Unified Emerald Protocol
          </p>
        </div>

        <div className="flex bg-[#040d08] p-1.5 rounded-[22px] border border-white/5">
          {['partners', 'new'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-10 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === tab ? 'bg-emerald-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab === 'partners' ? 'My Partners' : 'New Opportunities'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredBrands.map((brand) => {
            const style = getIntensity(brand.match)
            return (
              <motion.div
                layout
                key={brand.id}
                className="group bg-[#040d08]/60 border border-white/5 rounded-[45px] p-10 hover:border-emerald-500/30 transition-all duration-700 relative overflow-hidden backdrop-blur-3xl"
              >
                {/* 🟢 Unified Breathing Match Score */}
                <motion.div 
                  className="absolute top-8 right-12 flex flex-col items-end"
                  animate={{
                    opacity: style.opacity,
                    textShadow: [
                      `0 0 5px #10B981cc`,
                      `0 0 ${style.glow} #10B981`,
                      `0 0 5px #10B981cc`
                    ]
                  }}
                  transition={{
                    duration: style.speed,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-[7px] font-black text-emerald-500/40 uppercase tracking-widest">Match Score</span>
                  <span className="text-sm font-black italic text-emerald-500">{brand.match}%</span>
                </motion.div>

                {/* Brand Visuals */}
                <div className="flex flex-col items-start gap-6 mb-12">
                  <div className="h-20 w-20 rounded-[30px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                    {brand.logo}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter text-white uppercase">{brand.name}</h3>
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mt-1">{brand.category}</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <button className={`w-full py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 ${
                    brand.isPartner 
                      ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black' 
                      : 'bg-white text-black hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)]'
                  }`}>
                    {brand.isPartner ? 'Active Partnership' : 'Request Deal'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </main>
  )
}