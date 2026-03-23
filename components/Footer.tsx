'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-16 border-t border-white/5 bg-[#000000] flex flex-col items-center gap-10 relative z-10">
      
      {/* Payment Method Logos */}
      <div className="flex items-center gap-12 opacity-20 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0">
        <svg viewBox="0 0 24 24" className="h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.421 16.516l-1.34-8.892h-2.58l-1.611 8.892H2.3l.034-.153 1.606-4.99c.321-.996 1.137-1.465 1.942-1.465h3.805l-.261 1.708H5.66c-.302 0-.462.13-.538.38l-1.026 3.193 1.503 1.327h4.822zm5.727-4.22c-.015-.986-.71-1.41-1.378-1.745-.694-.343-1.124-.564-1.124-.913 0-.33.364-.67.95-.67.458 0 .86.136 1.157.307l.142.083.411-2.522c-.318-.114-1.1-.31-1.996-.31-2.457 0-4.186 1.303-4.195 3.172-.015 1.385 1.258 2.15 2.21 2.617.973.477 1.298.784 1.298 1.21 0 .653-.787.952-1.516.952-.962 0-1.503-.138-2.296-.484l-.328-.152-.432 2.668c.451.205 1.277.382 2.13.39 2.593 0 4.298-1.282 4.31-3.267h.657zm4.276 4.22h2.246l-1.928-8.892h-2.146c-.41 0-.756.242-.907.616l-3.328 8.276h2.51l.5-1.365h3.065l.288 1.365zm-2.023-3.396l.823-3.92.234 3.92h-1.057zm-8.807 3.396l1.326-8.892H7.268l-1.328 8.892H9.594z"/>
        </svg>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
          alt="Mastercard" 
          className="h-8" 
        />
      </div>

      <div className="text-center space-y-6">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic">
            © 2026 INFLUX NODE • SECURED ECOSYSTEM
          </p>
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest max-w-xs leading-loose">
            შპს ინფლუქს ნოუდ • ს/ნ: [აქ ჩაწერეთ] • ქ. თბილისი, პეკინის გამზ. 41
          </p>
        </div>
        
        <div className="flex gap-10 justify-center">
          <Link href="/terms" className="text-[9px] font-black text-gray-600 hover:text-emerald-500 uppercase tracking-widest transition-all italic">
            [ Terms of Service ]
          </Link>
          <Link href="/privacy" className="text-[9px] font-black text-gray-600 hover:text-emerald-500 uppercase tracking-widest transition-all italic">
            [ Privacy Policy ]
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </footer>
  )
}