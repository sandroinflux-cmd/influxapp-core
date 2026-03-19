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

  // 🔊 Web Audio API - სინთეზირებული "Tick" ხმა (არანაირი გარე ფაილი)
  const playPulseTick = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)

      gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start()
      osc.stop(audioCtx.currentTime + 0.1)
    } catch (e) {
      console.error("Audio Engine Error:", e)
    }
  }

  useEffect(() => {
    if (!isActive || !brandId) return

    // 📡 მხოლოდ ამ ბრენდის ტრანზაქციების მოსმენა რეალურ დროში
    const channel = supabase
      .channel(`terminal-${brandId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'transactions',
          filter: `brand_id=eq.${brandId}` 
        },
        (payload) => {
          const txData = {
            ...payload.new,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }
          
          playPulseTick()
          setLastPayment(txData)
          setHistory(prev => [txData, ...prev].slice(0, 8))
          setStatus('success')

          // ⚡️ თანხა რჩება 30 წამი
          setTimeout(() => {
            setStatus('scanning')
          }, 30000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isActive, brandId])

  // Error State: თუ ბმული ბრენდის ID-ის გარეშეა
  if (!brandId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-10">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-black uppercase text-[10px] tracking-[0.5em] italic">Access Denied</p>
          <p className="text-gray-600 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Missing Brand Protocol ID.<br />Please use the link provided in Brand Settings.
          </p>
        </div>
      </div>
    )
  }

  // 🛡️ Interaction Gate: ბრაუზერის ხმის პოლიტიკის გამო
  if (!isActive) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-12">
        <div className="text-center space-y-4">
          <div className="h-1 w-24 bg-blue-500/10 mx-auto rounded-full overflow-hidden relative">
            <motion.div 
              animate={{ left: ["-100%", "100%"] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute h-full w-1/2 bg-blue-500 shadow-[0_0_20px_#3b82f6]" 
            />
          </div>
          <h1 className="text-white/20 font-black text-[10px] uppercase tracking-[1em] italic">Matrix Terminal v3.0</h1>
        </div>
        <button 
          onClick={() => setIsActive(true)}
          className="bg-white text-black px-20 py-8 rounded-[40px] font-black text-xs uppercase tracking-[0.5em] italic hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-2xl"
        >
          Initialize Sync
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex flex-col p-8 md:p-16 ${
      status === 'success' ? 'bg-[#030a06]' : 'bg-[#010201]'
    }`}>
      
      {/* 📡 Header / Status Area */}
      <header className="flex justify-between items-start w-full max-w-7xl mx-auto">
        <div className="space-y-3">
          <h2 className="text-white font-black italic text-2xl uppercase tracking-tighter">
            Node <span className="text-blue-500">Monitor</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className={`h-1.5 w-1.5 rounded-full ${status === 'scanning' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
            <span className="text-[8px] font-black uppercase tracking-[0.6em] text-gray-700 italic">
              {status === 'scanning' ? 'Pulse: Active / Scanning' : 'Status: Secured'}
            </span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <span className="text-[8px] font-black text-gray-800 uppercase tracking-widest block">Terminal_Node_01</span>
          <span className="text-[10px] font-black text-emerald-500/40 italic">ENCRYPTED</span>
        </div>
      </header>

      {/* 💰 Main Display Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {status === 'scanning' ? (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <h3 className="text-6xl md:text-8xl font-black italic text-white/[0.02] uppercase tracking-tighter select-none">
                Standby Mode
              </h3>
            </motion.div>
          ) : (
            <motion.div 
              key="amount" 
              initial={{ y: 30, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: -30, opacity: 0, scale: 1.05 }}
              className="text-center relative"
            >
              <div className="absolute inset-0 bg-emerald-500/5 blur-[160px] -z-10 rounded-full" />
              <span className="text-emerald-500 text-[11px] font-black uppercase tracking-[1em] italic mb-8 block">Verified Settlement</span>
              <h1 className="text-[140px] md:text-[320px] font-black italic tracking-tighter text-white leading-none">
                <span>{lastPayment?.final_amount?.toFixed(2)}</span>
                <span className="text-4xl md:text-7xl opacity-20 ml-6 not-italic font-sans">₾</span>
              </h1>
              <div className="flex items-center justify-center gap-6 mt-12">
                <div className="h-[1px] w-12 bg-emerald-500/20" />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] italic">
                  REF: <span className="text-white opacity-60">{lastPayment?.id?.slice(0,16).toUpperCase()}</span>
                </p>
                <div className="h-[1px] w-12 bg-emerald-500/20" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 📜 Live Pulse History */}
      <footer className="w-full max-w-5xl mx-auto mt-12 space-y-6">
        <div className="flex justify-between items-end border-b border-white/5 pb-4 px-2">
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.6em] italic">Recent Payment Pulse</span>
          <span className="text-[8px] font-black text-gray-800 uppercase italic italic">Live Session History</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {history.map((tx, i) => (
              <motion.div 
                key={tx.id} 
                initial={{ x: -10, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex justify-between items-center group hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white italic uppercase tracking-widest">Node_{tx.id.slice(0,6)}</p>
                    <p className="text-[8px] font-black text-gray-600 uppercase italic tracking-widest">
                      {tx.timestamp} • {tx.influencer_id ? 'Partner Token' : 'Direct Pulse'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black italic text-emerald-500 leading-none">{tx.final_amount?.toFixed(2)} ₾</p>
                  <span className="text-[7px] font-black text-gray-800 uppercase tracking-tighter">SECURED</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {history.length === 0 && (
            <div className="col-span-full text-center py-16 text-[10px] font-black text-gray-800 uppercase tracking-[0.5em] italic">
              No live pulse detected
            </div>
          )}
        </div>
      </footer>
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