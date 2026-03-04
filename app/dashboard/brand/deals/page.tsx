'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function BrandDealsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [flippedId, setFlippedId] = useState<string | null>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [newShare, setNewShare] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  // 📥 გასწორებული fetchDeals - ამოღებულია .order() რომელიც ერორს აგდებდა ჩუმად
  const fetchDeals = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('brand_id', user.id)
        
      if (error) {
        console.error("Fetch Deals Error:", error)
      }
      
      setDeals(data || [])
    }
    setLoading(false)
  }

  // 🚀 გასწორებული handleCreate - "totalShare" და მასივით ინსერტი
  const handleCreate = async () => {
    if(!newShare) return
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("System Error: Unauthorized Node.")
      return
    }

    const newDeal = {
      brand_id: user.id,
      title: 'NEW MATRIX DEAL',
      "totalShare": parseInt(newShare), 
      logo: '💠',
      intel: { type: 'Active Venture', location: 'Tbilisi, Georgia', phone: 'Secure Line Active' }
    }

    const { data, error } = await supabase.from('deals').insert([newDeal]).select().single()
    
    if (error) {
      console.error("DB Error:", error)
      alert(`Deployment Failed: ${error.message || "Check Console"}`) 
      return
    }

    if (data) {
      setDeals([data, ...deals])
    }

    setIsCreating(false)
    setNewShare('')
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
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all italic shadow-[0_0_30px_rgba(59,130,246,0.2)]"
        >
          Create New Deal +
        </button>
      </header>

      {/* 🏗️ Optimized Deal Creator Panel */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/40"
          >
            <div className="bg-[#020502] border border-blue-500/30 rounded-[40px] p-8 md:p-10 w-full max-w-md relative shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              
              <button 
                onClick={() => setIsCreating(false)}
                className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all group"
              >
                <span className="text-xs font-black uppercase tracking-tighter group-hover:scale-110 transition-transform italic">X</span>
              </button>

              <div className="flex flex-col items-center gap-8">
                <div className="w-full space-y-4 text-center">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic block">Set Share (%)</label>
                  <input 
                    value={newShare} 
                    onChange={(e)=>setNewShare(e.target.value)} 
                    type="number" 
                    placeholder="00"
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-6xl text-white text-center focus:border-blue-500 outline-none transition-all font-black italic shadow-inner" 
                  />
                </div>
                
                <button 
                  onClick={handleCreate} 
                  className="bg-white text-black w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all italic shadow-xl active:scale-95"
                >
                  CREATE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📜 Deal Inventory */}
      {loading ? (
        <div className="text-center py-20 opacity-50 tracking-widest uppercase text-xs italic">Loading Assets...</div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 opacity-50 tracking-widest uppercase text-xs italic">No Assets Found. Create one to start.</div>
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
                <div 
                  className="absolute inset-0 bg-[#020502] border border-white/10 rounded-[60px] p-10 flex flex-col justify-between shadow-2xl group-hover:border-blue-500/40 overflow-hidden"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="flex flex-col items-center text-center -mt-6">
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-[28px] md:rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 text-4xl md:text-5xl shadow-inner">
                      {deal.logo}
                    </div>
                    <h3 className="text-md md:text-xl font-black text-white italic uppercase tracking-tighter">{deal.title}</h3>
                  </div>

                  <div className="text-center -mt-10">
                    <h3 className="text-8xl md:text-[130px] font-black italic tracking-tighter text-white group-hover:text-blue-500 transition-colors leading-none">
                      {deal.totalShare}<span className="text-xl md:text-2xl not-italic font-light ml-1">%</span>
                    </h3>
                  </div>

                  <div className="text-center opacity-20 italic">
                    <p className="text-[7px] font-black uppercase tracking-[0.5em]">Tap to Inspect</p>
                  </div>
                </div>

                {/* 💠 BACK */}
                <div 
                  className="absolute inset-0 bg-black border border-blue-500/20 rounded-[45px] md:rounded-[60px] p-12 flex flex-col justify-center shadow-2xl"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="space-y-10">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] italic border-b border-white/10 pb-4">Brand Intel</h4>
                    <div className="space-y-8">
                      <div className="border-l-2 border-blue-600 pl-4 py-1">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1 italic">Sectors</span>
                        <p className="text-md font-black text-white italic uppercase tracking-tight leading-tight">{deal.intel?.type}</p>
                      </div>
                      <div className="border-l-2 border-blue-600 pl-4 py-1">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1 italic">Hub Location</span>
                        <p className="text-md font-black text-white italic uppercase tracking-tight leading-tight">{deal.intel?.location}</p>
                      </div>
                      <div className="border-l-2 border-blue-600 pl-4 py-1">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1 italic">Secure Line</span>
                        <p className="text-md font-black text-white italic uppercase">{deal.intel?.phone}</p>
                      </div>
                    </div>
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