'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const isValidGeorgianIban = (iban?: string | null) =>
  /^GE\d{2}[A-Z]{2}[A-Z0-9]{16}$/.test((iban || '').replace(/\s+/g, '').toUpperCase())

export default function MyDealsPage() {
  const [activeDeals, setActiveDeals] = useState<any[]>([])
  const [profileIban, setProfileIban] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [flippedId, setFlippedId] = useState<string | null>(null)

  const [splittingDeal, setSplittingDeal] = useState<any | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)

  useEffect(() => {
    fetchMyDeals()
  }, [])

  const fetchMyDeals = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const [{ data: profileData }, { data, error }] = await Promise.all([
          supabase.from('profiles').select('iban, username').eq('id', user.id).single(),
          supabase
            .from('partnerships')
            .select('*, deals(*)')
            .eq('influencer_id', user.id)
            .eq('status', 'active')
        ])

        setUserId(user.id)
        setUsername(profileData?.username || null)
        setProfileIban(profileData?.iban || null)
        if (error) throw error
        if (data) setActiveDeals(data)
      }
    } catch (err: any) {
      console.error('Fetch error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const finalizePush = async () => {
    if (!splittingDeal) return
    if (!isValidGeorgianIban(profileIban)) {
      alert('გთხოვთ, ჯერ მიუთითოთ ვალიდური ქართული IBAN (GE...) Settings გვერდზე.')
      return
    }

    setIsDeploying(true)

    try {
      const currentDeal = Array.isArray(splittingDeal.deals) ? splittingDeal.deals[0] : splittingDeal.deals
      const shareCap = Number(currentDeal?.totalShare ?? splittingDeal?.total_percentage ?? 0)
      const influencerCut = Number.isFinite(shareCap) ? Math.max(0, shareCap) : 0

      const { data, error } = await supabase
        .from('partnerships')
        .update({
          user_discount_pct: 0,
          influencer_cut_pct: influencerCut,
          is_pushed_to_token: true
        })
        .eq('id', splittingDeal.id)
        .select()

      if (error) throw new Error(error.message)

      if (!data || data.length === 0) {
        throw new Error('Update Blocked! Row Level Security (RLS) restricts this action in Supabase.')
      }

      setActiveDeals(prev =>
        prev.map(deal =>
          deal.id === splittingDeal.id
            ? {
                ...deal,
                is_pushed_to_token: true,
                user_discount_pct: 0,
                influencer_cut_pct: influencerCut
              }
            : deal
        )
      )

      setSplittingDeal(null)
    } catch (err: any) {
      alert('MATRIX ERROR: ' + err.message)
    } finally {
      setIsDeploying(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#010201] flex items-center justify-center">
      <p className="text-emerald-500 font-black italic animate-pulse uppercase tracking-[0.5em]">Syncing Matrix Assets...</p>
    </div>
  )

  const modalDealData = splittingDeal ? (Array.isArray(splittingDeal.deals) ? splittingDeal.deals[0] : splittingDeal.deals) : null
  const modalTotalShare = Number(modalDealData?.totalShare ?? splittingDeal?.total_percentage ?? 0)
  const hasValidIban = isValidGeorgianIban(profileIban)

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey((current) => current === key ? null : current), 2000)
    } catch {
      alert(value)
    }
  }

  const bioLink = () => {
    if (!userId || typeof window === 'undefined') return ''
    return username
      ? `${window.location.origin}/${username}`
      : `${window.location.origin}/claim?ref=${userId}`
  }

  const storyLink = (dealId: string) => {
    if (!userId || typeof window === 'undefined') return ''
    return `${window.location.origin}/pay?deal=${dealId}&ref=${userId}`
  }

  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-12 max-w-6xl mx-auto pb-32 font-sans text-white overflow-x-hidden">
      <header className="flex justify-between items-center gap-4 border-b border-white/5 pb-10 italic font-black uppercase">
        <div>
          <h1 className="text-4xl tracking-tighter leading-none">My <span className="text-emerald-500 italic">Vault</span></h1>
          <p className="text-[7px] tracking-[0.5em] text-gray-600 mt-4 leading-none">Authorized Matrix Node Access</p>
        </div>
        <button
          type="button"
          disabled={!userId}
          onClick={() => copyText('bio', bioLink())}
          className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-[10px] tracking-[0.2em] text-emerald-300 disabled:opacity-40"
        >
          {copiedKey === 'bio' ? 'Copied' : 'Copy Bio Link'}
        </button>
      </header>

      {!hasValidIban && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
            ⚠️ ტოკენზე შეთავაზების გასაშვებად აუცილებელია ვალიდური ქართული IBAN ანგარიშის მითითება.
          </p>
          <Link
            href="/dashboard/influencer/settings"
            className="px-6 py-3 bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shrink-0"
          >
            Set IBAN in Settings
          </Link>
        </div>
      )}

      <AnimatePresence>
        {splittingDeal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
            <div className="bg-[#020502] border border-emerald-500/30 rounded-[40px] p-10 w-full max-w-md shadow-2xl text-center italic font-black uppercase">
              <div className="space-y-10">
                <div>
                  <span className="text-[8px] text-gray-500 tracking-widest block mb-2 leading-none">Total Share Power</span>
                  <p className="text-5xl">{modalTotalShare}%</p>
                </div>

                <p className="text-[9px] text-gray-500 tracking-widest leading-relaxed normal-case not-italic">
                  Buyer savings are already set by the bundle price. Your commission is {modalTotalShare}% of each sale.
                </p>

                <button
                  disabled={isDeploying || !hasValidIban}
                  onClick={finalizePush}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  {isDeploying ? 'SYNCING...' : 'CONFIRM PROTOCOL'}
                </button>
                <button onClick={() => setSplittingDeal(null)} className="text-[8px] opacity-30 mt-4 tracking-widest uppercase hover:text-white">Abort</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {activeDeals.map((item) => {
          const dealData = Array.isArray(item.deals) ? item.deals[0] : item.deals
          const totalShare = Number(dealData?.totalShare ?? item.total_percentage ?? 0)

          return (
            <div key={item.id} className="relative group h-[480px]" style={{ perspective: '2000px' }}>
              <motion.div
                className="w-full h-[450px] relative cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flippedId === item.id ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
                onClick={() => setFlippedId(flippedId === item.id ? null : item.id)}
              >
                {/* FRONT SIDE */}
                <div
                  className="absolute inset-0 bg-[#020502] border border-white/10 rounded-[60px] p-8 flex flex-col justify-between shadow-2xl group-hover:border-emerald-500/40 transition-colors duration-500 overflow-hidden"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="flex flex-col items-center text-center w-full mt-2">
                    <div className="h-32 w-32 md:h-40 md:w-40 mx-auto rounded-[32px] bg-white/[0.03] border-2 border-white/10 flex items-center justify-center mb-6 shadow-lg overflow-hidden relative">
                      {dealData?.logo?.startsWith('http') ? (
                        <img src={dealData.logo} alt="brand" className="absolute inset-0 h-full w-full object-cover filter brightness-105" />
                      ) : (
                        <span className="text-5xl">{dealData?.logo || '💠'}</span>
                      )}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      {dealData?.title || 'MATRIX NODE'}
                    </h3>
                  </div>

                  <div className="text-center mt-auto">
                    <h3 className="text-8xl md:text-[110px] font-black italic tracking-tighter text-white group-hover:text-emerald-500 transition-colors leading-none drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                      {totalShare}<span className="text-2xl md:text-3xl not-italic font-light ml-1 opacity-40">%</span>
                    </h3>
                    {item.is_pushed_to_token && (
                      <p className="text-[9px] text-emerald-400 uppercase tracking-widest mt-2 font-black">
                        User: {item.user_discount_pct ?? 0}% | You: {item.influencer_cut_pct ?? 0}%
                      </p>
                    )}
                    {item.is_pushed_to_token && dealData?.id && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          copyText(`story-${item.id}`, storyLink(dealData.id))
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                        className="mt-3 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[8px] font-black uppercase tracking-[0.18em] text-white/80 hover:border-emerald-400/50 hover:text-emerald-300"
                      >
                        {copiedKey === `story-${item.id}` ? 'Copied' : 'Copy Direct Story Link'}
                      </button>
                    )}
                  </div>

                  <div className="relative w-full h-12 flex justify-center items-end pb-2">
                    <div className="text-center opacity-30 italic absolute transition-opacity duration-300 group-hover:opacity-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.5em] animate-pulse">Double Tap to Flip</p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 absolute w-full z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSplittingDeal(item)
                        }}
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all italic active:scale-95 shadow-xl ${
                          item.is_pushed_to_token
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                            : 'bg-white text-black hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        {item.is_pushed_to_token ? 'SYNCED ✓' : 'ADD TO TOKEN'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div
                  className="absolute inset-0 bg-black border border-emerald-500/20 rounded-[60px] p-12 flex flex-col justify-between shadow-2xl"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="space-y-8 font-black italic uppercase leading-none">
                    <h4 className="text-[10px] text-emerald-500 tracking-[0.6em] border-b border-white/10 pb-4">About Brand</h4>

                    <div className="space-y-6">
                      <div className="group/item">
                        <span className="text-[8px] text-gray-600 tracking-widest block mb-1">Sector Node</span>
                        <p className="text-lg text-white leading-none">
                          {dealData?.intel?.type || 'Active Venture'}
                        </p>
                      </div>

                      <div className="group/item">
                        <span className="text-[8px] text-gray-600 tracking-widest block mb-1">HQ Location</span>
                        <p className="text-lg text-white leading-none">
                          {dealData?.intel?.location || 'Digital Node'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.04] border border-white/10 rounded-[35px] p-8 mt-2 shadow-inner">
                    <span className="text-[7px] text-emerald-500 tracking-[0.4em] block mb-4 italic font-black uppercase">Message / Intel</span>
                    <p className="text-lg text-white leading-tight tracking-tighter italic font-black uppercase line-clamp-3">
                      {dealData?.intel?.phone || 'Mission intel remains classified.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}