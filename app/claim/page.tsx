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
          backIntelPhone: d.deals?.intel?.phone || 'Secret Node'
        })))
      }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleSync = () => {
    const existing = localStorage.getItem('matrix_user_wallet')
    let wallet = existing ? JSON.parse(existing) : []
    
    // ვინახავთ ერთ ობიექტად
    const tokenToSave = { profile, liveDeals }
    
    if (!wallet.find((t: any) => t.profile.id === profile.id)) {
      wallet.push(tokenToSave)
      localStorage.setItem('matrix_user_wallet', JSON.stringify(wallet))
    }

    // 🚀 გადავდივართ საფულეში უშეცდომოდ
    window.location.href = '/wallet'
  }

  if (loading) return <div className="min-h-screen bg-[#010201] text-emerald-500 font-black uppercase tracking-[0.5em] animate-pulse flex items-center justify-center italic">Intercepting Signal...</div>

  return (
    <main className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* ენერგიის ფონი ტოკენის უკან */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b98115,transparent_70%)] pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center w-full max-w-[420px]">
        {/* აქ ვძახებთ მთავარ ტოკენს */}
        <InfluXCard profile={profile} liveDeals={liveDeals}>
          
          {/* 🚀 ღილაკი ახლა ცენტრშია და ზუსტად ტექსტის პროპორციულია */}
          <div className="mt-8 flex justify-center w-full">
            <button 
              onClick={handleSync} 
              className="px-12 py-4 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] italic active:scale-95"
            >
              GET IT
            </button>
          </div>
          
        </InfluXCard>
      </div>
    </main>
  )
}

export default function ClaimPage() { 
  return <Suspense fallback={null}><ClaimContent /></Suspense> 
}