'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'

// Sub-component to render individual deal cards on the back of the token
function GridDealCard({ deal }: { deal: any }) {
  const [isGridCardFlipped, setIsGridCardFlipped] = useState(false)

  return (
    <motion.div 
      className="relative cursor-pointer h-full"
      style={{ transformStyle: 'preserve-3d', perspective: "1000px" }}
      animate={{ rotateY: isGridCardFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      onClick={(e) => { e.stopPropagation(); setIsGridCardFlipped(!isGridCardFlipped); }}
    >
      {/* 💠 FRONT DEAL SIDE */}
      <div 
        className="absolute inset-0 bg-[#020502] border border-white/10 rounded-[45px] p-6 flex flex-col justify-between shadow-inner hover:border-emerald-500/20 transition-all duration-700 relative overflow-hidden group/deal" 
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      >
        <div className="absolute inset-0 bg-emerald-500/[0.01] opacity-0 group-hover/deal:opacity-100 transition-opacity blur-xl rounded-full" />
        
        {/* 🖼️ AVATAR & NAME SECTION (გაზრდილი, Brand Deals სტილში) */}
        <div className="flex flex-col items-center text-center w-full mt-2 relative z-10">
          <div className="h-14 w-14 md:h-16 md:w-16 mx-auto rounded-2xl bg-white/[0.03] border-2 border-white/10 flex items-center justify-center mb-3 shadow-lg overflow-hidden relative">
            {deal.logo?.startsWith('http') ? (
              <img src={deal.logo} alt={deal.brand} className="absolute inset-0 h-full w-full object-cover filter brightness-105" />
            ) : (
              <span className="text-2xl">{deal.logo || '💠'}</span>
            )}
          </div>
          <h3 className="text-[10px] md:text-[12px] font-black text-white italic uppercase tracking-widest leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            {deal.brand}
          </h3>
        </div>

        <h2 className="text-5xl md:text-6xl text-center py-4 text-emerald-500 text-glow leading-none relative z-10 tracking-tighter uppercase font-black italic">
          {deal.offer}
        </h2>
        
        <div className="relative z-10 opacity-0 group-hover/deal:opacity-100 transition-opacity">
           <button className="text-[7px] text-gray-700 pt-3 text-center tracking-[0.4em] leading-none uppercase font-black italic hover:text-emerald-500 transition-colors w-full">Tap to INSPECT INTEL</button>
        </div>
      </div>

      {/* 💠 BACK DEAL SIDE (Passport Style, მორგებული პატარა ბარათზე) */}
      <div 
        className="absolute inset-0 bg-black border border-emerald-500/20 rounded-[45px] p-6 flex flex-col justify-between shadow-inner" 
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <div className="space-y-4 font-black italic uppercase leading-none">
          <h4 className="text-[9px] text-emerald-500 tracking-[0.5em] border-b border-white/10 pb-2">About Brand</h4>
          
          <div className="space-y-3">
            <div className="group/item">
              <span className="text-[7px] text-gray-600 tracking-widest block mb-1">Sector Node</span>
              <p className="text-sm text-white leading-none truncate">
                {deal.intel?.type || 'Active Venture'}
              </p>
            </div>

            <div className="group/item">
              <span className="text-[7px] text-gray-600 tracking-widest block mb-1">HQ Location</span>
              <p className="text-sm text-white leading-none truncate">
                {deal.intel?.location || 'Digital Node'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-[20px] p-4 mt-2 shadow-inner">
          <span className="text-[6px] text-emerald-500 tracking-[0.4em] block mb-2 italic font-black uppercase">Message / Intel</span>
          <p className="text-[10px] text-white leading-tight tracking-tighter italic font-black uppercase line-clamp-3">
            {deal.backIntelPhone || deal.intel?.phone || 'Mission intel remains classified.'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function TokenForge() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [liveDeals, setLiveDeals] = useState<any[]>([])
  const [profile, setProfile] = useState<{ id: string; full_name: string; avatar_url: string } | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 60, damping: 50 })
  const mouseYSpring = useSpring(y, { stiffness: 60, damping: 50 })

  const rotateX = useTransform(mouseYSpring, [-300, 300], [5, -5])
  const rotateY = useTransform(mouseXSpring, [-300, 300], [-5, 5])

  const fetchAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profData } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', user.id).single()
      if (profData) setProfile(profData)
      setIsProfileLoading(false)

      const { data: dealsData } = await supabase.from('partnerships').select('*, deals(*)').eq('influencer_id', user.id)
      if (dealsData) {
        const pushedDeals = dealsData.filter((d: any) => d.is_pushed_to_token === true)
        setLiveDeals(pushedDeals.map((d: any, i: number) => ({
          id: d.id || i,
          brand: d.deals?.title || 'MATRIX NODE',
          offer: `${d.user_discount_pct || 0}% OFF`,
          logo: d.deals?.logo || '💎',
          backIntelPhone: d.deals?.intel?.phone || 'Secret Node',
          intel: d.deals?.intel || {} // ვამატებთ მთლიან intel ობიექტს
        })))
      }
    } catch (err: any) { console.error(err) }
  }

  useEffect(() => {
    fetchAllData()
    const channel = supabase.channel('token-forge-pulse').on('postgres_changes', { event: '*', schema: 'public', table: 'partnerships' }, () => fetchAllData()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // ✅ ✅ ✅ ლინკის გაზიარების ლოგიკა
  const handleDeployLink = () => {
    if (!profile) return
    const deployUrl = `${window.location.origin}/claim?ref=${profile.id}`
    navigator.clipboard.writeText(deployUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 overflow-hidden font-sans flex flex-col items-center relative">
      
      <div className="absolute inset-0 bg-black/50 bg-[linear-gradient(rgba(16,185,129,0.02)_1.5px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1.5px,transparent_1px)] bg-[size:30px_30px] opacity-30" />

      <header className="w-full mb-8 flex justify-between items-start z-10">
        <div>
           <span className="text-emerald-500/40 text-[9px] tracking-[0.8em] mb-4 block leading-none font-black uppercase italic">Matrix Node Asset v1.0</span>
           <h1 className="text-7xl tracking-tighter uppercase leading-none font-black italic">Token</h1>
        </div>
        
        {/* ✅ ✅ ✅ Deployment Button */}
        <button 
          onClick={handleDeployLink}
          className={`mt-4 px-10 py-4 rounded-full border-2 transition-all duration-500 font-black text-[10px] uppercase tracking-[0.3em] italic ${isCopied ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-emerald-500/40 bg-white/5'}`}
        >
          {isCopied ? 'Transmission Sent ✓' : 'Deploy Asset Link +'}
        </button>
      </header>

      <div 
        className="flex-1 flex flex-col items-center justify-center w-full relative z-10 mt-[-40px]"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          x.set(e.clientX - (rect.left + rect.width / 2))
          y.set(e.clientY - (rect.top + rect.height / 2))
        }}
        onMouseLeave={() => { x.set(0); y.set(0) }}
        onDoubleClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          style={{ rotateX: isFlipped ? 0 : rotateX, rotateY: isFlipped ? 180 : rotateY, transformStyle: "preserve-3d", perspective: "2000px" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
          className="w-[420px] h-[680px] relative cursor-pointer"
        >
          {/* === FRONT === */}
          <div className="absolute inset-0 bg-[#040d08]/98 border-2 border-emerald-500/10 rounded-[55px] p-8 pt-12 pb-14 flex flex-col items-center justify-between shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98115,transparent_75%)]" />
              
              <div className="mt-2 flex-1 w-full relative flex flex-col items-center justify-start">
                {isProfileLoading ? (
                  <div className="animate-pulse h-96 w-96 bg-emerald-500/10 rounded-[40px]" />
                ) : (
                  <motion.img 
                    src={profile?.avatar_url || ''} 
                    className="h-96 w-96 object-cover rounded-[40px] filter brightness-110 drop-shadow-[0_0_80px_#10b981cc]"
                    animate={{ y: [0, -20, 0], rotateY: [0, 15, -15, 0], scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
                  />
                )}
                <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none text-glow text-center w-full px-4 break-words mt-4">
                  {profile?.full_name || 'SYNC NODE MASTER'}
                </h3>
              </div>

              <div className="w-full flex justify-center pb-2">
                <p className="text-[10px] opacity-30 tracking-[0.4em] font-black uppercase leading-none animate-pulse">Double Tap to Flip</p>
              </div>
          </div>

          {/* === BACK === */}
          <div className="absolute inset-0 bg-[#010201] border-2 border-white/10 rounded-[55px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <div className="w-full h-full p-8 pt-10 bg-[radial-gradient(circle_at_0%_0%,#ffffff03,transparent_60%)]">
              <div className="grid grid-cols-2 grid-rows-2 gap-5 h-full">
                {liveDeals.length > 0 ? liveDeals.map((deal) => (
                    <GridDealCard key={deal.id} deal={deal} />
                )) : (
                  <div className="col-span-2 py-40 text-center opacity-20 italic font-black uppercase">
                    <p className="text-[11px] tracking-widest">No Sync Detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}