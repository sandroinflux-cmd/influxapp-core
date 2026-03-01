'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'MATRIX', icon: '💠', href: '/dashboard/influencer' },
  { name: 'TOKEN', icon: '🪙', href: '/dashboard/influencer/token' },
  { name: 'DEALS', icon: '📈', href: '/dashboard/influencer/deals' },
  { name: 'SETTINGS', icon: '⚙️', href: '/dashboard/influencer/settings' }
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 220 : 70 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="h-screen bg-[#020502] border-r border-white/5 flex flex-col items-center py-8 z-[100] transition-all relative shrink-0"
    >
      <div className="mb-12 font-black italic text-emerald-500 text-xl select-none">
        {isExpanded ? 'InfluX' : 'X'}
      </div>

      <nav className="flex flex-col gap-6 w-full px-3">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className="flex items-center gap-4 group">
            <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                pathname === item.href ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-500'
            }`}>
              <span className="text-lg">{item.icon}</span>
            </div>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-[10px] font-black tracking-[0.2em] text-gray-400 group-hover:text-white uppercase italic"
              >
                {item.name}
              </motion.span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
      </div>
    </motion.aside>
  )
}