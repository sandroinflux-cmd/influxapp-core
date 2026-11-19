'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LegacyCashierMonitor() {
  const router = useRouter()

  useEffect(() => {
    const openPublicMonitor = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/signup')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('monitor_token')
        .eq('id', user.id)
        .single()

      let token = data?.monitor_token as string | null
      if (!token) {
        token = crypto.randomUUID()
        const { error } = await supabase.from('profiles').update({ monitor_token: token }).eq('id', user.id)
        if (error) {
          router.replace('/dashboard/brand/settings')
          return
        }
      }

      router.replace(`/monitor/${token}`)
    }

    openPublicMonitor()
  }, [router])

  return (
    <main className="min-h-screen bg-[#010201] text-emerald-400 flex items-center justify-center p-6">
      <p className="text-[11px] font-black uppercase tracking-[0.45em] animate-pulse">Opening live monitor...</p>
    </main>
  )
}
