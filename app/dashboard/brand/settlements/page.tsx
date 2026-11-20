'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function BillingLedgerPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ gross: 0, net: 0, influencer: 0, fees: 0 })
  const [ledgerHistory, setLedgerHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchLedgerData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. მოგვაქვს პროფილები
      const { data: profiles } = await supabase.from('profiles').select('id, full_name')
      const profileMap: Record<string, string> = {}
      profiles?.forEach(p => { profileMap[p.id] = p.full_name || 'ANON' })

      // 2. მოგვაქვს ბრენდის ტრანზაქციები
      const { data: txData } = await supabase
        .from('transactions')
        .select('id, final_amount, brand_earned, influencer_earned, system_fee, payout_status, created_at, influencer_id')
        .eq('brand_id', user.id)
        .in('status', ['approved', 'success'])
        .order('created_at', { ascending: false })

      if (txData && txData.length > 0) {
        let totalGross = 0
        let totalNet = 0
        let totalInfluencer = 0
        let totalFees = 0

        const formattedHistory = txData.map(tx => {
          const clientPaid = Number(tx.final_amount) || 0
          const brandNet = Number(tx.brand_earned) || 0
          const influencerEarned = Number(tx.influencer_earned) || 0
          const systemFee = Number(tx.system_fee) || 0
          const nodeName = tx.influencer_id ? (profileMap[tx.influencer_id] || 'ANON') : 'ORGANIC TRAFFIC'

          totalGross += clientPaid
          totalNet += brandNet
          totalInfluencer += influencerEarned
          totalFees += systemFee

          return {
            id: `LDG-${tx.id.substring(0, 6).toUpperCase()}`,
            date: new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            clientPaid,
            brandNet,
            influencerEarned,
            systemFee,
            payoutStatus: tx.payout_status || '—',
            node: nodeName.replace(/\s+/g, '_').toUpperCase()
          }
        })

        setStats({ gross: totalGross, net: totalNet, influencer: totalInfluencer, fees: totalFees })
        setLedgerHistory(formattedHistory)
      } else {
        setStats({ gross: 0, net: 0, influencer: 0, fees: 0 })
        setLedgerHistory([])
      }
      
      setLoading(false)
    }

    fetchLedgerData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-500 font-black tracking-[1em] animate-pulse uppercase italic text-xs">
        Syncing Financial Ledger...
      </div>
    )
  }

  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-16 max-w-7xl mx-auto pb-40 font-sans text-white">
      
      {/* 💠 Ledger Matrix Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter italic uppercase text-white leading-none">
            Financial <span className="text-blue-500 italic">Ledger</span>
          </h1>
          <p className="text-[10px] font-black tracking-[0.6em] text-gray-600 uppercase italic">Instant Split Accounting & Reports</p>
        </div>
        
        {/* 💳 Quick Stats */}
        <div className="flex gap-8 border-l border-white/10 pl-10">
           <div className="space-y-1">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest italic">Customer Payments</span>
              <p className="text-3xl font-black italic tracking-tighter text-white leading-none">
                {stats.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs opacity-30">₾</span>
              </p>
           </div>
           <div className="space-y-1">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">Brand Earned</span>
              <p className="text-3xl font-black italic tracking-tighter text-blue-500 leading-none">
                {stats.net.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs opacity-30">₾</span>
              </p>
           </div>
        </div>
      </header>

      {/* 💰 Report Generation Card */}
      <section className="bg-[#010201] border-2 border-blue-500/10 rounded-[50px] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
         
         <div className="space-y-4 text-center md:text-left z-10">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] italic">Stored Split</span>
            <h2 className="text-6xl font-black italic tracking-tighter text-white">
              {stats.fees.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xl opacity-20 italic">GEL</span>
            </h2>
            <p className="text-xs font-black text-gray-600 uppercase tracking-widest italic">System fee · Influencer earned {stats.influencer.toLocaleString(undefined, { minimumFractionDigits: 2 })} ₾</p>
         </div>

         <div className="flex flex-col gap-4 w-full md:w-auto z-10">
            <button className="bg-white text-black px-12 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.4em] italic hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
               Download Tax Report (PDF)
            </button>
            <button className="bg-white/5 border border-white/10 text-gray-500 px-12 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.4em] italic hover:bg-white/10 hover:text-white transition-all">
               Export Ledger (.CSV)
            </button>
         </div>
      </section>

      {/* 📜 Transaction History */}
      <div className="space-y-10">
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] italic px-8">Settlement History</span>
        
        <div className="space-y-4">
          <div className="hidden md:grid md:grid-cols-7 px-8 text-[8px] font-black text-gray-700 uppercase tracking-[0.28em] italic mb-2">
             <div>Ledger ID</div>
             <div>Origin</div>
             <div>Date</div>
             <div>Paid</div>
             <div className="text-blue-500">Brand</div>
             <div>Influencer</div>
             <div className="text-right">Fee / Payout</div>
          </div>

          {ledgerHistory.length === 0 ? (
            <div className="text-center py-20 text-[10px] font-black tracking-[0.4em] uppercase text-gray-500 italic">
              No transactions detected in the ledger.
            </div>
          ) : (
            <AnimatePresence>
              {ledgerHistory.map((inv, i) => (
                <motion.div 
                  key={inv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/[0.02] border border-white/5 rounded-[35px] p-6 md:p-8 grid grid-cols-2 md:grid-cols-7 items-center gap-3 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                    <div>
                      <p className="text-[11px] font-black italic text-white uppercase">{inv.id}</p>
                      <p className="text-[10px] font-black italic text-gray-500 uppercase md:hidden">{inv.date}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-blue-500 italic tracking-widest uppercase">{inv.node}</span>
                  </div>
                  <div className="hidden md:block font-sans">
                    <p className="text-xs font-black italic text-gray-500 uppercase">{inv.date}</p>
                  </div>
                  <div>
                     <p className="text-[8px] text-gray-600 uppercase tracking-widest md:hidden">Paid</p>
                     <p className="text-sm font-black italic text-gray-300">{inv.clientPaid.toFixed(2)}</p>
                  </div>
                  <div>
                     <p className="text-[8px] text-gray-600 uppercase tracking-widest md:hidden">Brand</p>
                     <p className="text-sm font-black italic text-white">{inv.brandNet.toFixed(2)}</p>
                  </div>
                  <div>
                     <p className="text-[8px] text-gray-600 uppercase tracking-widest md:hidden">Influencer</p>
                     <p className="text-sm font-black italic text-white/80">{inv.influencerEarned.toFixed(2)}</p>
                  </div>
                  <div className="text-left md:text-right">
                     <p className="text-[8px] text-gray-600 uppercase tracking-widest md:hidden">Fee / payout</p>
                     <p className="text-sm font-black italic text-white/70">{inv.systemFee.toFixed(2)}</p>
                     <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest italic">{inv.payoutStatus}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}