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

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-[400px] bg-[#020402] border border-white/10 rounded-[50px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden print:border-none print:shadow-none"
      >
        {/* 💵 Banknote Watermark Pattern: InfluX Logos on Surface */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-12 p-4 rotate-12">
            {[...Array(20)].map((_, i) => (
                <span key={i} className="text-white font-black italic text-xl tracking-tighter select-none">InfluX</span>
            ))}
        </div>

        {/* Top Security Bar */}
        <div className="bg-emerald-500/5 border-b border-white/5 p-6 flex justify-between items-center relative overflow-hidden z-10">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1 italic">Authorized Merchant</span>
            <h4 className="text-sm font-black italic text-white tracking-widest uppercase truncate w-40">{brandName}</h4>
          </div>
          <div className="h-10 w-10 rounded-xl bg-black border border-emerald-500/20 flex items-center justify-center relative overflow-hidden shadow-inner">
             <motion.div animate={{ top: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute w-full h-[1px] bg-emerald-400 shadow-[0_0_10px_#10b981] z-20" />
             <span className="text-xl">🤖</span>
          </div>
        </div>

        <div className="p-8 space-y-8 relative z-10">
          {/* 🔴 LUXURY CRIMSON: MERCHANT PROOF */}
          <div className="text-center py-6 bg-red-500/[0.03] rounded-[35px] border border-red-500/20 relative overflow-hidden flex items-center justify-center gap-4">
            <div className="flex flex-col flex-1 pl-4">
              <span className="text-[9px] font-black text-red-500/50 uppercase tracking-[0.6em] block mb-2 italic text-left ml-4">Gross Input</span>
              <h3 className="text-6xl font-black tracking-tighter text-red-500 italic leading-none drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                {originalAmount?.toFixed(2)}
              </h3>
            </div>

            {/* ⚙️ High-Speed 3D Security Core: Reactive Points */}
            <div className="relative h-20 w-20 flex items-center justify-center mr-2 overflow-hidden">
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
                  {/* Rotating Inner Points */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-full h-full relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-red-500 rounded-full shadow-[0_0_10px_red]" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 bg-white rounded-full" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-1 bg-red-400 rounded-full" />
                  </motion.div>
              </motion.div>
              <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_15px_4px_rgba(239,68,68,0.8)] z-10" />
            </div>
          </div>

          {/* ⚪ PURE WHITE: FINAL SETTLE */}
          <div className="text-center relative">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[1em] block mb-2 italic">Settled Matrix</span>
            <h2 className="text-8xl font-black tracking-tighter text-white italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              {total.toFixed(2)}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic leading-none">GEL Verified</span>
            </div>
          </div>

          {/* 💰 EMERALD GLOW: MATRIX YIELD (Animated Figures) */}
          <div className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-[30px] py-5 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-[0.6em] mb-1 italic">Matrix Saving</span>
            <motion.span 
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            >
              -{savings.toFixed(2)} <span className="text-xs opacity-40">GEL</span>
            </motion.span>
          </div>

          {/* 🛡️ Secure Data Block */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 font-mono">
            <div className="flex flex-col">
              <span className="text-[6px] font-black text-gray-700 uppercase tracking-widest mb-1">Node Hash</span>
              <span className="text-[9px] text-emerald-500/80 font-bold italic truncate">#INX-{hash}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[6px] font-black text-gray-700 uppercase tracking-widest mb-1">Verified Time</span>
              <span className="text-[9px] text-white/60 font-bold">{time.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* 🚀 Actions */}
        <div className="p-8 pt-0 flex flex-col gap-3 relative z-10">
          <button onClick={handlePrint} className="w-full bg-white text-black py-5 rounded-[25px] font-black text-[11px] tracking-[0.5em] uppercase hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-2xl active:scale-95">
            Print the Receipt
          </button>
          <button onClick={onDone} className="w-full py-2 text-[8px] font-black text-gray-700 uppercase tracking-[0.4em] hover:text-white transition-colors italic">
            Dismiss Node
          </button>
        </div>

        {/* 🔒 Trace Mark */}
        <div className="bg-emerald-500/5 py-2 text-center border-t border-white/5 relative z-10">
          <span className="text-[5px] font-black text-emerald-500 uppercase tracking-[2.5em] opacity-40 italic leading-none">IMMUTABLE_MATRIX_ASSET</span>
        </div>
      </motion.div>
    </div>
  )
}