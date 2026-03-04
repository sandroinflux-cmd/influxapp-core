'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function InfluencerOnboarding() {
  const [username, setUsername] = useState('')
  const router = useRouter()

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ username: username.toLowerCase(), full_name: username })
      .eq('id', user.id)

    if (error) alert('Username already taken!')
    else router.push('/dashboard/user/wallet') // ვოლეტში გადაყვანა
  }

  return (
    <main className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-6 text-center">
        <h1 className="text-4xl font-black italic uppercase italic">Claim Your <span className="text-emerald-500">Node</span></h1>
        <p className="text-gray-500 text-xs uppercase tracking-widest">Choose your unique matrix handle</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">@</span>
          <input 
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-5 pl-10 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold"
            placeholder="username"
          />
        </div>
        <button onClick={saveProfile} className="w-full bg-emerald-500 py-5 rounded-2xl font-black uppercase tracking-widest italic hover:bg-emerald-400 transition-all">
          Activate Profile
        </button>
      </div>
    </main>
  )
}