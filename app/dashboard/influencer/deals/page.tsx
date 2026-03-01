'use client'

import { motion } from 'framer-motion'

const deals = [
  { id: 1, brand: 'Nike Energy', logo: '👟', offer: '20% OFF', revenue: '5,420', scans: 1240, color: '#10b981', glow: 'rgba(16,185,129,0.6)' },
  { id: 2, brand: 'Tesla Motors', logo: '🚗', offer: '15% OFF', revenue: '3,100', scans: 842, color: '#3b82f6', glow: 'rgba(59,130,246,0.6)' },
  { id: 3, brand: 'Apple Digital', logo: '🍎', offer: 'ACCESS', revenue: '2,800', scans: 915, color: '#a855f7', glow: 'rgba(168,85,247,0.6)' },
  { id: 4, brand: 'Adidas Origin', logo: '👟', offer: '10% OFF', revenue: '1,200', scans: 450, color: '#06b6d4', glow: 'rgba(6,182,212,0.6)' },
]

export default function MyDealsPage() {
  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 lg:ml-0 overflow-x-hidden font-sans">
      
      {/* 1. Matrix Header */}
      <header className="mb-20">
        <span className="text-emerald-500/40 text-[9px] font-black tracking-[0.8em] uppercase mb-4 block italic leading-none">Global Partnership Protocol</span>
        <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">
          My <span className="text-emerald-500 text-glow">Deals</span>
        </h1>
      </header>

      {/* 2. Grid - Fixed Symmetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {deals.map((deal, i) => (
          <motion.div 
            key={deal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative flex flex-col bg-[#040d08]/40 border border-white/5 rounded-[40px] p-9 h-[450px] transition-all duration-700 hover:border-white/10 overflow-hidden shadow-2xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 blur-[100px]" style={{ backgroundColor: deal.color }} />

            {/* TOP: Brand Identity */}
            <div className="flex items-center gap-4 mb-auto relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-3xl shadow-inner transition-all duration-500 group-hover:border-white/20">
                {deal.logo}
              </div>
              <div className="flex flex-col overflow-hidden">
                <h3 className="text-lg font-black italic tracking-tighter uppercase leading-none text-white/90 truncate">
                  {deal.brand}
                </h3>
                <span className="text-[7px] text-gray-700 font-black uppercase tracking-[0.3em] mt-1 italic">Verified Partner</span>
              </div>
              <div className="ml-auto shrink-0">
                <div className="h-2 w-2 rounded-full animate-pulse shadow-[0_0_12px_currentColor]" style={{ color: deal.color, backgroundColor: 'currentColor' }} />
              </div>
            </div>

            {/* MIDDLE: VIBRANT COLORED OFFER (Fixed & Scaled) */}
            <div className="flex flex-col items-center justify-center flex-1 relative z-10 px-2">
              <h2 className={`font-black italic tracking-tighter uppercase text-center leading-none transition-all duration-700 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110
                ${deal.offer.length > 7 ? 'text-4xl' : 'text-6xl'}`}
                style={{ 
                  color: deal.color,
                  textShadow: `0 0 40px ${deal.glow}`
                }}
              >
                {deal.offer}
              </h2>
              <div className="h-[2px] w-12 bg-white/5 mt-8 group-hover:w-20 transition-all duration-700 opacity-20" style={{ backgroundColor: deal.color }} />
            </div>

            {/* BOTTOM: Data Cluster (Pharmacy Precision) */}
            <div className="mt-auto space-y-6 relative z-10 pt-8 border-t border-white/5">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[7px] text-gray-700 uppercase font-black tracking-widest italic leading-none mb-2 opacity-50">Matrix Revenue</span>
                  <p className="text-2xl font-black italic tracking-tighter leading-none text-white/90 group-hover:text-emerald-500 transition-colors">
                    {deal.revenue} <span className="text-[9px] opacity-40">GEL</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] text-gray-700 uppercase font-black tracking-widest italic leading-none mb-2 opacity-50">Usage</span>
                  <p className="text-xl font-black text-white/20 italic tracking-tighter leading-none group-hover:text-white/40">
                    {deal.scans}
                  </p>
                </div>
              </div>
            </div>

            {/* Aesthetic Frame Overlays */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.02] to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </main>
  )
}