'use client'

import { motion } from 'framer-motion'

const metrics = [
  { label: 'Total Budget Allocated', value: '45,000', unit: 'GEL', icon: '💰' },
  { label: 'Active Campaigns', value: '8', unit: 'NODES', icon: '🚀' },
  { label: 'Partner Influencers', value: '124', unit: 'AUTH', icon: '🛡️' },
  { label: 'Global Reach', value: '1.2M', unit: 'EYES', icon: '🌐' },
]

export default function BrandDashboard() {
  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-10 max-w-7xl mx-auto pb-24">
      
      {/* 💎 Header Section: Sapphire Matrix Branding */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-white">
            Global <span className="text-blue-500 italic">Command</span>
          </h1>
          <p className="text-[8px] font-black tracking-[0.5em] text-gray-600 uppercase mt-2 italic">Matrix Brand Protocol v1.0</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-blue-500/5 border border-blue-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-blue-400 italic uppercase leading-none">System Live</span>
           </div>
        </div>
      </header>

      {/* 📊 Main Metrics Grid: Corporate Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, i) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#03080c] border border-white/5 rounded-[35px] p-8 group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 text-2xl opacity-20 group-hover:scale-110 transition-transform">{item.icon}</div>
            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-4 italic group-hover:text-blue-400/60 transition-colors">{item.label}</span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black tracking-tighter italic text-white group-hover:text-blue-100 transition-colors">{item.value}</h2>
              <span className="text-xs font-black text-blue-500/40 uppercase italic leading-none">{item.unit}</span>
            </div>
            {/* Background Sapphire Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      {/* 📈 Central Activity Block: Campaign Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Campaign Pulse Visualization */}
        <div className="lg:col-span-8 bg-[#03080c] border border-white/5 rounded-[45px] p-10 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic leading-none">Campaign Velocity</span>
            <button className="text-[8px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors underline decoration-blue-500/50 underline-offset-8">Expand Global Report</button>
          </div>
          
          <div className="h-64 w-full flex items-end gap-3 justify-between px-4">
             {[...Array(12)].map((_, i) => (
               <motion.div 
                 key={i}
                 initial={{ height: 0 }}
                 animate={{ height: `${20 + Math.random() * 80}%` }}
                 transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
                 className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-400/40 rounded-t-lg border-t border-blue-400/30 relative group"
               >
                 {/* Tooltip on Hover */}
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-blue-400 bg-black/80 px-2 py-1 rounded border border-blue-500/20">
                   NODE_{i+1}
                 </div>
               </motion.div>
             ))}
          </div>
        </div>

        {/* Brand Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-10 rounded-[35px] font-black text-[11px] tracking-[0.5em] uppercase transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] active:scale-95 flex flex-col items-center justify-center gap-4 group">
             <motion.span animate={{ rotate: 90 }} className="text-3xl italic leading-none group-hover:rotate-180 transition-transform">+</motion.span>
             Launch Campaign
          </button>
          
          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-8 rounded-[35px] font-black text-[9px] tracking-[0.4em] uppercase transition-all flex flex-col items-center gap-3 active:scale-95">
             <span className="text-xl">🛡️</span>
             Verify Influencer
          </button>
        </div>

      </div>

    </div>
  )
}