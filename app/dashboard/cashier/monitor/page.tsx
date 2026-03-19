'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

function MonitorContent() {
  const searchParams = useSearchParams()
  const brandId = searchParams.get('brand')
  
  const [isActive, setIsActive] = useState(false)
  const [lastPayment, setLastPayment] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [status, setStatus] = useState<'scanning' | 'success'>('scanning')

  const playPulseTick = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const playSharpTick = (freq: number, start: number, volume: number) => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start)
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + start + 0.1)
        gain.gain.setValueAtTime(volume, audioCtx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + 0.1)
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.start(audioCtx.currentTime + start)
        osc.stop(audioCtx.currentTime + start + 0.1)
      }
      playSharpTick(2500, 0, 0.5)
      playSharpTick(3200, 0.06, 0.4)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (!isActive || !brandId) return

    const channel = supabase
      .channel(`terminal-${brandId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions', filter: `brand_id=eq.${brandId}` },
        (payload) => {
          const now = new Date();
          const txData = {
            ...payload.new,
            exactTime: now.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          }
          
          playPulseTick()
          setLastPayment(txData)
          setHistory(prev => [txData, ...prev].slice(0, 10))
          setStatus('success')

          setTimeout(() => { setStatus('scanning') }, 40000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isActive, brandId])

  if (!brandId) return <div className="min-h-screen bg-black" />

  if (!isActive) {
    return (
      <div className="min-h-screen bg-[#010201] flex items-center justify-center">
        <button onClick={() => setIsActive(true)} className="bg-emerald-600 text-white px-24 py-10 rounded-[45px] font-black text-xl uppercase tracking-[0.5em] italic shadow-[0_0_60px_rgba(16,185,129,0.3)] border-2 border-white/10">
          Initialize Terminal
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex flex-col p-8 md:p-16 ${status === 'success' ? 'bg-[#030a06]' : 'bg-[#010201]'}`}>
      
      <header className="flex justify-between items-start w-full max-w-7xl mx-auto z-10">
        <div className="space-y-3">
          <h2 className="text-white font-black italic text-3xl uppercase tracking-tighter">Terminal <span className="text-emerald-500">Node</span></h2>
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${status === 'scanning' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_20px_#10b981]'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-700 italic">
              {status === 'scanning' ? 'Pulse: Active / Scanning' : 'Status: Transaction Received'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-emerald-500/40 text-[10px] font-black uppercase tracking-[0.4em] italic mb-1">Live Monitor v3.7</p>
          <p className="text-white/40 font-black italic text-xl tracking-widest">{new Date().toLocaleTimeString('ka-GE', {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {status === 'scanning' ? (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <h3 className="text-8xl md:text-[140px] font-black italic text-white/[0.02] uppercase tracking-tighter select-none">Monitoring...</h3>
            </motion.div>
          ) : (
            <motion.div key="amount" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="text-center w-full relative z-20">
              
              <div className="mb-10 flex flex-col items-center">
                 <span className="text-white/20 text-[18px] font-black uppercase tracking-[1.5em] italic mb-4 block leading-none">CHECK BILL AMOUNT</span>
                 <div className="px-8 py-3 bg-white/5 border border-white/10 rounded-full">
                    <p className="text-4xl font-black text-emerald-500 italic tracking-widest">
                       {lastPayment?.exactTime}
                    </p>
                 </div>
              </div>

              <div className="relative inline-block px-4">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[200px] -z-10 rounded-full" />
                
                {/* 🚀 ველის სახელი შევცვალე bill_amount-ით */}
                <h1 className="text-[200px] md:text-[420px] font-black italic tracking-tighter text-white leading-none drop-shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                  {(lastPayment?.bill_amount || lastPayment?.initial_amount || 0).toFixed(2)}
                  <span className="text-6xl md:text-9xl opacity-20 ml-8 not-italic font-sans">₾</span>
                </h1>
              </div>

              <div className="mt-16 flex flex-col items-center gap-6">
                <div className="px-12 py-6 bg-emerald-600/20 border-2 border-emerald-500/40 rounded-[35px] shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                  <p className="text-[22px] font-black text-emerald-500 uppercase tracking-[0.5em] italic leading-none">
                    CUSTOMER PAID: {lastPayment?.final_amount?.toFixed(2)} ₾
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="w-full max-w-5xl mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-48 overflow-y-auto scrollbar-hide">
          <AnimatePresence initial={false}>
            {history.map((tx) => (
              <motion.div key={tx.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex justify-between items-center group hover:border-emerald-500/20 transition-all">
                <div className="flex flex-col">
                  <span className="text-white font-black italic text-2xl tracking-widest leading-none mb-1">{tx.exactTime}</span>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">REF_{tx.id.slice(0,6).toUpperCase()}</span>
                </div>
                <div className="text-right">
                  {/* 🚀 აქაც bill_amount */}
                  <span className="text-4xl font-black italic text-white leading-none block">{(tx.bill_amount || tx.initial_amount || 0).toFixed(2)} ₾</span>
                  <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest mt-2 block">PAID: {tx.final_amount.toFixed(2)} ₾</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

export default function CashierMonitor() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <MonitorContent />
    </Suspense>
  )
}