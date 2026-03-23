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
      console.error("No Transaction ID provided in URL")
      setLoading(false)
      setError(true)
    }
  }, [txId])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      // 🔍 ყურადღება: დარწმუნდით რომ თეიბლის სახელები და კავშირები (Foreign Keys) სწორია
      const { data, error: sbError } = await supabase
        .from('transactions')
        .select(`
          *,
          deals (*)
        `)
        .eq('id', txId)
        .single()

      if (sbError) {
        console.error("Supabase Logic Error:", sbError.message, sbError.details)
        throw sbError
      }

      if (!data) {
        console.error("Transaction found but data is null")
        throw new Error("No data found")
      }

      setTxData(data)
    } catch (err: any) {
      console.error("Sync Error Detailed:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
          <span className="text-red-500 text-2xl">!</span>
        </div>
        <p className="text-red-500 font-black uppercase tracking-widest mb-2 italic text-sm">Signal Connection Lost</p>
        <p className="text-gray-600 text-[10px] uppercase mb-8">Transaction verification failed or access denied.</p>
        <button 
          onClick={() => router.push('/wallet')} 
          className="px-10 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all italic"
        >
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