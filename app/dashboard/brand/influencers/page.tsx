'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function BrandInfluencersPage() {
  const [filter, setFilter] = useState<'PARTNERS' | 'DISCOVERY' | 'INCOMING'>('DISCOVERY')
  const [influencers, setInfluencers] = useState<any[]>([])
  const [incomingRequests, setIncomingRequests] = useState<any[]>([])
  const [myDeals, setMyDeals] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  
  const [selectedInf, setSelectedInf] = useState<any>(null)
  const [confirmingReq, setConfirmingReq] = useState<any>(null)
  const [selectedDealId, setSelectedDealId] = useState<string>('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchData()
    fetchMyDeals()
  }, [filter])

  const fetchMyDeals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('deals').select('*').eq('brand_id', user.id)
      setMyDeals(data || [])
    }
  }

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (filter === 'INCOMING') {
      const { data } = await supabase
        .from('requests')
        .select('*, sender:profiles!sender_id(*)')
        .eq('receiver_id', user?.id)
        .eq('status', 'pending')
      setIncomingRequests(data || [])
    } else {
      const { data: allInfluencers } = await supabase.from('profiles').select('*').eq('role', 'influencer')
      const { data: partnerships } = await supabase.from('partnerships').select('influencer_id').eq('brand_id', user?.id).eq('status', 'active')
      const partnerIds = partnerships?.map(p => p.influencer_id) || []

      setInfluencers(allInfluencers?.map(inf => ({
        ...inf,
        isPartner: partnerIds.includes(inf.id)
      })) || [])
    }
    setLoading(false)
  }

  const handleAction = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const deal = myDeals.find(d => d.id === selectedDealId)

    let actionError = null;
    if (confirmingReq) {
      const { error } = await supabase.from('requests').update({
        deal_id: selectedDealId,
        proposed_percentage: deal.totalShare,
        message: message || confirmingReq.message, 
        status: 'deal_offered' 
      }).eq('id', confirmingReq.id)
      actionError = error;
    } else {
      const { error } = await supabase.from('requests').insert([{
        sender_id: user?.id,
        receiver_id: selectedInf.id,
        deal_id: selectedDealId,
        proposed_percentage: deal.totalShare,
        message,
        type: 'brand_to_influencer',
        status: 'deal_offered'
      }])
      actionError = error;
    }

    if (actionError) {
      alert(`TRANSMISSION FAILED: ${actionError.message}`)
      return; 
    }
    closeModal(); fetchData(); alert("DEPLOYED TO MATRIX");
  }

  const closeModal = () => {
    setSelectedInf(null); 
    setConfirmingReq(null); 
    setMessage('');
    setSelectedDealId('');
  }

  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto text-white italic font-black uppercase">
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <h1 className="text-4xl italic uppercase">Influencer <span className="text-blue-500 uppercase">Nodes</span></h1>
        <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
          {['PARTNERS', 'DISCOVERY', 'INCOMING'].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)} className={`px-8 py-3 rounded-xl text-[10px] ${filter === f ? 'bg-blue-600' : 'text-gray-500'}`}>{f}</button>
          ))}
        </div>
      </header>

      {loading ? <div className="text-center py-20 opacity-50 tracking-widest uppercase">Syncing Matrix...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filter === 'INCOMING' ? (
            incomingRequests.map(req => (
              <div key={req.id} className="bg-[#040d08] border border-blue-500/20 rounded-[40px] p-10 flex flex-col justify-between group">
                <div>
                  <span className="text-blue-500 text-[9px] tracking-widest block mb-2 italic uppercase">Incoming Connection</span>
                  <h3 className="text-2xl italic font-black">{req.sender?.full_name}</h3>
                  <p className="text-xs text-gray-500 lowercase font-sans opacity-60 mb-6 italic">"{req.message}"</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setConfirmingReq(req)} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black italic">Confirm</button>
                  <button onClick={() => {supabase.from('requests').delete().eq('id', req.id); fetchData();}} className="px-6 py-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black italic">Reject</button>
                </div>
              </div>
            ))
          ) : (
            influencers.filter(inf => filter === 'PARTNERS' ? inf.isPartner : !inf.isPartner).map(inf => (
              <div key={inf.id} className="bg-[#040d08]/60 border border-white/5 rounded-[45px] p-10 flex flex-col items-center gap-6 group hover:border-blue-500/30 transition-all">
                <div className="h-20 w-20 rounded-[30px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">💎</div>
                <h3 className="text-xl font-black italic">{inf.full_name}</h3>
                <button onClick={() => setSelectedInf(inf)} disabled={inf.isPartner}
                  className={`w-full py-4 rounded-2xl text-[10px] tracking-widest italic font-black transition-all ${inf.isPartner ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}>
                  {inf.isPartner ? 'Secured' : 'Connect +'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {(selectedInf || confirmingReq) && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80 font-black italic uppercase">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[#010201] border border-blue-500/30 rounded-[50px] p-12 pt-16 w-full max-w-xl shadow-2xl">
              
              <button onClick={closeModal} className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all z-50">
                <span className="text-xs font-black">X</span>
              </button>

              <h2 className="text-2xl mb-10 italic font-black">Select Asset for <span className="text-blue-500">{selectedInf?.full_name || confirmingReq?.sender?.full_name}</span></h2>
              
              <div className="space-y-6">
                {myDeals.length === 0 ? (
                  <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center">
                      <p className="text-red-500 text-xs tracking-widest italic">NO ASSETS DETECTED.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                    {myDeals.map(deal => (
                      <div 
                        key={deal.id} 
                        onClick={() => setSelectedDealId(deal.id)} 
                        className={`p-4 rounded-[25px] border cursor-pointer transition-all flex items-center gap-4 ${selectedDealId === deal.id ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                      >
                        {/* ✅ ლოგოს შემოწმება: თუ URL-ია, ვხატავთ იმიჯს */}
                        <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {deal.logo?.startsWith('http') ? (
                            <img src={deal.logo} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xl">{deal.logo || '💠'}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                           <p className="text-[13px] font-black italic leading-none mb-1">{deal.title}</p>
                           <p className="text-[9px] text-blue-500 tracking-widest">{deal.intel?.type || 'ACTIVE ASSET'}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black italic">{deal.totalShare}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <textarea 
                  placeholder="MESSAGE TO NODE..." 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 h-24 italic font-black uppercase outline-none focus:border-blue-500 transition-all text-xs" 
                />
                
                <button 
                  onClick={handleAction} 
                  disabled={!selectedDealId} 
                  className="w-full py-6 bg-blue-600 text-white rounded-[30px] text-[10px] tracking-widest disabled:opacity-20 hover:bg-blue-500 transition-all font-black uppercase italic shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                >
                  {confirmingReq ? 'CONFIRM PARTNERSHIP' : 'INITIALIZE CONNECTION'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}