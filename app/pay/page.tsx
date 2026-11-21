'use client'

import { FormEvent, Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { isGeorgianMobilePhone } from '@/lib/phone'
import { trackTokenEvent } from '@/lib/trackTokenEvent'

type DealRow = {
  id: string
  brand_id: string | null
  title: string | null
  description: string | null
  image_url: string | null
  logo: string | null
  price: number | null
  original_price: number | null
  gift_description: string | null
  free_delivery_tbilisi: boolean | null
  delivery_estimate: string | null
  stock_limit: number | null
  stock_sold: number | null
  is_active: boolean | null
}

type ProfileRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  username?: string | null
  bio?: string | null
  sector?: string | null
}

type PartnershipRow = {
  id: string
  status: string | null
  influencer_cut_pct: number | null
  total_percentage: number | null
}

type Checkout = {
  deal: DealRow
  partnership: PartnershipRow
  brand: ProfileRow | null
  influencer: ProfileRow | null
}

const BUYER_MESSAGE: Record<string, string> = {
  DEAL_NOT_FOUND: 'შეთავაზება ვერ მოიძებნა',
  PARTNERSHIP_INACTIVE: 'ეს შეთავაზება არ არის აქტიური',
  REF_REQUIRED: 'გახსენი ინფლუენსერის ბმული',
  DEAL_INACTIVE: 'შეთავაზება დროებით გათიშულია',
  PRICE_NOT_SET: 'ფასი ჯერ არ არის დაყენებული',
  SOLD_OUT: 'ამოიწურა',
  DB_ERROR: 'შეთავაზება დროებით მიუწვდომელია. სცადე თავიდან.',
}

function buyerMessage(code?: string, fallback?: string) {
  if (code && BUYER_MESSAGE[code]) return BUYER_MESSAGE[code]
  if (fallback) return fallback
  return BUYER_MESSAGE.DEAL_NOT_FOUND
}

function isHttpUrl(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.startsWith('http')
}

function initialsFromName(name: string | null) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

function dealSoldOut(deal: DealRow) {
  const limit = Number(deal.stock_limit || 0)
  const sold = Number(deal.stock_sold || 0)
  return deal.is_active === false || (limit > 0 && sold >= limit)
}

function GiftBoxIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <rect x="6" y="20" width="36" height="22" rx="3" />
      <path d="M6 28h36" />
      <path d="M24 20v22" />
      <path d="M24 20c-4.2 0-9-2.1-9-6.6 0-3.4 3.2-5 9 0 5.8-5 9-3.4 9 0 0 4.5-4.8 6.6-9 6.6z" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
      <path d="M16.37 12.62c.03 2.22 1.95 2.96 1.97 2.97-.02.06-.31 1.05-1.01 2.08-.61.89-1.24 1.77-2.23 1.79-.95.02-1.26-.56-2.35-.56s-1.43.54-2.33.58c-.94.04-1.66-.96-2.27-1.84-1.24-1.8-2.19-5.09-.91-7.31.63-1.1 1.77-1.8 3-1.82.94-.02 1.82.63 2.4.63.57 0 1.64-.78 2.77-.66.47.02 1.8.19 2.65 1.45-.07.04-1.58.92-1.56 2.69zM14.7 6.18c.5-.6.83-1.44.74-2.28-.71.03-1.58.48-2.09 1.08-.46.53-.86 1.38-.75 2.2.8.06 1.61-.4 2.1-1z" />
    </svg>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.21-2.36H12v4.46h6.46a5.53 5.53 0 0 1-2.4 3.63v3.01h3.88c2.27-2.09 3.58-5.17 3.58-8.74z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11C3.23 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.23 2.7 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  )
}

function CardMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19" />
    </svg>
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const dealId = searchParams.get('deal')
  const influencerId = searchParams.get('ref')

  const [checkout, setCheckout] = useState<Checkout | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [forcedSoldOut, setForcedSoldOut] = useState(false)
  const trackedDealId = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!dealId) {
        console.error('[Checkout Load Error]', { code: 'DEAL_NOT_FOUND', detail: 'Missing deal query parameter' })
        setLoading(false)
        setLoadError(BUYER_MESSAGE.DEAL_NOT_FOUND)
        return
      }

      setLoading(true)
      setLoadError(null)
      setCheckout(null)
      setForcedSoldOut(false)

      try {
        const params = new URLSearchParams({ deal: dealId })
        if (influencerId) params.set('ref', influencerId)
        const response = await fetch(`/api/public/checkout?${params.toString()}`)
        const data = await response.json().catch(() => null)
        if (cancelled) return

        if (!data || typeof data !== 'object') {
          console.error('[Checkout Load Error]', { code: 'DB_ERROR', detail: 'Unreadable checkout response', status: response.status })
          setLoadError(BUYER_MESSAGE.DB_ERROR)
          return
        }

        const code = typeof data.code === 'string' ? data.code : undefined
        const detail = typeof data.detail === 'string' ? data.detail : undefined
        const soldOutPayload = code === 'SOLD_OUT' || data.isSoldOut === true
        if (soldOutPayload && data.deal && data.partnership) {
          setCheckout({
            deal: data.deal as DealRow,
            partnership: data.partnership as PartnershipRow,
            brand: (data.brand as ProfileRow | null) || null,
            influencer: (data.influencer as ProfileRow | null) || null,
          })
          setForcedSoldOut(true)
          return
        }

        if (!response.ok || !data.deal || !data.partnership) {
          console.error('[Checkout Load Error]', {
            code: code || 'UNKNOWN',
            detail,
            error: typeof data.error === 'string' ? data.error : undefined,
            status: response.status,
          })
          setLoadError(buyerMessage(code, typeof data.error === 'string' ? data.error : undefined))
          return
        }

        setCheckout({
          deal: data.deal as DealRow,
          partnership: data.partnership as PartnershipRow,
          brand: (data.brand as ProfileRow | null) || null,
          influencer: (data.influencer as ProfileRow | null) || null,
        })
      } catch (error: any) {
        console.error('[Checkout Load Error]', { code: 'DB_ERROR', detail: error?.message || 'Network error' })
        if (!cancelled) setLoadError(BUYER_MESSAGE.DB_ERROR)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [dealId, influencerId])

  useEffect(() => {
    if (!checkout || trackedDealId.current === checkout.deal.id) return
    const trackedInfluencerId = checkout.influencer?.id || influencerId
    if (!trackedInfluencerId) return
    trackedDealId.current = checkout.deal.id
    void trackTokenEvent({
      influencerId: trackedInfluencerId,
      eventType: 'checkout_view',
      brandId: checkout.brand?.id || checkout.deal.brand_id,
      partnershipId: checkout.partnership.id,
      dealId: checkout.deal.id,
      source: 'checkout',
    })
  }, [checkout, influencerId])

  const pay = async (event: FormEvent) => {
    event.preventDefault()
    if (!checkout || submitting) return

    const phone = customerPhone.trim()
    const address = customerAddress.trim()

    if (!isGeorgianMobilePhone(phone)) {
      setFormError('შეიყვანე ნომერი ფორმატით 5XXXXXXXX')
      return
    }
    if (!address) {
      setFormError('შეიყვანე მისამართი')
      return
    }

    setFormError(null)
    setSubmitting(true)

    const trackedInfluencerId = checkout.influencer?.id || influencerId
    if (trackedInfluencerId) {
      void trackTokenEvent({
        influencerId: trackedInfluencerId,
        eventType: 'payment_init',
        brandId: checkout.brand?.id || checkout.deal.brand_id,
        partnershipId: checkout.partnership.id,
        dealId: checkout.deal.id,
        source: 'checkout',
      })
    }

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: checkout.deal.id,
          influencerId: trackedInfluencerId,
          customerPhone: phone,
          customerAddress: address,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 409 || data?.error === 'SOLD_OUT' || data?.code === 'SOLD_OUT') {
        setForcedSoldOut(true)
        setSubmitting(false)
        return
      }
      if (!response.ok || !data?.checkoutUrl) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'გადახდა ვერ დაიწყო')
      }
      window.location.assign(data.checkoutUrl)
    } catch (error: any) {
      setFormError(error?.message || 'გადახდა ვერ დაიწყო')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#010201] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98105,transparent_70%)] pointer-events-none" />
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-emerald-500 font-black animate-pulse tracking-[0.5em] uppercase italic text-[10px]">Secure Checkout</p>
        </div>
      </main>
    )
  }

  if (loadError || !checkout) {
    return (
      <main className="min-h-screen bg-[#010201] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98105,transparent_70%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex w-full max-w-[400px] flex-col items-center justify-center border-2 border-red-500/20 rounded-[45px] bg-black/40 p-12 text-center gap-6 shadow-[0_0_80px_rgba(239,68,68,0.05)]"
        >
          <div className="h-16 w-16 rounded-full border-2 border-red-500/30 flex items-center justify-center">
            <span className="text-red-500 text-3xl font-mono">!</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight">
            {loadError || BUYER_MESSAGE.DEAL_NOT_FOUND}
          </h2>
        </motion.div>
      </main>
    )
  }

  const { deal, brand, influencer } = checkout
  const price = Number(deal.price || 0)
  const original = Number(deal.original_price || 0)
  const showOriginal = Number.isFinite(original) && original > price && price > 0
  const off = showOriginal ? Math.round((1 - price / original) * 100) : 0
  const stockLimit = Number(deal.stock_limit || 0)
  const stockSold = Number(deal.stock_sold || 0)
  const remaining = Math.max(0, stockLimit - stockSold)
  const soldOut = forcedSoldOut || dealSoldOut(deal)
  const influencerName = influencer?.full_name || null
  const influencerHandle = influencer?.username ? '@' + String(influencer.username).replace(/^@/, '') : null
  const influencerAvatar = isHttpUrl(influencer?.avatar_url) ? influencer.avatar_url : null
  const influencerInitials = initialsFromName(influencerName || influencerHandle)
  const showInfluencer = Boolean(influencer || influencerId)
  const creatorLine = influencerName
    ? `Token by ${influencerName}`
    : influencerHandle
      ? `Via ${influencerHandle}`
      : null
  const brandName = brand?.full_name || deal.title || 'InfluX'
  const brandLogo = isHttpUrl(brand?.avatar_url) ? brand.avatar_url : (isHttpUrl(deal.logo) ? deal.logo : null)
  const brandMark = !brandLogo ? (deal.logo || '💎') : null
  const productImage = isHttpUrl(deal.image_url) && deal.image_url !== brandLogo ? deal.image_url : null
  const gift = deal.gift_description?.trim() || ''
  const deliveryLine = [
    deal.free_delivery_tbilisi ? 'უფასო მიტანა თბილისში' : null,
    deal.delivery_estimate?.trim() || null,
  ].filter(Boolean).join(' · ')

  return (
    <main className="min-h-screen bg-[#010201] text-white flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98105,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center">
        <div className="mb-5 flex w-full items-center justify-center">
          <img
            src="/influx-logo.png"
            alt="InfluX"
            className="h-5 w-auto max-w-full object-contain sm:h-6"
          />
        </div>
      <motion.form
        onSubmit={pay}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full bg-[#050505] border border-blue-500/30 rounded-[35px] p-6 sm:p-8 shadow-[0_0_80px_rgba(37,99,235,0.2)]"
      >
        <div className="flex flex-col items-center mb-6 border-b border-white/5 pb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
              {brandLogo
                ? <img src={brandLogo} alt="" className="h-full w-full object-cover" />
                : <span className="text-2xl">{brandMark}</span>}
            </div>
            {showInfluencer && (
              <>
                <span className="text-[13px] text-white/30 font-light leading-none select-none">×</span>
                <div className="h-14 w-14 shrink-0 rounded-full bg-[#07140f] border border-emerald-400/50 ring-2 ring-blue-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_18px_rgba(16,185,129,0.28)]">
                  {influencerAvatar
                    ? <img src={influencerAvatar} alt={influencerName || 'creator'} className="h-full w-full object-cover" />
                    : <span className="text-[13px] font-black italic text-emerald-300 tracking-widest">{influencerInitials || '•'}</span>}
                </div>
              </>
            )}
          </div>
          <span className="text-xs font-black text-white uppercase italic tracking-widest text-center">{brandName}</span>
          {creatorLine && (
            <span className="text-[8px] font-black tracking-[0.28em] text-emerald-400/80 uppercase mt-1.5 italic text-center">
              {creatorLine}
            </span>
          )}
          <span className="text-[8px] font-black tracking-[0.4em] text-blue-500 uppercase mt-1 italic">Secure Checkout</span>
        </div>

        {(productImage || deal.title) && (
          <div className="mb-5 flex items-center gap-3">
            {productImage && (
              <img src={productImage} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover border border-white/10" />
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-black uppercase italic tracking-tight leading-tight text-white">
                {deal.title || 'შეთავაზება'}
              </h1>
              {deal.description && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/45">{deal.description}</p>
              )}
            </div>
          </div>
        )}

        <div className="relative bg-white/5 rounded-[25px] p-6 border border-white/5 flex justify-between items-center overflow-hidden">
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Total to Pay</span>
            {showOriginal && (
              <span className="mb-1 flex items-center gap-2">
                <span className="text-sm font-light text-white/35 line-through">{original.toFixed(2)}</span>
                {off > 0 && (
                  <span className="text-[9px] font-black tracking-[0.16em] text-emerald-400/80">{off}% OFF</span>
                )}
              </span>
            )}
            <span className="text-3xl font-black text-white leading-none">
              {price.toFixed(2)} <span className="text-sm font-light text-gray-400">GEL</span>
            </span>
          </div>

          <div className="absolute right-6 h-12 w-12 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute h-full w-full rounded-full bg-blue-500/10 border border-blue-500/20"
            />
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_4px_rgba(37,99,235,0.7)]" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              className="absolute h-[140%] w-[140%] border-[2px] border-dotted border-blue-500/30 rounded-full"
            />
          </div>
        </div>

        {gift && (
          <div className="mt-4 flex items-center gap-3 rounded-[22px] border border-amber-200/15 bg-amber-300/[0.045] px-3 py-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200/25 bg-amber-300/10 text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.12)]">
              <GiftBoxIcon />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[8px] font-black uppercase tracking-[0.28em] text-amber-200/50">საჩუქარი</p>
              <p className="mt-1 break-words text-[13px] font-bold leading-snug text-amber-50/90">{gift}</p>
            </div>
          </div>
        )}

        {((stockLimit > 0 && !soldOut) || deliveryLine) && (
          <div className="mt-3 space-y-2 text-center">
            {stockLimit > 0 && !soldOut && (
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">დარჩა {remaining}</p>
            )}
            {deliveryLine && (
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">{deliveryLine}</p>
            )}
          </div>
        )}

        {soldOut ? (
          <div className="mt-6 rounded-[25px] border border-red-500/20 bg-red-500/5 px-5 py-6 text-center">
            <p className="text-sm font-black uppercase italic tracking-[0.28em] text-red-400">Sold Out</p>
            <p className="mt-2 text-[11px] font-bold text-white/50">ამოიწურა</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-2 block text-center font-bold">ტელეფონის ნომერი</span>
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="5XXXXXXXX"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-white text-center focus:border-blue-500 outline-none transition-all placeholder:text-white/25"
              />
            </label>
            <label className="block">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-2 block text-center font-bold">მისამართი</span>
              <input
                required
                autoComplete="street-address"
                placeholder="ქუჩა, სადარბაზო, სართული"
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-base font-bold text-white text-center focus:border-blue-500 outline-none transition-all placeholder:text-white/25"
              />
            </label>
          </div>
        )}

        {formError && (
          <p className="mt-4 text-center text-[11px] font-bold text-red-400">{formError}</p>
        )}

        <button
          type="submit"
          disabled={soldOut || submitting || price <= 0}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-20 py-5 rounded-2xl font-bold text-sm shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95"
        >
          {soldOut ? 'ამოიწურა' : submitting ? 'ბანკზე გადასვლა...' : `გადახდა ${price.toFixed(2)} GEL`}
        </button>
        {!soldOut && (
          <div className="mt-3 flex w-full min-w-0 flex-col items-center gap-2">
            <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5">
              <span className="inline-flex h-7 items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] px-2.5 text-white">
                <AppleMark />
                <span className="text-[11px] font-semibold tracking-tight">Pay</span>
              </span>
              <span className="inline-flex h-7 items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] px-2.5 text-white">
                <GoogleMark />
                <span className="text-[11px] font-medium tracking-tight text-white/90">Pay</span>
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55" aria-hidden="true">
                <CardMark />
              </span>
            </div>
            <p className="max-w-full break-words px-1 text-center text-[10px] font-medium leading-snug text-white/55">
              შემდეგ გვერდზე შეგიძლია გადაიხადო Apple Pay, Google Pay ან ბარათით
            </p>
          </div>
        )}
        <p className="mt-3 text-center text-[8px] font-black tracking-[0.4em] text-blue-500 uppercase italic">Bank of Georgia</p>
      </motion.form>
      </div>
    </main>
  )
}

export default function PaymentFlowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#010201]" />}>
      <CheckoutContent />
    </Suspense>
  )
}
