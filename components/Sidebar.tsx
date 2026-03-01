'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Matrix', path: '/dashboard/influencer', color: '#10b981', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/> <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/> </svg> ) },
  { name: 'Token', path: '/dashboard/influencer/token', color: '#f59e0b', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/> <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/> <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/> </svg> ) },
  { name: 'My Deals', path: '/dashboard/influencer/deals', color: '#3b82f6', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M16 3H21V8M8 21H3V16M21 3L12 12M3 21L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> </svg> ) },
  { name: 'Marketplace', path: '/dashboard/influencer/marketplace', color: '#06b6d4', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/> <path d="M3.6 9H20.4M3.6 15H20.4" stroke="currentColor" strokeWidth="1.5"/> <path d="M12 3C14.501 5.338 16 8.52 16 12C16 15.48 14.501 18.662 12 21C9.499 18.662 8 15.48 8 12C8 8.52 9.499 5.338 12 3Z" stroke="currentColor" strokeWidth="1.5"/> </svg> ) },
  { name: 'Live Pulse', path: '/dashboard/influencer/live', color: '#ef4444', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> </svg> ) },
  { name: 'Analytics', path: '/dashboard/influencer/analytics', color: '#8b5cf6', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M3 3V21H21M7 16L11 11L15 14L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> </svg> ) },
  { name: 'Payouts', path: '/dashboard/influencer/payouts', color: '#ec4899', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> </svg> ) },
  { name: 'Settings', path: '/dashboard/influencer/settings', color: '#64748b', icon: ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5"/> <path d="M19.4 15V9M16.4 4.4L13.4 2.1C12.5 1.4 11.4 1.4 10.5 2.1L7.5 4.4M4.5 9V15M7.5 19.6L10.5 21.9C11.4 22.6 12.5 22.6 13.4 21.9L16.4 19.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> </svg> ) },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="h-screen w-72 bg-[#010201] border-r border-emerald-500/10 flex flex-col p-10 backdrop-blur-3xl sticky top-0 overflow-y-auto no-scrollbar">
      <div className="mb-20">
        <h1 className="text-3xl font-black text-white tracking-tighter italic leading-none">
          INFLU<span className="text-emerald-500 not-italic drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">X</span>
        </h1>
        <div className="h-[1px] w-12 bg-emerald-500/30 mt-4" />
        <p className="text-[7px] font-black tracking-[0.6em] text-gray-500 uppercase mt-4">Matrix Protocol v1.0</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link key={item.name} href={item.path} prefetch={true}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-5 p-4 rounded-2xl transition-colors duration-200 relative group ${
                  isActive ? 'bg-white/[0.04] border border-white/5 shadow-xl' : 'hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    className="absolute left-0 w-1 h-5 bg-emerald-500 shadow-[0_0_15px_#10b981]" 
                    style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}` }}
                  />
                )}
                
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'}`} style={{ color: isActive ? item.color : '#475569' }}>
                  {item.icon}
                </span>

                <span className={`text-[11px] font-black uppercase tracking-[0.25em] transition-colors duration-200 ${isActive ? 'text-white italic' : 'text-gray-600 group-hover:text-gray-300'}`}>
                  {item.name}
                </span>

                {isActive && (
                   <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.5 }} className="ml-auto h-1 w-1 rounded-full" style={{ backgroundColor: item.color }} />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-10 border-t border-white/5">
        <div className="flex items-center gap-5">
          <div className="h-10 w-10 rounded-[15px] bg-[#040d08] border border-emerald-500/10 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white font-black uppercase tracking-widest italic leading-none">Auth: Verified</span>
            <span className="text-[7px] text-gray-700 uppercase font-black tracking-[0.3em] mt-2">Operator_Core_01</span>
          </div>
        </div>
      </div>
    </div>
  )
}