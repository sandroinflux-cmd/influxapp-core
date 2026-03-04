'use client'

import { motion } from 'framer-motion'

const billingHistory = [
  { id: 'INV-001', date: 'Oct 12, 2025', amount: '12,400.00', status: 'PAID', node: 'ANDRO_NODE' },
  { id: 'INV-002', date: 'Nov 02, 2025', amount: '8,200.00', status: 'PAID', node: 'NINA_NODE' },
  { id: 'INV-003', date: 'Dec 01, 2025', amount: '5,100.00', status: 'PROCESSING', node: 'ALPHA_NODE' },
]

export default function BillingPage() {
  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-16 max-w-7xl mx-auto pb-40 font-sans text-white">
      
      {/* 💠 Billing Matrix Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter italic uppercase text-white leading-none">
            Billing <span className="text-blue-500 italic">Matrix</span>
          </h1>
          <p className="text-[10px] font-black tracking-[0.6em] text-gray-600 uppercase italic">Financial Settlements & Ledger</p>
        </div>
        
        {/* 💳 Quick Stats */}
        <div className="flex gap-12 border-l border-white/10 pl-12">
           <div className="space-y-1">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">Total Paid out</span>
              <p className="text-4xl font-black italic tracking-tighter text-white leading-none">154,200 <span className="text-xs opacity-30">₾</span></p>
           </div>
           <div className="space-y-1">
              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest italic">In Reserve</span>
              <p className="text-4xl font-black italic tracking-tighter text-amber-500 leading-none">12,850 <span className="text-xs opacity-30 text-white">₾</span></p>
           </div>
        </div>
      </header>

      {/* 💰 Current Cycle Card */}
      <section className="bg-[#010201] border-2 border-blue-500/10 rounded-[50px] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
         
         <div className="space-y-4 text-center md:text-left">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic">Active Settlement Cycle</span>
            <h2 className="text-6xl font-black italic tracking-tighter text-white">5,100.00 <span className="text-xl opacity-20 italic">GEL</span></h2>
            <p className="text-xs font-black text-gray-600 uppercase tracking-widest italic italic">Next Automated Payout: Dec 15, 2025</p>
         </div>

         <div className="flex flex-col gap-4 w-full md:w-auto">
            <button className="bg-white text-black px-12 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.4em] italic hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
               Release Funds Now
            </button>
            <button className="bg-white/5 border border-white/10 text-gray-500 px-12 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.4em] italic hover:bg-white/10 hover:text-white transition-all">
               Update Payment Node
            </button>
         </div>
      </section>

      {/* 📜 Transaction History */}
      <div className="space-y-10">
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] italic px-8">Settlement History</span>
        
        <div className="space-y-4">
          <div className="grid grid-cols-4 px-12 text-[8px] font-black text-gray-700 uppercase tracking-[0.4em] italic mb-2">
             <div>Reference ID</div>
             <div className="text-center">Influencer Node</div>
             <div className="text-center">Execution Date</div>
             <div className="text-right">Value Delivered</div>
          </div>

          {billingHistory.map((inv, i) => (
            <motion.div 
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-[35px] p-8 grid grid-cols-4 items-center hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                <p className="text-sm font-black italic text-white uppercase">{inv.id}</p>
              </div>
              
              <div className="text-center">
                <span className="text-[10px] font-black text-blue-500 italic tracking-widest">{inv.node}</span>
              </div>

              <div className="text-center font-sans">
                <p className="text-xs font-black italic text-gray-500 uppercase">{inv.date}</p>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                 <p className="text-xl font-black italic text-white leading-none">{inv.amount} <span className="text-[9px] opacity-20 italic">₾</span></p>
                 <span className={`text-[7px] font-black px-3 py-1 rounded-full border ${
                    inv.status === 'PAID' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                 } uppercase tracking-widest italic`}>{inv.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}