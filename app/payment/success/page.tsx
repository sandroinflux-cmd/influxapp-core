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
  const [errorMsg, setErrorMsg] = useState<string | null>(null) // 🔍 ერორის დეტალების შემნახველი

  useEffect(() => {
    if (txId) {
      fetchTransactionDetails()
    } else {
      // ვამოწმებთ, ბანკმა ხომ არ ჩაანაცვლა ჩვენი ლინკი
      const allParams = searchParams.toString()
      setErrorMsg(`URL ERROR: txid is missing. Current parameters: ${allParams}`)
      setLoading(false)
    }
  }, [txId, searchParams])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      const { data, error: sbError } = await supabase
        .from('transactions')
        .select('*, deals (*)')
        .eq('id', txId)
        .single()

      if (sbError) throw sbError
      if (!data) throw new Error("Transaction not found in database")

      setTxData(data)
    } catch (err: any) {
      // 🔍 ვიჭერთ ზუსტ ერორს Supabase-დან
      setErrorMsg(`DATABASE ERROR: ${err.message || JSON.stringify(err)}`)
    } finally {
      setLoading(false)
    }
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
          <span className="text-red-500 text-2xl">!</span>
        </div>
        <p className="text-red-500 font-black uppercase tracking-widest mb-2 italic text-sm">System Error X-Ray</p>
        
        {/* 🔴 ზუსტი ერორი გამოჩნდება აქ! */}
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mb-8 max-w-md w-full">
          <p className="text-red-400 text-[10px] font-mono break-words lowercase">{errorMsg}</p>
        </div>

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