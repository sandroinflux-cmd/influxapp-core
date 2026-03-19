'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const brandMenuItems = [
  { 
    name: 'Matrix', 
    path: '/dashboard/brand', 
    color: '#3b82f6', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  { 
    name: 'Deals', 
    path: '/dashboard/brand/deals', 
    color: '#60a5fa', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 3H21V8M8 21H3V16M21 3L12 12M3 21L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    name: 'Campaigns', 
    path: '/dashboard/brand/campaigns', 
    color: '#38bdf8', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    name: 'Influencers', 
    path: '/dashboard/brand/influencers', 
    color: '#0ea5e9', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M19.4 15V9M16.4 4.4L13.4 2.1C12.5 1.4 11.4 1.4 10.5 2.1L7.5 4.4M4.5 9V15M7.5 19.6L10.5 21.9C11.4 22.6 12.5 22.6 13.4 21.9L16.4 19.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    name: 'Live Pulse', 
    path: '/dashboard/brand/live', 
    color: '#ef4444', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    name: 'Analytics', 
    path: '/dashboard/brand/analytics', 
    color: '#8b5cf6', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3V21H21M7 16L11 11L15 14L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    // ⚡️ გადაკეთდა: Payouts -> Settlements
    name: 'Settlements', 
    path: '/dashboard/brand/settlements', 
    color: '#ec4899', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    name: 'Settings', 
    path: '/dashboard/brand/settings', 
    color: '#64748b', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M19.4 15V9M16.4 4.4L13.4 2.1C12.5 1.4 11.4 1.4 10.5 2.1L7.5 4.4M4.5 9V15M7.5 19.6L10.5 21.9C11.4 22.6 12.5 22.6 13.4 21.9L16.4 19.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
]

export default function BrandSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 280 : 100 }}
      transition={{ duration: 0.2, ease: "circOut" }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      className="h-screen bg-[#010201] border-r border-blue-500/10 flex flex-col p-8 backdrop-blur-3xl sticky top-0 overflow-y-auto no-scrollbar z-[100]"
    >
      {/* Brand Identity */}
      <div className="mb-16 flex flex-col items-center">
        <h1 className="text-2xl font-black text-white tracking-tighter italic">
          {isExpanded ? (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
              INFLU<span className="text-blue-500 not-italic drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">X</span>
            </motion.span>
          ) : (
            <span className="text-blue-500 not-italic">X</span>
          )}
        </h1>
        {isExpanded && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.1 }} className="h-[1px] w-12 bg-blue-500/30 mt-4" />
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-4">
        {brandMenuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link key={item.name} href={item.path}>
              <motion.div
                whileHover={{ x: isExpanded ? 5 : 0 }}
                transition={{ duration: 0.1 }}
                className={`flex items-center ${isExpanded ? 'px-4' : 'justify-center'} py-4 rounded-2xl transition-all duration-200 relative group ${
                  isActive ? 'bg-white/[0.03] border border-white/5 shadow-2xl' : 'hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicatorBrand"
                    className="absolute left-0 w-1 h-5 bg-blue-500" 
                    style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}` }}
                  />
                )}
                
                <span className={`transition-all duration-200 flex-shrink-0 ${
                  isActive ? 'scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'
                }`} style={{ color: isActive ? item.color : '#475569' }}>
                  {item.icon}
                </span>

                <AnimatePresence mode="wait">
                  {isExpanded && (
                    <motion.span 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.1 }}
                      className={`ml-5 text-[11px] font-black uppercase tracking-[0.25em] whitespace-nowrap transition-all duration-200 ${
                        isActive ? 'text-white italic' : 'text-gray-600 group-hover:text-gray-300'
                      }`}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && isExpanded && (
                   <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-auto h-1 w-1 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                   />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Status Section */}
      <div className="mt-auto pt-10 border-t border-white/5 flex flex-col items-center">
        <div className={`flex items-center ${isExpanded ? 'gap-5 w-full' : 'justify-center'}`}>
          <div className="h-10 w-10 rounded-[15px] bg-[#01080c] border border-blue-500/10 flex items-center justify-center relative flex-shrink-0">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          </div>
          {isExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }} className="flex flex-col">
              <span className="text-[9px] text-white font-black uppercase tracking-widest italic leading-none whitespace-nowrap">Brand: Secured</span>
              <span className="text-[7px] text-gray-700 uppercase font-black tracking-[0.3em] mt-2 whitespace-nowrap">Node_Admin</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}