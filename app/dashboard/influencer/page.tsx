'use client'

import InfluXCard from '@/components/InfluXCard'

export default function MatrixDashboard() {
  return (
    // 📱 პადინგები შემცირებულია მობილურისთვის (p-4)
    <main className="min-h-screen bg-[#010201] text-white p-4 lg:p-14 overflow-x-hidden">
      
      <header className="mb-10 lg:mb-14">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tighter italic uppercase text-center lg:text-left">
          Influ<span className="text-emerald-500 not-italic">X</span> Vault
        </h1>
        <p className="text-[7px] lg:text-[8px] font-black tracking-[0.5em] text-gray-600 uppercase mt-2 italic text-center lg:text-left">Secure Command Center</p>
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10 max-w-7xl mx-auto">
        
        {/* Token Section - First on Mobile */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.5em] mb-6 italic lg:self-start lg:ml-4">Active Matrix Asset</span>
          <InfluXCard deal={{ brands: { name: "Influencer X" } }} />
        </div>

        {/* Metrics Section - Below Token on Mobile */}
        <div className="lg:col-span-7 space-y-6 lg:space-y-10">
          
          {/* Net Profit Card */}
          <div className="bg-[#040d08] border border-white/5 rounded-[40px] p-8 lg:p-16 relative overflow-hidden group">
            <span className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.4em] italic block mb-4">Net Profit ( 9% )</span>
            <div className="flex items-baseline gap-2 lg:gap-4">
              <h2 className="text-5xl lg:text-[110px] font-black tracking-tighter italic leading-none">1,282.50</h2>
              <span className="text-lg lg:text-4xl font-black text-emerald-500 italic opacity-40">GEL</span>
            </div>
            
            <button className="w-full bg-white text-black py-6 lg:py-8 rounded-[30px] font-black text-[10px] lg:text-sm tracking-[0.4em] uppercase mt-10 lg:mt-16 hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95">
              Transfer to Bank
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 lg:gap-10">
            <div className="bg-[#040d08] border border-white/5 rounded-[35px] p-8 lg:p-12 text-center lg:text-left">
              <span className="text-[7px] text-gray-700 font-black uppercase tracking-widest block mb-2 italic">Partner Brands</span>
              <p className="text-4xl lg:text-6xl font-black italic tracking-tighter">12</p>
            </div>
            <div className="bg-[#040d08] border border-white/5 rounded-[35px] p-8 lg:p-12 text-center lg:text-left">
              <span className="text-[7px] text-gray-700 font-black uppercase tracking-widest block mb-2 italic">Token Scans</span>
              <p className="text-4xl lg:text-6xl font-black italic tracking-tighter">842</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}