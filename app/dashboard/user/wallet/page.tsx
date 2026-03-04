'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import InfluXCard from '@/components/InfluXCard'
import AmountModal from '@/components/AmountModal'
import ReceiptModal from '@/components/ReceiptModal'

// QR Scanner dynamic import
const QRScanner = dynamic(() => import('@/components/QRScanner'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-white/5 animate-pulse rounded-[45px] border border-white/10" />
})

const mockUserTokens = [
  { id: 1, name: 'Andro Protocol', user_discount_pct: 20, influencer_cut_pct: 9, system_fee_pct: 4, brand_cut_pct: 67, logo: '🤖', token: '$ANDRO', brands: { name: 'Andro Global' } },
  { id: 2, name: 'Nina Matrix', user_discount_pct: 15, influencer_cut_pct: 10, system_fee_pct: 5, brand_cut_pct: 70, logo: '🧬', token: '$NINA', brands: { name: 'Nina Brand' } },
  { id: 3, name: 'Cyber Luna', user_discount_pct: 10, influencer_cut_pct: 8, system_fee_pct: 4, brand_cut_pct: 78, logo: '🌙', token: '$LUNA', brands: { name: 'Luna Systems' } },
]

export default function InfluXWalletPage() {
  const [step, setStep] = useState<'IDLE' | 'SELECT' | 'SCAN' | 'AMOUNT' | 'RECEIPT'>('IDLE')
  const [selectedToken, setSelectedToken] = useState<any>(null)
  const [paymentDetails, setPaymentDetails] = useState({ total: 0, originalAmount: 0 })

  const handleTokenSelect = (token: any) => {
    setSelectedToken(token)
    setStep('SELECT')
  }

  const handlePaymentConfirm = (finalTotal: number) => {
    const discount = selectedToken?.user_discount_pct || 20;
    const rawInput = finalTotal / (1 - discount / 100);
    setPaymentDetails({ total: finalTotal, originalAmount: rawInput })
    setStep('RECEIPT')
  }

  return (
    <main className="min-h-screen bg-[#020202] text-white p-6 md:p-14 font-sans overflow-x-hidden">
      
      {/* 💠 Wallet Header */}
      <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <span className="text-blue-500/40 text-[9px] font-black tracking-[0.7em] uppercase block italic">Asset Vault v2.6</span>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">
            InfluX <span className="text-blue-500 italic text-glow">Wallet</span>
          </h1>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] shadow-inner font-sans">
           <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic block mb-2">Matrix Balance</span>
           <p className="text-4xl font-black italic text-emerald-500 leading-none">1,240.50 <span className="text-xs opacity-30">₾</span></p>
        </div>
      </header>

      {/* 📜 3 Full-Scale Tokens Node */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 justify-items-center">
        {mockUserTokens.map((token) => (
          <div key={token.id} onClick={() => handleTokenSelect(token)} className="w-full flex justify-center transform scale-90 hover:scale-95 transition-transform">
             <InfluXCard deal={token} />
          </div>
        ))}
      </div>

      {/* 🚀 Active Process Overlay */}
      <AnimatePresence>
        {(step !== 'IDLE' && step !== 'RECEIPT') && (
          <div className="fixed inset-0 z-[500] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 overflow-y-auto">
             <button 
               onClick={() => { setStep('IDLE'); setSelectedToken(null); }} 
               className="absolute top-10 right-10 text-[10px] font-black text-gray-500 uppercase tracking-widest italic hover:text-white transition-all z-[600]"
             >
               Close Vault [X]
             </button>

             <div className="w-full max-w-[380px] py-10">
                <InfluXCard deal={selectedToken}>
                   <div className="mt-8 space-y-4">
                      
                      {/* Token Menu */}
                      {step === 'SELECT' && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                           <button 
                              onClick={() => setStep('SCAN')} 
                              className="w-full bg-blue-600 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl italic text-white hover:bg-blue-500 transition-all active:scale-95"
                           >
                              SCAN TO PAY
                           </button>
                           <button 
                              onClick={() => setStep('AMOUNT')} 
                              className="w-full py-2 text-[9px] font-black text-gray-700 uppercase tracking-widest italic text-center hover:text-blue-400 transition-colors"
                           >
                              [ Direct Checkout: Skip QR Scan ]
                           </button>
                        </div>
                      )}

                      {/* Scanner Phase */}
                      {step === 'SCAN' && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                           <QRScanner onScanSuccess={() => setStep('AMOUNT')} />
                        </div>
                      )}

                      {/* Amount Phase */}
                      {step === 'AMOUNT' && (
                        <AmountModal 
                           deal={selectedToken}
                           onCancel={() => setStep('SELECT')}
                           onConfirm={handlePaymentConfirm}
                        />
                      )}
                   </div>
                </InfluXCard>
             </div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Phase */}
      <AnimatePresence>
        {step === 'RECEIPT' && (
          <ReceiptModal 
            total={paymentDetails.total} 
            originalAmount={paymentDetails.originalAmount}
            deal={selectedToken} 
            onDone={() => { setStep('IDLE'); setSelectedToken(null); }} 
          />
        )}
      </AnimatePresence>

    </main>
  )
}