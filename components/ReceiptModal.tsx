'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function ReceiptModal({ total, originalAmount, deal, onDone }: any) {
  const [time, setTime] = useState(new Date())
  const [hash, setHash] = useState('')
  const savings = (originalAmount || 0) - total;
  const brandName = deal?.brands?.name || "Global Partner";

  useEffect(() => {
    setHash(Math.random().toString(36).substr(2, 10).toUpperCase())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-4 overflow-hidden font-sans print:p-0">
      
      {/* 🌌 Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 print:hidden">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/[0.05] rounded-full"
            style={{ width: `${(i + 1) * 50}%`, aspectRatio: '1/1' }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-[340px] bg-[#020402]/90 border border-white/15 rounded-[45px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden print:border-none print:shadow-none backdrop-blur-2xl"
      >
        {/* 💵 Bold Phosphorescent Watermarks: გაზრდილი და მკვეთრი ნეონის ვოთერმარკები */}
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none flex flex-wrap gap-x-14 gap-y-12 p-4 rotate-[15deg] z-0 justify-center">
            {[...Array(24)].map((_, i) => (
                <motion.span 
                  key={i} 
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3],
                    textShadow: ["0 0 5px #10b981", "0 0 15px #10b981", "0 0 5px #10b981"]
                  }}
                  transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                  className="text-[11px] font-black italic tracking-[0.2em] select-none uppercase text-emerald-400"
                >
                  InfluXpay
                </motion.span>
            ))}
        </div>

        {/* Top Security Bar */}
        <div className="bg-emerald-500/5 border-b border-white/5 p-5 flex justify-between items-center relative overflow-hidden z-10">
          <div className="flex flex-col">
            <span className="text-[6px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1 italic">Authorized Merchant</span>
            <h4 className="text-xs font-black italic text-white tracking-widest uppercase truncate w-32">{brandName}</h4>
          </div>
          <div className="h-9 w-9 rounded-xl bg-black border border-emerald-500/20 flex items-center justify-center relative overflow-hidden shadow-inner">
             <motion.div animate={{ top: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute w-full h-[1px] bg-emerald-400 shadow-[0_0_10px_#10b981] z-20" />
             <span className="text-lg">🤖</span>
          </div>
        </div>

        <div className="p-6 space-y-6 relative z-10">
          {/* 🔴 MERCHANT PROOF: GALAXY ENGINE */}
          <div className="text-center py-5 bg-red-500/[0.03] rounded-[30px] border border-red-500/20 relative overflow-hidden flex items-center justify-center gap-3">
            <div className="flex flex-col flex-1 pl-2">
              <span className="text-[8px] font-black text-red-500/50 uppercase tracking-[0.6em] block mb-1 italic text-left ml-4">Gross Input</span>
              <h3 className="text-5xl font-black tracking-tighter text-red-500 italic leading-none">
                {originalAmount?.toFixed(2)}
              </h3>
            </div>

            {/* 🪐 Interstellar Galaxy Sphere */}
            <div className="relative h-18 w-18 flex items-center justify-center mr-1">
              {/* Outer Glow & Shell */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
                className="absolute h-full w-full border-[0.5px] border-red-500/40 rounded-full shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]" 
              />
              
              {/* Galactic Core */}
              <div className="absolute h-6 w-6 bg-red-600 rounded-full blur-[10px] opacity-60 animate-pulse" />
              
              {/* Thousands of Star Points: 3D Surface Distribution */}
              <motion.div 
                animate={{ rotateY: 360, rotateZ: 360 }} 
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }} 
                className="absolute h-[110%] w-[110%] rounded-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute h-[1.5px] w-[1.5px] bg-white rounded-full shadow-[0_0_4px_white]"
                      style={{ 
                        top: `${Math.random() * 100}%`, 
                        left: `${Math.random() * 100}%`,
                        transform: `translateZ(${Math.random() * 30 - 15}px)`
                      }}
                    />
                  ))}
              </motion.div>

              {/* Accretion Disk */}
              <motion.div 
                animate={{ rotateX: 75, rotateZ: -360 }} 
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }} 
                className="absolute h-[130%] w-[130%] border-[0.5px] border-red-400/30 rounded-full"
                style={{ transformStyle: 'preserve-3d' }}
              />

              <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_20px_8px_rgba(239,68,68,0.9)] z-10" />
            </div>
          </div>

          {/* ⚪ PURE WHITE: FINAL SETTLE */}
          <div className="text-center relative">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-[1em] block mb-1 italic">Settled Matrix</span>
            <h2 className="text-7xl font-black tracking-tighter text-white italic leading-none drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]">
              {total.toFixed(2)}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] italic leading-none">GEL Verified</span>
            </div>
          </div>

          {/* 💰 EMERALD GLOW: MATRIX YIELD */}
          <div className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-[25px] py-4 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[7px] font-black text-emerald-500/60 uppercase tracking-[0.6em] mb-1 italic">Matrix Saving</span>
            <motion.span 
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-3xl font-black text-emerald-400 tracking-tight"
            >
              -{savings.toFixed(2)} <span className="text-xs opacity-40">GEL</span>
            </motion.span>
          </div>

          {/* 🛡️ Secure Data Block */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-5 font-mono">
            <div className="flex flex-col">
              <span className="text-[5px] font-black text-gray-700 uppercase tracking-widest mb-1">Node Hash</span>
              <span className="text-[8px] text-emerald-500/80 font-bold italic truncate">#INX-{hash}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[5px] font-black text-gray-700 uppercase tracking-widest mb-1">Verified Time</span>
              <span className="text-[8px] text-white/60 font-bold">{time.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* 🚀 ACTIONS: Download */}
        <div className="p-6 pt-0 flex flex-col gap-3 relative z-10">
          <button 
            onClick={handlePrint} 
            className="w-full bg-white text-black py-4 rounded-[22px] font-black text-[10px] tracking-[0.4em] uppercase hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95"
          >
            DOWNLOAD
          </button>
          <button onClick={onDone} className="w-full py-2 text-[7px] font-black text-gray-700 uppercase tracking-[0.3em] hover:text-white transition-colors italic">
            Dismiss Node
          </button>
        </div>

        {/* 🔒 Trace Mark */}
        <div className="bg-emerald-500/5 py-1.5 text-center border-t border-white/5 relative z-10">
          <span className="text-[4px] font-black text-emerald-500 uppercase tracking-[2em] opacity-30 italic leading-none">IMMUTABLE_MATRIX_ASSET</span>
        </div>
      </motion.div>
    </div>
  )
}