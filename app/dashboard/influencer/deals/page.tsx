'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function MyDealsPage() {
  const [activeDeals, setActiveDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [flippedId, setFlippedId] = useState<string | null>(null)
  
  const [splittingDeal, setSplittingDeal] = useState<any | null>(null)
  const [userDiscount, setUserDiscount] = useState<number>(0)
  const [isDeploying, setIsDeploying] = useState(false)

  useEffect(() => {
    fetchMyDeals()
  }, [])

  const fetchMyDeals = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('partnerships')
          .select('*, deals(*)')
          .eq('influencer_id', user.id)
          .eq('status', 'active')

        if (error) throw error
        if (data) setActiveDeals(data)
      }
    } catch (err: any) {
      console.error("Fetch error:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const finalizePush = async () => {
    if (!splittingDeal) return
    setIsDeploying(true)

    try {
      // 🚀 ტიპების მკაცრი კონტროლი, რომ ბაზამ NaN ერორი არ ამოაგდოს
      const total = Number(splittingDeal.deals?.totalShare || 0)
      const discount = Number(userDiscount)
      const influencerCut = total - discount

      const { error } = await supabase
        .from('partnerships')
        .update({ 
          user_discount_pct: discount,
          influencer_cut_pct: influencerCut,
          is_pushed_to_token: true 
        })
        .eq('id', splittingDeal.id)

      if (error) throw error

      setSplittingDeal(null)
      fetchMyDeals() // 🚀 წარმატების შემდეგ ეგრევე ვაახლებთ სიას, რომ ღილაკი ჩაიკეტოს
    } catch (err: any) {
      alert("SYNC ERROR: " + err.message)
    } finally {
      setIsDeploying(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#010201] flex items-center justify-center">
      <p className="text-emerald-500 font-black italic animate-pulse uppercase tracking-[0.5em]">Syncing Matrix Assets...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-12 max-w-6xl mx-auto pb-32 font-sans text-white overflow-x-hidden">
      
      <header className="flex justify-between items-center border-b border-white/5 pb-10 italic font-black uppercase">
        <div>
          <h1 className="text-4xl tracking-tighter leading-none">My <span className="text-emerald-500 italic">Vault</span></h1>
          <p className="text-[7px] tracking-[0.5em] text-gray-600 mt-4 leading-none">Authorized Matrix Node Access</p>
        </div>
      </header>

      <AnimatePresence>
        {splittingDeal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
            <div className="bg-[#020502] border border-emerald-500/30 rounded-[40px] p-10 w-full max-w-md shadow-2xl text-center italic font-black uppercase">
              <div className="space-y-12">
                <div>
                  <span className="text-[8px] text-gray-500 tracking-widest block mb-2 leading-none">Total Share Power</span>
                  <p className="text-5xl">{Number(splittingDeal.deals?.totalShare || 0)}%</p>
                </div>
                <div className="space-y-6 text-left">
                  <div className="flex justify-between text-[9px] tracking-widest leading-none">
                    <span className="text-emerald-500 font-black uppercase">USER: {userDiscount}%</span>
                    <span className="text-white/30 font-black uppercase">YOU: {Number(splittingDeal.deals?.totalShare || 0) - userDiscount}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max={Number(splittingDeal.deals?.totalShare || 1) - 1} 
                    value={userDiscount} 
                    onChange={(e) => setUserDiscount(parseInt(e.target.value))} 
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500" 
                  />
                </div>
                <button disabled={isDeploying} onClick={finalizePush} className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-white transition-all active:scale-95 disabled:opacity-50">
                  {isDeploying ? 'SYNCING...' : 'CONFIRM PROTOCOL'}
                </button>
                <button onClick={() => setSplittingDeal(null)} className="text-[8px] opacity-30 mt-4 tracking-widest uppercase">Abort</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {activeDeals.map((item) => (
          <div key={item.id} className="relative group h-[480px]" style={{ perspective: '2000px' }}>
            <motion.div 
              className="w-full h-[450px] relative cursor-pointer" 
              style={{ transformStyle: 'preserve-3d' }} 
              animate={{ rotateY: flippedId === item.id ? 180 : 0 }} 
              transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }} 
              onClick={() => setFlippedId(flippedId === item.id ? null : item.id)}
            >
              {/* 💠 FRONT SIDE */}
              <div 
                className="absolute inset-0 bg-[#020502] border border-white/10 rounded-[60px] p-8 flex flex-col justify-between shadow-2xl group-hover:border-emerald-500/40 transition-colors duration-500 overflow-hidden" 
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="flex flex-col items-center text-center w-full mt-2">
                  <div className="h-32 w-32 md:h-40 md:w-40 mx-auto rounded-[32px] bg-white/[0.03] border-2 border-white/10 flex items-center justify-center mb-6 shadow-lg overflow-hidden relative">
                    {item.deals?.logo?.startsWith('http') ? (
                      <img src={item.deals.logo} alt={item.deals.title} className="absolute inset-0 h-full w-full object-cover filter brightness-105" />
                    ) : (
                      <span className="text-5xl">{item.deals?.logo || '💠'}</span>
                    )}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    {item.deals?.title}
                  </h3>
                </div>

                <div className="text-center mt-auto">
                  <h3 className="text-8xl md:text-[110px] font-black italic tracking-tighter text-white group-hover:text-emerald-500 transition-colors leading-none drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    {item.deals?.totalShare || 0}<span className="text-2xl md:text-3xl not-italic font-light ml-1 opacity-40">%</span>
                  </h3>
                </div>

                <div className="relative w-full h-12 flex justify-center items-end pb-2">
                  <div className="text-center opacity-30 italic absolute transition-opacity duration-300 group-hover:opacity-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] animate-pulse">Double Tap to Flip</p>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 absolute w-full z-20">
                    {/* 🚀 ლოგიკა: თუ უკვე დამატებულია ტოკენზე, ვაჩვენებთ მწვანე ჩაკეტილ წარწერას */}
                    {item.is_pushed_to_token ? (
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-center shadow-xl italic cursor-not-allowed">
                        SYNCED TO TOKEN ✓
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSplittingDeal(item); 
                          setUserDiscount(item.user_discount_pct || Math.floor(Number(item.deals?.totalShare || 0) * 0.7)); 
                        }} 
                        className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all italic active:scale-95 shadow-xl"
                      >
                        ADD TO TOKEN
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 💠 BACK SIDE */}
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
                        {item.deals?.intel?.type || 'Active Venture'}
                      </p>
                    </div>

                    <div className="group/item">
                      <span className="text-[8px] text-gray-600 tracking-widest block mb-1">HQ Location</span>
                      <p className="text-lg text-white leading-none">
                        {item.deals?.intel?.location || 'Digital Node'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-[35px] p-8 mt-2 shadow-inner">
                  <span className="text-[7px] text-emerald-500 tracking-[0.4em] block mb-4 italic font-black uppercase">Message / Intel</span>
                  <p className="text-lg text-white leading-tight tracking-tighter italic font-black uppercase">
                    {item.deals?.intel?.phone || 'Mission intel remains classified.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}