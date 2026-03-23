'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ReceiptModal from '@/components/ReceiptModal'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const txId = searchParams.get('txid')

  const [txData, setTxData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (txId) {
      fetchTransactionDetails()
    } else {
      setLoading(false)
      setError(true)
    }
  }, [txId])

  const fetchTransactionDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          deals (*, brands(*))
        `)
        .eq('id', txId)
        .single()

      if (error || !data) throw error
      setTxData(data)
    } catch (err) {
      console.error("Sync Error:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // 🛡️ Error State (თუ ბმული გატეხილია)
  if (error) {
    return (
      <div className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-black uppercase tracking-widest mb-6 italic">Signal Lost: Transaction Not Found</p>
        <button onClick={() => router.push('/wallet')} className="px-8 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all italic">
          [ Return to Base ]
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-white italic font-black uppercase">
      {txData && (
        <ReceiptModal 
          total={txData.final_amount} 
          originalAmount={txData.bill_amount} 
          deal={txData.deals} 
          onDone={() => router.push('/wallet')} 
        />
      )}

      {loading && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[8px] animate-pulse tracking-[0.5em] text-emerald-500">Decrypting Transaction Intel...</p>
        </div>
      )}
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SuccessContent />
    </Suspense>
  )
}