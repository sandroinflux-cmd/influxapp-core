'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import QRScanner from '@/components/QRScanner' 
import AmountModal from '@/components/AmountModal'
import ReceiptModal from '@/components/ReceiptModal'

export default function PaymentFlowPage() {
  const router = useRouter()
  const [step, setStep] = useState('scan') // 'scan' | 'amount' | 'receipt'
  
  const [scannedBrand, setScannedBrand] = useState(null)
  const [activeDeal, setActiveDeal] = useState(null)
  const [txData, setTxData] = useState(null)

  // 📸 1. როცა QR კოდი დასკანერდება
  const handleScanSuccess = async (decodedText) => {
    const brandId = decodedText.split('/').pop() || decodedText
    setScannedBrand(brandId)

    const activeTokenRaw = localStorage.getItem('matrix_active_token')
    
    if (activeTokenRaw) {
      const token = JSON.parse(activeTokenRaw)
      const influencerId = token.profile?.id || token.id

      if (influencerId) {
        // ვიღებთ პარტნიორობას და მასთან მიბმულ დილს
        const { data: partnership } = await supabase
          .from('partnerships')
          .select('*, deals(*)')
          .eq('influencer_id', influencerId)
          .eq('brand_id', brandId)
          .single()

        if (partnership) {
          setActiveDeal(partnership)
        } else {
          setActiveDeal({ user_discount_pct: 0, influencer_id: influencerId, brand_id: brandId })
        }
      } else {
        setActiveDeal(token)
      }
    } else {
      setActiveDeal({
        user_discount_pct: 0,
        influencer_cut_pct: 0,
        brand_id: brandId
      })
    }

    setStep('amount')
  }

  // 💸 2. როცა იუზერი თანხას ჩაწერს და იხდის
  const handlePaymentConfirm = async (finalPayable) => {
    // MATRIX LOGIC: ვიღებთ deal_id-ს, რომ ბაზამ დათვალოს სპლიტი
    const currentDealId = activeDeal?.deal_id || activeDeal?.id;
    
    const discountPct = activeDeal?.user_discount_pct || 0;
    const rawAmount = discountPct < 100 
      ? (finalPayable / (1 - (discountPct / 100))) 
      : finalPayable;

    // 💾 ვინახავთ ტრანზაქციას Supabase-ში
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        amount: Number(rawAmount.toFixed(2)), // საწყისი ფასი
        deal_id: currentDealId,               // აუცილებელი პარამეტრი SQL ტრიგერისთვის
        brand_id: scannedBrand,
        influencer_id: activeDeal?.influencer_id || null,
        status: 'success'
        // დანარჩენ სვეტებს (brand_earned და ა.შ.) ავსებს ბაზა ავტომატურად
      }])
      .select()
      .single();

    if (error) {
      console.error("Matrix Sync Error:", error.message);
      alert("გადახდა ვერ მოხერხდა: " + error.message);
      return;
    }

    setTxData({ finalPayable, rawAmount });
    setStep('receipt');

    // 💾 ლოკალური ისტორია ვოლეტისთვის
    const newTx = {
      id: Date.now(),
      brandName: activeDeal?.deals?.title || activeDeal?.brand_name || 'Matrix Partner',
      paid: finalPayable,
      saved: Number((rawAmount - finalPayable).toFixed(2)),
      date: new Date().toISOString()
    };
    
    const savedHistory = JSON.parse(localStorage.getItem('matrix_tx_history') || '[]');
    localStorage.setItem('matrix_tx_history', JSON.stringify([newTx, ...savedHistory]));
  }

  const handleDone = () => {
    localStorage.removeItem('matrix_active_token')
    router.push('/wallet')
  }

  return (
    <main className="min-h-screen bg-[#010201] text-white flex flex-col items-center justify-center p-6 font-sans">
      {step === 'scan' && (
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Initialize <span className="text-emerald-500">Node</span></h1>
            <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">Scan physical access point</p>
          </div>
          <QRScanner onScanSuccess={handleScanSuccess} onScanError={(err) => console.log("Scan Note:", err)} />
        </div>
      )}

      {step === 'amount' && (
        <AmountModal 
          deal={activeDeal} 
          onConfirm={handlePaymentConfirm} 
          onCancel={() => { localStorage.removeItem('matrix_active_token'); router.push('/wallet') }} 
        />
      )}

      {step === 'receipt' && (
        <ReceiptModal 
          total={txData?.finalPayable} 
          originalAmount={txData?.rawAmount} 
          deal={activeDeal} 
          onDone={handleDone} 
        />
      )}
    </main>
  )
}