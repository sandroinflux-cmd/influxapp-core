'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import BrandMark from '@/components/BrandMark'

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
    <main className="flex min-h-screen flex-col items-center bg-[#090808] px-5 py-10 text-[#F2EFE9]">
      <div className="my-auto flex w-full max-w-md flex-col items-center">
      <BrandMark size="sm" />
      <div className="mt-6 w-full rounded-2xl border border-white/[0.08] bg-[#121011] px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(242,239,233,0.08)]">
        <h1 className="font-editorial text-2xl font-medium text-[#F2EFE9]">გადახდა ვერ შესრულდა</h1>
        <p className="mt-3 font-sans text-sm leading-relaxed text-[#8C8580]">
          ბანკმა ეს გადახდა არ დაასრულა.
        </p>
        {shortId && (
          <p className="mt-4 font-mono text-xs tracking-[0.18em] text-[#8C8580]">#{shortId}</p>
        )}
        <Link
          href={retryHref}
          className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#F2EFE9] py-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#090808] transition-colors hover:bg-[#E7DEC8]"
        >
          სცადე თავიდან
        </Link>
      </div>
      </div>
    </main>
  )
}

export default function PaymentFail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090808]" />}>
      <FailContent />
    </Suspense>
  )
}
