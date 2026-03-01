'use client'

import { motion, AnimatePresence } from 'framer-motion'

const liveFeed = [
  { id: 'TOKENOWNER_882', brand: 'Nike Energy', spent: '450', location: 'Tbilisi Mall', time: 'Just Now' },
  { id: 'TOKENOWNER_104', brand: 'Tesla Motors', spent: '1,200', location: 'Online Store', time: '2 mins ago' },
  { id: 'TOKENOWNER_651', brand: 'Apple Digital', spent: '2,800', location: 'City Center', time: '5 mins ago' },
]

export default function LiveFeed() {
  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-8 md:p-14 lg:ml-0">
      <header className="mb-20 flex justify-between items-end">
        <div>
          <span className="text-emerald-500/40 text-[9px] font-black tracking-[0.7em] uppercase mb-4 block italic">Network Pulse</span>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Live <span className="text-emerald-500">Activity</span></h1>
        </div>
        <div className="h-12 w-48 bg-emerald-500/5 border border-emerald-500/20 rounded-full flex items-center justify-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Monitoring Stream</span>
        </div>
      </header>

      <div className="space-y-4">
        <AnimatePresence>
          {liveFeed.map((tx, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={i}
              className="bg-[#040d08]/40 border border-white/5 rounded-[45px] p-10 flex items-center group relative overflow-hidden"
            >
              <div className="w-1/4">
                <span className="text-[10px] text-emerald-500/40 font-black block mb-2 tracking-widest uppercase italic">Tokenowner</span>
                <span className="text-xl font-black italic tracking-tighter uppercase">{tx.id}</span>
              </div>
              <div className="w-1/4">
                <span className="text-[10px] text-gray-600 font-black block mb-2 tracking-widest uppercase italic">Point of Interaction</span>
                <span className="text-xl font-black italic tracking-tighter uppercase text-white/80">{tx.brand}</span>
              </div>
              <div className="w-1/4 text-center">
                <span className="text-[10px] text-gray-600 font-black block mb-2 tracking-widest uppercase italic">Location</span>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">{tx.location}</span>
              </div>
              <div className="w-1/4 text-right">
                <span className="text-[10px] text-emerald-500/60 font-black block mb-2 tracking-widest uppercase italic">Liquidity Spent</span>
                <span className="text-3xl font-black text-emerald-500 italic tracking-tighter">{tx.spent} <span className="text-xs">GEL</span></span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  )
}