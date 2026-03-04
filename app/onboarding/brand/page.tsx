'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function BrandOnboarding() {
  const [brandName, setBrandName] = useState('')
  const router = useRouter()

  const saveBrand = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // პროფილის განახლება და ბრენდების ცხრილში ჩამატება
    await supabase.from('profiles').update({ full_name: brandName }).eq('id', user.id)
    await supabase.from('brands').insert([{ name: brandName, owner_id: user.id }])

    router.push('/dashboard/brand') // ბრენდის დეშბორდზე გადაყვანა
  }

  return (
    <main className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-6 text-center">
        <h1 className="text-4xl font-black italic uppercase italic text-blue-500">Command Center</h1>
        <p className="text-gray-500 text-xs uppercase tracking-widest">Register your official brand entity</p>
        <input 
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-center"
          placeholder="BRAND NAME"
        />
        <button onClick={saveBrand} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase tracking-widest italic hover:bg-blue-500 transition-all">
          Establish Brand Node
        </button>
      </div>
    </main>
  )
}