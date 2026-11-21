'use client'

import { ReactNode, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Receipt = {
  id: string
  status: string | null
  final_amount: number
  deal_title: string | null
  brand_name: string | null
  gift_description: string | null
  customer_city: string | null
  customer_phone: string | null
}

function shortOrderId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

function formatGel(value: number) {
  if (!Number.isFinite(value)) return '0.00'
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function whatsappHref(orderId: string) {
  const text = `გამარჯობა, შეკვეთა #${shortOrderId(orderId)}`
  return `https://wa.me/995500050608?text=${encodeURIComponent(text)}`
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#010201] px-5 py-10 text-white">
      <div className="flex w-full max-w-md flex-col items-center">
        <img
          src="/influx-logo.png"
          alt="InfluX"
          className="mb-6 h-5 w-auto max-w-full object-contain sm:h-6"
        />
        <div className="w-full">{children}</div>
      </div>
    </main>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const txId = searchParams.get('txid') || searchParams.get('id') || searchParams.get('tx')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [phase, setPhase] = useState<'checking' | 'approved' | 'rejected' | 'timeout' | 'missing' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!txId) {
      setPhase('missing')
      return
    }

    let cancelled = false
    let settled = false
    const started = Date.now()
    let pollTimer = 0
    let watchdog = 0
    const deadlineMs = 14000

    const stopPolling = () => {
      settled = true
      window.clearTimeout(pollTimer)
      window.clearTimeout(watchdog)
    }

    watchdog = window.setTimeout(() => {
      if (cancelled || settled) return
      settled = true
      window.clearTimeout(pollTimer)
      setPhase((current) => (current === 'approved' || current === 'rejected' || current === 'error' ? current : 'timeout'))
    }, deadlineMs)

    const poll = async () => {
      if (cancelled || settled) return
      if (Date.now() - started >= deadlineMs) {
        if (!settled) {
          settled = true
          window.clearTimeout(watchdog)
          setPhase('timeout')
        }
        return
      }

      const controller = new AbortController()
      const abortTimer = window.setTimeout(() => controller.abort(), 8000)
      try {
        const response = await fetch(
          `/api/payments/receipt?id=${encodeURIComponent(txId)}&_=${Date.now()}`,
          {
            cache: 'no-store',
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          }
        )
        const data = await response.json().catch(() => ({}))
        if (cancelled) return

        if (!response.ok) {
          if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
            setError(data.error || 'შეკვეთა ვერ მოიძებნა')
            stopPolling()
            setPhase('error')
            return
          }
          if (Date.now() - started >= deadlineMs) {
            stopPolling()
            setPhase('timeout')
            return
          }
          pollTimer = window.setTimeout(poll, 2000)
          return
        }

        setReceipt(data)
        if (data.status === 'approved') {
          stopPolling()
          setPhase('approved')
          return
        }
        if (data.status === 'rejected') {
          stopPolling()
          setPhase('rejected')
          return
        }
        if (Date.now() - started >= deadlineMs) {
          stopPolling()
          setPhase('timeout')
          return
        }
        pollTimer = window.setTimeout(poll, 2000)
      } catch {
        if (cancelled || settled) return
        if (Date.now() - started >= deadlineMs) {
          stopPolling()
          setPhase('timeout')
          return
        }
        pollTimer = window.setTimeout(poll, 2000)
      } finally {
        window.clearTimeout(abortTimer)
      }
    }

    poll()
    return () => {
      cancelled = true
      window.clearTimeout(pollTimer)
      window.clearTimeout(watchdog)
    }
  }, [txId, attempt])

  if (phase === 'checking') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
          <p className="text-base font-semibold">გადახდა მოწმდება...</p>
        </div>
      </Shell>
    )
  }

  if (phase === 'missing' || phase === 'error') {
    return (
      <Shell>
        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-black">შეკვეთა ვერ მოიძებნა</h1>
          <p className="text-sm text-white/60">{error || 'Order reference is missing.'}</p>
          <Link href="/" className="inline-block pt-2 text-sm font-bold text-emerald-300">
            მთავარზე
          </Link>
        </div>
      </Shell>
    )
  }

  if (phase === 'rejected') {
    return (
      <Shell>
        <div className="rounded-[28px] border border-red-400/30 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-2xl font-black">გადახდა ვერ შესრულდა</h1>
          <p className="mt-2 text-sm text-white/70">Payment was not confirmed.</p>
          {receipt?.id && (
            <p className="mt-4 text-xs tracking-widest text-white/50">#{shortOrderId(receipt.id)}</p>
          )}
        </div>
      </Shell>
    )
  }

  if (phase === 'timeout') {
    return (
      <Shell>
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-black">გადახდა მოწმდება...</h1>
          <p className="text-sm text-white/60">დადასტურებას ცოტა მეტი დრო სჭირდება. განაახლე გვერდი რამდენიმე წამში.</p>
          <button
            type="button"
            onClick={() => {
              setError(null)
              setPhase('checking')
              setAttempt((value) => value + 1)
            }}
            className="w-full rounded-2xl bg-white py-4 text-sm font-black text-black"
          >
            განახლება
          </button>
        </div>
      </Shell>
    )
  }

  const orderId = receipt?.id || txId || ''
  const customerCity = receipt?.customer_city?.trim() || ''
  const showCity = customerCity.length > 0 && customerCity !== '—' && customerCity !== '-' && customerCity !== '–'
  const brandName = receipt?.brand_name?.trim() || ''
  const maskedPhone = receipt?.customer_phone?.trim() || ''

  return (
    <Shell>
      <div className="rounded-[28px] border border-emerald-400/25 bg-emerald-500/10 px-6 py-7">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">დადასტურებულია</p>
        <h1 className="mt-2 text-3xl font-black">შეკვეთა მიღებულია</h1>
        <p className="mt-2 text-sm text-white/60">Order #{shortOrderId(orderId)}</p>
        <p className="mt-2 text-sm text-white/80">
          შეკვეთა უკვე გადაეცა {brandName ? `${brandName}-ს` : 'ბრენდს'}
        </p>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-white/50">ბრენდი</dt>
            <dd className="text-right font-bold">{receipt?.brand_name || '—'}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-white/50">ბანდლი</dt>
            <dd className="text-right font-bold">{receipt?.deal_title || '—'}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-white/50">გადახდილი</dt>
            <dd className="text-right font-black">{formatGel(Number(receipt?.final_amount || 0))} ₾</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-white/50">საჩუქარი</dt>
            <dd className="text-right font-bold">{receipt?.gift_description || '—'}</dd>
          </div>
          {showCity && (
            <div className="flex items-start justify-between gap-4">
              <dt className="text-white/50">ქალაქი</dt>
              <dd className="text-right font-bold">{customerCity}</dd>
            </div>
          )}
          {maskedPhone && (
            <div className="flex items-start justify-between gap-4">
              <dt className="text-white/50">ტელეფონი</dt>
              <dd className="text-right font-bold tracking-wider">{maskedPhone}</dd>
            </div>
          )}
        </dl>

        <p className="mt-4 text-sm leading-relaxed text-white/70">
          {maskedPhone
            ? `მალე დაგიკავშირდებიან WhatsApp-ზე (${maskedPhone})`
            : 'მალე დაგიკავშირდებიან WhatsApp-ზე'}
        </p>
        <p className="mt-2 text-xs text-white/40">შეინახე ამ ეკრანის სქრინშოთი შეკვეთის ნომრით</p>
        <p className="mt-5 text-xs leading-relaxed text-white/55">
          გადახდა დაცულია InfluX-ის მიერ — ნებისმიერ კითხვაზე მოგვწერე WhatsApp-ში
        </p>

        <a
          href={whatsappHref(orderId)}
          className="mt-3 flex w-full items-center justify-center rounded-2xl bg-[#25D366] py-4 text-base font-black text-black"
        >
          WhatsApp მხარდაჭერა
        </a>
      </div>
    </Shell>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#010201]" />}>
      <SuccessContent />
    </Suspense>
  )
}
