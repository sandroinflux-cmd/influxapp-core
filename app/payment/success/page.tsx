'use client'

import { ReactNode, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BrandMark, { BrandMonogram } from '@/components/BrandMark'

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
  return `https://wa.me/995500050607?text=${encodeURIComponent(text)}`
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#090808] px-5 py-10 text-[#F2EFE9]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[48vh] bg-[radial-gradient(ellipse_at_top,rgba(92,24,39,0.28),transparent_62%)]" />
      <div className="relative my-auto flex w-full max-w-md flex-col items-center">
        <BrandMark size="sm" className="mb-6" />
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
  const [copied, setCopied] = useState(false)

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
          <div className="h-8 w-8 animate-spin rounded-full border border-[#C9B087]/25 border-t-[#C9B087]" />
          <p className="font-sans text-sm text-[#8C8580]">გადახდა მოწმდება...</p>
        </div>
      </Shell>
    )
  }

  if (phase === 'missing' || phase === 'error') {
    return (
      <Shell>
        <div className="space-y-3 text-center">
          <h1 className="font-editorial text-2xl font-medium">შეკვეთა ვერ მოიძებნა</h1>
          <p className="font-sans text-sm text-[#8C8580]">{error || 'ბმული არასრულია.'}</p>
          <Link href="/" className="inline-block pt-2 font-sans text-sm tracking-[0.08em] text-[#C9B087]">
            მთავარზე
          </Link>
        </div>
      </Shell>
    )
  }

  if (phase === 'rejected') {
    return (
      <Shell>
        <div className="rounded-2xl border border-white/[0.08] bg-[#121011] px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(242,239,233,0.08)]">
          <h1 className="font-editorial text-2xl font-medium">გადახდა ვერ შესრულდა</h1>
          <p className="mt-2 font-sans text-sm text-[#8C8580]">გადახდა არ დადასტურდა.</p>
          {receipt?.id && (
            <p className="mt-4 font-mono text-xs tracking-[0.18em] text-[#8C8580]">#{shortOrderId(receipt.id)}</p>
          )}
        </div>
      </Shell>
    )
  }

  if (phase === 'timeout') {
    return (
      <Shell>
        <div className="space-y-4 text-center">
          <h1 className="font-editorial text-xl font-medium">გადახდა მოწმდება...</h1>
          <p className="font-sans text-sm text-[#8C8580]">დადასტურებას ცოტა მეტი დრო სჭირდება. განაახლე გვერდი რამდენიმე წამში.</p>
          <button
            type="button"
            onClick={() => {
              setError(null)
              setPhase('checking')
              setAttempt((value) => value + 1)
            }}
            className="w-full rounded-lg bg-[#F2EFE9] py-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#090808] transition-colors hover:bg-[#E7DEC8]"
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
  const dealTitle = receipt?.deal_title?.trim() || ''
  const gift = receipt?.gift_description?.trim() || ''
  const maskedPhone = receipt?.customer_phone?.trim() || ''
  const passHeadline = brandName || dealTitle || 'VIP Pass'
  const showDealTitle = Boolean(dealTitle) && dealTitle !== passHeadline
  const passTitle = [brandName, dealTitle].filter(Boolean).join(' · ')
  const passCode = `#${shortOrderId(orderId)}`

  const sharePass = async () => {
    const text = ['VIP PASS', passTitle, gift, passCode].filter(Boolean).join('\n')
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'VIP Pass', text })
        return
      } catch (shareError: any) {
        if (shareError?.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(passCode)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Shell>
      <div className="relative overflow-hidden rounded-2xl border border-[#C9B087]/35 bg-gradient-to-br from-[#1C0D11] via-[#121011] to-[#0D0B0C] px-7 py-8 shadow-[inset_0_1px_0_rgba(242,239,233,0.08)]">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#C9B087]/15" />
        <BrandMonogram className="pointer-events-none absolute top-4 right-4 h-16 w-16 opacity-[0.06]" />
        <div className="relative">
          <p className="font-sans text-[11px] tracking-[0.2em] text-[#C9B087]">VIP PASS · დადასტურებულია</p>
          <h1 className="font-editorial mt-3 text-3xl font-medium leading-[1.15] text-[#F2EFE9]">
            {passHeadline}
          </h1>
          {showDealTitle && (
            <p className="mt-2 font-sans text-sm leading-snug text-[#F2EFE9]/75">
              {dealTitle}
            </p>
          )}

          {gift && (
            <div className="mt-5 rounded-lg border border-[#C9B087]/25 bg-gradient-to-r from-[#4A1420]/30 to-[#C9B087]/[0.06] px-4 py-3">
              <p className="font-sans text-[11px] tracking-[0.14em] text-[#C9B087]">VIP პრივილეგია</p>
              <p className="mt-1 font-sans text-sm leading-snug text-[#F2EFE9]">{gift}</p>
            </div>
          )}

          <p className="mt-6 font-mono text-2xl tracking-[0.18em] text-[#C9B087]">{passCode}</p>

          <button
            type="button"
            onClick={sharePass}
            className="mt-6 w-full rounded-lg bg-[#F2EFE9] py-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#090808] transition-colors hover:bg-[#E7DEC8]"
          >
            {copied ? 'კოდი დაკოპირდა' : 'VIP Pass-ის გაზიარება'}
          </button>
        </div>
      </div>

      <div className="mt-4 w-full border-t border-white/[0.08] px-1 py-5 text-center">
        <p className="font-sans text-sm text-[#8C8580]">
          გადახდილია <span className="font-editorial text-lg font-medium text-[#F2EFE9]">{formatGel(Number(receipt?.final_amount || 0))} ₾</span> · საქართველოს ბანკი
        </p>
        {showCity && (
          <p className="mt-2 font-sans text-xs text-[#8C8580]">{customerCity}</p>
        )}
        <p className="mt-2 font-sans text-xs leading-relaxed text-[#8C8580]">
          {maskedPhone ? (
            <>
              მალე დაგიკავშირდებიან WhatsApp-ზე{' '}
              <span className="whitespace-nowrap">({maskedPhone})</span>
            </>
          ) : (
            'მალე დაგიკავშირდებიან WhatsApp-ზე'
          )}
        </p>
        <a
          href={whatsappHref(orderId)}
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-white/15 py-3.5 font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#F2EFE9] transition-colors hover:bg-white/[0.04]"
        >
          WhatsApp კონსიერჟი
        </a>
      </div>
    </Shell>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090808]" />}>
      <SuccessContent />
    </Suspense>
  )
}
