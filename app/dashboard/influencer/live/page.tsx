'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

function timeAgo(dateString: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return "Just Now"
  const mins = Math.floor(seconds / 60)
  return mins + " mins ago"
}

export default function LiveFeed() {
  const [liveFeed, setLiveFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLivePulse = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: brandsData } = await supabase.from('profiles').select('id, full_name, address').eq('role', 'brand')
    const brandMap = new Map(brandsData?.map(b => [b.id, b]) || [])

    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .eq('influencer_id', user.id)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(20)

    if (txs) {
      setLiveFeed(txs.map(tx => ({
        id: `OWNER_${(tx.token_id || 'UNK').substring(0, 4).toUpperCase()}`,
        brand: brandMap.get(tx.brand_id)?.full_name || 'MATRIX NODE',
        // 🚀 შესწორებული: აჩვენებს ინფლუენსერის გამომუშავებულ წილს
        spent: Number(tx.influencer_earned).toLocaleString('en-US', { minimumFractionDigits: 2 }),
        location: brandMap.get(tx.brand_id)?.address || 'Digital Node',
        time: timeAgo(tx.created_at),
        rawId: tx.id
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLivePulse()
    const channel = supabase.channel('live-pulse').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, () => fetchLivePulse()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return <div className="min-h-screen bg-[#010201] flex items-center justify-center text-emerald-500 font-black italic animate-pulse uppercase tracking-[0.5em]">Network Link...</div>

  return (
    <main className="min-h-screen bg-[#010201] text-white p-8 md:p-14 italic font-black uppercase">
      <header className="mb-20 flex justify-between items-end">
        <div>
          <span className="text-emerald-500/40 text-[9px] tracking-[0.7em] mb-4 block">Pulse Feed</span>
          <h1 className="text-6xl">Live <span className="text-emerald-500">Activity</span></h1>
        </div>
      </header>

      <div className="space-y-4">
        <AnimatePresence>
          {liveFeed.map((tx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={tx.rawId}
              className="bg-[#040d08]/60 border border-white/5 rounded-[45px] p-10 flex items-center group relative overflow-hidden hover:border-emerald-500/20 transition-colors"
            >
              <div className="w-1/4 pl-4">
                <span className="text-[10px] text-emerald-500/40 block mb-2 tracking-widest">Tokenowner</span>
                <span className="text-xl">{tx.id}</span>
              </div>
              <div className="w-1/4">
                <span className="text-[10px] text-gray-600 block mb-2 tracking-widest">Brand</span>
                <span className="text-xl text-white/90">{tx.brand}</span>
              </div>
              <div className="w-1/4 text-center">
                <span className="text-[10px] text-gray-600 block mb-2 tracking-widest">Location</span>
                <span className="text-sm text-gray-400">{tx.location}</span>
              </div>
              <div className="w-1/4 text-right">
                <span className="text-[10px] text-emerald-500/60 block mb-2 tracking-widest">Your Profit</span>
                <span className="text-3xl text-emerald-500">{tx.spent} ₾</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  )
}