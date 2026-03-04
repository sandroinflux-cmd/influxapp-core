'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function BrandNavbar() {
  const [brandName, setBrandName] = useState<string>('')
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
        setBrandName(data?.full_name || 'SANDRO LTD')
      }
    }
    getProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signup'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center pointer-events-none">
      <div className="w-full max-w-7xl bg-[#040d08]/40 backdrop-blur-md border border-white/5 rounded-[30px] px-8 py-3 flex justify-between items-center shadow-2xl pointer-events-auto">
        
        {/* 💠 Logo Area */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard/brand')}>
          <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
          <span className="text-[11px] font-black tracking-[0.4em] uppercase italic text-white">
            Influx <span className="text-blue-500">Core</span>
          </span>
        </div>

        {/* 👤 User & Logout (შუა ნაწილი ამოღებულია) */}
        <div className="flex items-center gap-6 border-l border-white/10 pl-6 font-sans">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white uppercase italic tracking-wider">
              {brandName}
            </span>
            <span className="text-[7px] font-black text-blue-500/50 uppercase tracking-[0.3em] italic">
              Verified Entity
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="h-9 w-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
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