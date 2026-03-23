'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

// ✅ 1. განახლებული GridDealCard - მაქსიმალური აქცენტით
function GridDealCard({ deal, currentBrandId }: { deal: any, currentBrandId?: string | null }) {
  const [isGridCardFlipped, setIsGridCardFlipped] = useState(false)
  const isMyDeal = deal.brandId === currentBrandId

  return (
    <motion.div 
      className="relative cursor-pointer h-[240px]" 
      style={{ transformStyle: 'preserve-3d', perspective: "1000px" }}
      animate={{ 
        rotateY: isGridCardFlipped ? 180 : 0,
        scale: isMyDeal ? [1, 1.02, 1] : 1 // 🚀 თქვენი დილი ოდნავ "სუნთქავს" ზომაშიც
      }}
      transition={{ 
        rotateY: { duration: 0.6, type: "spring", stiffness: 200, damping: 20 },
        scale: { repeat: Infinity, duration: 4, ease: "easeInOut" }
      }}
      onClick={(e) => { e.stopPropagation(); setIsGridCardFlipped(!isGridCardFlipped); }}
    >
      {/* 💠 FRONT SIDE */}
      <div 
        className={`absolute inset-0 bg-[#020502] border-2 rounded-[35px] p-5 flex flex-col justify-between shadow-inner relative overflow-hidden group/deal transition-all duration-500
          ${isMyDeal 
            ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] z-10' 
            : 'border-white/10'}`} 
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}
      >
        {/* 🚀 აციმციმებული ფონი მხოლოდ თქვენი დილისთვის */}
        {isMyDeal && (
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-emerald-500/20 blur-[40px] pointer-events-none" 
          />
        )}

        {/* 🚀 "YOUR NODE" მარკერი */}
        {isMyDeal && (
          <div className="absolute top-4 right-5 flex items-center gap-1.5 z-20">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[7px] font-black text-emerald-500 tracking-[0.2em] italic uppercase">Your Node</span>
          </div>
        )}
        
        <div className="flex flex-col items-center gap-2 relative z-10 text-center mt-2">
            <div className={`h-12 w-12 rounded-2xl bg-white/[0.03] border-2 ${isMyDeal ? 'border-emerald-400 shadow-[0_0_15px_#10b981]' : 'border-white/10'} flex items-center justify-center overflow-hidden transition-all`}>
               {deal.logo?.startsWith('http') 
                  ? <img src={deal.logo} alt="brand" className="h-full w-full object-cover filter brightness-110" /> 
                  : <span className="text-xl">{deal.logo || '💎'}</span>}
            </div>
            <h3 className={`text-[8px] tracking-widest truncate w-full uppercase font-black italic mt-1 ${isMyDeal ? 'text-emerald-400 opacity-100' : 'text-white opacity-60'}`}>
              {deal.brand}
            </h3>
        </div>
        
        <h2 className={`text-4xl text-center py-2 leading-none relative z-10 tracking-tighter uppercase font-black italic transition-all ${isMyDeal ? 'text-white text-glow-emerald scale-110' : 'text-emerald-500 text-glow'}`}>
          {deal.offer}
        </h2>
        
        <div className={`text-[6px] text-center tracking-[0.3em] uppercase font-black italic transition-opacity relative z-10 pb-1 ${isMyDeal ? 'text-emerald-500 opacity-100' : 'text-gray-700 opacity-0 group-hover/deal:opacity-100'}`}>
          {isMyDeal ? 'CONNECTED' : 'Tap to INSPECT'}
        </div>
      </div>

      {/* 💠 BACK SIDE */}
      <div 
        className={`absolute inset-0 bg-black border-2 ${isMyDeal ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-emerald-500/20'} rounded-[35px] p-5 flex flex-col justify-between shadow-inner transition-all`} 
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}
      >
        <div className="space-y-3 font-black italic uppercase leading-none">
          <h4 className="text-[8px] text-emerald-500 tracking-[0.4em] border-b border-white/10 pb-2 text-center">Brand Intel</h4>
          
          <div className="space-y-2">
            <div>
              <span className="text-[6px] text-gray-600 tracking-widest block mb-0.5">Sector</span>
              <p className="text-[10px] text-white truncate">{deal.intel?.type || 'Active Node'}</p>
            </div>
            <div>
              <span className="text-[6px] text-gray-600 tracking-widest block mb-0.5">Location</span>
              <p className="text-[10px] text-white truncate">{deal.intel?.location || 'Digital'}</p>
            </div>
          </div>
        </div>

        <div className={`bg-white/[0.04] border ${isMyDeal ? 'border-emerald-400/50' : 'border-white/10'} rounded-[15px] p-3 shadow-inner mt-2 transition-all`}>
          <span className="text-[5px] text-emerald-500 tracking-[0.3em] block mb-1 font-black uppercase">Message</span>
          <p className="text-[9px] text-white leading-tight italic font-black uppercase line-clamp-3">
            {deal.backIntelPhone || deal.intel?.phone || 'Classified.'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ✅ 2. InfluXCard (უცვლელია)
function InfluXCard({ profile, liveDeals = [], disableRotation = false, currentBrandId }: any) {
  const [isFlipped, setIsFlipped] = useState(false)
  const x = useMotionValue(0), y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 60, damping: 50 }), mouseYSpring = useSpring(y, { stiffness: 60, damping: 50 })
  
  const rotateX = useTransform(mouseYSpring, [-300, 300], disableRotation ? [0, 0] : [5, -5])
  const rotateY = useTransform(mouseXSpring, [-300, 300], disableRotation ? [0, 0] : [-5, 5])

  if (!profile) return null

  const nameParts = (profile?.full_name || 'SYNC NODE').split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-full" 
           onMouseMove={(e) => { if(!disableRotation) { const rect = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - (rect.left + rect.width / 2)); y.set(e.clientY - (rect.top + rect.height / 2)) } }} 
           onMouseLeave={() => { x.set(0); y.set(0) }} 
           onDoubleClick={() => setIsFlipped(!isFlipped)}>
        
        <motion.div 
          style={{ rotateX: isFlipped ? 0 : rotateX, rotateY: isFlipped ? 180 : rotateY, transformStyle: "preserve-3d", perspective: "2000px", WebkitTransformStyle: "preserve-3d" }} 
          animate={{ rotateY: isFlipped ? 180 : 0 }} 
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }} 
          className="w-full aspect-[1/1.6] relative cursor-pointer"
        >
          {/* === FRONT === */}
          <div 
            className="absolute inset-0 bg-[#040d08]/98 border-2 border-emerald-950/30 rounded-[45px] p-5 pt-6 flex flex-col shadow-2xl overflow-hidden" 
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translateZ(1px)" }}
          >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98110,transparent_75%)] pointer-events-none" />
              
              <div className="w-full relative flex flex-col items-center z-10">
                {profile?.avatar_url && (
                  <motion.img 
                    src={profile.avatar_url} 
                    className="w-[96%] aspect-square object-cover rounded-[32px] filter brightness-105 drop-shadow-[0_0_60px_#10b98144]" 
                    animate={{ y: [0, -6, 0] }} 
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} 
                  />
                )}
                
                <h3 className="font-black italic uppercase text-white tracking-tighter leading-[0.85] text-glow text-center w-full px-2 mt-7 flex flex-col">
                  <span className="text-[34px]">{firstName}</span>
                  {lastName && <span className="text-[34px]">{lastName}</span>}
                </h3>
              </div>

              <div className="absolute bottom-8 left-0 w-full flex justify-center z-20 pointer-events-none">
                <p className="text-[10px] text-white/50 tracking-[0.4em] font-black uppercase animate-pulse">
                  Double Tap to Flip
                </p>
              </div>
          </div>

          {/* === BACK === */}
          <div 
            className="absolute inset-0 bg-[#010201] border-2 border-white/10 rounded-[45px] overflow-hidden" 
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(1px)" }}
          >
            <div className="w-full h-full p-6 pt-8 overflow-y-auto custom-token-scrollbar pr-3 bg-[radial-gradient(circle_at_0%_0%,#ffffff03,transparent_60%)]">
              <div className="grid grid-cols-2 gap-4 pb-8">
                {liveDeals.length > 0 ? liveDeals.map((d: any) => (
                  <GridDealCard key={d.id} deal={d} currentBrandId={currentBrandId} />
                )) : (
                  <div className="col-span-2 text-center py-20 opacity-20 font-black italic uppercase text-[10px] tracking-widest">
                    No Deals Linked
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ✅ 3. CampaignsPage (უცვლელია)
export default function CampaignsPage() {
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentBrandId, setCurrentBrandId] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrandPartnerships = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        setCurrentBrandId(user.id)

        const { data: partnerships } = await supabase
          .from('partnerships')
          .select('influencer_id')
          .eq('brand_id', user.id)
          .eq('status', 'active')

        if (!partnerships || partnerships.length === 0) {
          setTokens([])
          setLoading(false)
          return
        }

        const influencerIds = [...new Set(partnerships.map(p => p.influencer_id))]

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', influencerIds)

        const { data: dealsData } = await supabase
          .from('partnerships')
          .select('*, deals(*)')
          .in('influencer_id', influencerIds)
          .eq('is_pushed_to_token', true)

        const assembledTokens = (profiles || []).map(prof => {
          const liveDeals = (dealsData || [])
            .filter(d => d.influencer_id === prof.id)
            .map((d: any, i: number) => ({
               id: d.id || i,
               brandId: d.brand_id,
               brand: d.deals?.title || 'MATRIX NODE',
               offer: `${d.user_discount_pct || 0}% OFF`,
               logo: d.deals?.logo || '💎',
               backIntelPhone: d.deals?.intel?.phone || 'Secret Node',
               intel: d.deals?.intel || {}
            }))
          return {
            profile: prof,
            liveDeals
          }
        })

        setTokens(assembledTokens)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBrandPartnerships()
  }, [])

  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-20 max-w-7xl mx-auto pb-40 font-sans text-white">
      
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
           <div className="space-y-4 text-left">
              <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
                Matrix <span className="text-emerald-500">Nodes</span>
              </h1>
              <p className="text-[10px] font-black tracking-[0.6em] text-gray-600 uppercase italic">Partnered Influencer Tokens</p>
           </div>
           <div className="grid grid-cols-2 gap-12 border-l border-white/10 pl-12 text-left">
              <div className="space-y-1">
                 <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic font-sans">Active Tokens</span>
                 <p className="text-5xl font-black italic tracking-tighter text-white leading-none font-sans">{tokens.length}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic font-sans">Ecosystem Status</span>
                 <p className="text-2xl pt-2 font-black italic tracking-tighter text-white leading-none font-sans">SYNCED</p>
              </div>
           </div>
        </div>
      </section>

      {loading ? (
        <div className="text-center py-20 opacity-50 tracking-widest uppercase text-xs italic font-black text-emerald-500 animate-pulse">
          Syncing Partner Nodes...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-items-center">
          {tokens.map((token, idx) => (
            <div key={idx} className="w-full max-w-[360px]">
              <InfluXCard profile={token.profile} liveDeals={token.liveDeals} currentBrandId={currentBrandId} />
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .custom-token-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-token-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-token-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; border: 2px solid #010201; }
        .text-glow-emerald { text-shadow: 0 0 15px #10b981; }
      `}</style>
    </div>
  )
}