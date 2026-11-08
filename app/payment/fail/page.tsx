'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function FailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const txId = searchParams.get('txid')

  return (
    <div className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
        <span className="text-red-500 text-2xl">!</span>
      </div>
      <p className="text-red-500 font-black uppercase tracking-widest mb-2 italic text-sm">Payment Failed</p>
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic mb-6">
        The bank cancelled or rejected this checkout.
      </p>
      {txId && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mb-8 max-w-md w-full">
          <p className="text-red-400 text-[10px] font-mono break-words lowercase">txid: {txId}</p>
        </div>
      )}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <button
          onClick={() => router.push('/pay')}
          className="w-full py-4 bg-red-600/10 border border-red-500/50 text-red-500 rounded-full font-black text-[10px] uppercase tracking-[0.4em] italic hover:bg-red-600 hover:text-white transition-all active:scale-95"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push('/wallet')}
          className="px-10 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all italic"
        >
          Back to Wallet
        </button>
      </div>
    </div>
  )
}

export default function PaymentFail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <FailContent />
    </Suspense>
  )
}
