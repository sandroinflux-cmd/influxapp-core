'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-white/5 bg-[#010201] flex flex-col items-center gap-8 relative z-10">
      
      <div className="text-center space-y-4">
        {/* ბრენდინგი */}
        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] italic">
          © 2026 INFLUX NODE • SECURED ECOSYSTEM
        </p>
        
        {/* იურიდიული ლინკები */}
        <div className="flex gap-8 justify-center">
          <Link href="/terms" className="text-[9px] font-bold text-gray-500 hover:text-emerald-500 uppercase tracking-widest transition-colors italic">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-[9px] font-bold text-gray-500 hover:text-emerald-500 uppercase tracking-widest transition-colors italic">
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* პატარა დიზაინერული დეტალი */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
    </footer>
  )
}