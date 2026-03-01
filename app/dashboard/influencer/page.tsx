'use client'

import { motion } from 'framer-motion'
import InfluXCard from '@/components/InfluXCard' // ჩვენი Modular Card

export default function InfluencerDashboard() {
  return (
    <main className="min-h-screen w-full bg-[#010201] p-8 overflow-y-auto">
      {/* 1. Header Section */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white tracking-tighter">
            Influ<span className="text-emerald-500 italic">X</span> VAULT
          </h1>
          <p className="text-[8px] font-black tracking-[0.6em] text-emerald-500 uppercase opacity-50">Secure Command Center</p>
        </div>
        <div className="h-10 w-10 rounded-full border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* 2. THE 3D TOKEN VIEW (ინფლუენსერის მთავარი აქტივი) */}
        <section className="flex flex-col gap-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-4">Active Digital Token</h3>
          <InfluXCard deal={{ brands: { name: 'GLOBAL PARTNERS' }, user_discount_pct: 20 }}>
             <div className="mt-8 p-6 bg-emerald-500/5 rounded-[30px] border border-emerald-500/10 backdrop-blur-md">
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] mb-2 font-bold">Total Sales via Token</p>
                <p className="text-3xl font-black text-white tracking-tighter">14,250.00 <span className="text-xs font-normal text-emerald-500">GEL</span></p>
             </div>
          </InfluXCard>
        </section>

        {/* 3. ANALYTICS & EARNINGS (მწვანე ესთეტიკა) */}
        <section className="space-y-8">
          <div className="bg-[#040d08]/80 border border-emerald-500/20 rounded-[45px] p-8 backdrop-blur-xl shadow-2xl">
             <span className="text-[9px] text-emerald-500 uppercase tracking-[0.5em] font-black italic">Net Profit (9%)</span>
             <h2 className="text-6xl font-black text-white tracking-tighter mt-4 mb-2 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
               1,282.50
             </h2>
             <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Available for withdrawal</span>
             
             <button className="w-full mt-10 bg-white text-black py-5 rounded-[25px] font-black text-[11px] tracking-[0.3em] uppercase hover:bg-emerald-600 hover:text-white transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
               Transfer to Bank
             </button>
          </div>'use client'

import { motion } from 'framer-motion'
import InfluXCard from '@/components/InfluXCard'

export default function InfluencerDashboard() {
  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-4 md:p-10 overflow-x-hidden">
      
      {/* 1. Header - კომპაქტური და სუფთა */}
      <header className="max-w-6xl mx-auto flex justify-between items-end mb-16 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">
            Influ<span className="text-emerald-500 italic">X</span> VAULT
          </h1>
          <p className="text-[9px] font-black tracking-[0.5em] text-emerald-500 uppercase opacity-60">Security Protocol Active</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-gray-500 uppercase tracking-widest">Operator Status</p>
          <p className="text-[10px] font-black text-emerald-500 uppercase">Online & Verified</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Left Column: The Token (35% width) */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Master Digital Asset</h3>
          <InfluXCard deal={{ brands: { name: 'GLOBAL PARTNERS' }, user_discount_pct: 20 }} />
          
          <div className="bg-white/[0.02] border border-white/5 rounded-[35px] p-8 mt-6">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total Sales Impact</span>
            <p className="text-4xl font-black mt-2 tracking-tighter text-white">14,250.00 <span className="text-sm text-emerald-500 uppercase">Gel</span></p>
          </div>
        </div>

        {/* 3. Right Column: Earnings & Stats (75% width) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#040d08]/90 border border-emerald-500/20 rounded-[50px] p-10 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] rounded-full" />
            
            <span className="text-[10px] text-emerald-500 uppercase tracking-[0.6em] font-black italic">Net Profit Available</span>
            <div className="flex items-baseline gap-2 mt-4">
               <h2 className="text-7xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">1,282.50</h2>
               <span className="text-xl font-bold text-emerald-500 uppercase">Gel</span>
            </div>
            
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-2 opacity-50">Authorized for immediate bank settlement</p>
            
            <button className="w-full mt-10 bg-white text-black py-5 rounded-[30px] font-black text-[12px] tracking-[0.4em] uppercase hover:bg-emerald-600 hover:text-white transition-all duration-700 shadow-xl">
              Execute Withdrawal
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8">
              <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Active Brands</span>
              <p className="text-3xl font-black text-white mt-1">12</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8">
              <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Token Scans</span>
              <p className="text-3xl font-black text-white mt-1">842</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}

          {/* Active Campaigns */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/[0.02] border border-white/5 rounded-[35px] p-6">
                <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest block mb-3">Partner Brands</span>
                <span className="text-2xl font-black text-white">12</span>
             </div>
             <div className="bg-white/[0.02] border border-white/5 rounded-[35px] p-6">
                <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest block mb-3">Token Scans</span>
                <span className="text-2xl font-black text-white">842</span>
             </div>
          </div>
        </section>

      </div>
    </main>
  )
}