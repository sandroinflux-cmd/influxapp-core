'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { playChaChingSound, unlockAudio } from '@/lib/cashRegisterSound'

type FulfillmentStatus = 'pending' | 'shipped' | 'delivered'

type MonitorTransaction = {
  id: string
  created_at: string
  final_amount: number | null
  brand_earned: number | null
  deal_title: string | null
  influencer_name: string | null
  gift_description: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_city: string | null
  customer_address: string | null
  delivery_note: string | null
  fulfillment_status: string | null
  payout_status: string | null
  status: string
}

type MonitorPayload = {
  brand: { id: string; full_name: string; avatar_url: string | null }
  stats: { todayCount: number; todayTotal: number; todayBrand?: number; timezone?: string }
  transactions: MonitorTransaction[]
}

type Filter = 'all' | 'gifts' | 'paid'

const FULFILLMENT_STEPS: { value: FulfillmentStatus; ka: string; en: string }[] = [
  { value: 'pending', ka: 'მზადდება', en: 'Pending' },
  { value: 'shipped', ka: 'გაგზავნილია', en: 'Shipped' },
  { value: 'delivered', ka: 'ჩაბარებულია', en: 'Delivered' },
]

function isPaidStatus(status: string) {
  return ['approved', 'completed', 'success', 'paid'].includes(String(status || '').toLowerCase())
}

function money(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function shortOrderId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

function fulfillmentOf(status: string | null | undefined): FulfillmentStatus {
  const value = String(status || '').toLowerCase()
  if (value === 'shipped' || value === 'delivered') return value
  return 'pending'
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

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

function previewSound() {
  void unlockAudio().then(() => playChaChingSound()).catch(() => {})
}

function presentText(value: string | null | undefined) {
  const text = value?.trim() || ''
  if (!text || text === '—' || text === '-' || text === '–') return null
  return text
}

function DeliveryBlock({ tx }: { tx: MonitorTransaction }) {
  const name = presentText(tx.customer_name)
  const phone = presentText(tx.customer_phone)
  const city = presentText(tx.customer_city)
  const address = presentText(tx.customer_address)
  const note = presentText(tx.delivery_note)
  return (
    <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left">
      <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/35">Delivery</p>
      {name ? <p className="text-sm font-bold leading-tight text-white">{name}</p> : null}
      {phone ? (
        <a href={telHref(phone)} className="inline-flex text-2xl font-black tracking-tight text-emerald-300">
          {phone}
        </a>
      ) : null}
      {city ? <p className="text-sm font-bold text-white/80">{city}</p> : null}
      {address ? <p className="text-base font-semibold leading-snug text-white">{address}</p> : null}
      {note ? (
        <p className="rounded-xl bg-amber-400/10 px-3 py-2 text-sm font-semibold leading-snug text-amber-100">
          {note}
        </p>
      ) : null}
    </div>
  )
}

function FulfillmentActions({
  status,
  busy,
  onChange,
}: {
  status: string | null
  busy: boolean
  onChange: (next: FulfillmentStatus) => void
}) {
  const current = fulfillmentOf(status)
  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5">
      {FULFILLMENT_STEPS.map((step) => {
        const active = current === step.value
        return (
          <button
            key={step.value}
            type="button"
            disabled={busy || active}
            onClick={() => onChange(step.value)}
            className={`min-h-[48px] rounded-xl px-1 py-1.5 text-center leading-tight ${
              active ? 'bg-emerald-400 text-black' : 'border border-white/10 bg-white/5 text-white/75'
            } disabled:opacity-90`}
          >
            <span className="block text-[10px] font-black">{step.ka}</span>
            <span className="block text-[8px] font-bold uppercase tracking-wider opacity-70">{step.en}</span>
          </button>
        )
      })}
    </div>
  )
}

function OrderCard({
  tx,
  fresh,
  hero,
  busy,
  onFulfillment,
}: {
  tx: MonitorTransaction
  fresh: boolean
  hero?: boolean
  busy: boolean
  onFulfillment: (transactionId: string, status: FulfillmentStatus) => void
}) {
  const paid = Number(tx.final_amount ?? 0)
  const brandNet = Number(tx.brand_earned ?? 0)
  const time = when(tx.created_at)
  const current = fulfillmentOf(tx.fulfillment_status)
  const step = FULFILLMENT_STEPS.find((item) => item.value === current) || FULFILLMENT_STEPS[0]

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
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">#{shortOrderId(tx.id)}</p>
          <p className={`${hero ? 'text-4xl' : 'text-2xl'} mt-1 font-black leading-none tracking-tight`}>
            {money(paid)} <span className={`${hero ? 'text-base' : 'text-sm'} text-white/40`}>GEL</span>
          </p>
          <p className="mt-1 text-[11px] font-bold text-emerald-300/80">Brand net {money(brandNet)} ₾</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
            {step.ka}
          </span>
          <p className="mt-2 text-sm font-black">{time.clock}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{time.relative}</p>
        </div>
      </div>

      <p className="mt-3 text-sm font-black leading-snug text-white">{tx.deal_title || 'Direct order'}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-white/45">{tx.influencer_name || 'Influencer'}</p>

      {tx.gift_description?.trim() && (
        <div className={`mt-3 rounded-2xl border border-amber-300/50 bg-gradient-to-r from-emerald-500/20 to-amber-400/20 font-black text-amber-100 ${
          hero ? 'px-4 py-4 text-base' : 'px-3 py-3 text-sm'
        }`}>
          🎁 {tx.gift_description.trim()}
        </div>
      )}

      <DeliveryBlock tx={tx} />
      <FulfillmentActions
        status={tx.fulfillment_status}
        busy={busy}
        onChange={(status) => onFulfillment(tx.id, status)}
      />
      {tx.payout_status && (
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/35">Payout {tx.payout_status}</p>
      )}
    </motion.article>
  )
}

function PaymentSpotlight({ tx, onClose }: { tx: MonitorTransaction; onClose: () => void }) {
  const paid = Number(tx.final_amount ?? 0)
  const brandNet = Number(tx.brand_earned ?? 0)
  const time = when(tx.created_at)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden p-3 sm:items-center"
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
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[32px] border border-emerald-400/80 bg-[#04110c] px-5 pb-6 pt-6 shadow-[0_0_80px_rgba(16,185,129,0.45)]"
      >
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/15 px-3 py-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">Payment received ✓</span>
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/45">
            #{shortOrderId(tx.id)} · {time.clock} · {time.relative}
          </p>
          <p className="mt-5 text-5xl font-black leading-none tracking-tight text-white sm:text-6xl">
            {money(paid)} <span className="text-2xl text-white/45 sm:text-3xl">GEL</span>
          </p>
          <p className="mt-2 text-sm font-bold text-emerald-300/80">Brand net {money(brandNet)} ₾</p>
          <p className="mt-3 text-sm font-black text-white">{tx.deal_title || 'Direct order'}</p>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/45">{tx.influencer_name || 'Influencer'}</p>
        </div>

        {tx.gift_description?.trim() && (
          <div className="mt-5 rounded-2xl border-2 border-amber-300/70 bg-gradient-to-r from-emerald-500/25 via-emerald-400/10 to-amber-300/30 px-4 py-4 text-center text-lg font-black leading-snug text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.28)]">
            🎁 {tx.gift_description.trim()}
          </div>
        )}

        <DeliveryBlock tx={tx} />

        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-emerald-400 text-base font-black uppercase tracking-widest text-black"
        >
          OK / GOT IT
        </button>
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
  const [savingId, setSavingId] = useState<string | null>(null)

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

  const updateFulfillment = async (transactionId: string, fulfillment_status: FulfillmentStatus) => {
    if (!token || savingId) return
    setSavingId(transactionId)
    setPayload((current) => current && ({
      ...current,
      transactions: current.transactions.map((tx) => tx.id === transactionId ? { ...tx, fulfillment_status } : tx),
    }))
    try {
      const response = await fetch('/api/monitor/live', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, transactionId, fulfillment_status }),
      })
      if (!response.ok) loadRef.current()
    } catch {
      loadRef.current()
    } finally {
      setSavingId(null)
    }
  }

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
    if (filter === 'gifts') return Boolean(tx.gift_description?.trim())
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
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/70">Today paid</p>
              <p className="text-sm font-black text-emerald-200">{money(payload.stats.todayTotal)} ₾</p>
              <p className="text-[10px] font-bold text-emerald-100/60">Net {money(Number(payload.stats.todayBrand || 0))} ₾</p>
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
          {heroTx && (
            <OrderCard
              tx={heroTx}
              fresh={freshIds.includes(heroTx.id)}
              hero
              busy={savingId === heroTx.id}
              onFulfillment={updateFulfillment}
            />
          )}
          {heroTx && earlier.length > 0 && (
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Earlier Orders</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          )}
          {earlier.map((tx) => (
            <OrderCard
              key={tx.id}
              tx={tx}
              fresh={freshIds.includes(tx.id)}
              busy={savingId === tx.id}
              onFulfillment={updateFulfillment}
            />
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
