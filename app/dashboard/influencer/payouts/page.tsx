'use client'

import { motion } from 'framer-motion'

const transactions = [
  { id: 'TXN_9921', date: 'Oct 24, 2025', amount: '4,250.00', status: 'Completed' },
  { id: 'TXN_9904', date: 'Oct 12, 2025', amount: '1,820.50', status: 'Verified' },
  { id: 'TXN_9851', date: 'Sep 28, 2025', amount: '3,400.00', status: 'Completed' },
]

export default function PayoutsPage() {
  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 lg:ml-0 overflow-x-hidden">
      
      {/* 1. Bold Header */}
      <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <span className="text-emerald-500/40 text-[9px] font-black tracking-[0.8em] uppercase mb-4 block italic">Financial Protocol v1.0</span>
          <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">
            Payout <span className="text-emerald-500">Vault</span>
          </h1>
        </div>
        <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-3xl backdrop-blur-xl">
          <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-1">Bank Account Linked</span>
          <p className="text-sm font-bold tracking-tight uppercase">TBC Bank • **** 8842</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 2. Primary Wallet Pod */}
        <div className="lg:col-span-7 bg-[#040d08]/60 border border-emerald-500/20 rounded-[60px] p-16 backdrop-blur-3xl relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-1000" />
          
          <span className="text-[11px] text-emerald-500 uppercase tracking-[0.6em] font-black italic mb-6 block">Available Liquidity</span>
          <div className="flex items-baseline gap-4 mb-16">
            <h2 className="text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">1,282.50</h2>
            <span className="text-3xl font-bold text-emerald-500 uppercase italic">Gel</span>
          </div>

          <button className="w-full bg-white text-black py-7 rounded-[35px] font-black text-[14px] tracking-[0.6em] uppercase hover:bg-emerald-500 hover:text-white transition-all duration-700 shadow-2xl active:scale-95">
            Execute Withdrawal
          </button>
          
          <p className="text-gray-600 text-[9px] uppercase font-black tracking-[0.3em] mt-8 text-center opacity-50">
            Instant settlement via SEPA/RTGS protocol
          </p>
        </div>

        {/* 3. Transaction History */}
        <div className="lg:col-span-5 space-y-6">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] ml-6 mb-8 italic">Settlement History</h4>
          {transactions.map((txn, i) => (
            <motion.div 
              key={txn.id} 
              whileHover={{ x: -10 }}
              className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 flex justify-between items-center group transition-all duration-500 hover:border-emerald-500/20"
            >
              <div>
                <span className="text-xl font-black italic tracking-tighter uppercase text-white/80 group-hover:text-white">{txn.amount} <span className="text-xs text-emerald-500">Gel</span></span>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-2">{txn.date} • {txn.id}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">{txn.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  )
}