'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'

type MonitorTransaction = {
  id: string
  amount: number | null
  bill_amount: number | null
  final_amount: number | null
  discount_percent: number | null
  status: string
  created_at: string
  customer_phone: string | null
  gift_unlocked: boolean
  gift_description: string | null
  deal_title: string | null
  influencer_name: string | null
}

type MonitorPayload = {
  brand: { id: string; full_name: string; avatar_url: string | null }
  stats: { todayCount: number; todayTotal: number; timezone?: string }
  transactions: MonitorTransaction[]
}

type Filter = 'all' | 'gifts' | 'paid'

function isPaid(status: string) {
  return ['approved', 'completed', 'success', 'paid'].includes(status.toLowerCase())
}

function money(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function when(iso: string) {
  const date = new Date(iso)
  const clock = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Tbilisi',
  }).format(date)
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return { clock, relative: 'Just now' }
  if (seconds < 3600) return { clock, relative: `${Math.floor(seconds / 60)}m ago` }
  if (seconds < 86400) return { clock, relative: `${Math.floor(seconds / 3600)}h ago` }
  return { clock, relative: `${Math.floor(seconds / 86400)}d ago` }
}

function discountLabel(tx: MonitorTransaction) {
  const original = Number(tx.bill_amount ?? tx.amount ?? 0)
  const paid = Number(tx.final_amount ?? 0)
  const stored = Number(tx.discount_percent ?? 0)
  if (stored > 0) return Math.round(stored)
  if (original > paid && original > 0) return Math.round((1 - paid / original) * 100)
  return 0
}

function playChime() {
  const audio = new AudioContext()
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(784, audio.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1174, audio.currentTime + 0.16)
  gain.gain.setValueAtTime(0.0001, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.06, audio.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.42)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + 0.44)
  osc.onended = () => audio.close()
}

export default function PublicLiveMonitor() {
  const params = useParams<{ token: string }>()
  const token = Array.isArray(params.token) ? params.token[0] : params.token
  const seenIds = useRef<Set<string> | null>(null)
  const soundOn = useRef(false)
  const loadRef = useRef<(manual?: boolean) => void>(() => {})

  const [payload, setPayload] = useState<MonitorPayload | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sound, setSound] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [freshIds, setFreshIds] = useState<string[]>([])

  useEffect(() => {
    soundOn.current = sound
  }, [sound])

  useEffect(() => {
    if (!token) return
    let active = true
    let timer = 0

    const load = async (manual = false) => {
      if (manual) setRefreshing(true)
      try {
        const response = await fetch(`/api/monitor/live?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
        const data = await response.json().catch(() => ({}))
        if (!active) return
        if (response.status === 404 || data.error === 'INVALID_TOKEN') {
          setInvalid(true)
          setPayload(null)
          stop()
          return
        }
        if (!response.ok) return
        const next = data as MonitorPayload
        const ids = next.transactions.map((tx) => tx.id)
        if (seenIds.current === null) {
          seenIds.current = new Set(ids)
        } else {
          const arrived = ids.filter((id) => !seenIds.current?.has(id))
          arrived.forEach((id) => seenIds.current?.add(id))
          if (arrived.length) {
            setFreshIds(arrived)
            if (soundOn.current) playChime()
            window.setTimeout(() => {
              if (active) setFreshIds((current) => current.filter((id) => !arrived.includes(id)))
            }, 8000)
          }
        }
        setPayload(next)
        setInvalid(false)
      } catch {
        if (active && !seenIds.current) setInvalid(true)
      } finally {
        if (active) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    }

    const start = () => {
      window.clearInterval(timer)
      timer = window.setInterval(() => load(), 4000)
    }
    const stop = () => window.clearInterval(timer)
    const onVisibility = () => {
      if (document.hidden) {
        stop()
        return
      }
      load()
      start()
    }

    loadRef.current = (manual = false) => { void load(manual) }
    load()
    if (!document.hidden) start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      active = false
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [token])

  if (invalid) {
    return (
      <main className="min-h-screen bg-[#010201] text-white flex items-center justify-center p-6 overflow-x-hidden">
        <div className="max-w-sm text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full border border-red-500/40 flex items-center justify-center text-red-400 text-2xl">!</div>
          <h1 className="text-xl font-black italic uppercase tracking-tight">Monitor link is invalid or has been reset by the manager</h1>
          <p className="text-sm text-white/45">Ask the brand manager for a new live monitor link.</p>
        </div>
      </main>
    )
  }

  if (loading || !payload) {
    return (
      <main className="min-h-screen bg-[#010201] text-emerald-400 flex items-center justify-center p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.45em] animate-pulse">Opening live monitor...</p>
      </main>
    )
  }

  const visible = payload.transactions.filter((tx) => {
    if (filter === 'gifts') return tx.gift_unlocked
    if (filter === 'paid') return isPaid(tx.status)
    return true
  })
  const initial = payload.brand.full_name.trim().slice(0, 1).toUpperCase() || 'B'

  return (
    <main className="min-h-screen bg-[#010201] text-white overflow-x-hidden">
      <div className="max-w-lg mx-auto">
        <header className="sticky top-0 z-30 bg-[#010201]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              {payload.brand.avatar_url?.startsWith('http') ? (
                <img src={payload.brand.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-black text-emerald-300">{initial}</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-black italic uppercase tracking-tight">{payload.brand.full_name}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Live monitor</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Today · Tbilisi</p>
              <p className="text-sm font-black">{payload.stats.todayCount} orders</p>
            </div>
            <div className="flex-1 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/70">Today total</p>
              <p className="text-sm font-black text-emerald-200">{money(payload.stats.todayTotal)} ₾</p>
            </div>
            <button
              onClick={() => loadRef.current(true)}
              className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 bg-white/5 text-lg"
              aria-label="Refresh"
            >
              <span className={refreshing ? 'inline-block animate-spin' : ''}>↻</span>
            </button>
            <button
              onClick={() => {
                const audio = new AudioContext()
                audio.resume().finally(() => audio.close())
                setSound((on) => !on)
              }}
              className={`h-12 shrink-0 rounded-2xl border px-3 text-[10px] font-black uppercase tracking-widest ${
                sound ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300' : 'border-white/10 bg-white/5 text-white/45'
              }`}
            >
              {sound ? 'Sound on' : 'Sound'}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {([
              ['all', 'All'],
              ['gifts', 'Gifts 🎁'],
              ['paid', 'Paid'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`min-h-[40px] rounded-full text-[11px] font-black uppercase tracking-wider ${
                  filter === key ? 'bg-white text-black' : 'bg-white/5 text-white/60 border border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <section className="px-4 py-4 space-y-3">
          {visible.length === 0 && (
            <p className="py-16 text-center text-[11px] font-black uppercase tracking-[0.3em] text-white/35">No orders in this view</p>
          )}
          {visible.map((tx) => {
            const paid = Number(tx.final_amount ?? 0)
            const original = Number(tx.bill_amount ?? tx.amount ?? 0)
            const discount = discountLabel(tx)
            const time = when(tx.created_at)
            const fresh = freshIds.includes(tx.id)
            const phone = tx.customer_phone?.trim() || ''
            const meta = [tx.deal_title, tx.influencer_name].filter(Boolean).join(' · ')
            return (
              <motion.article
                key={tx.id}
                initial={fresh ? { opacity: 0, y: -10 } : false}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-[28px] border bg-[#070b09] p-4 ${
                  fresh ? 'border-emerald-400/70 shadow-[0_0_28px_rgba(16,185,129,0.28)]' : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black leading-none">{money(paid)} <span className="text-sm text-white/40">GEL</span></p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {discount > 0 && (
                        <>
                          <span className="text-[11px] text-white/40 line-through">{money(original)} ₾</span>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-300">-{discount}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                      isPaid(tx.status)
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : String(tx.status).toLowerCase() === 'pending'
                          ? 'bg-amber-400/15 text-amber-200'
                          : 'bg-white/10 text-white/50'
                    }`}>
                      {isPaid(tx.status) ? 'Paid' : tx.status}
                    </span>
                    <p className="mt-2 text-sm font-black">{time.clock}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{time.relative}</p>
                  </div>
                </div>

                {tx.gift_unlocked && (
                  <div className="mt-3 rounded-2xl border border-amber-300/40 bg-gradient-to-r from-emerald-500/15 to-amber-400/15 px-3 py-3 text-sm font-black text-amber-100">
                    🎁 GIFT: {tx.gift_description || 'Included'}
                  </div>
                )}

                {phone ? (
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                    className="mt-3 flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-black text-sm font-black"
                  >
                    <span aria-hidden>☎</span>
                    {phone}
                  </a>
                ) : (
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-white/30">No phone linked</p>
                )}

                <p className="mt-3 flex items-center justify-between gap-3 text-[11px] text-white/45">
                  <span className="truncate">{meta || 'Direct order'}</span>
                  <span className="shrink-0 font-black tracking-widest">#{tx.id.slice(-6).toUpperCase()}</span>
                </p>
              </motion.article>
            )
          })}
        </section>
      </div>
    </main>
  )
}
