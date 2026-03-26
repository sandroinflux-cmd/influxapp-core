'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function ReceiptModal({ total, originalAmount, deal, onDone }: any) {
  const [time, setTime] = useState(new Date())
  const [hash, setHash] = useState('')
  const [influencer, setInfluencer] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const savings = (originalAmount || 0) - total;
  
  // 🚀 დაზღვეული სახელი აქაც!
  const brandName = deal?.brands?.name || deal?.brand || deal?.title || "MATRIX PARTNER";

  useEffect(() => {
    setHash(Math.random().toString(36).substr(2, 10).toUpperCase())
    const timer = setInterval(() => setTime(new Date()), 1000)
    
    const token = JSON.parse(localStorage.getItem('matrix_active_token') || '{}')
    if (token?.profile) setInfluencer(token.profile)
      
    return () => clearInterval(timer)
  }, [])

  // 🚀 PDF გენერატორი დაცვითი მექანიზმით
  const handlePrint = () => {
    setIsDownloading(true)
    const element = document.getElementById('receipt-wrapper')
    
    const generatePDF = () => {
      const opt = {
        margin: 0,
        filename: `INFLUX_${brandName}_${hash}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        // სტანდარტული ზომა 'a5', რომ აღარ გაქრაშოს!
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#020402' },
        jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
      }
      try {
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save().then(() => {
          setIsDownloading(false);
        }).catch((err: any) => {
          console.error("PDF generation failed:", err);
          setIsDownloading(false);
        });
      } catch (e) {
        setIsDownloading(false);
      }
    };

    // @ts-ignore
    if (window.html2pdf) {
      generatePDF();
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.onload = generatePDF;
      script.onerror = () => setIsDownloading(false);
      document.body.appendChild(script)
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-4 overflow-hidden font-sans">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
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
        id="receipt-wrapper"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-[340px] bg-[#020402]/90 border border-white/20 rounded-[45px] shadow-[0_0_120px_rgba(16,185,129,0.1)] overflow-hidden backdrop-blur-3xl"
      >
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none flex flex-wrap gap-x-16 gap-y-14 p-4 rotate-[20deg] z-0 justify-center">
            {[...Array(18)].map((_, i) => (
                <motion.span 
                  key={i} 
                  animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.1, 1], textShadow: ["0 0 10px #10b981", "0 0 25px #10b981", "0 0 10px #10b981"] }}
                  transition={{ duration: Math.random() * 2 + 1, repeat: Infinity }}
                  className="text-[14px] font-black italic tracking-[0.3em] select-none uppercase text-emerald-400"
                >
                  InfluXpay
                </motion.span>
            ))}
        </div>

        <div className="bg-emerald-500/10 border-b border-white/5 p-5 flex justify-between items-center relative overflow-hidden z-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col">
              <span className="text-[5px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-0.5 italic">Merchant / Brand</span>
              <h4 className="text-[10px] font-black italic text-white tracking-widest uppercase truncate">{brandName}</h4>
            </div>
            <div className="flex flex-col">
              <span className="text-[5px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-0.5 italic">InfluX Partner</span>
              <h4 className="text-[10px] font-black italic text-white tracking-widest uppercase truncate">{influencer?.full_name || 'Matrix Node'}</h4>
            </div>
          </div>
          
          <div className="h-12 w-12 rounded-xl bg-black border border-emerald-500/30 flex items-center justify-center relative overflow-hidden shadow-inner shrink-0">
             <motion.div animate={{ top: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute w-full h-[1px] bg-emerald-400 shadow-[0_0_15px_#10b981] z-20" />
             {influencer?.avatar_url 
               ? <img src={influencer.avatar_url} className="w-full h-full object-cover filter brightness-110" /> 
               : <span className="text-xl">🤖</span>}
          </div>
        </div>

        <div className="p-6 space-y-6 relative z-10">
          <div className="text-center py-5 bg-red-600/[0.05] rounded-[30px] border border-red-500/30 relative overflow-hidden flex items-center justify-center gap-2 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
            <div className="flex flex-col flex-1 pl-2">
              <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.6em] block mb-1 italic text-left ml-4">Input Amount</span>
              <h3 className="text-6xl font-black tracking-tighter text-red-500 italic leading-none drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                {originalAmount?.toFixed(2)}
              </h3>
            </div>

            <div className="relative h-20 w-20 flex items-center justify-center mr-1 overflow-hidden scale-110">
              <motion.div 
                animate={{ rotateY: 360, rotateX: 360, rotateZ: 360 }} 
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }} 
                className="absolute h-full w-full rounded-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                  {[...Array(50)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: [0.1, 1, 0.1], scale: [1, 1.8, 1] }}
                      transition={{ duration: Math.random() * 1.5 + 0.5, repeat: Infinity }}
                      className="absolute h-[1.5px] w-[1.5px] bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"
                      style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: `translateZ(${Math.random() * 80 - 40}px)` }}
                    />
                  ))}
              </motion.div>
              <div className="h-3 w-3 rounded-full bg-red-600 shadow-[0_0_30px_12px_rgba(239,68,68,1)] z-10 animate-pulse" />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="absolute h-full w-full border-t-2 border-red-500/60 rounded-full" />
            </div>
          </div>

          <div className="text-center relative py-4 bg-white/[0.02] border border-white/5 rounded-[30px]">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-[1em] block mb-1 italic">Settled Matrix</span>
            <h2 className="text-6xl font-black tracking-tighter text-white italic leading-none">
              {total.toFixed(2)}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3 opacity-40">
              <div className="h-1 w-1 rounded-full bg-white" />
              <span className="text-[9px] font-black text-white uppercase tracking-[0.5em] italic leading-none">GEL Verified</span>
            </div>
          </div>

          <div className="bg-emerald-500/[0.06] border border-emerald-500/30 rounded-[30px] py-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <span className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.6em] mb-1 italic">Benefit Realized</span>
            <motion.span 
              animate={{ opacity: [0.8, 1, 0.8], textShadow: ["0 0 10px #10b981", "0 0 25px #10b981", "0 0 10px #10b981"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl font-black text-emerald-400 tracking-tighter italic"
            >
              -{savings.toFixed(2)} <span className="text-xs opacity-50">GEL</span>
            </motion.span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-5 font-mono">
            <div className="flex flex-col">
              <span className="text-[5px] font-black text-gray-700 uppercase tracking-widest mb-1">Node Hash</span>
              <span className="text-[8px] text-emerald-500/80 font-bold italic truncate">#INX-{hash}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[5px] font-black text-gray-700 uppercase tracking-widest mb-1">Trace Time</span>
              <span className="text-[8px] text-white/60 font-bold">{time.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500/5 py-1.5 text-center border-t border-white/5 relative z-10">
          <span className="text-[4px] font-black text-emerald-500 uppercase tracking-[2em] opacity-30 italic leading-none">IMMUTABLE_MATRIX_ASSET</span>
        </div>
      </motion.div>

      <div className="w-full max-w-[340px] pt-6 flex flex-col gap-3 relative z-10">
        <button 
          onClick={handlePrint} 
          disabled={isDownloading}
          className="w-full bg-white text-black py-4 rounded-[22px] font-black text-[10px] tracking-[0.4em] uppercase hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50"
        >
          {isDownloading ? 'GENERATING PDF...' : 'DOWNLOAD'}
        </button>
        <button onClick={onDone} className="w-full py-2 text-[7px] font-black text-gray-700 uppercase tracking-[0.3em] hover:text-white transition-colors italic">
          Dismiss Node
        </button>
      </div>
    </div>
  )
}