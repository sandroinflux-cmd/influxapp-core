'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ReceiptModal from '@/components/ReceiptModal'

function PhoneLinkForm({
  transactionId,
  savedPhone,
  onSaved,
  submitLabel = 'Confirm & Link Order',
}: {
  transactionId: string
  savedPhone: string | null
  onSaved: (phone: string) => void
  submitLabel?: string
}) {
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (savedPhone) {
    return (
      <div className="w-full rounded-[22px] border border-emerald-400/40 bg-emerald-500/10 px-4 py-4 text-center normal-case not-italic">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">Phone Linked ✓</p>
        <p className="mt-1 text-sm font-bold text-white tracking-widest">{savedPhone}</p>
      </div>
    )
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/payments/customer-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, phone }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not link this phone number.')
      onSaved(data.customer_phone || phone.trim())
    } catch (err: any) {
      setError(err.message || 'Could not link this phone number.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-3 normal-case not-italic font-sans">
      <input
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="+995 5XX XX XX XX"
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-center text-base font-bold text-white outline-none focus:border-emerald-400/60"
      />
      {error && <p className="text-[11px] font-bold text-red-400 text-center">{error}</p>}
      <button
        onClick={submit}
        disabled={saving || !phone.trim()}
        className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] italic hover:bg-emerald-400 disabled:opacity-40 transition-all"
      >
        {saving ? 'Linking...' : submitLabel}
      </button>
    </div>
  )
}

function ModalPhoneForm({
  transactionId,
  submitLabel,
  onSaved,
}: {
  transactionId: string
  submitLabel: string
  onSaved: (phone: string) => void
}) {
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!phone.trim()) {
      setError('Enter a phone number to link this order.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/payments/customer-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, phone }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Enter a valid phone number, like +995 5XX XX XX XX.')
      onSaved(data.customer_phone || phone.trim())
    } catch (err: any) {
      setError(err.message || 'Enter a valid phone number, like +995 5XX XX XX XX.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-3 normal-case not-italic font-sans">
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="+995 5XX XX XX XX"
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-center text-base font-bold text-white outline-none focus:border-emerald-400/60"
      />
      {error && <p className="text-[11px] font-bold text-red-400 text-center">{error}</p>}
      <button
        onClick={submit}
        disabled={saving}
        className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] italic hover:bg-emerald-400 disabled:opacity-40 transition-all"
      >
        {saving ? 'Saving...' : submitLabel}
      </button>
    </div>
  )
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const txId = searchParams.get('txid') || searchParams.get('id') || searchParams.get('tx')
  const promptStarted = useRef(false)
  const closeTimer = useRef<number | null>(null)

  const [txData, setTxData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [captureOpen, setCaptureOpen] = useState(false)
  const [savedPhone, setSavedPhone] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<'order' | 'saved' | null>(null)

  useEffect(() => {
    promptStarted.current = false
    setCaptureOpen(false)
    setConfirmState(null)
    if (txId) {
      fetchTransactionDetails()
    } else {
      setErrorMsg('URL ERROR: txid is missing.')
      setLoading(false)
    }
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [txId])

  useEffect(() => {
    if (!captureOpen || !txData?.gift_unlocked) return
    const blockEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
    }
    window.addEventListener('keydown', blockEscape)
    return () => window.removeEventListener('keydown', blockEscape)
  }, [captureOpen, txData?.gift_unlocked])

  useEffect(() => {
    if (!captureOpen || txData?.gift_unlocked) return
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
      setCaptureOpen(false)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [captureOpen, txData?.gift_unlocked])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/payments/receipt?id=${encodeURIComponent(txId || '')}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Transaction not found')

      const tx = data.transaction
      const dealData = data.deal
      const brand = data.brand
      const mergedDeal = {
        ...dealData,
        brand: dealData?.title || brand?.full_name || 'MATRIX PARTNER',
        logo: brand?.avatar_url || dealData?.logo || '💎',
        title: dealData?.title || brand?.full_name || 'MATRIX PARTNER',
      }

      const nextTx = { ...tx, deals: mergedDeal, deal: dealData, brand }
      const existingPhone = typeof tx.customer_phone === 'string' ? tx.customer_phone.trim() : ''
      setTxData(nextTx)
      setSavedPhone(existingPhone || null)
      if (!existingPhone && !promptStarted.current) {
        promptStarted.current = true
        setCaptureOpen(true)
      }

      const savedHistory = JSON.parse(localStorage.getItem('matrix_user_transactions') || '[]')
      if (!savedHistory.find((item: any) => item.id === tx.id)) {
        savedHistory.unshift({
          id: tx.id,
          brandName: mergedDeal.brand,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          paid: tx.final_amount,
          saved: Number(tx.bill_amount || tx.amount || 0) - Number(tx.final_amount || 0),
        })
        localStorage.setItem('matrix_user_transactions', JSON.stringify(savedHistory.slice(0, 15)))
      }
    } catch (err: any) {
      setErrorMsg(`DATABASE ERROR: ${err.message || JSON.stringify(err)}`)
    } finally {
      setLoading(false)
    }
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
          <span className="text-red-500 text-2xl">!</span>
        </div>
        <p className="text-red-500 font-black uppercase tracking-widest mb-2 italic text-sm">System Error X-Ray</p>
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mb-8 max-w-md w-full">
          <p className="text-red-400 text-[10px] font-mono break-words lowercase">{errorMsg}</p>
        </div>
        <button
          onClick={() => router.push('/wallet')}
          className="px-10 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all italic"
        >
          [ Return to Base ]
        </button>
      </div>
    )
  }

  const giftImage = txData?.deal?.gift_image_url
  const giftImageIsUrl = typeof giftImage === 'string' && giftImage.startsWith('http')
  const giftCopy = txData?.gift_description || txData?.deal?.gift_description
  const giftRequired = Boolean(txData?.gift_unlocked)

  const closeCapture = () => {
    if (giftRequired) return
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setCaptureOpen(false)
  }

  const revealReceipt = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setCaptureOpen(false)
  }

  const handlePhoneSaved = (phone: string) => {
    setSavedPhone(phone)
    setTxData((current: any) => current ? { ...current, customer_phone: phone } : current)
    setConfirmState(giftRequired ? 'order' : 'saved')
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setCaptureOpen(false), giftRequired ? 900 : 800)
  }

  return (
    <div className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-white italic font-black uppercase">
      {txData && (
        <ReceiptModal
          total={txData.final_amount}
          originalAmount={txData.bill_amount || txData.amount}
          deal={txData.deals}
          giftUnlocked={Boolean(txData.gift_unlocked)}
          giftDescription={giftCopy}
          obscured={captureOpen && giftRequired}
          onDone={() => router.push('/wallet')}
          footer={
            <div className="mt-2 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 normal-case not-italic">
              {!savedPhone && (
                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-emerald-300/80 italic text-center mb-3">
                  Link your phone to this order
                </p>
              )}
              <PhoneLinkForm
                transactionId={txData.id}
                savedPhone={savedPhone}
                onSaved={(phone) => {
                  setSavedPhone(phone)
                  setTxData((current: any) => current ? { ...current, customer_phone: phone } : current)
                }}
              />
            </div>
          }
        />
      )}

      <AnimatePresence>
        {captureOpen && txData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!giftRequired) closeCapture() }}
            className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              className={`relative w-full max-w-[380px] max-h-[90vh] overflow-y-auto rounded-[32px] p-7 normal-case not-italic ${
                giftRequired
                  ? 'border border-amber-300/30 bg-[#07080c] shadow-[0_0_80px_rgba(251,191,36,0.18)]'
                  : 'border border-emerald-400/25 bg-[#05080a] shadow-[0_0_70px_rgba(16,185,129,0.16)]'
              }`}
            >
              {!giftRequired && (
                <button
                  onClick={closeCapture}
                  aria-label="Close"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white"
                >
                  X
                </button>
              )}

              {giftRequired ? (
                <div className="flex flex-col items-center text-center">
                  {giftImageIsUrl ? (
                    <img src={giftImage} alt="gift" className="h-24 w-24 rounded-[28px] object-cover border border-white/10 shadow-[0_0_30px_rgba(251,191,36,0.25)]" />
                  ) : (
                    <div className="h-24 w-24 rounded-[28px] bg-amber-400/10 border border-amber-300/40 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(251,191,36,0.35)]">
                      🎁
                    </div>
                  )}
                  <h2 className="mt-5 text-xl font-black italic uppercase tracking-tight text-white">You unlocked a gift</h2>
                  {giftCopy && <p className="mt-2 text-sm font-black text-amber-200 italic">{giftCopy}</p>}
                  <p className="mt-3 text-[11px] font-bold leading-relaxed text-white/60">
                    Your phone number is required so the store can match this payment and hand over the gift.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center pr-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400">Join VIP / Giveaway List</p>
                  <h2 className="mt-3 text-xl font-black italic uppercase tracking-tight text-white">Leave your number</h2>
                  <p className="mt-3 text-[11px] font-bold leading-relaxed text-white/60">
                    Get exclusive offers, bonuses, and giveaways from this brand.
                  </p>
                </div>
              )}

              <div className="mt-6">
                {confirmState ? (
                  <div className="space-y-3">
                    <div className="rounded-[22px] border border-emerald-400/40 bg-emerald-500/10 px-4 py-4 text-center">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">
                        {confirmState === 'order' ? 'Order Linked ✓' : 'Number Saved ✓'}
                      </p>
                      <p className="mt-1 text-sm font-bold text-white tracking-widest">{savedPhone}</p>
                    </div>
                    {confirmState === 'order' && (
                      <button
                        onClick={revealReceipt}
                        className="w-full bg-white text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] italic"
                      >
                        View Receipt Now
                      </button>
                    )}
                  </div>
                ) : (
                  <ModalPhoneForm
                    transactionId={txData.id}
                    submitLabel={giftRequired ? 'Confirm & Unlock Receipt' : 'Save Number'}
                    onSaved={handlePhoneSaved}
                  />
                )}
              </div>

              {!giftRequired && !confirmState && (
                <button
                  onClick={closeCapture}
                  className="mt-4 w-full py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.28em] text-white/50 hover:text-white italic"
                >
                  Skip & View Receipt
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[8px] animate-pulse tracking-[0.5em] text-emerald-500">Decrypting Transaction Intel...</p>
        </div>
      )}
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SuccessContent />
    </Suspense>
  )
}
