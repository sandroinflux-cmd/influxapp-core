'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

const timeAgo = (dateString: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'Just Now'
  return `${Math.floor(seconds / 60)}m ago`
}

export default function LivePulsePage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({ count24h: 0, value24h: 0 })
  const [profileMap, setProfileMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const initLivePulse = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profiles } = await supabase.from('profiles').select('id, full_name')
      const pMap: Record<string, string> = {}
      profiles?.forEach(p => { pMap[p.id] = p.full_name || 'ANON_NODE' })
      setProfileMap(pMap)

      const { data: allTx } = await supabase
        .from('transactions')
        .select('*')
        .eq('brand_id', user.id)
        .eq('status', 'success')
        .order('created_at', { ascending: false })

      if (allTx) {
        setTransactions(allTx.slice(0, 15))
        // 🚀 ჯამშიც brand_earned-ს ვითვლით
        const totalNetVal = allTx.reduce((sum, tx) => sum + (tx.brand_earned || 0), 0)
        setStats({ count24h: allTx.length, value24h: totalNetVal })
      }

      const channel = supabase
        .channel('brand-live-pulse')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'transactions',
            filter: `brand_id=eq.${user.id}` 
          }, 
          (payload) => {
            const newTx = payload.new
            setTransactions(prev => [newTx, ...prev].slice(0, 15))
            setStats(prev => ({
              count24h: prev.count24h + 1,
              // 🚀 რეალურ დროში დამატებისასაც brand_earned
              value24h: prev.value24h + (newTx.brand_earned || 0)
            }))
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    initLivePulse()
  }, [])

  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-12 max-w-7xl mx-auto pb-40 font-sans text-white uppercase italic font-black">
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-500 animate-ping shadow-[0_0_15px_#ef4444]" />
             <h1 className="text-4xl tracking-tighter">Live <span className="text-blue-500">Pulse</span></h1>
          </div>
          <p className="text-[10px] tracking-[0.6em] text-gray-600">Net Transaction Stream</p>
        </div>
      </header>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#010201] border border-white/5 rounded-[35px] p-8 flex flex-col md:grid md:grid-cols-5 items-center gap-6 hover:border-blue-500/30 transition-all group"
            >
              <div className="col-span-1 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">#</div>
                 <div>
                    <p className="text-sm text-white">TX-{tx.id.substring(0, 6).toUpperCase()}</p>
                    <p className="text-[7px] text-gray-600 tracking-widest mt-1.5">{timeAgo(tx.created_at)}</p>
                 </div>
              </div>
              <div className="col-span-1 text-center text-[11px] text-gray-400">NODE_USR_{tx.id.substring(0, 3)}</div>
              <div className="col-span-1 text-center text-blue-500 tracking-widest">${(profileMap[tx.influencer_id] || 'SYS').substring(0, 5).toUpperCase()}</div>
              {/* 🚀 Net_Value აჩვენებს ბრენდის სუფთა წილს */}
              <div className="col-span-1 text-right text-2xl text-white">
                {Number(tx.brand_earned || 0).toFixed(2)} <span className="text-[10px] text-gray-500 opacity-40 ml-1">₾</span>
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                 <button className="bg-blue-600 text-white px-4 py-3 rounded-xl text-[9px] tracking-widest hover:bg-blue-500 transition-all shadow-lg">Download ↓</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 p-8 z-[200]">
         <div className="max-w-7xl mx-auto flex justify-between items-center px-12">
            <div className="flex gap-12">
               <div><span className="text-[8px] text-gray-600 block">Total TX</span><p className="text-2xl text-white">{stats.count24h}</p></div>
               {/* 🚀 Footer-შიც სუფთა მოგება (Net Pulse) */}
               <div><span className="text-[8px] text-blue-500 block">Total Net Pulse</span><p className="text-2xl text-blue-500">{stats.value24h.toLocaleString(undefined, {minimumFractionDigits: 2})} ₾</p></div>
            </div>
            <p className="text-[9px] text-emerald-500 animate-pulse tracking-[0.4em]">Secure Ledger Sync Active</p>
         </div>
      </footer>
    </div>
  )
}