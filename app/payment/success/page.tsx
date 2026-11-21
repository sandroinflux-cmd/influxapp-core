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
  delivery_estimate: string | null
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
      <div className="w-full max-w-md">{children}</div>
    </main>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const txId = searchParams.get('txid') || searchParams.get('id') || searchParams.get('tx')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [phase, setPhase] = useState<'checking' | 'approved' | 'rejected' | 'timeout' | 'missing' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!txId) {
      setPhase('missing')
      return
    }

    let stopped = false
    const started = Date.now()
    let timer = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/receipt?id=${encodeURIComponent(txId)}`, { cache: 'no-store' })
        const data = await response.json().catch(() => ({}))
        if (stopped) return
        if (!response.ok) throw new Error(data.error || 'შეკვეთა ვერ მოიძებნა')

        setReceipt(data)
        if (data.status === 'approved') {
          setPhase('approved')
          return
        }
        if (data.status === 'rejected') {
          setPhase('rejected')
          return
        }
        if (Date.now() - started >= 14000) {
          setPhase('timeout')
          return
        }
        timer = window.setTimeout(poll, 2000)
      } catch (err: any) {
        if (stopped) return
        setError(err?.message || 'შეკვეთა ვერ მოიძებნა')
        setPhase('error')
      }
    }

    poll()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [txId])

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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
          <h1 className="text-xl font-black">გადახდა მოწმდება...</h1>
          <p className="text-sm text-white/60">დადასტურებას ცოტა მეტი დრო სჭირდება. განაახლე გვერდი რამდენიმე წამში.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
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

  return (
    <Shell>
      <div className="rounded-[28px] border border-emerald-400/25 bg-emerald-500/10 px-6 py-7">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">დადასტურებულია</p>
        <h1 className="mt-2 text-3xl font-black">შეკვეთა მიღებულია</h1>
        <p className="mt-2 text-sm text-white/60">Order #{shortOrderId(orderId)}</p>

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
          <div className="flex items-start justify-between gap-4">
            <dt className="text-white/50">მიტანა</dt>
            <dd className="text-right font-bold">{receipt?.delivery_estimate || '—'}</dd>
          </div>
          {showCity && (
            <div className="flex items-start justify-between gap-4">
              <dt className="text-white/50">ქალაქი</dt>
              <dd className="text-right font-bold">{customerCity}</dd>
            </div>
          )}
          {receipt?.customer_phone && (
            <div className="flex items-start justify-between gap-4">
              <dt className="text-white/50">ტელეფონი</dt>
              <dd className="text-right font-bold tracking-wider">{receipt.customer_phone}</dd>
            </div>
          )}
        </dl>

        <a
          href={whatsappHref(orderId)}
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#25D366] py-4 text-base font-black text-black"
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
