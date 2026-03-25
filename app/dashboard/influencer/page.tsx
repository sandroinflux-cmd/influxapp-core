'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export default function MatrixDashboard() {
  const [activeDeals, setActiveDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProfit, setTotalProfit] = useState(0)
  const [totalScans, setTotalScans] = useState(0)
  const [liveFeed, setLiveFeed] = useState<any[]>([]) // რეალური დროის ტრანზაქციები

  useEffect(() => {
    fetchMetrics()
    fetchActiveDeals()
    subscribeToTransactions() // Real-time Update
  }, [])

  const fetchActiveDeals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('partnerships')
      .select('*, deals(*)')
      .eq('influencer_id', user.id)
      .eq('status', 'active')
    if (data) setActiveDeals(data)
    setLoading(false)
  }

  const fetchMetrics = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('influencer_id', user.id)
      .eq('status', 'approved') // 🎯 გასწორდა
      .order('created_at', { ascending: false })

    if (txData) {
      setTotalProfit(txData.reduce((acc, tx) => acc + (tx.influencer_earned || 0), 0))
      setTotalScans(txData.length)
      setLiveFeed(txData.slice(0, 5)) // ბოლო 5 აქტივობა
    }
  }

  const subscribeToTransactions = () => {
    const channel = supabase
      .channel('realtime_vault')
      // 🎯 გასწორდა: ახლა უსმენს UPDATE-ს, როცა ბანკი სტატუსს approved-ზე ცვლის
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions' }, () => {
        fetchMetrics()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  return (
    <main className="min-h-screen bg-[#010201] text-white p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      
      {/* --- COMMAND HEADER --- */}
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase">
            Vault <span className="text-emerald-500 not-italic text-glow">Terminal</span>
          </h1>
          <p className="text-[9px] font-black tracking-[0.6em] text-gray-500 uppercase mt-2 italic">
            Encrypted Revenue & Node Management
          </p>
        </div>
        <div className="hidden md:block text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Live</span>
          </div>
          <p className="text-[8px] text-gray-600 font-black uppercase mt-1 tracking-tighter">Lat: 41.7151° N | Lon: 44.8271° E</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: FINANCIAL CORE --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Profit Card */}
          <div className="bg-[#040d08] border border-white/5 rounded-[60px] p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <span className="text-[180px] font-black italic">₾</span>
            </div>
            
            <div className="relative z-10">
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] italic block mb-4">Available Balance</span>
              <div className="flex items-baseline gap-4 mb-12">
                <h2 className="text-[140px] md:text-[180px] font-black tracking-tighter italic leading-none text-white">
                  {totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <span className="text-5xl font-black text-emerald-500 italic opacity-40">₾</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <button className="flex-1 bg-white text-black py-8 rounded-[35px] font-black text-sm tracking-[0.6em] uppercase hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  Payout Funds
                </button>
                <button className="px-12 py-8 border border-white/10 rounded-[35px] font-black text-[10px] tracking-[0.4em] uppercase hover:bg-white/5 transition-all italic">
                  Revenue Intel
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Network Reach', val: totalScans, unit: 'SCANS' },
              { label: 'Active Nodes', val: activeDeals.length, unit: 'BRANDS' },
              { label: 'Conversion Rate', val: '12.4', unit: '%' }
            ].map((m, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 hover:border-emerald-500/20 transition-colors">
                <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest block mb-2 italic">{m.label}</span>
                <p className="text-5xl font-black italic tracking-tighter">{m.val}<span className="text-sm ml-2 text-emerald-500">{m.unit}</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: LIVE TRANSMISSION FEED --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#020502] border border-white/5 rounded-[50px] p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8 px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Live Feed</h3>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
              {liveFeed.length > 0 ? liveFeed.map((tx, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={tx.id} 
                  className="bg-white/[0.02] border border-white/5 rounded-[25px] p-5 flex items-center justify-between group hover:bg-emerald-500/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-xs">
                      +{idx + 1}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase italic">Transaction Verified</p>
                      <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest mt-1">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-500 font-black italic text-sm">+{tx.influencer_earned}₾</span>
                  </div>
                </motion.div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                  <p className="text-[9px] uppercase font-black tracking-widest">Awaiting Uplink...</p>
                </div>
              )}
            </div>

            <button className="w-full mt-8 py-4 text-[8px] font-black uppercase tracking-[0.5em] text-gray-500 border border-white/5 rounded-full hover:text-white transition-colors">
              View All Logs
            </button>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .text-glow { text-shadow: 0 0 20px rgba(16,185,129,0.5); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}