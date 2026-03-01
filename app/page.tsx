'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import InfluXCard from '@/components/InfluXCard'
import AmountModal from '@/components/AmountModal'
import ReceiptModal from '@/components/ReceiptModal'

// სკანერის დინამიკური იმპორტი (SSR Safety)
const QRScanner = dynamic(() => import('@/components/QRScanner'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-white/5 animate-pulse rounded-[35px] border border-white/10" />
})

export default function Home() {
  const [deal, setDeal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [showAmountModal, setShowAmountModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [scannedStore, setScannedStore] = useState<string | null>(null)
  
  // ფინანსური მონაცემების შენახვა ქვითრისთვის
  const [paymentDetails, setPaymentDetails] = useState({ 
    total: 0, 
    originalAmount: 0,
    split: {} 
  })

  // 1. მონაცემების სინქრონიზაცია ბაზასთან (პროცენტების ჩათვლით)
  useEffect(() => {
    async function fetchInfluXCore() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('deals')
          .select('*, brands(name)')
          .limit(1)

        if (error) throw error
        if (data && data.length > 0) setDeal(data[0])
      } catch (err) {
        console.error('Vault Sync Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchInfluXCore()
  }, [])

  // 2. სკანირების დამუშავება
  const handleScanSuccess = (decodedText: string) => {
    setScannedStore(decodedText)
    setShowScanner(false)
    setShowAmountModal(true)
  }

  // 3. გადახდის დადასტურება და მონაცემების გადაცემა ქვითრისთვის
  const handlePaymentConfirm = (finalTotal: number, splitDetails: any) => {
    // ვიღებთ original amount-ს AmountModal-იდან (გამოითვლება უკუპროპორციით ან გადაეცემა)
    // ამ შემთხვევაში splitDetails უკვე შეიცავს საჭირო ინფორმაციას
    const rawInput = finalTotal / (1 - (deal?.user_discount_pct || 20) / 100);
    
    setPaymentDetails({ 
      total: finalTotal, 
      originalAmount: rawInput,
      split: splitDetails 
    })
    
    setShowAmountModal(false)
    setShowReceipt(true) // იხსნება ფუტურისტული ქვითარი
  }

  return (
    <main className="h-screen w-full bg-[#020202] flex items-center justify-center p-6 overflow-hidden">
      
      {/* ეტაპი 0: სისტემის ჩატვირთვა */}
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
          <p className="text-[9px] text-blue-500 font-black tracking-[0.4em] uppercase animate-pulse">Syncing Secure Vault...</p>
        </div>
      ) : (
        /* ეტაპი 1: მთავარი 3D ტოკენი */
        <InfluXCard deal={deal}>
          <div className="mt-4">
            {showAmountModal ? (
              /* ეტაპი 3: სუფთა ჩექაუთი (მხოლოდ იუზერისთვის საჭირო ინფორმაციით) */
              <AmountModal 
                deal={deal} 
                onCancel={() => setShowAmountModal(false)}
                onConfirm={handlePaymentConfirm}
              />
            ) : showScanner ? (
              /* ეტაპი 2: QR სკანერი */
              <QRScanner onScanSuccess={handleScanSuccess} />
            ) : (
              /* საწყისი ინტერფეისი */
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowScanner(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-bold text-sm shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95"
                >
                  SCAN TO PAY
                </button>
                
                {/* დეველოპერული Bypass სწრაფი ტესტირებისთვის */}
                <button 
                  onClick={() => handleScanSuccess("DEV_STORE_ADIDAS")}
                  className="w-full py-2 text-[9px] text-gray-700 uppercase tracking-tighter hover:text-blue-400 transition-colors"
                >
                  [ DEV: Bypass to Checkout ]
                </button>
              </div>
            )}
          </div>
        </InfluXCard>
      )}

      {/* ეტაპი 4: ლაქშერი ქვითარი მოლარესთვის (Original vs Paid) */}
      {showReceipt && (
        <ReceiptModal 
          total={paymentDetails.total} 
          originalAmount={paymentDetails.originalAmount}
          deal={deal} 
          onDone={() => setShowReceipt(false)} 
        />
      )}

    </main>
  )
}