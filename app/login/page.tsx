'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden">
      
      {/* 🌌 Background Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98105,transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-[400px] space-y-12 relative z-10">
        
        {/* Branding Section */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black italic tracking-tighter"
          >
            INFLU<span className="text-emerald-500 not-italic">X</span>
          </motion.h1>
          <p className="text-[8px] font-black tracking-[0.6em] text-gray-700 uppercase italic">
            Secure Handshake Protocol v1.0
          </p>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          
          {/* 💠 INFLUENCER BUTTON (გადაჰყავს დეშბორდზე) */}
          <Link href="/dashboard/influencer" className="block">
            <motion.div
              whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full border-2 border-emerald-500/10 bg-[#040d08]/80 backdrop-blur-xl p-8 rounded-[35px] flex flex-col items-center gap-4 transition-all group cursor-pointer"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🤖</span>
              <div className="text-center">
                <span className="block text-sm font-black italic uppercase tracking-widest text-emerald-500">Influencer</span>
                <span className="text-[7px] text-gray-600 uppercase font-black tracking-widest mt-1 italic">Matrix Vault Access</span>
              </div>
            </motion.div>
          </Link>

          {/* 🏢 BRAND PARTNER (ჯერჯერობით პასიურია) */}
          <div className="opacity-30 cursor-not-allowed">
            <div className="w-full border border-white/5 bg-white/[0.02] p-8 rounded-[35px] flex flex-col items-center gap-4 grayscale">
              <span className="text-5xl">🏢</span>
              <div className="text-center">
                <span className="block text-sm font-black italic uppercase tracking-widest text-white">Brand Partner</span>
                <span className="text-[7px] text-gray-700 uppercase font-black tracking-widest mt-1 italic">Campaign Control</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bypass link for Devs */}
        <div className="text-center pt-4">
          <Link href="/dashboard/influencer" className="text-[8px] font-black text-gray-800 hover:text-emerald-500 transition-colors uppercase tracking-[0.4em]">
            [ Manual Bypass to Matrix ]
          </Link>
        </div>
      </div>

      {/* Security Watermark */}
      <footer className="fixed bottom-10 opacity-10 pointer-events-none">
        <span className="text-[6px] font-black uppercase tracking-[2.5em] text-emerald-500">Node_Connection_Established</span>
      </footer>
    </main>
  )
}