'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

function GiftMark({ imageUrl }: { imageUrl: string | null }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="gift" className="h-14 w-14 shrink-0 rounded-2xl object-cover border border-white/10" />
  }
  return (
    <div className="h-14 w-14 shrink-0 rounded-2xl bg-amber-400/10 border border-amber-300/40 flex items-center justify-center text-2xl shadow-[0_0_18px_rgba(251,191,36,0.35)]">
      🎁
    </div>
  )
}

function GiftOfferCard({
  description,
  imageUrl,
  unlocked,
  payable,
  threshold,
  remaining,
  progress,
}: {
  description: string
  imageUrl: string | null
  unlocked: boolean
  payable: number
  threshold: number
  remaining: number
  progress: number
}) {
  const thresholdLabel = Number.isInteger(threshold) ? String(threshold) : threshold.toFixed(2)
  const unlockedStyle = unlocked
    ? 'border-amber-300/50 bg-gradient-to-r from-emerald-500/15 to-amber-400/10 shadow-[0_0_28px_rgba(251,191,36,0.16)]'
    : 'border-white/10 bg-white/[0.03]'

  return (
    <div className={`rounded-[22px] border p-4 flex items-center gap-3 ${unlockedStyle}`}>
      <GiftMark imageUrl={imageUrl} />
      <div className="min-w-0 flex-1">
        {unlocked ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200 italic">🎁 Gift Included</p>
            <p className="mt-1 text-sm font-black text-white italic leading-tight">{description}</p>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-300/80">You qualify for this gift on checkout.</p>
          </>
        ) : payable === 0 && threshold > 0 ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70 italic">🎁 Free Gift over {thresholdLabel} GEL</p>
            <p className="mt-1 text-sm font-black text-white/80 italic leading-tight">{description}</p>
          </>
        ) : payable === 0 ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70 italic">🎁 Includes Free Gift</p>
            <p className="mt-1 text-sm font-black text-white/80 italic leading-tight">{description}</p>
          </>
        ) : (
          <>
            <p className="text-[11px] font-black text-white italic leading-snug">
              Add {remaining.toFixed(2)} GEL more to unlock: {description}
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function initialsFromName(name: string | null) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

export default function AmountModal({ deal, onConfirm, onCancel }: any) {
  const [inputAmount, setInputAmount] = useState('')

  const dealObj = Array.isArray(deal?.deals) ? deal.deals[0] : deal?.deals
  const totalShare = Number(deal?.total_percentage ?? dealObj?.totalShare ?? 0)

  let userPct = Number(deal?.user_discount_pct ?? 0)
  let commissionPct = Number(deal?.influencer_cut_pct ?? 0)

  if (userPct === 0 && commissionPct === 0 && totalShare > 0) {
    userPct = totalShare
    commissionPct = 0
  }

  const raw = parseFloat(inputAmount) || 0
  const userDiscount = Number(((raw * userPct) / 100).toFixed(2))
  const finalPayable = Number((raw - userDiscount).toFixed(2))
  const influencerEarnings = Number(((raw * commissionPct) / 100).toFixed(2))
  const brandAmount = Number((finalPayable - influencerEarnings).toFixed(2))

  const brandName = deal?.brands?.name || deal?.brand || dealObj?.title || deal?.title || 'MATRIX PARTNER'
  const brandLogo = deal?.brands?.logo || deal?.logo || dealObj?.logo || '💎'
  const influencer = deal?.influencerProfile || null
  const influencerAvatar = influencer?.avatar_url || null
  const influencerName = influencer?.full_name || influencer?.username || null
  const influencerHandle = influencer?.username ? '@' + String(influencer.username).replace(/^@/, '') : null
  const avatarIsUrl = typeof influencerAvatar === 'string' && influencerAvatar.startsWith('http')
  const influencerInitials = initialsFromName(influencerName)
  const showInfluencer = !!(deal?.influencer_id || influencer)
  const creatorLine = influencerName
    ? `Token by ${influencerName}`
    : influencerHandle
      ? `Via ${influencerHandle}`
      : null

  const giftDescription = dealObj?.gift_description || deal?.gift_description || null
  const giftThreshold = Number(dealObj?.gift_threshold ?? deal?.gift_threshold ?? 0)
  const giftImageUrl = dealObj?.gift_image_url || deal?.gift_image_url || null
  const hasGift = Boolean(giftDescription)
  const giftUnlocked = hasGift && finalPayable > 0 && (giftThreshold <= 0 || finalPayable >= giftThreshold)
  const amountRemainingForGift = hasGift && giftThreshold > 0 && finalPayable < giftThreshold
    ? Number((giftThreshold - finalPayable).toFixed(2))
    : 0
  const giftProgress = giftThreshold > 0 ? Math.min(100, (finalPayable / giftThreshold) * 100) : 0
  const giftImageIsUrl = typeof giftImageUrl === 'string' && giftImageUrl.startsWith('http')

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[400px] max-h-[92vh] overflow-y-auto bg-[#050505] border border-blue-500/30 rounded-[35px] p-8 animate-in zoom-in-95 duration-300 shadow-[0_0_80px_rgba(37,99,235,0.2)] relative">
        <div className="flex flex-col items-center mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
              {typeof brandLogo === 'string' && brandLogo.startsWith('http')
                ? <img src={brandLogo} alt="brand" className="h-full w-full object-cover" />
                : <span className="text-2xl">{brandLogo}</span>}
            </div>
            {showInfluencer && (
              <>
                <span className="text-[13px] text-white/30 font-light leading-none select-none">×</span>
                <div className="h-14 w-14 shrink-0 rounded-full bg-[#07140f] border border-emerald-400/50 ring-2 ring-blue-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_18px_rgba(16,185,129,0.28)]">
                  {avatarIsUrl
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

        <div className="space-y-6">
          <div className="relative">
            <label className="text-[9px] text-gray-500 uppercase tracking-widest mb-3 block text-center font-bold">Original Price (GEL)</label>
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-3xl font-bold text-white text-center focus:border-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
          </div>

          {raw > 0 && (
            <div className="space-y-5 animate-in fade-in duration-500">
              {userPct > 0 && (
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Your Savings ({userPct}%)</span>
                  <span className="text-green-500 font-black">-{userDiscount.toFixed(2)} GEL</span>
                </div>
              )}

              <div className="relative bg-white/5 rounded-[25px] p-6 border border-white/5 flex justify-between items-center overflow-hidden">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Total to Pay</span>
                  <span className="text-3xl font-black text-white leading-none">
                    {finalPayable.toFixed(2)} <span className="text-sm font-light text-gray-400">GEL</span>
                  </span>
                </div>

                <div className="absolute right-6 h-12 w-12 flex items-center justify-center">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute h-full w-full rounded-full bg-blue-500/10 border border-blue-500/20" />
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_4px_rgba(37,99,235,0.7)]" />
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: 'linear' }} className="absolute h-[140%] w-[140%] border-[2px] border-dotted border-blue-500/30 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {hasGift && (
            <GiftOfferCard
              description={giftDescription}
              imageUrl={giftImageIsUrl ? giftImageUrl : null}
              unlocked={giftUnlocked}
              payable={finalPayable}
              threshold={giftThreshold}
              remaining={amountRemainingForGift}
              progress={giftProgress}
            />
          )}

          <div className="flex flex-col gap-3 pt-4">
            <button
              disabled={raw <= 0}
              onClick={() =>
                onConfirm(finalPayable, {
                  rawAmount: raw,
                  discountPct: userPct,
                  commissionPct,
                  influencerEarnings,
                  brandAmount,
                  giftUnlocked,
                  giftDescription: giftUnlocked ? giftDescription : null,
                })
              }
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-20 py-5 rounded-2xl font-bold text-sm shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95"
            >
              CONFIRM & PAY
            </button>
            <button onClick={onCancel} className="w-full py-2 text-[9px] uppercase font-bold text-gray-600 hover:text-white transition-colors tracking-[0.3em]">CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  )
}