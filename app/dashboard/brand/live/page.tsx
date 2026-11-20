'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

const FULFILLMENT = [
  { value: 'pending', label: 'მზადდება / Pending' },
  { value: 'shipped', label: 'გაგზავნილია / Shipped' },
  { value: 'delivered', label: 'ჩაბარებულია / Delivered' },
] as const

const timeAgo = (dateString: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'Just Now'
  return `${Math.floor(seconds / 60)}m ago`
}

function shortOrderId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export default function LivePulsePage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({ count24h: 0, value24h: 0 })
  const [profileMap, setProfileMap] = useState<Record<string, string>>({})
  const [dealMap, setDealMap] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [monitorError, setMonitorError] = useState<string | null>(null)
  const tokenRef = useRef<string | null>(null)

  const loadOrders = async (userId: string) => {
    const { data: allTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('brand_id', userId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    const rows = allTx || []
    setTransactions(rows.slice(0, 30))
    const totalNetVal = rows.reduce((sum, tx) => sum + (Number(tx.brand_earned) || 0), 0)
    setStats({ count24h: rows.length, value24h: totalNetVal })

    const dealIds = [...new Set(rows.map((tx) => tx.deal_id).filter(Boolean))]
    if (dealIds.length) {
      const { data: deals } = await supabase.from('deals').select('id, title').in('id', dealIds)
      const next: Record<string, string> = {}
      deals?.forEach((deal) => { next[deal.id] = deal.title || 'Deal' })
      setDealMap(next)
    }
  }

  useEffect(() => {
    const initLivePulse = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('monitor_token').eq('id', user.id).single()
      let token = profile?.monitor_token as string | null
      if (!token) {
        token = crypto.randomUUID()
        const { error: tokenError } = await supabase.from('profiles').update({ monitor_token: token }).eq('id', user.id)
        if (tokenError) {
          console.error('monitor_token auto-save failed:', tokenError.message)
          setMonitorError(tokenError.message || 'Monitor link could not be saved')
          token = null
        }
      }
      tokenRef.current = token

      const { data: profiles } = await supabase.from('profiles').select('id, full_name')
      const pMap: Record<string, string> = {}
      profiles?.forEach(p => { pMap[p.id] = p.full_name || 'ANON_NODE' })
      setProfileMap(pMap)

      await loadOrders(user.id)

      const channel = supabase
        .channel('brand-live-pulse')
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'transactions',
            filter: `brand_id=eq.${user.id}` 
          }, 
          () => { void loadOrders(user.id) }
        )
        .subscribe()

      const poll = window.setInterval(() => { void loadOrders(user.id) }, 10000)

      return () => {
        window.clearInterval(poll)
        supabase.removeChannel(channel)
      }
    }
    const cleanup = initLivePulse()
    return () => { void cleanup.then((done) => done?.()) }
  }, [])

  const updateFulfillment = async (transactionId: string, fulfillment_status: string) => {
    const token = tokenRef.current
    if (!token || savingId) return
    setSavingId(transactionId)
    setTransactions((current) => current.map((tx) => tx.id === transactionId ? { ...tx, fulfillment_status } : tx))
    try {
      const response = await fetch('/api/monitor/live', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, transactionId, fulfillment_status }),
      })
      if (!response.ok) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await loadOrders(user.id)
      }
    } catch {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await loadOrders(user.id)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-12 max-w-7xl mx-auto pb-40 font-sans text-white uppercase italic font-black">
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-red-500 animate-ping shadow-[0_0_15px_#ef4444]" />
             <h1 className="text-4xl tracking-tighter">Live <span className="text-blue-500">Pulse</span></h1>
          </div>
          <p className="text-[10px] tracking-[0.6em] text-gray-600">Approved Orders</p>
          {monitorError && (
            <p className="text-[10px] tracking-widest text-red-400 normal-case not-italic">
              Monitor link was not saved: {monitorError}
            </p>
          )}
        </div>
      </header>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {transactions.map((tx) => {
            const phone = String(tx.customer_phone || '').trim()
            const fulfillment = String(tx.fulfillment_status || 'pending')
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                className="bg-[#010201] border border-white/5 rounded-[35px] p-6 md:p-8 hover:border-blue-500/30 transition-all"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 space-y-2">
                    <p className="text-sm text-white">#{shortOrderId(tx.id)}</p>
                    <p className="text-[7px] text-gray-600 tracking-widest">{timeAgo(tx.created_at)}</p>
                    <p className="text-lg text-white normal-case not-italic">{dealMap[tx.deal_id] || 'Deal'}</p>
                    <p className="text-[11px] text-blue-400 tracking-widest">{profileMap[tx.influencer_id] || 'Influencer'}</p>
                    <p className="text-2xl text-white">{Number(tx.final_amount || 0).toFixed(2)} <span className="text-[10px] text-gray-500">₾</span></p>
                    <p className="text-[10px] text-emerald-400">Net {Number(tx.brand_earned || 0).toFixed(2)} ₾</p>
                    {tx.gift_description && (
                      <p className="text-[11px] text-amber-300 normal-case not-italic tracking-wide">🎁 {tx.gift_description}</p>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 rounded-3xl border border-white/10 bg-white/[0.03] p-4 normal-case not-italic font-semibold">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/35 italic">Delivery</p>
                    <p className="mt-2 text-base font-black text-white">{tx.customer_name || '—'}</p>
                    {phone ? (
                      <a href={telHref(phone)} className="mt-1 inline-flex text-sm font-black text-emerald-400">{phone}</a>
                    ) : (
                      <p className="mt-1 text-sm text-white/35">No phone</p>
                    )}
                    <p className="mt-2 text-sm text-white/80">{tx.customer_city || '—'}</p>
                    <p className="text-sm leading-snug text-white">{tx.customer_address || '—'}</p>
                    {tx.delivery_note && (
                      <p className="mt-2 rounded-xl bg-amber-400/10 px-3 py-2 text-sm text-amber-100">{tx.delivery_note}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 normal-case not-italic">
                  {FULFILLMENT.map((step) => (
                    <button
                      key={step.value}
                      type="button"
                      disabled={savingId === tx.id || fulfillment === step.value}
                      onClick={() => updateFulfillment(tx.id, step.value)}
                      className={`min-h-[40px] rounded-xl px-3 text-[10px] font-black uppercase tracking-widest ${
                        fulfillment === step.value ? 'bg-blue-600 text-white' : 'border border-white/10 bg-white/5 text-white/60'
                      } disabled:opacity-80`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 p-8 z-[200]">
         <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-12">
            <div className="flex gap-12">
               <div><span className="text-[8px] text-gray-600 block">Total TX</span><p className="text-2xl text-white">{stats.count24h}</p></div>
               <div><span className="text-[8px] text-blue-500 block">Total Net Pulse</span><p className="text-2xl text-blue-500">{stats.value24h.toLocaleString(undefined, {minimumFractionDigits: 2})} ₾</p></div>
            </div>
            <p className="text-[9px] text-emerald-500 animate-pulse tracking-[0.4em]">Secure Ledger Sync Active</p>
         </div>
      </footer>
    </div>
  )
}
