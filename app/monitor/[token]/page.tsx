'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { playChaChingSound, unlockAudio } from '@/lib/cashRegisterSound'

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

function isPaidStatus(status: string) {
  return ['approved', 'completed', 'success', 'paid'].includes(String(status || '').toLowerCase())
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

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

function previewSound() {
  void unlockAudio().then(() => playChaChingSound()).catch(() => {})
}

function OrderCard({ tx, fresh, hero }: { tx: MonitorTransaction; fresh: boolean; hero?: boolean }) {
  const paid = Number(tx.final_amount ?? 0)
  const original = Number(tx.bill_amount ?? tx.amount ?? 0)
  const discount = discountLabel(tx)
  const time = when(tx.created_at)
  const phone = tx.customer_phone?.trim() || ''
  const meta = [tx.deal_title, tx.influencer_name].filter(Boolean).join(' · ')

  return (
    <motion.article
      layout
      initial={fresh ? { opacity: 0, y: -12 } : false}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[28px] border ${
        hero
          ? 'border-emerald-400/80 bg-emerald-500/[0.08] p-5 shadow-[0_0_36px_rgba(16,185,129,0.32)]'
          : fresh
            ? 'border-emerald-400/70 bg-[#070b09] p-4 shadow-[0_0_28px_rgba(16,185,129,0.28)]'
            : 'border-white/10 bg-[#070b09] p-4'
      }`}
    >
      {hero && (
        <div className="mb-3 inline-flex items-center rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-black">
          Latest payment
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`${hero ? 'text-4xl' : 'text-2xl'} font-black leading-none tracking-tight`}>
            {money(paid)} <span className={`${hero ? 'text-base' : 'text-sm'} text-white/40`}>GEL</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {discount > 0 && (
              <>
                <span className="text-[11px] text-white/40 line-through">{money(original)} ₾</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-300">-{discount}%</span>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
            isPaidStatus(tx.status)
              ? 'bg-emerald-500/15 text-emerald-300'
              : String(tx.status).toLowerCase() === 'pending'
                ? 'bg-amber-400/15 text-amber-200'
                : 'bg-white/10 text-white/50'
          }`}>
            {isPaidStatus(tx.status) ? 'Paid' : tx.status}
          </span>
          <p className="mt-2 text-sm font-black">{time.clock}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{time.relative}</p>
        </div>
      </div>

      {tx.gift_unlocked && (
        <div className={`mt-3 rounded-2xl border border-amber-300/50 bg-gradient-to-r from-emerald-500/20 to-amber-400/20 font-black text-amber-100 ${
          hero ? 'px-4 py-4 text-base' : 'px-3 py-3 text-sm'
        }`}>
          🎁 GIFT: {tx.gift_description || 'Included'}
        </div>
      )}

      {phone ? (
        <a
          href={telHref(phone)}
          className={`mt-3 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 font-black text-black ${
            hero ? 'min-h-[52px] text-base' : 'min-h-[44px] text-sm'
          }`}
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
}

function PaymentSpotlight({ tx, onClose }: { tx: MonitorTransaction; onClose: () => void }) {
  const paid = Number(tx.final_amount ?? 0)
  const original = Number(tx.bill_amount ?? tx.amount ?? 0)
  const discount = discountLabel(tx)
  const time = when(tx.created_at)
  const phone = tx.customer_phone?.trim() || ''
  const meta = [tx.deal_title, tx.influencer_name].filter(Boolean).join(' · ')

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Payment received"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Dismiss payment alert"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-emerald-400/80 bg-[#04110c] px-5 pb-6 pt-6 shadow-[0_0_80px_rgba(16,185,129,0.45)]"
      >
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/15 px-3 py-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">Payment received ✓</span>
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/45">{time.clock} · {time.relative}</p>
          <p className="mt-5 text-5xl font-black leading-none tracking-tight text-white sm:text-6xl">
            {money(paid)} <span className="text-2xl text-white/45 sm:text-3xl">GEL</span>
          </p>
          {discount > 0 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-sm text-white/40 line-through">{money(original)} ₾</span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-black text-emerald-300">-{discount}%</span>
            </div>
          )}
        </div>

        {tx.gift_unlocked && (
          <div className="mt-5 rounded-2xl border-2 border-amber-300/70 bg-gradient-to-r from-emerald-500/25 via-emerald-400/10 to-amber-300/30 px-4 py-4 text-center text-lg font-black leading-snug text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.28)]">
            🎁 GIVE GIFT: {tx.gift_description || 'Included'}
          </div>
        )}

        {phone ? (
          <a
            href={telHref(phone)}
            className="mt-4 flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-white text-lg font-black text-black"
          >
            <span aria-hidden>☎</span>
            {phone}
          </a>
        ) : tx.gift_unlocked ? (
          <p className="mt-4 animate-pulse text-center text-xs font-bold uppercase tracking-widest text-amber-200/80">
            Waiting for customer phone...
          </p>
        ) : null}

        <p className="mt-4 flex items-center justify-between gap-3 text-center text-[12px] text-white/55">
          <span className="min-w-0 flex-1 truncate text-left">{meta || 'Direct order'}</span>
          <span className="shrink-0 font-black tracking-widest">#{tx.id.slice(-6).toUpperCase()}</span>
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-emerald-400 text-base font-black uppercase tracking-widest text-black"
        >
          OK / GOT IT
        </button>
        <motion.div
          className="absolute bottom-0 left-0 h-1 w-full origin-left bg-emerald-300"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 10, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  )
}

export default function PublicLiveMonitor() {
  const params = useParams<{ token: string }>()
  const token = Array.isArray(params.token) ? params.token[0] : params.token
  const seenIds = useRef<Set<string> | null>(null)
  const seenPaidIdsRef = useRef<Set<string>>(new Set())
  const initializedRef = useRef(false)
  const soundOn = useRef(false)
  const loadRef = useRef<(manual?: boolean) => void>(() => {})

  const [payload, setPayload] = useState<MonitorPayload | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sound, setSound] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [freshIds, setFreshIds] = useState<string[]>([])
  const [spotlightTxId, setSpotlightTxId] = useState<string | null>(null)

  useEffect(() => {
    soundOn.current = sound
  }, [sound])

  useEffect(() => {
    if (!spotlightTxId) return
    const timer = window.setTimeout(() => setSpotlightTxId(null), 10000)
    return () => window.clearTimeout(timer)
  }, [spotlightTxId])

  useEffect(() => {
    if (!token) return
    let active = true
    let timer = 0
    seenIds.current = null
    seenPaidIdsRef.current = new Set()
    initializedRef.current = false

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
            window.setTimeout(() => {
              if (active) setFreshIds((current) => current.filter((id) => !arrived.includes(id)))
            }, 8000)
          }
        }

        const paidNow = next.transactions.filter((tx) => isPaidStatus(tx.status))
        if (!initializedRef.current) {
          initializedRef.current = true
          paidNow.forEach((tx) => seenPaidIdsRef.current.add(tx.id))
        } else {
          const newlyPaid = paidNow.filter((tx) => !seenPaidIdsRef.current.has(tx.id))
          newlyPaid.forEach((tx) => seenPaidIdsRef.current.add(tx.id))
          if (newlyPaid.length) {
            if (soundOn.current) void playChaChingSound()
            navigator.vibrate?.([80, 40, 120])
            setSpotlightTxId(newlyPaid[0].id)
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
    if (filter === 'paid') return isPaidStatus(tx.status)
    return true
  })
  const showHero = (filter === 'all' || filter === 'paid') && visible.length > 0
  const heroTx = showHero ? visible[0] : null
  const earlier = showHero ? visible.slice(1) : visible
  const spotlightTx = spotlightTxId
    ? payload.transactions.find((tx) => tx.id === spotlightTxId) ?? null
    : null
  const initial = payload.brand.full_name.trim().slice(0, 1).toUpperCase() || 'B'

  return (
    <main className="min-h-screen bg-[#010201] text-white overflow-x-hidden">
      <div className="mx-auto max-w-lg">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#010201]/95 px-4 pb-3 pt-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {payload.brand.avatar_url?.startsWith('http') ? (
                <img src={payload.brand.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-black text-emerald-300">{initial}</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-black uppercase italic tracking-tight">{payload.brand.full_name}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Live monitor</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="min-w-[46%] flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Today · Tbilisi</p>
              <p className="text-sm font-black">{payload.stats.todayCount} orders</p>
            </div>
            <div className="min-w-[46%] flex-1 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
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
            <div className={`flex h-12 shrink-0 overflow-hidden rounded-2xl border ${
              sound ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300' : 'border-white/10 bg-white/5 text-white/45'
            }`}>
              <button
                type="button"
                aria-pressed={sound}
                onClick={() => {
                  const next = !sound
                  setSound(next)
                  if (next) previewSound()
                }}
                className="px-3 text-[10px] font-black uppercase tracking-widest"
              >
                {sound ? 'Sound on' : 'Sound'}
              </button>
              <button
                type="button"
                aria-label="Test sound"
                onClick={previewSound}
                className="w-9 border-l border-white/10 text-sm"
              >
                ♪
              </button>
            </div>
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
                  filter === key ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-white/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <section className="space-y-3 px-4 py-4">
          {visible.length === 0 && (
            <p className="py-16 text-center text-[11px] font-black uppercase tracking-[0.3em] text-white/35">No orders in this view</p>
          )}
          {heroTx && <OrderCard tx={heroTx} fresh={freshIds.includes(heroTx.id)} hero />}
          {heroTx && earlier.length > 0 && (
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Earlier Orders</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          )}
          {earlier.map((tx) => (
            <OrderCard key={tx.id} tx={tx} fresh={freshIds.includes(tx.id)} />
          ))}
        </section>
      </div>

      <AnimatePresence>
        {spotlightTx && (
          <PaymentSpotlight key={spotlightTx.id} tx={spotlightTx} onClose={() => setSpotlightTxId(null)} />
        )}
      </AnimatePresence>
    </main>
  )
}
