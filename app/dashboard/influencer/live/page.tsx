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

function shortOrderId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
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
      .select('id, created_at, influencer_earned, payout_status, deal_id, brand_id, status')
      .eq('influencer_id', user.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20)

    const dealIds = [...new Set((txs || []).map((tx) => tx.deal_id).filter(Boolean))]
    const dealTitles = new Map<string, string>()
    if (dealIds.length) {
      const { data: deals } = await supabase.from('deals').select('id, title').in('id', dealIds)
      deals?.forEach((deal) => dealTitles.set(deal.id, deal.title || 'Deal'))
    }

    if (txs) {
      setLiveFeed(txs.map(tx => ({
        id: shortOrderId(tx.id),
        dealTitle: tx.deal_id ? (dealTitles.get(tx.deal_id) || 'Deal') : 'Deal',
        brand: brandMap.get(tx.brand_id)?.full_name || 'MATRIX NODE',
        earned: Number(tx.influencer_earned || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
        payout: tx.payout_status || '—',
        time: timeAgo(tx.created_at),
        rawId: tx.id
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLivePulse()
    // 🎯 გასწორდა: INSERT შეიცვალა UPDATE-ით
    const channel = supabase.channel('live-pulse').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions' }, () => fetchLivePulse()).subscribe()
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
                <span className="text-[10px] text-emerald-500/40 block mb-2 tracking-widest">Order</span>
                <span className="text-xl">#{tx.id}</span>
                <span className="mt-2 block text-[10px] text-gray-600">{tx.time}</span>
              </div>
              <div className="w-1/4">
                <span className="text-[10px] text-gray-600 block mb-2 tracking-widest">Deal</span>
                <span className="text-xl text-white/90">{tx.dealTitle}</span>
                <span className="mt-2 block text-[10px] text-gray-500">{tx.brand}</span>
              </div>
              <div className="w-1/4 text-center">
                <span className="text-[10px] text-gray-600 block mb-2 tracking-widest">Payout</span>
                <span className="text-sm text-gray-300">{tx.payout}</span>
              </div>
              <div className="w-1/4 text-right">
                <span className="text-[10px] text-emerald-500/60 block mb-2 tracking-widest">Earned</span>
                <span className="text-3xl text-emerald-500">{tx.earned} ₾</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  )
}