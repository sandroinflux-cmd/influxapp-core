'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function BrandDealsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [flippedId, setFlippedId] = useState<string | null>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [newShare, setNewShare] = useState('')
  const [giftDescription, setGiftDescription] = useState('')
  const [giftThreshold, setGiftThreshold] = useState('')
  const [giftImageUrl, setGiftImageUrl] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingGift, setUploadingGift] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [brandProfile, setBrandProfile] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, sector, address, bio')
        .eq('id', user.id)
        .single()
        
      if (profile) setBrandProfile(profile)

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false })
        
      if (error) console.error("Fetch Deals Error:", error)
      setDeals(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setNewShare('')
    setGiftDescription('')
    setGiftThreshold('')
    setGiftImageUrl('')
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  const openEdit = (deal: any, event: React.MouseEvent) => {
    event.stopPropagation()
    setEditingId(deal.id)
    setNewShare(String(deal.totalShare ?? ''))
    setGiftDescription(deal.gift_description || '')
    setGiftThreshold(Number(deal.gift_threshold) > 0 ? String(deal.gift_threshold) : '')
    setGiftImageUrl(deal.gift_image_url || '')
    setIsCreating(true)
  }

  const handleGiftUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUploadingGift(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `gift-images/${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath)
      setGiftImageUrl(publicUrl)
    } catch (error: any) {
      alert('Matrix Upload Error: ' + error.message)
    } finally {
      setUploadingGift(false)
    }
  }

  const handleCreate = async () => {
    if(!newShare) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const giftFields = {
      gift_description: giftDescription.trim() || null,
      gift_threshold: Number(giftThreshold) || 0,
      gift_image_url: giftImageUrl.trim() || null,
    }

    if (editingId) {
      const { data, error } = await supabase
        .from('deals')
        .update({ totalShare: parseInt(newShare), ...giftFields })
        .eq('id', editingId)
        .select()
        .single()
      if (error) {
        alert(error.message)
        return
      }
      if (data) setDeals(deals.map((deal) => deal.id === data.id ? data : deal))
      setIsCreating(false)
      resetForm()
      return
    }

    const newDeal = {
      brand_id: user.id,
      title: brandProfile?.full_name || 'MATRIX BRAND',
      totalShare: parseInt(newShare), 
      logo: brandProfile?.avatar_url || '💠',
      intel: { 
        type: brandProfile?.sector || 'Active Venture', 
        location: brandProfile?.address || 'Digital Node', 
        phone: brandProfile?.bio || 'Mission intel remains classified.' 
      },
      ...giftFields,
    }

    const { data, error } = await supabase.from('deals').insert([newDeal]).select().single()
    if (error) {
      alert(error.message)
      return
    }
    if (data) setDeals([data, ...deals])
    setIsCreating(false)
    resetForm()
  }

  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-12 max-w-6xl mx-auto pb-32 font-sans text-white overflow-x-hidden">
      
      {/* 💠 Header */}
      <header className="flex justify-between items-center border-b border-white/5 pb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none">
            Deal <span className="text-blue-500 italic">Assets</span>
          </h1>
          <p className="text-[7px] md:text-[8px] font-black tracking-[0.5em] text-gray-600 uppercase mt-4 italic">Matrix Deployment Hub</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all italic shadow-[0_0_30px_rgba(59,130,246,0.2)]"
        >
          Create New Deal +
        </button>
      </header>

      {/* 🏗️ Deal Creator Panel */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/40"
          >
            <div className="bg-[#020502] border border-blue-500/30 rounded-[40px] p-8 md:p-10 w-full max-w-md relative shadow-2xl">
              <button onClick={() => { setIsCreating(false); resetForm() }} className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all italic font-black">X</button>
              <div className="flex flex-col items-center gap-6 max-h-[78vh] overflow-y-auto pr-1">
                <div className="w-full space-y-4 text-center">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic block">Set Share (%)</label>
                  <input value={newShare} onChange={(e)=>setNewShare(e.target.value)} type="number" placeholder="00" className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-5xl text-white text-center focus:border-blue-500 outline-none transition-all font-black italic shadow-inner" />
                </div>
                <div className="w-full space-y-3">
                  <label className="text-[9px] font-black text-amber-300/80 uppercase tracking-[0.35em] italic block text-center">Optional Gift</label>
                  <input value={giftDescription} onChange={(e) => setGiftDescription(e.target.value)} type="text" placeholder="Free Gift Box / Dessert" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white text-center focus:border-amber-300/50 outline-none transition-all font-bold italic" />
                  <input value={giftThreshold} onChange={(e) => setGiftThreshold(e.target.value)} type="number" min="0" placeholder="Threshold GEL (0 = any purchase)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white text-center focus:border-amber-300/50 outline-none transition-all font-bold italic" />
                  <input value={giftImageUrl} onChange={(e) => setGiftImageUrl(e.target.value)} type="url" placeholder="Gift image URL" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[11px] text-white text-center focus:border-amber-300/50 outline-none transition-all font-bold" />
                  <label className="block w-full cursor-pointer bg-white/5 border border-dashed border-white/15 rounded-2xl py-3 text-center text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white hover:border-amber-300/40 transition-all italic">
                    {uploadingGift ? 'Uploading...' : giftImageUrl ? 'Replace Gift Image' : 'Upload Gift Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleGiftUpload} disabled={uploadingGift} />
                  </label>
                  {giftImageUrl.startsWith('http') && (
                    <img src={giftImageUrl} alt="gift" className="mx-auto h-16 w-16 rounded-2xl object-cover border border-white/10" />
                  )}
                </div>
                <button onClick={handleCreate} disabled={uploadingGift} className="bg-white text-black w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all italic shadow-xl active:scale-95 disabled:opacity-40">{editingId ? 'SAVE' : 'CREATE'}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📜 Deal Inventory */}
      {loading ? (
        <div className="text-center py-20 opacity-50 tracking-widest uppercase text-xs italic">Syncing Ledger...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {deals.map((deal) => (
            <div key={deal.id} className="relative group h-[480px]" style={{ perspective: '2000px' }}>
              <motion.div 
                className="w-full h-[450px] relative cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flippedId === deal.id ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                onClick={() => setFlippedId(flippedId === deal.id ? null : deal.id)}
              >
                {/* 💠 FRONT */}
                <div className="absolute inset-0 bg-[#020502] border border-white/10 rounded-[60px] p-8 flex flex-col justify-between shadow-2xl group-hover:border-blue-500/40 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
                  {deal.gift_description && (
                    <div className="absolute top-6 left-6 right-6 z-10 flex justify-center pointer-events-none">
                      <span className="max-w-full truncate px-3 py-1 rounded-full border border-amber-300/40 bg-amber-400/10 text-[8px] font-black uppercase tracking-[0.18em] text-amber-200 italic">
                        🎁 {deal.gift_description}{Number(deal.gift_threshold) > 0 ? ` · ${Number(deal.gift_threshold)} GEL` : ''}
                      </span>
                    </div>
                  )}
                  
                  {/* 🖼️ AVATAR & NAME SECTION */}
                  <div className="flex flex-col items-center text-center w-full mt-2">
                    {/* ✅ 20%-ით შემცირებული ლოგოს კონტეინერი */}
                    <div className="h-32 w-32 md:h-40 md:w-40 mx-auto rounded-[32px] bg-white/[0.03] border-2 border-white/10 flex items-center justify-center mb-6 shadow-lg overflow-hidden relative">
                      {deal.logo?.startsWith('http') ? (
                        <img src={deal.logo} alt={deal.title} className="absolute inset-0 h-full w-full object-cover filter brightness-105" />
                      ) : (
                        // ✅ დაპატარავებული ტექსტური ლოგო
                        <span className="text-5xl">{deal.logo}</span>
                      )}
                    </div>
                    {/* 📝 გაზრდილი სათაური */}
                    <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      {deal.title}
                    </h3>
                  </div>

                  <div className="text-center mt-auto">
                    <h3 className="text-8xl md:text-[110px] font-black italic tracking-tighter text-white group-hover:text-blue-500 transition-colors leading-none">
                      {deal.totalShare}<span className="text-2xl md:text-3xl not-italic font-light ml-1">%</span>
                    </h3>
                  </div>

                  <div className="text-center italic mt-6 pb-2 flex flex-col items-center gap-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] animate-pulse opacity-30">Double Tap to Flip</p>
                    <button
                      onClick={(event) => openEdit(deal, event)}
                      onPointerDown={(event) => event.stopPropagation()}
                      className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white hover:border-blue-500/40 transition-all"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* 💠 BACK (Passport Style) */}
                <div 
                  className="absolute inset-0 bg-black border border-blue-500/20 rounded-[60px] p-12 flex flex-col justify-between shadow-2xl" 
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="space-y-8">
                    {/* ✅ "ABOUT BRAND" სათაური */}
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] italic border-b border-white/10 pb-4">About Brand</h4>
                    
                    <div className="space-y-6">
                      <div className="group/item">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1 italic">Sector Node</span>
                        <p className="text-lg font-black text-white italic uppercase leading-none">
                          {deal.intel?.type}
                        </p>
                      </div>

                      <div className="group/item">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1 italic">HQ Location</span>
                        <p className="text-lg font-black text-white italic uppercase leading-none">
                          {deal.intel?.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Bio/Mission ბლოკი */}
                  <div className="bg-white/[0.04] border border-white/10 rounded-[35px] p-8 mt-2 shadow-inner">
                    <span className="text-[7px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-4 italic">Message / Intel</span>
                    <p className="text-lg font-black text-white uppercase leading-tight italic tracking-tighter">
                      {deal.intel?.phone}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}