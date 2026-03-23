'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function InfluencerMarketplace() {
  const [filter, setFilter] = useState<'partners' | 'new' | 'offers'>('new')
  const [brands, setBrands] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [activeOffer, setActiveOffer] = useState<any>(null)
  
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (filter === 'offers') {
      const { data } = await supabase
        .from('requests')
        .select(`*, sender:profiles!sender_id(full_name), deal:deals(*)`)
        .eq('receiver_id', user?.id)
        .eq('status', 'deal_offered')
      setOffers(data || [])
    } else {
      const { data: brandsData } = await supabase.from('profiles').select('*').eq('role', 'brand')
      const { data: partnersData } = await supabase.from('partnerships').select('brand_id').eq('influencer_id', user?.id).eq('status', 'active')
      const partnerIds = partnersData?.map(p => p.brand_id) || []
      setBrands(brandsData?.map(b => ({ ...b, isPartner: partnerIds.includes(b.id) })) || [])
    }
    setLoading(false)
  }

  const handleRequestBrand = async () => {
    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('requests').insert([{
      sender_id: user?.id,
      receiver_id: selectedBrand.id,
      message,
      type: 'influencer_to_brand',
      status: 'pending'
    }])
    setSelectedBrand(null); setMessage(''); fetchData();
    setIsSubmitting(false)
  }

  const handleRejectOffer = async (offerId: string) => {
    await supabase.from('requests').delete().eq('id', offerId)
    setActiveOffer(null)
    fetchData()
  }

  const handleAcceptOffer = async () => {
    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error: partError } = await supabase.from('partnerships').insert([{
      brand_id: activeOffer.sender_id,
      influencer_id: user?.id,
      deal_id: activeOffer.deal_id,
      total_percentage: activeOffer.proposed_percentage,
      status: 'active'
    }])

    if (partError) {
      console.error("Partnership Error:", partError)
      alert(`ACCEPT FAILED: ${partError.message}`)
      setIsSubmitting(false)
      return
    }

    await supabase.from('requests').update({ status: 'accepted' }).eq('id', activeOffer.id)
    
    alert("NODE ACTIVATED: DEAL IS LIVE IN YOUR VAULT")
    setActiveOffer(null)
    setFilter('partners')
    fetchData()
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-8 md:p-12 font-sans italic uppercase font-black">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-8">
        <div>
          <h1 className="text-5xl tracking-tighter italic leading-none uppercase">Brand <span className="text-emerald-500">Marketplace</span></h1>
        </div>
        <div className="flex bg-[#040d08] p-1.5 rounded-[22px] border border-white/5">
          {['partners', 'new', 'offers'].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab as any)}
              className={`px-8 py-3 rounded-[18px] text-[9px] tracking-widest transition-all ${filter === tab ? 'bg-emerald-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>
              {tab === 'offers' ? 'Incoming Offers' : tab === 'partners' ? 'My Partners' : 'New Opportunities'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filter === 'offers' ? (
          offers.map(offer => (
            <div key={offer.id} className="bg-[#040d08] border border-emerald-500/20 rounded-[40px] p-8 flex flex-col justify-between group">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="h-28 w-28 rounded-[24px] bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden relative shadow-lg">
                   {offer.deal?.logo?.startsWith('http') ? (
                     <img src={offer.deal.logo} alt="" className="absolute inset-0 h-full w-full object-cover filter brightness-105" />
                   ) : (
                     <span className="text-5xl">{offer.deal?.logo || '🏢'}</span>
                   )}
                </div>
                <h3 className="text-2xl text-center leading-none mt-2">{offer.sender?.full_name}</h3>
              </div>
              <div className="flex gap-4 w-full">
                <button onClick={() => setActiveOffer(offer)} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] tracking-widest hover:bg-emerald-500 transition-all">REVIEW</button>
                <button onClick={() => handleRejectOffer(offer.id)} className="px-6 py-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px]">Reject</button>
              </div>
            </div>
          ))
        ) : (
          brands.filter(b => filter === 'partners' ? b.isPartner : !b.isPartner).map(brand => (
            <div key={brand.id} className="bg-[#040d08]/60 border border-white/5 rounded-[45px] p-10 flex flex-col items-center gap-6 group hover:border-emerald-500/30 transition-all">
              
              {/* 🚀 ლოგოს კონტეინერი - გაზრდილი ზომით (h-32 w-32) */}
              <div className="h-32 w-32 rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden relative shadow-xl transition-all group-hover:border-emerald-500/50">
                {brand.avatar_url ? (
                  <img src={brand.avatar_url} alt={brand.full_name} className="absolute inset-0 h-full w-full object-cover filter brightness-110" />
                ) : (
                  <span className="text-5xl opacity-20 italic">🏢</span>
                )}
              </div>

              <h3 className="text-2xl text-center">{brand.full_name}</h3>
              <button onClick={() => setSelectedBrand(brand)} disabled={brand.isPartner} className={`w-full py-5 rounded-[25px] text-[10px] tracking-widest italic font-black ${brand.isPartner ? 'bg-emerald-500/5 text-emerald-500' : 'bg-white text-black hover:bg-emerald-500'}`}>
                {brand.isPartner ? 'Secured Node' : 'Initialize Connection'}
              </button>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {activeOffer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <div className="absolute inset-0 bg-black/90" onClick={() => setActiveOffer(null)} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-[#020502] border border-emerald-500/30 rounded-[60px] p-12 pt-16 max-w-md w-full shadow-2xl">
              <button onClick={() => setActiveOffer(null)} className="absolute top-8 right-8 h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all">X</button>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-32 h-32 mb-6 bg-white/[0.03] rounded-[28px] border border-white/10 flex items-center justify-center overflow-hidden relative shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                   {activeOffer.deal?.logo?.startsWith('http') ? (
                     <img src={activeOffer.deal.logo} alt="" className="absolute inset-0 h-full w-full object-cover filter brightness-105" />
                   ) : (
                     <span className="text-6xl">{activeOffer.deal?.logo || '🏢'}</span>
                   )}
                </div>
                <h2 className="text-4xl uppercase tracking-tighter leading-none mb-2">{activeOffer.sender?.full_name}</h2>
                <p className="text-emerald-500 text-[10px] tracking-[0.4em] uppercase mt-2">{activeOffer.deal?.title}</p>
              </div>
              <div className="text-center mb-10">
                <h3 className="text-[110px] font-black italic tracking-tighter text-white leading-none drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  {activeOffer.proposed_percentage}<span className="text-4xl not-italic font-light ml-1 text-emerald-500">%</span>
                </h3>
              </div>
              <div className="flex gap-4">
                <button onClick={handleAcceptOffer} disabled={isSubmitting} className="flex-1 py-5 bg-emerald-500 text-black rounded-3xl text-[11px] tracking-widest hover:scale-105 transition-all font-black uppercase italic shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  Accept Deal
                </button>
                <button onClick={() => handleRejectOffer(activeOffer.id)} disabled={isSubmitting} className="px-8 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-3xl text-[11px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">
                  Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}