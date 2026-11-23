'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 flex w-full flex-col items-center gap-8 border-t border-white/[0.08] bg-[#090808] py-14">
      <div className="flex items-center gap-10 text-[#8C8580]">
        <span className="font-sans text-xl font-medium tracking-[0.14em] text-[#F2EFE9]/80">
          VISA
        </span>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
          alt="Mastercard"
          className="h-7 opacity-80"
        />
      </div>

      <div className="space-y-4 text-center">
        <p className="font-sans text-xs text-[#8C8580]">
          შპს ინფლუიქსი 2025 · ს/ნ 406517675
        </p>
        <div className="flex justify-center gap-8">
          <Link href="/terms" className="font-sans text-xs text-[#8C8580] transition-colors hover:text-[#F2EFE9]">
            Terms of Service
          </Link>
          <Link href="/privacy" className="font-sans text-xs text-[#8C8580] transition-colors hover:text-[#F2EFE9]">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
