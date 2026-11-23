'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BrandMonogram } from '@/components/BrandMark'

function buyerDealMark(deal: any): { kind: 'discount'; pct: number } | { kind: 'gift'; text: string } | null {
  const limit = Number(deal?.stock_limit || 0)
  const sold = Number(deal?.stock_sold || 0)
  if (deal?.offer === 'SOLD' || deal?.is_active === false || (limit > 0 && sold >= limit)) return null

  const price = Number(deal?.price)
  const originalPrice = Number(deal?.original_price)
  const discounted = Number.isFinite(originalPrice) && Number.isFinite(price) && originalPrice > price && price > 0
  if (discounted) {
    const discountPct = Math.round(((originalPrice - price) / originalPrice) * 100)
    return discountPct > 0 ? { kind: 'discount', pct: discountPct } : null
  }

  const gift = typeof deal?.gift_description === 'string' ? deal.gift_description.trim() : ''
  return gift ? { kind: 'gift', text: gift } : null
}

export function DealValueMark({ deal }: { deal: any }) {
  const mark = buyerDealMark(deal)

  if (mark?.kind === 'discount') {
    return (
      <div className="relative z-10 flex w-full min-w-0 flex-col items-center px-0.5 py-1">
        <span className="text-[28px] font-black italic leading-none tracking-tighter text-emerald-400">-{mark.pct}%</span>
        <span className="mt-1 max-w-full truncate text-[7px] font-black uppercase tracking-[0.12em] text-emerald-300/80">ფასდაკლება</span>
      </div>
    )
  }

  if (mark?.kind === 'gift') {
    return (
      <div className="relative z-10 flex w-full min-w-0 flex-col items-center gap-1 px-0.5 py-1">
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-[8px] font-black leading-none tracking-[0.06em] text-amber-200">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <rect x="3" y="10" width="18" height="10" rx="1.5" />
            <path d="M3 14.5h18M12 10v10" />
            <path d="M12 10c-2 0-4.2-1-4.2-3.1C7.8 5.2 9.4 4.4 12 6.6 14.6 4.4 16.2 5.2 16.2 6.9 16.2 9 14 10 12 10z" />
          </svg>
          <span className="truncate">საჩუქარი</span>
        </span>
        <span className="line-clamp-2 max-w-full break-words text-center text-[8px] font-bold normal-case not-italic leading-tight text-amber-100/70">
          {mark.text}
        </span>
      </div>
    )
  }

  return (
    <h2 className="text-4xl text-center py-2 text-emerald-500 text-glow leading-none relative z-10 tracking-tighter uppercase font-black italic">
      {deal.offer}
    </h2>
  )
}

function formatPassPrice(price: unknown) {
  const value = Number(price)
  if (!Number.isFinite(value) || value <= 0) return ''
  const amount = Number.isInteger(value) ? String(value) : value.toFixed(2)
  return `${amount} ₾`
}

function DealRow({ deal, onDealClick }: { deal: any; onDealClick?: (deal: any) => void }) {
  const perk = (typeof deal?.gift_description === 'string' && deal.gift_description.trim()) || 'VIP წვდომა'
  const priceLabel = formatPassPrice(deal?.price)
  const logo = typeof deal?.logo === 'string' ? deal.logo : ''

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onDealClick?.(deal)
      }}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#4A1420]/20"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
        {logo.startsWith('http')
          ? <img src={logo} alt="" className="h-full w-full object-cover" />
          : <span className="font-editorial text-lg text-[#C9B087]">{logo || '◆'}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-editorial text-base font-medium text-[#F2EFE9]">{deal?.brand || 'VIP'}</p>
        <p className="mt-0.5 truncate font-sans text-xs tracking-[0.04em] text-[#C9B087]">{perk}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 font-editorial text-sm text-[#F2EFE9]">
        {priceLabel && <span>{priceLabel}</span>}
        <span className="font-sans text-[#8C8580]">→</span>
      </div>
    </button>
  )
}

interface InfluXCardProps {
  profile?: any;
  liveDeals?: any[];
  deal?: any;
  children?: React.ReactNode;
  disableRotation?: boolean;
  onFlip?: () => void;
  onDealClick?: (deal: any) => void;
}

export default function InfluXCard({ profile, liveDeals = [], deal, children, onFlip, onDealClick }: InfluXCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  if (!profile && !deal) return null

  const displayName = (profile?.full_name || deal?.brands?.name || '').trim()

  const handleFlip = () => {
    const opening = !isFlipped
    setIsFlipped(opening)
    if (opening) onFlip?.()
  }

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="pointer-events-none absolute -inset-x-8 -top-16 bottom-6 bg-[radial-gradient(ellipse_at_top,rgba(92,24,39,0.28),transparent_62%)]" />
      <div className="relative w-full" onClick={handleFlip}>
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          style={{ transformStyle: 'preserve-3d', WebkitTransformStyle: 'preserve-3d' }}
          className="relative aspect-[1/1.6] w-full cursor-pointer"
        >
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121011] shadow-[inset_0_1px_0_rgba(242,239,233,0.08),0_0_0_1px_rgba(201,176,135,0.14),0_28px_70px_-24px_rgba(92,24,39,0.7)]"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}
          >
            <div className="relative min-h-0 flex-1">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[#1C0D11]" />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#121011] via-[#121011]/88 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 px-5 pb-2 text-center">
                {displayName && (
                  <h3 className="font-editorial text-3xl font-medium capitalize leading-tight text-[#F2EFE9]">
                    {displayName}
                  </h3>
                )}
                <div className="mt-3 flex flex-col items-center">
                  <BrandMonogram className="h-5 w-5" />
                  <span className="mt-2 h-px w-10 bg-[#C9B087]/50" />
                  <p className="mt-2 font-sans text-[10px] tracking-[0.18em] text-[#C9B087]">
                    EXCLUSIVE ACCESS · {liveDeals.length} VIP PASS
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4">
              <button
                type="button"
                className="w-full rounded-lg bg-[#F2EFE9] py-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#090808] transition-colors hover:bg-[#E7DEC8]"
              >
                წვდომის გახსნა
              </button>
              {children}
            </div>
            <div className="pointer-events-none absolute inset-2.5 rounded-xl border border-[#C9B087]/15" />
          </div>

          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121011] shadow-[inset_0_1px_0_rgba(242,239,233,0.08),0_0_0_1px_rgba(201,176,135,0.14)]"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
              <p className="min-w-0 truncate font-editorial text-lg font-medium capitalize text-[#F2EFE9]">{displayName}</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsFlipped(false)
                }}
                className="shrink-0 font-sans text-[11px] tracking-[0.12em] text-[#8C8580] transition-colors hover:text-[#F2EFE9]"
              >
                ← უკან
              </button>
            </div>
            <div className="scrollbar-hide flex-1 overflow-y-auto">
              {liveDeals.length > 0 ? (
                <div className="divide-y divide-white/[0.07]">
                  {liveDeals.map((item) => (
                    <DealRow key={item.id} deal={item} onDealClick={onDealClick} />
                  ))}
                </div>
              ) : (
                <p className="py-16 text-center font-sans text-sm text-[#8C8580]">
                  VIP წვდომა ჯერ არ არის
                </p>
              )}
            </div>
            <div className="pointer-events-none absolute inset-2.5 rounded-xl border border-[#C9B087]/15" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
