'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardHub() {
  const router = useRouter()

  useEffect(() => {
    const routeUser = async () => {
      // 1. ვამოწმებთ, საერთოდ შემოსულია თუ არა მომხმარებელი სისტემაში
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // თუ უცხოა ან სესია გაუვიდა, ვისვრით მთავარ გვერდზე (ან ლოგინზე)
        router.push('/') 
        return
      }

      // 2. ვკითხულობთ მის როლს ჩვენი ერთიანი profiles ცხრილიდან
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !profile) {
        console.error("Matrix Error: Profile not found", error)
        return
      }

      // 3. მთავარი მაგია: გადამისამართება როლის მიხედვით
      if (profile.role === 'brand') {
        router.replace('/dashboard/brand/settings')
      } else if (profile.role === 'influencer') {
        router.replace('/dashboard/influencer/settings')
      } else {
        // თუ შემთხვევით როლი არ უწერია, ვაბრუნებთ მთავარზე
        router.push('/') 
      }
    }

    routeUser()
  }, [router])

  // სანამ ბაზას ამოწმებს, მომხმარებელი ხედავს ამ ლამაზ დატვირთვის ეკრანს
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010201] text-white font-sans">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center h-16 w-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
          <span className="text-xl">💠</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] italic text-blue-500 animate-pulse">
          Routing Node...
        </p>
      </div>
    </div>
  )
}