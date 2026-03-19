'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function InfluencerSettingsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  
  // ⚡ სტეიტები მონაცემებისთვის
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [handle, setHandle] = useState('')
  const [iban, setIban] = useState('')
  
  // სოც. მედიების სტეიტები
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [youtube, setYoutube] = useState('')

  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 📡 მონაცემების წამოღება
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, iban, bio') // bio-ში შევინახავთ სოც.ლინკებს JSON-ად
          .eq('id', user.id)
          .single()

        if (data) {
          setHandle(data.full_name || '')
          setIban(data.iban || '')
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url)
            setAvatarPreview(data.avatar_url)
          }
          // თუ bio-ში JSON გვაქვს შენახული სოც მედიებისთვის
          if (data.bio) {
            try {
              const socials = JSON.parse(data.bio)
              setInstagram(socials.instagram || '')
              setTiktok(socials.tiktok || '')
              setYoutube(socials.youtube || '')
            } catch (e) {
              // თუ JSON არ არის, უბრალოდ ვაიგნორებთ
            }
          }
        }
      }
    }
    fetchUserData()
  }, [])

  // 📸 ავატარის ატვირთვის ლოგიკა
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-avatar-${Date.now()}.${fileExt}`
      const filePath = `influencer-avatars/${fileName}`

      // ვიყენებთ იგივე 'logos' ბაკეტს, ან შეგიძლია 'avatars' შექმნა
      const { error: uploadError } = await supabase.storage
        .from('logos') 
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
    } catch (error: any) {
      alert("Upload Error: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // 💾 მონაცემების შენახვა
  const handleCommit = async () => {
    if (!userId) return
    setIsSaving(true)
    
    // სოც მედიებს ვინახავთ ერთ JSON ობიექტად `bio` სვეტში (ბაზის შეცვლა რომ არ დაგვჭირდეს)
    const socialsJson = JSON.stringify({ instagram, tiktok, youtube })

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: handle,
          avatar_url: avatarUrl,
          iban: iban,
          bio: socialsJson
        })
        .eq('id', userId)

      if (error) throw error
      alert("PROTOCOL COMMITTED: Identity Synced 🦾")
    } catch (error: any) {
      alert("MATRIX ERROR: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 lg:ml-0 overflow-x-hidden">
      
      {/* 1. Header */}
      <header className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-emerald-500/40 text-[9px] font-black tracking-[0.7em] uppercase mb-4 block italic">Operator Configuration v1.0</span>
          <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">
            System <span className="text-emerald-500 text-glow">Settings</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-6 py-3 rounded-2xl">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Node Active</span>
        </div>
      </header>

      <div className="max-w-5xl space-y-32">
        
        {/* 2. Identity Protocol */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-white/5 pt-16">
          <div className="col-span-1">
            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white italic">Identity Core</h3>
            <p className="text-[10px] text-gray-600 mt-4 leading-relaxed uppercase font-bold tracking-tight">
              Your public credentials within the access protocol.
            </p>
          </div>
          
          <div className="col-span-2 space-y-12">
            
            {/* Avatar Upload */}
            <div className="flex items-center gap-10">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*" 
              />
              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={() => fileInputRef.current?.click()}
                className="h-28 w-28 rounded-[40px] bg-[#040d08] border border-emerald-500/20 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(16,185,129,0.1)] cursor-pointer overflow-hidden relative group"
              >
                {isUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover group-hover:opacity-50 transition-opacity" />
                ) : (
                  <span>👤</span>
                )}
                {avatarPreview && <div className="absolute opacity-0 group-hover:opacity-100 text-[8px] font-black uppercase tracking-widest">CHANGE</div>}
              </motion.div>
              <div className="space-y-2">
                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-white transition-colors border-b border-emerald-500/30 pb-1">Deploy New Avatar</button>
                <p className="text-[8px] text-gray-700 uppercase font-black italic">Max size: 2MB • Square Aspect</p>
              </div>
            </div>

            {/* Handle / Name Input */}
            <div className="group">
              <label className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] mb-4 block italic">Operator Handle / Name</label>
              <input 
                type="text" 
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="OPERATOR_882" 
                className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-5 text-sm font-black focus:border-emerald-500/30 focus:bg-emerald-500/[0.01] outline-none transition-all uppercase italic tracking-widest placeholder:opacity-20" 
              />
            </div>

            {/* IBAN Input */}
            <div className="group pt-6 border-t border-white/5">
              <label className="text-[9px] text-emerald-500 uppercase font-black tracking-[0.3em] mb-4 block italic">Financial Node (IBAN)</label>
              <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-4 italic font-black">Routing destination for bank settlements.</p>
              <input 
                type="text" 
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="GE00TB0000000000000000" 
                className="w-full bg-[#040d08] border border-emerald-500/20 rounded-3xl p-5 text-sm font-black focus:border-emerald-500/50 outline-none transition-all uppercase italic tracking-widest placeholder:opacity-20 text-emerald-50" 
              />
            </div>

          </div>
        </section>

        {/* 3. Social Nodes */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-white/5 pt-16">
          <div className="col-span-1">
            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-500 italic">Social Nodes</h3>
            <p className="text-[10px] text-gray-600 mt-4 leading-relaxed uppercase font-bold tracking-tight">
              Direct linkage to your digital influence streams.
            </p>
          </div>
          
          <div className="col-span-2 space-y-10">
            {/* Instagram */}
            <div className="group">
              <label className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] mb-4 block italic opacity-60 group-focus-within:text-emerald-500 transition-colors">
                Instagram Profile
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-6 text-lg opacity-30 group-focus-within:opacity-100 transition-opacity">📸</span>
                <input 
                  type="url" 
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="instagram.com/handle"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-[30px] py-5 pl-16 pr-6 text-xs font-black focus:border-emerald-500/20 focus:bg-emerald-500/[0.02] outline-none transition-all placeholder:text-gray-800 tracking-tight"
                />
              </div>
            </div>

            {/* TikTok */}
            <div className="group">
              <label className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] mb-4 block italic opacity-60 group-focus-within:text-emerald-500 transition-colors">
                TikTok Profile
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-6 text-lg opacity-30 group-focus-within:opacity-100 transition-opacity">🎵</span>
                <input 
                  type="url" 
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="tiktok.com/@handle"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-[30px] py-5 pl-16 pr-6 text-xs font-black focus:border-emerald-500/20 focus:bg-emerald-500/[0.02] outline-none transition-all placeholder:text-gray-800 tracking-tight"
                />
              </div>
            </div>

            {/* YouTube */}
            <div className="group">
              <label className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] mb-4 block italic opacity-60 group-focus-within:text-emerald-500 transition-colors">
                YouTube Channel
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-6 text-lg opacity-30 group-focus-within:opacity-100 transition-opacity">📺</span>
                <input 
                  type="url" 
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="youtube.com/@channel"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-[30px] py-5 pl-16 pr-6 text-xs font-black focus:border-emerald-500/20 focus:bg-emerald-500/[0.02] outline-none transition-all placeholder:text-gray-800 tracking-tight"
                />
              </div>
            </div>

          </div>
        </section>

        {/* 4. Action Protocol */}
        <div className="pt-20 border-t border-white/5 flex justify-end items-center gap-10">
           <button className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-all italic">Discard Changes</button>
           <button 
             onClick={handleCommit}
             disabled={isSaving || isUploading}
             className="px-16 py-6 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[0.5em] hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] active:scale-95 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isSaving ? 'Syncing...' : 'Commit Protocol'}
           </button>
        </div>

      </div>
    </main>
  )
}