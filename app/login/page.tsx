'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()

  const handleInfluencerLogin = () => {
    // 🚀 გადამისამართება ინფლუენსერის დეშბორდზე
    router.push('/dashboard/influencer')
  }

  return (
    <main className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-[400px] space-y-12">
        
        {/* Branding */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black italic tracking-tighter">
            INFLU<span className="text-emerald-500 not-italic">X</span>
          </h1>
          <p className="text-[8px] font-black tracking-[0.6em] text-gray-700 uppercase italic">
            Accessing Matrix Node v1.0
          </p>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          {/* 💠 Influencer Option */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInfluencerLogin}
            className="w-full border-2 border-emerald-500/20 bg-[#040d08] p-8 rounded-[35px] flex flex-col items-center gap-4 transition-all group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🤖</span>
            <div className="text-center">
              <span className="block text-xs font-black italic uppercase tracking-widest text-emerald-500">Influencer</span>
              <span className="text-[7px] text-gray-600 uppercase font-black tracking-widest mt-1">Matrix Vault Access</span>
            </div>
          </motion.button>

          {/* 🏢 Brand Option (Placeholder for now) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full border border-white/5 bg-white/5 p-8 rounded-[35px] flex flex-col items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all"
          >
            <span className="text-4xl">🏢</span>
            <div className="text-center">
              <span className="block text-xs font-black italic uppercase tracking-widest text-white">Brand Partner</span>
              <span className="text-[7px] text-gray-700 uppercase font-black tracking-widest mt-1">Campaign Manager</span>
            </div>
          </motion.button>
        </div>

      </div>

      {/* Security Footer */}
      <footer className="fixed bottom-10 opacity-20">
        <span className="text-[6px] font-black uppercase tracking-[2em] text-emerald-500">Secure_Handshake_Active</span>
      </footer>
    </main>
  )
}