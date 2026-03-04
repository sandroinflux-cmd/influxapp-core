'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const analyticsData = [
  { month: 'JAN', revenue: 145000, sales: 4200, loyalty: 1.4 },
  { month: 'FEB', revenue: 282000, sales: 7100, loyalty: 1.8 },
  { month: 'MAR', revenue: 268000, sales: 6800, loyalty: 2.1 },
  { month: 'APR', revenue: 425000, sales: 11400, loyalty: 2.5 },
  { month: 'MAY', revenue: 698000, sales: 18800, loyalty: 3.2 },
]

const influencerNodes = [
  { name: 'Andro Protocol', token: '$ANDRO', revenue: '242,400', sales: '6,820', loyalty: '3.4x' },
  { name: 'Nina Matrix', token: '$NINA', revenue: '198,200', sales: '5,110', loyalty: '2.8x' },
  { name: 'Cyber Alpha', token: '$ALPHA', revenue: '165,100', sales: '4,455', loyalty: '4.1x' },
]

export default function AnalyticsPage() {
  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-20 max-w-7xl mx-auto pb-40 font-sans text-white">
      
      {/* 💠 Master Header */}
      <header className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter italic uppercase text-white leading-none">
              Strategic <span className="text-blue-500 italic">Analysis</span>
            </h1>
            <p className="text-[10px] font-black tracking-[0.6em] text-gray-600 uppercase italic">Ecosystem Performance Intelligence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-l border-white/10 pl-12 font-sans">
             <div className="space-y-1">
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic block">Total Revenue</span>
                <p className="text-5xl font-black italic tracking-tighter text-white leading-none">698,000 <span className="text-xs opacity-30">₾</span></p>
             </div>
             <div className="space-y-1">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic block">Total Sales Units</span>
                <p className="text-5xl font-black italic tracking-tighter text-white leading-none">18,800</p>
             </div>
             <div className="space-y-1">
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic block">Loyalty Index</span>
                <p className="text-5xl font-black italic tracking-tighter text-emerald-500 leading-none">3.2x</p>
             </div>
          </div>
        </div>

        {/* 📉 Triple Parameter Visual Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="bg-[#010201] border border-white/5 rounded-[40px] p-8 h-[300px] relative overflow-hidden group">
              <div className="absolute top-6 left-8 z-10">
                 <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic block mb-1">Gross Revenue</span>
                 <p className="text-2xl font-black italic leading-none text-white/80">Matrix Volume</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs><linearGradient id="cR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fill="url(#cR)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="bg-[#010201] border border-white/5 rounded-[40px] p-8 h-[300px] relative overflow-hidden group">
              <div className="absolute top-6 left-8 z-10">
                 <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest italic block mb-1">Unit Sales</span>
                 <p className="text-2xl font-black italic leading-none text-white/80">Conversion Velocity</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <Line type="stepAfter" dataKey="sales" stroke="#fff" strokeWidth={4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
           </div>

           <div className="bg-[#010201] border border-white/5 rounded-[40px] p-8 h-[300px] relative overflow-hidden group">
              <div className="absolute top-6 left-8 z-10">
                 <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic block mb-1">Loyalty Index</span>
                 <p className="text-2xl font-black italic leading-none text-white/80">Repeat Purchases</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs><linearGradient id="cL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                  <Area type="step" dataKey="loyalty" stroke="#10b981" strokeWidth={4} fill="url(#cL)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </header>

      {/* 📜 Individual Node Analysis */}
      <div className="space-y-10">
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] italic px-8">Deep Node Intelligence</span>
        <div className="grid grid-cols-1 gap-8">
          {influencerNodes.map((inf, i) => (
            <motion.div 
              key={inf.token}
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }}
              className="bg-[#010201] border border-white/5 rounded-[45px] p-10 flex flex-col lg:grid lg:grid-cols-4 items-center gap-12 hover:border-blue-500/30 transition-all group overflow-hidden"
            >
              <div className="col-span-1 flex items-center gap-6 w-full">
                <div className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">🤖</div>
                <div>
                  <h4 className="text-xl font-black italic text-white uppercase leading-none">{inf.name}</h4>
                  <p className="text-[10px] font-black text-blue-500 uppercase mt-2 tracking-widest">{inf.token}</p>
                </div>
              </div>

              <div className="col-span-1 text-center lg:text-left">
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest block mb-2 italic">Matrix Revenue</span>
                <p className="text-3xl font-black italic text-white leading-none">{inf.revenue} <span className="text-[10px] opacity-20">₾</span></p>
              </div>

              <div className="col-span-1 text-center lg:text-left">
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest block mb-2 italic">Total Units</span>
                <p className="text-3xl font-black italic text-white leading-none">{inf.sales}</p>
              </div>

              <div className="col-span-1 text-center lg:text-left">
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-2 italic">Loyalty Index</span>
                <p className="text-3xl font-black italic text-emerald-400 leading-none">{inf.loyalty}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}