'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface GuardProps {
  status?: string;
  role?: string;
  children: React.ReactNode;
}

export default function StatusGuard({ status, role, children }: GuardProps) {
  const pathname = usePathname()
  // ამოწმებს, არის თუ არა მომხმარებელი Settings გვერდზე
  const isSettings = pathname.includes('/settings')

  // ✅ 1. თუ დადასტურებულია ან სუპერადმინია - სრული მწვანე შუქი!
  if (status === 'approved' || role === 'superadmin') {
    return <>{children}</>
  }

  // ☠️ 2. თუ დაბლოკილია - წითელი კედელი (არსად არ ვუშვებთ)
  if (status === 'suspended') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center z-50 relative w-full h-full min-h-[60vh]">
        <div className="absolute inset-0 bg-red-900/5 pointer-events-none" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-500/10 border border-red-500/30 p-10 rounded-[40px] max-w-md w-full relative overflow-hidden backdrop-blur-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
            <span className="text-3xl">☠️</span>
          </div>
          <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest italic mb-2">Access Denied</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold leading-relaxed">
            Your Node has been suspended by the InfluX Administration. All financial routing is blocked.
          </p>
        </motion.div>
      </div>
    )
  }

  // ⏳ 3. თუ მოლოდინშია (Pending)
  if (status === 'pending') {
    // 🚀 თუ უკვე Settings გვერდზეა, ვაჩვენებთ შიგთავსს!
    if (isSettings) return <>{children}</>

    // 🛑 თუ სხვაგან სცადა შესვლა, ვუგდებთ ამ ყვითელ გაფრთხილებას:
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center z-50 relative w-full h-full min-h-[60vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-yellow-500/5 border border-yellow-500/20 p-10 rounded-[40px] max-w-md w-full relative overflow-hidden backdrop-blur-md">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
            <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-black text-yellow-500 uppercase tracking-widest italic mb-2">Node Under Review</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold leading-relaxed mb-8">
            Please complete your profile configuration in Settings. Your node will be granted full Matrix access once reviewed by an administrator.
          </p>
          
          {/* ავტომატურად გადააგდებს Settings გვერდზე როლის მიხედვით */}
          <Link href={`/dashboard/${role}/settings`} className="block w-full py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-[20px] font-black text-[10px] uppercase tracking-widest italic hover:bg-yellow-500 hover:text-black transition-colors">
            Proceed to Settings ➔
          </Link>
        </motion.div>
      </div>
    )
  }

  return null
}