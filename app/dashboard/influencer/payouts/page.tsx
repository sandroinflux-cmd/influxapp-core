'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function SettlementLedger() {
  const [loading, setLoading] = useState(true)
  const [totalSettled, setTotalSettled] = useState(0)
  const [history, setHistory] = useState<any[]>([])
  const [iban, setIban] = useState('')

  useEffect(() => {
    fetchSettlements()
  }, [])

  const fetchSettlements = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. IBAN-ის წამოღება პროფილიდან
      const { data: profile } = await supabase
        .from('profiles')
        .select('iban')
        .eq('id', user.id)
        .single()
      if (profile) setIban(profile.iban || 'NO IBAN LINKED')

      // 2. წარმატებული ტრანზაქციების წამოღება (რომლებიც უკვე "დარიცხულია")
      const { data: txs, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('influencer_id', user.id)
        .eq('status', 'success')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (txs) {
        const total = txs.reduce((sum, tx) => sum + (Number(tx.final_amount) || 0), 0)
        setTotalSettled(total)
        setHistory(txs.slice(0, 10)) // ბოლო 10 ტრანზაქცია
      }
    } catch (err) {
      console.error('Settlement Fetch Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#010201] flex items-center justify-center">
      <p className="text-emerald-500 font-black italic animate-pulse uppercase tracking-[0.5em]">Accessing Financial Ledger...</p>
    </div>
  )

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 lg:ml-0 overflow-x-hidden">
      
      {/* 1. Technical Header */}
      <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <span className="text-emerald-500/40 text-[9px] font-black tracking-[0.8em] uppercase mb-4 block italic">Automated Settlement Protocol</span>
          <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">
            Payout <span className="text-emerald-500">Ledger</span>
          </h1>
        </div>
        
        {/* IBAN Status Chip */}
        <div className="bg-white/[0.02] border border-emerald-500/20 px-8 py-5 rounded-[30px] backdrop-blur-xl group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-1">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
             <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Active Settlement Node</span>
          </div>
          <p className="text-xs font-black tracking-tight uppercase text-emerald-50">{iban}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 2. Automated Capital Card */}
        <div className="lg:col-span-7 bg-[#040d08]/60 border border-white/5 rounded-[60px] p-16 relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 right-0 p-10 opacity-20">
             <span className="text-[120px] leading-none select-none font-black italic text-emerald-500/10">PUSH</span>
          </div>
          
          <span className="text-[11px] text-emerald-500/60 uppercase tracking-[0.6em] font-black italic mb-6 block">Total Settled Capital</span>
          <div className="flex items-baseline gap-4 mb-16 relative z-10">
            <h2 className="text-[110px] font-black tracking-tighter text-white leading-none drop-shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              {totalSettled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-4xl font-black text-emerald-500 italic opacity-40">₾</span>
          </div>

          <div className="space-y-6 relative z-10">
             <button className="w-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 py-7 rounded-[35px] font-black text-[12px] tracking-[0.6em] uppercase hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-2xl active:scale-95">
               Generate Tax Report
             </button>
             
             <div className="flex items-center justify-center gap-4 text-gray-600">
                <div className="h-[1px] w-12 bg-white/5" />
                <p className="text-[9px] uppercase font-black tracking-[0.3em] italic">
                  Status: All funds routed to bank
                </p>
                <div className="h-[1px] w-12 bg-white/5" />
             </div>
          </div>
        </div>

        {/* 3. Real-time Bank Transfers History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-end ml-6 mb-8">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] italic">Transfer Log</h4>
            <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest italic animate-pulse text-glow">Live Feed</span>
          </div>

          {history.length > 0 ? history.map((tx) => (
            <motion.div 
              key={tx.id} 
              whileHover={{ x: -10 }}
              className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 flex justify-between items-center group transition-all duration-500 hover:border-emerald-500/20"
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black italic tracking-tighter uppercase text-white/90 group-hover:text-white">
                    {Number(tx.final_amount).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-black text-emerald-500">₾</span>
                </div>
                <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest mt-2">
                  {new Date(tx.created_at).toLocaleDateString()} • ID_{tx.id.slice(0,6).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Settled</span>
                </div>
                <p className="text-[7px] text-gray-600 font-black uppercase tracking-tighter italic">Bank Transferred</p>
              </div>
            </motion.div>
          )) : (
            <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-20 text-center">
               <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600 italic font-black">No recent settlements</p>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}