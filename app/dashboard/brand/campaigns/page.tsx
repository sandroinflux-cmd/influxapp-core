'use client'

import { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const campaigns = [
  { id: 1, name: 'Andro Protocol', logo: '🤖', revenue: '142,400', sales: '3,820', frequency: '3.4x' },
  { id: 2, name: 'Nina Matrix', logo: '🧬', revenue: '98,200', sales: '2,110', frequency: '2.8x' },
  { id: 3, name: 'Cyber Alpha', logo: '⚡', revenue: '65,100', sales: '1,455', frequency: '4.1x' },
]

function InfluXCampaignCard({ camp }: { camp: any }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 25, mass: 0.5 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 25, mass: 0.5 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [20, -20])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-20, 20])

  return (
    <div className="relative w-full max-w-[340px] h-[550px] mb-20" style={{ perspective: "2000px" }}>
      <motion.div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          x.set((e.clientX - rect.left) / rect.width - 0.5)
          y.set((e.clientY - rect.top) / rect.height - 0.5)
        }}
        onMouseLeave={() => { x.set(0); y.set(0) }}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ rotateX: isFlipped ? 0 : rotateX, rotateY: isFlipped ? 180 : rotateY, transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full h-full cursor-pointer shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-[45px]"
      >
        {/* FRONT: Identity */}
        <div className="absolute inset-0 bg-[#040d08]/95 border-2 border-emerald-500/10 rounded-[45px] p-8 flex flex-col items-center justify-between backface-hidden overflow-hidden">
          <div className="w-full h-[70%] rounded-[35px] bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center backdrop-blur-3xl shadow-inner">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute inset-0 bg-emerald-500 blur-[100px]" />
            <span className="text-[140px] relative z-10 filter drop-shadow-[0_0_50px_rgba(16,185,129,0.4)] brightness-125">{camp.logo}</span>
          </div>
          <div className="text-center space-y-2 pb-6">
            <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{camp.name}</h3>
            <p className="text-[9px] text-emerald-500/50 font-black uppercase tracking-[0.5em] italic">Node Status: Active</p>
          </div>
        </div>

        {/* BACK: High-Impact Metrics */}
        <div className="absolute inset-0 bg-black border-2 border-blue-500/20 rounded-[45px] p-10 flex flex-col justify-between backface-hidden shadow-[inset_0_0_50px_rgba(59,130,246,0.1)]" style={{ transform: "rotateY(180deg)" }}>
          <header className="border-b border-white/10 pb-6 text-left">
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] italic block">Economic Intelligence</span>
          </header>
          
          <div className="space-y-12">
             <div className="text-center">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-2 italic font-sans">Net Volume Generated</span>
                <h2 className="text-6xl font-black italic tracking-tighter text-white font-sans">{camp.revenue}<span className="text-xs ml-1 opacity-40">₾</span></h2>
             </div>
             
             <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5 text-left font-sans">
                <div className="space-y-1">
                   <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block italic">Transactions</span>
                   <p className="text-2xl font-black italic text-white">{camp.sales}</p>
                </div>
                <div className="text-right space-y-1">
                   <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest block italic">Loyalty Loop</span>
                   <p className="text-2xl font-black italic text-blue-400">{camp.frequency}</p>
                </div>
             </div>
          </div>
          <div className="text-center opacity-10 font-mono text-[7px] tracking-[0.5em] uppercase pb-2">Verified Matrix Node</div>
        </div>
      </motion.div>
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-20 max-w-7xl mx-auto pb-40 font-sans text-white">
      
      {/* 💠 Top Tier Header & Master Stats */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
           <div className="space-y-4 text-left">
              <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
                Matrix <span className="text-blue-500">Wealth</span>
              </h1>
              <p className="text-[10px] font-black tracking-[0.6em] text-gray-600 uppercase italic">InfluX Ecosystem Performance Dashboard</p>
           </div>
           <div className="grid grid-cols-2 gap-12 border-l border-white/10 pl-12 text-left">
              <div className="space-y-1">
                 <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic font-sans">Total Ecosystem Revenue</span>
                 <p className="text-5xl font-black italic tracking-tighter text-white leading-none font-sans">518,200 <span className="text-xs opacity-30">₾</span></p>
              </div>
              <div className="space-y-1">
                 <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic font-sans">Combined Transactions</span>
                 <p className="text-5xl font-black italic tracking-tighter text-white leading-none font-sans">13,385</p>
              </div>
           </div>
        </div>
      </section>

      {/* 📜 Active Token Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-items-center">
        {campaigns.map((camp) => (
          <InfluXCampaignCard key={camp.id} camp={camp} />
        ))}
      </div>
    </div>
  )
}