'use client'

import { FormEvent, Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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

const CITIES = ['თბილისი', 'რეგიონი'] as const

function formatGel(value: number) {
  if (!Number.isFinite(value)) return '0'
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function isHttpUrl(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.startsWith('http')
}

function dealUnavailable(deal: DealRow) {
  const limit = Number(deal.stock_limit || 0)
  const sold = Number(deal.stock_sold || 0)
  return deal.is_active !== true || (limit > 0 && sold >= limit)
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const dealId = searchParams.get('deal')
  const influencerId = searchParams.get('ref')

  const [checkout, setCheckout] = useState<Checkout | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerCity, setCustomerCity] = useState<(typeof CITIES)[number]>('თბილისი')
  const [customerAddress, setCustomerAddress] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [forcedSoldOut, setForcedSoldOut] = useState(false)
  const trackedDealId = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!dealId) {
        setLoading(false)
        setLoadError('შეთავაზება ვერ მოიძებნა')
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
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data?.deal || !data?.partnership) {
          throw new Error(typeof data?.error === 'string' ? data.error : 'შეთავაზება ვერ მოიძებნა')
        }

        if (cancelled) return
        setCheckout({
          deal: data.deal as DealRow,
          partnership: data.partnership as PartnershipRow,
          brand: (data.brand as ProfileRow | null) || null,
          influencer: (data.influencer as ProfileRow | null) || null,
        })
      } catch (error: any) {
        if (!cancelled) setLoadError(error?.message || 'შეთავაზება ვერ მოიძებნა')
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

    const name = customerName.trim()
    const phone = customerPhone.trim()
    const address = customerAddress.trim()
    const note = deliveryNote.trim()

    if (name.length < 2) {
      setFormError('შეიყვანე სახელი')
      return
    }
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
          customerName: name,
          customerPhone: phone,
          customerCity,
          customerAddress: address,
          deliveryNote: note,
          marketingOptIn,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 409 || data?.error === 'SOLD_OUT') {
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#010201] text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
        <p className="text-sm text-white/70">იტვირთება...</p>
      </div>
    )
  }

  if (loadError || !checkout) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#010201] px-6 text-center text-white">
        <div className="max-w-sm space-y-3">
          <p className="text-lg font-black">შეთავაზება მიუწვდომელია</p>
          <p className="text-sm text-white/60">{loadError || 'შეთავაზება ვერ მოიძებნა'}</p>
        </div>
      </main>
    )
  }

  const { deal, brand, influencer } = checkout
  const price = Number(deal.price || 0)
  const original = Number(deal.original_price || 0)
  const stockLimit = Number(deal.stock_limit || 0)
  const stockSold = Number(deal.stock_sold || 0)
  const remaining = Math.max(0, stockLimit - stockSold)
  const soldOut = forcedSoldOut || dealUnavailable(deal)
  const influencerName = influencer?.full_name || influencer?.username || ''
  const influencerAvatarUrl = influencer?.avatar_url
  const influencerAvatar = isHttpUrl(influencerAvatarUrl) ? influencerAvatarUrl : null
  const brandName = brand?.full_name || deal.title || 'InfluX'
  const brandAvatar = brand?.avatar_url
  const brandLogo = isHttpUrl(brandAvatar) ? brandAvatar : (isHttpUrl(deal.logo) ? deal.logo : null)
  const productImage = isHttpUrl(deal.image_url) ? deal.image_url : null

  return (
    <main className="min-h-screen bg-[#010201] text-white">
      <form onSubmit={pay} className="mx-auto flex w-full max-w-md flex-col px-5 pb-48 pt-6">
        <header className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
            {influencerAvatar ? (
              <img src={influencerAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-black text-emerald-300">
                {(influencerName || 'I').slice(0, 1)}
              </div>
            )}
          </div>
          <p className="text-sm font-semibold leading-snug">
            რეკომენდებულია: {influencerName || 'InfluX'}
          </p>
        </header>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {brandLogo ? (
              <img src={brandLogo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg">{deal.logo || '💎'}</div>
            )}
          </div>
          <p className="text-sm font-bold text-white/80">{brandName}</p>
        </div>

        {productImage && (
          <img src={productImage} alt="" className="mt-5 aspect-[4/3] w-full rounded-[28px] object-cover" />
        )}

        <h1 className="mt-5 text-2xl font-black leading-tight">{deal.title || 'შეთავაზება'}</h1>
        {deal.description && (
          <p className="mt-2 text-sm leading-relaxed text-white/70">{deal.description}</p>
        )}

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black tracking-tight">{formatGel(price)} ₾</p>
            {original > price && (
              <p className="pb-1 text-base text-white/40 line-through">{formatGel(original)} ₾</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {deal.gift_description && (
              <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-100">
                {deal.gift_description}
              </span>
            )}
            {deal.free_delivery_tbilisi && (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">
                უფასო მიტანა თბილისში
              </span>
            )}
            {stockLimit > 0 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/80">
                დარჩა {remaining} / {stockLimit}
              </span>
            )}
          </div>

          {deal.delivery_estimate && (
            <p className="mt-4 text-sm text-white/70">{deal.delivery_estimate}</p>
          )}
        </section>

        {soldOut ? (
          <div className="mt-6 rounded-[28px] border border-red-400/30 bg-red-500/10 px-5 py-8 text-center">
            <p className="text-xl font-black">ამოიწურა / SOLD OUT</p>
            <p className="mt-2 text-sm text-white/60">ეს შეთავაზება ამ წუთას მიუწვდომელია.</p>
          </div>
        ) : (
          <section className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-white/55">სახელი</span>
              <input
                required
                autoComplete="name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="w-full rounded-2xl bg-white px-4 py-4 text-base text-black outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-white/55">ტელეფონი</span>
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="5XXXXXXXX"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                className="w-full rounded-2xl bg-white px-4 py-4 text-base text-black outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-white/55">ქალაქი</span>
              <select
                required
                value={customerCity}
                onChange={(event) => setCustomerCity(event.target.value as (typeof CITIES)[number])}
                className="w-full rounded-2xl bg-white px-4 py-4 text-base text-black outline-none"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-white/55">მისამართი</span>
              <input
                required
                autoComplete="street-address"
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
                className="w-full rounded-2xl bg-white px-4 py-4 text-base text-black outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-white/55">შენიშვნა</span>
              <input
                value={deliveryNote}
                onChange={(event) => setDeliveryNote(event.target.value)}
                placeholder="სადარბაზო / სართული"
                className="w-full rounded-2xl bg-white px-4 py-4 text-base text-black outline-none placeholder:text-black/35"
              />
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-white/10 px-4 py-4">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(event) => setMarketingOptIn(event.target.checked)}
                className="mt-1 h-4 w-4 accent-emerald-500"
              />
              <span className="text-sm leading-snug text-white/80">
                მსურს მივიღო InfluX-ის დახურული შეთავაზებები და ფასდაკლებები
              </span>
            </label>
          </section>
        )}

        {formError && <p className="mt-4 text-center text-sm font-semibold text-red-300">{formError}</p>}

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#010201]/95 px-5 py-4 backdrop-blur">
          <div className="mx-auto w-full max-w-md">
            <button
              type="submit"
              disabled={soldOut || submitting || price <= 0}
              className="w-full rounded-2xl bg-emerald-500 py-4 text-base font-black text-black disabled:bg-white/10 disabled:text-white/40"
            >
              {soldOut ? 'ამოიწურა / SOLD OUT' : submitting ? 'ბანკზე გადასვლა...' : `გადახდა ${formatGel(price)} ₾`}
            </button>
            <p className="mt-2 text-center text-[11px] text-white/40">უსაფრთხო გადახდა · Bank of Georgia</p>
          </div>
        </div>
      </form>
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
