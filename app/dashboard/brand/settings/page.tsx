'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function BrandSettingsPage() {
  const [avatar, setAvatar] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatar(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 lg:ml-0 overflow-x-hidden font-sans">
      
      {/* 💠 1. Header */}
      <header className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
        <div>
          <span className="text-blue-500/40 text-[9px] font-black tracking-[0.7em] uppercase mb-4 block italic">Brand Configuration v2.6</span>
          <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">
            Identity <span className="text-blue-500 text-glow italic">Center</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-6 py-3 rounded-2xl shadow-inner">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Master Node Active</span>
        </div>
      </header>

      <div className="max-w-5xl space-y-32">
        
        {/* 💠 2. Identity Protocol */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-white/5 pt-16 group">
          <div className="col-span-1">
            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white italic group-hover:text-blue-500 transition-colors">Identity Core</h3>
            <p className="text-[10px] text-gray-600 mt-4 leading-relaxed uppercase font-black tracking-tight italic">
              Global brand credentials. This logo will be deployed on all matrix deal assets.
            </p>
          </div>
          
          <div className="col-span-2 space-y-12">
            <div className="flex items-center gap-10">
              <label className="relative cursor-pointer group/avatar">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="h-32 w-32 rounded-[45px] bg-[#020502] border-2 border-blue-500/20 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(59,130,246,0.1)] overflow-hidden transition-all group-hover/avatar:border-blue-500"
                >
                  {avatar ? (
                    <img src={avatar} alt="Brand Logo" className="h-full w-full object-cover" />
                  ) : (
                    <span className="opacity-40 group-hover/avatar:scale-110 transition-transform">🏢</span>
                  )}
                </motion.div>
                <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
              </label>
              <div className="space-y-3">
                <button 
                  onClick={() => document.querySelector('input')?.click()}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-white transition-all italic border-b border-blue-500/20 pb-1"
                >
                  Deploy Master Logo ↑
                </button>
                <p className="text-[8px] text-gray-700 uppercase font-black italic tracking-widest">Format: PNG/SVG • Square Preferred</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[9px] text-gray-600 uppercase font-black tracking-[0.4em] mb-4 block italic">Brand Display Name</label>
              <input 
                type="text" 
                placeholder="MATRIX_CORP_GLOBAL" 
                className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm font-black focus:border-blue-500/40 focus:bg-blue-500/[0.01] outline-none transition-all uppercase italic tracking-[2px] placeholder:opacity-10 shadow-inner" 
              />
            </div>
          </div>
        </section>

        {/* 💠 3. Social Expansion Nodes */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-white/5 pt-16 group">
          <div className="col-span-1">
            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-500 italic">Expansion Nodes</h3>
            <p className="text-[10px] text-gray-600 mt-4 leading-relaxed uppercase font-black tracking-tight italic">
              Connect your brand’s main social hubs to the matrix network.
            </p>
          </div>
          
          <div className="col-span-2 space-y-10">
            {[
              { label: 'Instagram Hub', placeholder: 'instagram.com/brand_hq', icon: '📸' },
              { label: 'TikTok Hub', placeholder: 'tiktok.com/@brand_official', icon: '🎵' },
              { label: 'Facebook Hub', placeholder: 'facebook.com/brand.page', icon: '👤' }
            ].map((social) => (
              <div key={social.label} className="group/social">
                <label className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] mb-4 block italic opacity-60 group-focus-within/social:text-blue-500 transition-colors">
                  {social.label}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-6 text-lg opacity-20 group-focus-within/social:opacity-100 transition-opacity">
                    {social.icon}
                  </span>
                  <input 
                    type="url" 
                    placeholder={social.placeholder}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-[30px] py-6 pl-16 pr-6 text-xs font-black focus:border-blue-500/20 focus:bg-blue-500/[0.02] outline-none transition-all placeholder:text-gray-800 tracking-tight italic"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 💠 4. Action Protocol */}
        <div className="pt-20 border-t border-white/5 flex justify-end items-center gap-10">
           <button className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700 hover:text-white transition-all italic">Abort Changes</button>
           <button className="px-20 py-7 bg-white text-black rounded-full text-[12px] font-black uppercase tracking-[0.6em] hover:bg-blue-600 hover:text-white hover:shadow-[0_20px_60px_rgba(59,130,246,0.3)] active:scale-95 transition-all duration-500 italic shadow-2xl">
             Commit Identity
           </button>
        </div>

      </div>
    </main>
  )
}