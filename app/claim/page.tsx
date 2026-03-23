'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import InfluXCard from '@/components/InfluXCard'

function ClaimContent() {
  const searchParams = useSearchParams()
  const influencerId = searchParams.get('ref')
  
  const [profile, setProfile] = useState<any>(null)
  const [liveDeals, setLiveDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (influencerId) fetchData()
  }, [influencerId])

  const fetchData = async () => {
    try {
      const { data: prof } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', influencerId).single()
      if (prof) setProfile(prof)

      const { data: dealsData } = await supabase.from('partnerships').select('*, deals(*)').eq('influencer_id', influencerId).eq('is_pushed_to_token', true)
      
      if (dealsData) {
        setLiveDeals(dealsData.map((d: any, i: number) => ({
          id: d.id || i,
          brand: d.deals?.title || 'MATRIX NODE',
          offer: `${d.user_discount_pct || 0}% OFF`,
          logo: d.deals?.logo || '💎',
          backIntelPhone: d.deals?.intel?.phone || 'Secret Node',
          intel: d.deals?.intel || {}
        })))
      }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleSync = () => {
    const existing = localStorage.getItem('matrix_user_wallet')
    let wallet = existing ? JSON.parse(existing) : []
    
    const tokenToSave = { profile, liveDeals }
    
    if (!wallet.find((t: any) => t.profile.id === profile.id)) {
      wallet.push(tokenToSave)
      localStorage.setItem('matrix_user_wallet', JSON.stringify(wallet))
    }

    window.location.href = '/wallet'
  }

  if (loading) return <div className="min-h-screen bg-[#010201] text-emerald-500 font-black uppercase tracking-[0.5em] animate-pulse flex items-center justify-center italic">Intercepting Signal...</div>

  return (
    <main className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b98108,transparent_70%)] pointer-events-none" />
      
      {/* 🚀 ზომა გასწორებულია 340px-ზე, როგორც ვოლეტში */}
      <div className="z-10 flex flex-col items-center w-full max-w-[340px]">
        <InfluXCard profile={profile} liveDeals={liveDeals} disableRotation={false}>
          
          {/* 🚀 ღილაკი იდენტურია ვოლეტის სტილის */}
          <button 
            onClick={handleSync} 
            className="px-12 py-3.5 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] italic active:scale-95 whitespace-nowrap"
          >
            GET ASSET
          </button>
          
        </InfluXCard>
      </div>
    </main>
  )
}

export default function ClaimPage() { 
  return <Suspense fallback={null}><ClaimContent /></Suspense> 
}