'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AmountModal({ deal, onConfirm, onCancel }: any) {
  const [inputAmount, setInputAmount] = useState('')
  
  const userPct = deal?.user_discount_pct || 20;
  const influencerPct = deal?.influencer_cut_pct || 9;
  const systemPct = deal?.system_fee_pct || 4;
  const brandPct = deal?.brand_cut_pct || 67;

  const raw = parseFloat(inputAmount) || 0;
  const userDiscount = (raw * userPct) / 100;
  const finalPayable = raw - userDiscount;

  // 🚀 დაზღვეული ვარიანტი: ამოწმებს როგორც ბაზის, ისე ტელეფონის მონაცემებს
  const brandName = deal?.brands?.name || deal?.brand || deal?.title || 'MATRIX PARTNER';
  const brandLogo = deal?.brands?.logo || deal?.logo || '💎';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[400px] bg-[#050505] border border-blue-500/30 rounded-[35px] p-8 animate-in zoom-in-95 duration-300 shadow-[0_0_80px_rgba(37,99,235,0.2)] relative">
        
        <div className="flex flex-col items-center mb-8 border-b border-white/5 pb-6">
          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
            {brandLogo.startsWith('http') 
              ? <img src={brandLogo} alt="brand" className="h-full w-full object-cover" /> 
              : <span className="text-2xl">{brandLogo}</span>}
          </div>
          <span className="text-xs font-black text-white uppercase italic tracking-widest text-center">{brandName}</span>
          <span className="text-[8px] font-black tracking-[0.4em] text-blue-500 uppercase mt-1 italic">Secure Checkout</span>
        </div>
        
        <div className="space-y-6">
          <div className="relative">
            <label className="text-[9px] text-gray-500 uppercase tracking-widest mb-3 block text-center font-bold">Original Price (GEL)</label>
            <input 
              type="number" 
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-3xl font-bold text-white text-center focus:border-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
          </div>

          {raw > 0 && (
            <div className="space-y-5 animate-in fade-in duration-500">
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Your Savings ({userPct}%)</span>
                <span className="text-green-500 font-black">-{userDiscount.toFixed(2)} GEL</span>
              </div>

              <div className="relative bg-white/5 rounded-[25px] p-6 border border-white/5 flex justify-between items-center overflow-hidden">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Total to Pay</span>
                  <span className="text-3xl font-black text-white leading-none">
                    {finalPayable.toFixed(2)} <span className="text-sm font-light text-gray-400">GEL</span>
                  </span>
                </div>

                <div className="absolute right-6 h-12 w-12 flex items-center justify-center">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute h-full w-full rounded-full bg-blue-500/10 border border-blue-500/20" />
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_4px_rgba(37,99,235,0.7)]" />
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute h-[140%] w-[140%] border-[2px] border-dotted border-blue-500/30 rounded-full" />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <button 
              disabled={raw <= 0}
              onClick={() => onConfirm(finalPayable, { influencerEarnings: (raw * influencerPct)/100, systemFee: (raw * systemPct)/100, brandAmount: (raw * brandPct)/100 })}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-20 py-5 rounded-2xl font-bold text-sm shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95"
            >
              CONFIRM & PAY
            </button>
            <button onClick={onCancel} className="w-full py-2 text-[9px] uppercase font-bold text-gray-600 hover:text-white transition-colors tracking-[0.3em]">CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  )
}