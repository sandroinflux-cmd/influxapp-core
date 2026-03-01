'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const navItems = [
  { name: 'MATRIX', icon: '💠', href: '/dashboard/influencer' },
  { name: 'TOKEN', icon: '🪙', href: '/dashboard/influencer/token' },
  { name: 'DEALS', icon: '📈', href: '/dashboard/influencer/deals' },
  { name: 'SETTINGS', icon: '⚙️', href: '/dashboard/influencer/settings' }
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.aside 
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      // 📱 მობილურზე Tap-ით იხსნება, დესკტოპზე Hover-ით
      onClick={() => setIsExpanded(!isExpanded)}
      animate={{ width: isExpanded ? 240 : 70 }}
      className="h-screen bg-[#020502] border-r border-white/5 flex flex-col items-center py-8 z-[100] transition-all relative shrink-0"
    >
      <div className="mb-12 font-black italic text-emerald-500 text-xl">
        {isExpanded ? 'InfluX' : 'X'}
      </div>

      <nav className="flex flex-col gap-6 w-full px-3">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className="flex items-center gap-4 group">
            <div className="h-10 w-10 shrink-0 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              {item.icon}
            </div>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-[10px] font-black tracking-widest text-gray-400 group-hover:text-white"
              >
                {item.name}
              </motion.span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <div className={`h-2 w-2 rounded-full bg-emerald-500 animate-pulse ${isExpanded ? 'mb-0' : ''}`} />
      </div>
    </motion.aside>
  )
}