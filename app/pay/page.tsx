'use client'

import { FormEvent, Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import BrandMark from '@/components/BrandMark'
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
    const isDeliveryDeal = Boolean(checkout.deal.free_delivery_tbilisi || checkout.deal.delivery_estimate?.trim())
    if (!address) {
      setFormError(isDeliveryDeal ? 'შეიყვანე მისამართი' : 'შეიყვანე სახელი და გვარი')
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#090808] p-6 text-[#F2EFE9]">
        <div className="h-8 w-8 animate-spin rounded-full border border-[#C9B087]/25 border-t-[#C9B087]" />
      </main>
    )
  }

  if (loadError || !checkout) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#090808] p-6 text-[#F2EFE9]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.08] bg-[#121011] px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(242,239,233,0.08)]"
        >
          <h2 className="font-editorial text-lg font-medium leading-snug text-[#F2EFE9]">
            {loadError || BUYER_MESSAGE.DEAL_NOT_FOUND}
          </h2>
        </motion.div>
      </main>
    )
  }

  const { deal, brand, influencer } = checkout
  const price = Number(deal.price || 0)
  const priceLabel = Number.isInteger(price) ? String(price) : price.toFixed(2)
  const stockLimit = Number(deal.stock_limit || 0)
  const stockSold = Number(deal.stock_sold || 0)
  const remaining = Math.max(0, stockLimit - stockSold)
  const soldOut = forcedSoldOut || dealSoldOut(deal)
  const influencerName = influencer?.full_name || null
  const influencerAvatar = isHttpUrl(influencer?.avatar_url) ? influencer.avatar_url : null
  const influencerInitials = initialsFromName(influencerName)
  const showInfluencer = Boolean(influencer || influencerId)
  const brandName = brand?.full_name || deal.title || 'InfluX'
  const brandLogo = isHttpUrl(brand?.avatar_url) ? brand.avatar_url : (isHttpUrl(deal.logo) ? deal.logo : null)
  const brandMark = !brandLogo ? (deal.logo || '◆') : null
  const productImage = isHttpUrl(deal.image_url) && deal.image_url !== brandLogo ? deal.image_url : null
  const gift = deal.gift_description?.trim() || ''
  const isDeliveryDeal = Boolean(deal.free_delivery_tbilisi || deal.delivery_estimate?.trim())
  const deliveryLine = [
    deal.free_delivery_tbilisi ? 'უფასო მიტანა თბილისში' : null,
    deal.delivery_estimate?.trim() || null,
  ].filter(Boolean).join(' · ')
  const fieldClass = 'w-full rounded-lg border border-white/[0.08] bg-transparent px-4 py-3.5 font-sans text-sm text-[#F2EFE9] outline-none transition-colors placeholder:text-[#8C8580] focus:border-[#C9B087]/40 focus:ring-1 focus:ring-[#C9B087]/40'

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#090808] px-4 py-8 text-[#F2EFE9]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46vh] bg-[radial-gradient(ellipse_at_top,rgba(92,24,39,0.28),transparent_62%)]" />
      <div className="relative my-auto flex w-full max-w-[400px] flex-col items-center">
        <div className="mb-5 flex w-full items-center justify-center">
          <BrandMark size="sm" />
        </div>
      <motion.form
        onSubmit={pay}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full rounded-2xl border border-white/[0.08] bg-[#121011] p-6 shadow-[inset_0_1px_0_rgba(242,239,233,0.08)] sm:p-8"
      >
        <div className="flex flex-col items-center border-b border-white/[0.07] pb-6">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#C9B087]/25 bg-[#1E0E12]">
              {brandLogo
                ? <img src={brandLogo} alt="" className="h-full w-full object-cover" />
                : <span className="font-editorial text-lg text-[#F2EFE9]">{brandMark}</span>}
            </div>
            {showInfluencer && (
              <>
                <span className="select-none font-editorial text-sm font-light leading-none text-[#C9B087]">×</span>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-[#0E0C0D]">
                  {influencerAvatar
                    ? <img src={influencerAvatar} alt={influencerName || ''} className="h-full w-full object-cover" />
                    : <span className="font-sans text-xs font-medium tracking-[0.12em] text-[#F2EFE9]">{influencerInitials || '•'}</span>}
                </div>
              </>
            )}
          </div>
          <span className="text-center font-editorial text-xl font-medium text-[#F2EFE9]">{brandName}</span>
          {influencerName && (
            <span className="mt-1.5 text-center font-sans text-xs tracking-[0.08em] text-[#C9B087]">
              {influencerName}-ს VIP წვდომა
            </span>
          )}
        </div>

        {(productImage || deal.title) && (
          <div className="flex items-center gap-3 border-b border-white/[0.07] py-5">
            {productImage && (
              <img src={productImage} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-white/[0.08] object-cover" />
            )}
            <div className="min-w-0">
              <h1 className="font-editorial text-lg font-medium leading-snug text-[#F2EFE9]">
                {deal.title || 'შეთავაზება'}
              </h1>
              {deal.description && (
                <p className="mt-1 line-clamp-2 font-sans text-[13px] leading-snug text-[#8C8580]">{deal.description}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-end justify-between gap-4 border-b border-white/[0.07] py-6">
          <p className="font-editorial text-4xl font-medium leading-none text-[#F2EFE9]">
            {priceLabel}<span className="ml-1 text-2xl font-normal opacity-75">₾</span>
          </p>
          {stockLimit > 0 && !soldOut && (
            <span className="shrink-0 rounded-lg border border-[#C9B087]/25 bg-gradient-to-r from-[#1E0E12] via-[#131011] to-[#0E0C0D] px-2.5 py-1 font-sans text-[10px] tracking-[0.12em] text-[#C9B087]">
              დარჩა {remaining} / {stockLimit}
            </span>
          )}
        </div>

        {gift && (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#C9B087]/25 bg-gradient-to-r from-[#4A1420]/30 to-[#C9B087]/[0.06] px-4 py-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center text-[#C9B087]">
              <GiftBoxIcon />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-sans text-[11px] tracking-[0.14em] text-[#C9B087]">VIP პრივილეგია</p>
              <p className="mt-1 break-words font-sans text-sm leading-snug text-[#F2EFE9]">{gift}</p>
            </div>
          </div>
        )}

        {isDeliveryDeal && deliveryLine && (
          <p className="mt-3 text-center font-sans text-xs text-[#8C8580]">{deliveryLine}</p>
        )}

        {soldOut ? (
          <div className="mt-6 border-t border-white/[0.07] py-6 text-center">
            <p className="font-sans text-sm text-[#F2EFE9]">ამოიწურა</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block font-sans text-xs tracking-[0.08em] text-[#8C8580]">ტელეფონის ნომერი</span>
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="5XXXXXXXX"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-sans text-xs tracking-[0.08em] text-[#8C8580]">
                {isDeliveryDeal ? 'მიტანის მისამართი' : 'სახელი და გვარი'}
              </span>
              <input
                required
                autoComplete={isDeliveryDeal ? 'street-address' : 'name'}
                placeholder={isDeliveryDeal ? 'ქუჩა, სადარბაზო, სართული' : 'მაგ: ნინო ბერიძე'}
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
                className={fieldClass}
              />
            </label>
          </div>
        )}

        {formError && (
          <p className="mt-4 text-center font-sans text-sm text-red-300/90">{formError}</p>
        )}

        <button
          type="submit"
          disabled={soldOut || submitting || price <= 0}
          className="mt-6 w-full rounded-lg bg-[#F2EFE9] py-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#090808] transition-colors hover:bg-[#E7DEC8] disabled:opacity-30"
        >
          {soldOut ? 'ამოიწურა' : submitting ? 'ბანკზე გადასვლა...' : `გადახდა ${priceLabel} ₾`}
        </button>
        {!soldOut && (
          <div className="mt-4 flex w-full min-w-0 flex-col items-center gap-3">
            <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5">
              <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[#F2EFE9]">
                <AppleMark />
                <span className="font-sans text-[11px] font-medium tracking-tight">Pay</span>
              </span>
              <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[#F2EFE9]">
                <GoogleMark />
                <span className="font-sans text-[11px] font-medium tracking-tight">Pay</span>
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#8C8580]" aria-hidden="true">
                <CardMark />
              </span>
            </div>
            <p className="max-w-full px-1 text-center font-sans text-[11px] leading-snug text-[#8C8580]">
              შემდეგ გვერდზე შეგიძლია გადაიხადო Apple Pay, Google Pay ან ბარათით
            </p>
            {!isDeliveryDeal && (
              <div className="space-y-1 text-center font-sans text-[11px] leading-relaxed text-[#8C8580]">
                <p>60 დღე ღია თარიღი</p>
                <p>2 სთ-ში კონტაქტი WhatsApp-ზე</p>
                <p>დაცულია საქართველოს ბანკით</p>
              </div>
            )}
          </div>
        )}
      </motion.form>
      </div>
    </main>
  )
}

export default function PaymentFlowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090808]" />}>
      <CheckoutContent />
    </Suspense>
  )
}
