'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ReceiptModal from '@/components/ReceiptModal'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const txId = searchParams.get('txid') // ვიღებთ ტრანზაქციის ID-ს URL-იდან

  const [txData, setTxData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (txId) {
      fetchTransactionDetails()
    }
  }, [txId])

  const fetchTransactionDetails = async () => {
    try {
      // 🔍 ამოგვაქვს ტრანზაქციის სრული დეტალები ჩეკისთვის
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          deals (*)
        `)
        .eq('id', txId)
        .single()

      if (error) throw error
      setTxData(data)
    } catch (err) {
      console.error("Sync Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#010201] flex flex-col items-center justify-center p-6 text-white italic font-black uppercase">
      
      {/* 📜 როგორც კი მონაცემები მოვა, ReceiptModal თავისით ამოხტება */}
      {txData && (
        <ReceiptModal 
          total={txData.final_amount} 
          originalAmount={txData.bill_amount} 
          deal={txData.deals} 
          onDone={() => router.push('/wallet')} // ჩეკის დახურვისას გადადის ვოლეტში
        />
      )}

      {/* 🔄 Loading ეფექტი სანამ ჩეკი გენერირდება */}
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
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  )
}