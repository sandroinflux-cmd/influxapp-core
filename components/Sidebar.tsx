'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    // 🛡️ -translate-x-full მალავს მობილურზე, lg:translate-x-0 აჩენს დესკტოპზე
    <aside className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#010201] border-r border-white/5 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
      <div className="flex flex-col h-full p-8">
        <div className="mb-12">
            <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Influ<span className="text-emerald-500 not-italic">X</span></h2>
            <p className="text-[7px] font-black text-gray-700 uppercase tracking-[0.4em] mt-1">Matrix Protocol v1.0</p>
        </div>

        <nav className="flex-1 space-y-2">
          {['MATRIX', 'TOKEN', 'MY DEALS', 'SETTINGS'].map((item) => (
            <Link 
              key={item}
              href={`/dashboard/influencer/${item.toLowerCase().replace(' ', '-')}`}
              className={`block px-6 py-4 rounded-2xl text-[9px] font-black tracking-[0.3em] uppercase italic transition-all ${
                pathname.includes(item.toLowerCase().replace(' ', '-')) 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'text-gray-600 hover:text-white'
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Auth: Verified</span>
            </div>
        </div>
      </div>
    </aside>
  )
}