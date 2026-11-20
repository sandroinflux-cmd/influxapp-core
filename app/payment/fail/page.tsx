'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function FailContent() {
  const searchParams = useSearchParams()
  const txId = searchParams.get('txid')
  const deal = searchParams.get('deal')
  const ref = searchParams.get('ref')

  const retryHref = deal
    ? `/pay?deal=${encodeURIComponent(deal)}${ref ? `&ref=${encodeURIComponent(ref)}` : ''}`
    : '/'

  const shortId = txId ? txId.replace(/-/g, '').slice(0, 8).toUpperCase() : ''

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#010201] px-5 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-red-400/30 bg-red-500/10 px-6 py-8 text-center">
        <h1 className="text-2xl font-black">გადახდა ვერ შესრულდა</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Payment failed. ბანკმა ეს გადახდა არ დაასრულა.
        </p>
        {shortId && <p className="mt-4 text-xs tracking-widest text-white/45">#{shortId}</p>}
        <Link
          href={retryHref}
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-white py-4 text-sm font-black text-black"
        >
          სცადე თავიდან · Try again
        </Link>
      </div>
    </main>
  )
}

export default function PaymentFail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#010201]" />}>
      <FailContent />
    </Suspense>
  )
}
