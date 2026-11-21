'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-16 border-t border-white/5 bg-[#000000] flex flex-col items-center gap-10 relative z-10">
      
      {/* 💳 Payment Method Logos */}
      <div className="flex items-center gap-12 opacity-20 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0 select-none">
        
        {/* 🔹 VISA - Styled Text Logo */}
        <span className="text-2xl md:text-3xl font-[1000] italic tracking-[-0.1em] text-white leading-none">
          VISA
        </span>

        {/* Mastercard Logo */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
          alt="Mastercard" 
          className="h-8 md:h-9" 
        />
      </div>

      <div className="text-center space-y-6">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic">
            © 2026 INFLUX • SECURED ECOSYSTEM
          </p>
          
          {/* 🏢 იურიდიული მონაცემები */}
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest max-w-xs leading-loose">
            შპს ინფლუ იქსი 2025 INFLUX • ს/ნ: 406517675 •
          </p>
        </div>
        
        <div className="flex gap-10 justify-center">
          <Link href="/terms" className="text-[9px] font-black text-gray-600 hover:text-emerald-500 uppercase tracking-widest transition-all italic">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-[9px] font-black text-gray-600 hover:text-emerald-500 uppercase tracking-widest transition-all italic">
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* დეკორატიული ხაზი ბოლოში */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </footer>
  )
}