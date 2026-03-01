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
    <div className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-2 overflow-hidden font-sans print:p-0">
      
      {/* 🌌 External Precision Layers */}
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

      {/* 📏 ჩეკის ზომა შემცირებულია 15%-ით (max-w-[340px]) */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-[340px] bg-[#020402] border border-white/10 rounded-[45px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden print:border-none print:shadow-none"
      >
        {/* 💵 მბჟუტავი ჰოლოგრამა/ვოთერმარკები */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex flex-wrap gap-8 p-4 rotate-12">
            {[...Array(24)].map((_, i) => (
                <motion.span 
                  key={i} 
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                  className="text-white font-black italic text-sm tracking-tighter select-none"
                >
                  InfluX
                </motion.span>
            ))}
        </div>

        {/* Top Security Bar */}
        <div className="bg-emerald-500/5 border-b border-white/5 p-5 flex justify-between items-center relative overflow-hidden z-10">
          <div className="flex flex-col">
            <span className="text-[6px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1 italic leading-none">Authorized Merchant</span>
            <h4 className="text-xs font-black italic text-white tracking-widest uppercase truncate w-32 leading-none">{brandName}</h4>
          </div>
          <div className="h-8 w-8 rounded-lg bg-black border border-emerald-500/20 flex items-center justify-center relative overflow-hidden shadow-inner">
             <motion.div animate={{ top: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute w-full h-[1px] bg-emerald-400 shadow-[0_0_10px_#10b981] z-20" />
             <span className="text-lg">🤖</span>
          </div>
        </div>

        <div className="p-6 space-y-6 relative z-10">
          {/* 🔴 LUXURY CRIMSON: MERCHANT PROOF */}
          <div className="text-center py-4 bg-red-500/[0.03] rounded-[30px] border border-red-500/20 relative overflow-hidden flex items-center justify-center gap-2">
            <div className="flex flex-col flex-1 pl-2 text-left">
              <span className="text-[7px] font-black text-red-500/50 uppercase tracking-[0.6em] block mb-1 italic ml-4">Gross Input</span>
              <h3 className="text-5xl font-black tracking-tighter text-red-500 italic leading-none drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] ml-4">
                {originalAmount?.toFixed(2)}
              </h3>
            </div>

            {/* ⚙️ High-Speed 3D Security Core */}
            <div className="relative h-14 w-14 flex items-center justify-center mr-2 overflow-hidden">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                className="absolute h-full w-full border-[1px] border-red-500/10 rounded-full" 
              />
              <motion.div 
                animate={{ rotate: -360, scale: [1, 1.1, 1] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute h-4/5 w-4/5 border-[1.5px] border-dashed border-red-500/30 rounded-full flex items-center justify-center"
              >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-full h-full relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-1 bg-red-500 rounded-full shadow-[0_0_10px_red]" />
                  </motion.div>
              </motion.div>
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_15px_4px_rgba(239,68,68,0.8)] z-10" />
            </div>
          </div>

          {/* ⚪ PURE WHITE: FINAL SETTLE */}
          <div className="text-center relative">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.8em] block mb-1 italic">Settled Matrix</span>
            <h2 className="text-7xl font-black tracking-tighter text-white italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              {total.toFixed(2)}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic leading-none">GEL Verified</span>
            </div>
          </div>

          {/* 💰 EMERALD GLOW: MATRIX YIELD */}
          <div className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-[25px] py-4 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[7px] font-black text-emerald-500/60 uppercase tracking-[0.6em] mb-1 italic leading-none">Matrix Saving</span>
            <motion.span 
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] leading-none"
            >
              -{savings.toFixed(2)} <span className="text-xs opacity-40 italic">GEL</span>
            </motion.span>
          </div>

          {/* 🛡️ Secure Data Block */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-5 font-mono">
            <div className="flex flex-col">
              <span className="text-[5px] font-black text-gray-700 uppercase tracking-widest mb-1 leading-none">Node Hash</span>
              <span className="text-[8px] text-emerald-500/80 font-bold italic truncate leading-none">#INX-{hash}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[5px] font-black text-gray-700 uppercase tracking-widest mb-1 leading-none">Verified Time</span>
              <span className="text-[8px] text-white/60 font-bold leading-none">{time.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* 🚀 Actions */}
        <div className="p-6 pt-0 flex flex-col gap-3 relative z-10">
          <button onClick={handlePrint} className="w-full bg-white text-black py-4 rounded-[22px] font-black text-[9px] tracking-[0.4em] uppercase hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-2xl active:scale-95 leading-none">
            DOWNLOAD
          </button>
          <button onClick={onDone} className="w-full py-1 text-[7px] font-black text-gray-700 uppercase tracking-[0.4em] hover:text-white transition-colors italic leading-none">
            Dismiss Node
          </button>
        </div>

        {/* 🔒 Trace Mark */}
        <div className="bg-emerald-500/5 py-2 text-center border-t border-white/5 relative z-10">
          <span className="text-[5px] font-black text-emerald-500 uppercase tracking-[2.5em] opacity-40 italic leading-none">IMMUTABLE_MATRIX_ASSET</span>
        </div>
      </motion.div>
      
      <p className="mt-6 text-[8px] text-emerald-950 uppercase tracking-[2em] font-black animate-pulse italic leading-none">Encrypted Secure Settle Protocol • v1.1</p>
    </div>
  )
}