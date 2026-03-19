'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import AmountModal from '@/components/AmountModal'
import ReceiptModal from '@/components/ReceiptModal'

// 📸 სკანერის დინამიური ჩატვირთვა SSR-ის პრევენციისთვის
const QRScanner = dynamic(() => import('@/components/QRScanner'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-white/[0.02] border border-white/5 animate-pulse rounded-[40px] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] italic">Initializing Optic Sensor...</p>
    </div>
  )
})

function PaymentContent() {
  const router = useRouter()
  const [step, setStep] = useState<'scan' | 'amount' | 'receipt'>('scan')
  
  const [scannedBrand, setScannedBrand] = useState<string | null>(null)
  const [activeDeal, setActiveDeal] = useState<any>(null)
  const [txData, setTxData] = useState<{ finalPayable: number; rawAmount: number } | null>(null)

  // 📸 1. QR სკანირების ლოგიკა
  const handleScanSuccess = async (decodedText: string) => {
    try {
      // 🛡️ UUID EXTRACTION LOGIC: ამოვიღოთ მხოლოდ ID ნებისმიერი ფორმატის ლინკიდან
      let brandId = decodedText.trim();

      if (brandId.includes('/')) {
        // შლის ლინკს ნაწილებად, აგდებს ცარიელებს და იღებს ბოლო მასივს
        const parts = brandId.split('/').filter(p => p.length > 0);
        brandId = parts.pop() || brandId;
      }

      // თუ ლინკში ?brand= ფორმატია
      if (brandId.includes('brand=')) {
        brandId = brandId.split('brand=').pop() || brandId;
      }

      // საბოლოო გასუფთავება (მაგ. თუ კითხვის ნიშანი დარჩა)
      brandId = brandId.split('?')[0];

      console.log("Transmission Target Identified:", brandId);
      setScannedBrand(brandId);

      const activeTokenRaw = localStorage.getItem('matrix_active_token');
      
      if (activeTokenRaw) {
        const token = JSON.parse(activeTokenRaw);
        const influencerId = token.profile?.id || token.id;

        const { data: partnership } = await supabase
          .from('partnerships')
          .select('*, deals(*)')
          .eq('influencer_id', influencerId)
          .eq('brand_id', brandId)
          .single();

        setActiveDeal(partnership || { user_discount_pct: 0, influencer_id: influencerId, brand_id: brandId });
      } else {
        setActiveDeal({ user_discount_pct: 0, influencer_cut_pct: 0, brand_id: brandId });
      }

      setStep('amount');
    } catch (err) {
      console.error("Scan Error:", err);
      alert("QR Transmission Interrupted. Try Again.");
    }
  }

  // 💸 2. გადახდის დადასტურების ლოგიკა
  const handlePaymentConfirm = async (finalPayable: number) => {
    try {
      const currentDealId = activeDeal?.deal_id || activeDeal?.id || null;
      const discountPct = activeDeal?.user_discount_pct || 0;
      
      // 🧮 საწყისი თანხის აღდგენა (bill_amount მონიტორისთვის)
      const rawAmount = discountPct < 100 
        ? (finalPayable / (1 - (discountPct / 100))) 
        : finalPayable;

      // 💾 INSERT TO SUPABASE
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          amount: Number(rawAmount.toFixed(2)),       // თავსებადობისთვის
          bill_amount: Number(rawAmount.toFixed(2)),  // 🚀 მოლარის მონიტორისთვის!
          final_amount: Number(finalPayable.toFixed(2)), // რეალურად გადახდილი
          deal_id: currentDealId,
          brand_id: scannedBrand,
          influencer_id: activeDeal?.influencer_id || null,
          status: 'success'
        }])
        .select()
        .single();

      if (error) throw error;

      setTxData({ finalPayable, rawAmount });
      setStep('receipt');

      // 📜 ლოკალური ისტორიის განახლება
      const newTx = {
        id: data.id,
        brandName: activeDeal?.deals?.title || 'Matrix Partner',
        paid: finalPayable,
        saved: Number((rawAmount - finalPayable).toFixed(2)),
        date: new Date().toISOString()
      };
      const savedHistory = JSON.parse(localStorage.getItem('matrix_tx_history') || '[]');
      localStorage.setItem('matrix_tx_history', JSON.stringify([newTx, ...savedHistory]));

    } catch (err: any) {
      console.error("Sync Error:", err.message);
      alert("Payment Failed: " + err.message);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      {step === 'scan' && (
        <div className="space-y-10 animate-in fade-in zoom-in duration-700">
          <div className="text-center space-y-3">
            <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
               <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">System Status: Ready</p>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Initialize <span className="text-emerald-500 text-glow">Node</span></h1>
            <p className="text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase italic">Align QR within the matrix frame</p>
          </div>
          
          <QRScanner onScanSuccess={handleScanSuccess} onScanError={(err: any) => console.log(err)} />
          
          <button 
            onClick={() => router.back()} 
            className="w-full py-4 text-[9px] font-black text-gray-700 uppercase tracking-[0.5em] italic hover:text-white transition-colors"
          >
            [ Abort Transmission ]
          </button>
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
          onDone={() => { localStorage.removeItem('matrix_active_token'); router.push('/wallet') }} 
        />
      )}
    </div>
  )
}

// 🛡️ ROOT EXPORT WITH SUSPENSE
export default function PaymentFlowPage() {
  return (
    <main className="min-h-screen bg-[#010201] text-white flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98105,transparent_70%)] pointer-events-none" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-emerald-500 font-black animate-pulse tracking-[0.5em] uppercase italic text-[10px]">Linking to Matrix...</p>
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </main>
  )
}