'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export default function CashierLiveMonitor() {
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  useEffect(() => {
    // ⚡ ვუსმენთ ტრანზაქციების ცხრილს რეალურ დროში
    const channel = supabase
      .channel('cashier-monitor')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log("New Payment Detected!", payload.new)
          setLastTransaction(payload.new)
          
          // ⏱️ 8 წამში ვაქრობთ შეტყობინებას
          setTimeout(() => setLastTransaction(null), 8000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <AnimatePresence>
      {lastTransaction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-6 pointer-events-none"
        >
          <div className="bg-[#050505] border-4 border-emerald-500 rounded-[60px] p-16 shadow-[0_0_150px_rgba(16,185,129,0.4)] flex flex-col items-center gap-8 max-w-2xl w-full italic font-black uppercase pointer-events-auto">
            
            <div className="flex items-center gap-4 text-emerald-500 animate-pulse">
              <div className="h-4 w-4 rounded-full bg-current shadow-[0_0_15px_currentColor]" />
              <span className="text-sm tracking-[0.5em]">Payment Received</span>
            </div>

            {/* 💰 გიგანტური თანხა */}
            <h2 className="text-[180px] leading-none text-white tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              {lastTransaction.amount}<span className="text-4xl ml-4 opacity-40 italic font-light">GEL</span>
            </h2>

            <div className="w-full h-[1px] bg-white/10" />

            <div className="flex justify-between w-full px-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 tracking-widest mb-1">Status</span>
                <span className="text-xl text-emerald-500 tracking-tighter">SUCCESSFUL</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-500 tracking-widest mb-1">Node ID</span>
                <span className="text-xl text-white/40 tracking-tighter">#{lastTransaction.id.slice(0,8)}</span>
              </div>
            </div>

            {/* Progress bar countdown */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="absolute bottom-0 left-0 h-2 bg-emerald-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}