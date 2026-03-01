'use client'

import { motion } from 'framer-motion'

export default function SettingsPage() {
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
            <div className="flex items-center gap-10">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="h-28 w-28 rounded-[40px] bg-[#040d08] border border-emerald-500/20 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(16,185,129,0.1)] cursor-pointer"
              >
                👤
              </motion.div>
              <div className="space-y-2">
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-white transition-colors">Replace Avatar</button>
                <p className="text-[8px] text-gray-700 uppercase font-black italic">Max size: 2MB • Square Aspect</p>
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] mb-4 block italic">Operator Handle</label>
              <input 
                type="text" 
                placeholder="OPERATOR_882" 
                className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-5 text-sm font-black focus:border-emerald-500/30 focus:bg-emerald-500/[0.01] outline-none transition-all uppercase italic tracking-widest placeholder:opacity-20" 
              />
            </div>
          </div>
        </section>

        {/* 3. Social Nodes - Simple Link Protocol */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-white/5 pt-16">
          <div className="col-span-1">
            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-500 italic">Social Nodes</h3>
            <p className="text-[10px] text-gray-600 mt-4 leading-relaxed uppercase font-bold tracking-tight">
              Direct linkage to your digital influence streams.
            </p>
          </div>
          
          <div className="col-span-2 space-y-10">
            {[
              { label: 'Instagram Profile', placeholder: 'instagram.com/handle', icon: '📸' },
              { label: 'TikTok Profile', placeholder: 'tiktok.com/@handle', icon: '🎵' },
              { label: 'YouTube Channel', placeholder: 'youtube.com/@channel', icon: '📺' }
            ].map((social) => (
              <div key={social.label} className="group">
                <label className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] mb-4 block italic opacity-60 group-focus-within:text-emerald-500 transition-colors">
                  {social.label}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-6 text-lg opacity-30 group-focus-within:opacity-100 transition-opacity">
                    {social.icon}
                  </span>
                  <input 
                    type="url" 
                    placeholder={social.placeholder}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-[30px] py-5 pl-16 pr-6 text-xs font-black focus:border-emerald-500/20 focus:bg-emerald-500/[0.02] outline-none transition-all placeholder:text-gray-800 tracking-tight"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Action Protocol */}
        <div className="pt-20 border-t border-white/5 flex justify-end items-center gap-10">
           <button className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-all italic">Discard Changes</button>
           <button className="px-16 py-6 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[0.5em] hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] active:scale-95 transition-all duration-500">
             Commit Protocol
           </button>
        </div>

      </div>
    </main>
  )
}