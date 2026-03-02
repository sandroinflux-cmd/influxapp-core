'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const brandMenuItems = [
  { name: 'DASHBOARD', path: '/dashboard/brand', icon: "📊" },
  { name: 'CAMPAIGNS', path: '/dashboard/brand/campaigns', icon: "🚀" },
  { name: 'INFLUENCERS', path: '/dashboard/brand/influencers', icon: "🛡️" },
  { name: 'ANALYTICS', path: '/dashboard/brand/analytics', icon: "📈" },
  { name: 'BILLING', path: '/dashboard/brand/billing', icon: "💳" },
  { name: 'SETTINGS', path: '/dashboard/brand/settings', icon: "⚙️" },
]

// ✅ დარწმუნდი რომ გიწერია "export default"
export default function BrandSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 240 : 70 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      className="h-screen bg-[#010305] border-r border-blue-500/10 flex flex-col items-center py-6 z-[100] transition-all relative shrink-0 overflow-hidden"
    >
      <div className="mb-10 font-black italic text-blue-500 text-xl select-none">
        {isExpanded ? 'InfluX Brand' : 'B'}
      </div>

      <nav className="flex flex-col gap-4 w-full px-3">
        {brandMenuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link key={item.name} href={item.path} className="flex items-center gap-4 group">
              <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-gray-500'
              }`}>
                <span className="text-xl">{item.icon}</span>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                    className="text-[10px] font-black tracking-[0.2em] text-gray-400 group-hover:text-white uppercase italic whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
      </div>
    </motion.aside>
  )
}