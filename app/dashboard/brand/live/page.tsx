'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 🚀 იმიტირებული ლაივ მონაცემები
const initialTransactions = [
  { id: 'TX-8842', user: 'NODE_ALPHA_9', amount: '320.00', token: '$ANDRO', time: 'Just Now' },
  { id: 'TX-8841', user: 'NODE_BETA_2', amount: '150.50', token: '$NINA', time: '1m ago' },
  { id: 'TX-8840', user: 'NODE_GAMMA_5', amount: '75.00', token: '$LUNA', time: '3m ago' },
]

export default function LivePulsePage() {
  const [transactions, setTransactions] = useState(initialTransactions)

  // 🛰️ ლაივ რეჟიმის სიმულაცია
  useEffect(() => {
    const interval = setInterval(() => {
      const newTx = {
        id: `TX-${Math.floor(Math.random() * 9000) + 1000}`,
        user: `NODE_${['X', 'Y', 'Z'][Math.floor(Math.random() * 3)]}_${Math.floor(Math.random() * 99)}`,
        amount: (Math.random() * 450 + 20).toFixed(2),
        token: ['$ANDRO', '$NINA', '$LUNA', '$ALPHA'][Math.floor(Math.random() * 4)],
        time: 'Just Now'
      }
      setTransactions(prev => [newTx, ...prev.slice(0, 8)])
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-12 max-w-7xl mx-auto pb-40 font-sans text-white overflow-hidden">
      
      {/* 💠 Live Header */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-500 animate-ping shadow-[0_0_15px_#ef4444]" />
             <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">
               Live <span className="text-blue-500 italic">Pulse</span>
             </h1>
          </div>
          <p className="text-[10px] font-black tracking-[0.6em] text-gray-600 uppercase italic">Real-Time Transaction Stream</p>
        </div>

        <div className="hidden md:block text-right">
           <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic block mb-1">Ecosystem Status</span>
           <p className="text-sm font-black italic text-emerald-500 uppercase tracking-tighter animate-pulse">Stream Active</p>
        </div>
      </header>

      {/* 📊 Real-Time Matrix Feed */}
      <div className="space-y-4">
        <div className="grid grid-cols-5 px-10 text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] italic mb-6">
           <div className="col-span-1">TX_ID</div>
           <div className="col-span-1 text-center">Consumer_ID</div>
           <div className="col-span-1 text-center">Origin_Token</div>
           <div className="col-span-1 text-right">Net_Value</div>
           <div className="col-span-1 text-right">Receipt_Action</div>
        </div>

        <AnimatePresence initial={false}>
          {transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.98 }}
              className="bg-[#010201] border border-white/5 rounded-[35px] p-6 md:p-8 flex flex-col md:grid md:grid-cols-5 items-center gap-6 transition-all hover:border-blue-500/30 group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* TX INFO */}
              <div className="col-span-1 flex items-center gap-4 w-full md:w-auto">
                 <div className="h-10 w-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[11px] font-black text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all italic italic">
                   #
                 </div>
                 <div>
                    <p className="text-sm font-black italic text-white leading-none">{tx.id}</p>
                    <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-1.5 italic">{tx.time}</p>
                 </div>
              </div>

              {/* Consumer Node */}
              <div className="col-span-1 text-center font-sans">
                 <p className="text-[11px] font-black italic text-gray-400 tracking-tighter uppercase">{tx.user}</p>
              </div>

              {/* Matrix Origin Token */}
              <div className="col-span-1 text-center font-sans">
                 <span className="text-sm font-black italic text-blue-500 tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">{tx.token}</span>
              </div>

              {/* Transaction Value */}
              <div className="col-span-1 text-right w-full md:w-auto font-sans">
                 <p className="text-2xl font-black italic text-white leading-none">
                    {tx.amount} <span className="text-[10px] text-gray-500 opacity-40 ml-1">₾</span>
                 </p>
              </div>

              {/* Action: Receipt Options */}
              <div className="col-span-1 flex justify-end gap-2 w-full md:w-auto font-sans">
                 <button 
                   onClick={() => alert(`Opening Receipt View: ${tx.id}`)}
                   className="bg-white/5 text-white border border-white/10 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic hover:bg-white hover:text-black transition-all active:scale-95"
                 >
                   View
                 </button>
                 <button 
                   onClick={() => alert(`Downloading Receipt File: ${tx.id}`)}
                   className="bg-blue-600 text-white px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic hover:bg-blue-500 transition-all shadow-lg active:scale-95"
                 >
                   Download ↓
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 💠 Fixed Pulse Metrics Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 p-8 z-[200]">
         <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12">
            <div className="flex gap-12 font-sans">
               <div className="space-y-1">
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block italic">Transactions (24h)</span>
                  <p className="text-2xl font-black italic text-white leading-none">1,482</p>
               </div>
               <div className="space-y-1">
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest block italic">Total Pulse Value</span>
                  <p className="text-2xl font-black italic text-blue-500 leading-none">42,890.00 ₾</p>
               </div>
            </div>
            <div className="hidden lg:block font-sans">
               <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 px-6 py-3 rounded-2xl">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black text-white uppercase tracking-[0.4em] italic">Secure Ledger Sync Verified</p>
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}