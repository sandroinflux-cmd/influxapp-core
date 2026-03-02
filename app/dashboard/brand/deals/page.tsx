'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BrandDealsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [flippedId, setFlippedId] = useState<number | null>(null)
  
  const [deals, setDeals] = useState([
    { 
      id: 1, title: 'BANANA PROTOCOL', totalShare: 25, logo: '🍌',
      intel: { type: 'Organic Agriculture', location: 'Tropical Zone', phone: '+995 555 111 222' }
    },
    { 
      id: 2, title: 'APPLE OFFICIAL', totalShare: 20, logo: '🍎',
      intel: { type: 'Consumer Electronics', location: 'City Mall, Saburtalo', phone: '+995 555 001 002' }
    },
    { 
      id: 3, title: 'KIWI MATRIX', totalShare: 18, logo: '🥝',
      intel: { type: 'Vitamin Infrastructure', location: 'Green Garden Hub', phone: '+995 555 777 888' }
    },
  ])

  const [newShare, setNewShare] = useState('')

  const handleCreate = () => {
    if(!newShare) return
    const newDeal = {
      id: Date.now(),
      title: 'NEW MATRIX DEAL',
      totalShare: parseInt(newShare),
      logo: '💠',
      intel: { type: 'Active Venture', location: 'Tbilisi, Georgia', phone: 'Secure Line Active' }
    }
    setDeals([newDeal, ...deals])
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
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all italic shadow-[0_0_30px_rgba(59,130,246,0.2)]"
        >
          {isCreating ? 'Close' : 'Create +'}
        </button>
      </header>

      {/* 🏗️ Deal Creator Panel */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-[#020502] border border-blue-500/20 rounded-[35px] md:rounded-[40px] p-6 md:p-10 mb-12 shadow-2xl flex flex-col items-center gap-6"
          >
            <div className="w-full max-w-xs space-y-4 text-center">
              <label className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] italic">Set Share (%)</label>
              <input 
                value={newShare} onChange={(e)=>setNewShare(e.target.value)} type="number" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-4xl text-white text-center focus:border-blue-500 outline-none transition-all font-black italic" 
              />
            </div>
            <button onClick={handleCreate} className="bg-white text-black w-full max-w-xs py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all italic shadow-xl">
              Initialize Node
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📜 Deal Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-16">
        {deals.map((deal) => (
          <div key={deal.id} className="relative group h-[380px] md:h-[480px]" style={{ perspective: '2000px' }}>
            
            {/* 🚀 SEND BUTTON: Visible on Mobile & Hover */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-[100] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
              <button 
                className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-white/10 whitespace-nowrap"
                onClick={(e) => { e.stopPropagation(); alert(`Broadcasting ${deal.title}...`); }}
              >
                Send to Influencer →
              </button>
            </div>

            {/* 💠 3D CARD */}
            <motion.div 
              className="w-full h-[350px] md:h-[450px] relative cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flippedId === deal.id ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
              onClick={() => setFlippedId(flippedId === deal.id ? null : deal.id)}
            >
              
              {/* 💠 FRONT */}
              <div 
                className="absolute inset-0 bg-[#020502] border border-white/10 rounded-[45px] md:rounded-[60px] p-8 md:p-10 flex flex-col justify-between shadow-2xl group-hover:border-blue-500/40 overflow-hidden"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="flex flex-col items-center text-center -mt-4">
                  <div className="h-16 w-16 md:h-24 md:w-24 rounded-[24px] md:rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-3 text-3xl md:text-5xl shadow-inner">
                    {deal.logo}
                  </div>
                  <h3 className="text-md md:text-xl font-black text-white italic uppercase tracking-tighter">{deal.title}</h3>
                </div>

                <div className="text-center -mt-6">
                  <h3 className="text-7xl md:text-[130px] font-black italic tracking-tighter text-white group-hover:text-blue-500 transition-colors leading-none">
                    {deal.totalShare}<span className="text-xl md:text-2xl not-italic font-light ml-1">%</span>
                  </h3>
                </div>

                <div className="text-center opacity-20 italic">
                   <p className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.5em]">Tap to Inspect</p>
                </div>
              </div>

              {/* 💠 BACK */}
              <div 
                className="absolute inset-0 bg-black border border-blue-500/20 rounded-[45px] md:rounded-[60px] p-8 md:p-12 flex flex-col justify-center shadow-2xl"
                style={{ 
                  backfaceVisibility: 'hidden', 
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                 <div className="space-y-6 md:space-y-10">
                    <h4 className="text-[8px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] italic border-b border-white/10 pb-4">Brand Intel</h4>
                    <div className="space-y-6 md:space-y-8 text-left">
                       <div className="border-l-2 border-blue-600 pl-4">
                          <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest block mb-1">Sectors</span>
                          <p className="text-sm font-black text-white italic uppercase leading-tight">{deal.intel.type}</p>
                       </div>
                       <div className="border-l-2 border-blue-600 pl-4">
                          <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest block mb-1">Location</span>
                          <p className="text-sm font-black text-white italic uppercase leading-tight">{deal.intel.location}</p>
                       </div>
                       <div className="border-l-2 border-blue-600 pl-4">
                          <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest block mb-1">Phone</span>
                          <p className="text-sm font-black text-white italic uppercase">{deal.intel.phone}</p>
                       </div>
                    </div>
                 </div>
              </div>

            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}