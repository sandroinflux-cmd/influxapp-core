'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function InfluencerNavbar() {
  const [name, setName] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        setName(data?.full_name || 'Influencer Node')
      }
    }
    getProfile()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      window.location.href = '/signup' 
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center pointer-events-none">
      {/* 🚀 100% გამჭვირვალე ფონი (bg-transparent) */}
      <div className="w-full max-w-7xl bg-transparent border border-emerald-500/20 rounded-[30px] px-8 py-3 flex justify-between items-center pointer-events-auto">
        
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard/influencer')}>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          <span className="text-[11px] font-black tracking-[0.4em] uppercase italic text-white">
            Influx <span className="text-emerald-500">Node</span>
          </span>
        </div>

        <div className="flex items-center gap-6 border-l border-white/10 pl-6 font-sans">
          <div className="flex flex-col items-end italic">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">
              {name}
            </span>
            <span className="text-[7px] font-black text-emerald-500/50 uppercase tracking-[0.3em]">
              Verified Node
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="h-9 w-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 transition-all group shadow-xl"
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}