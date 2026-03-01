'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

const chartData = [
  { name: 'Jan', income: 4000, owners: 200 },
  { name: 'Feb', income: 5500, owners: 350 },
  { name: 'Mar', income: 4800, owners: 480 },
  { name: 'Apr', income: 7200, owners: 610 },
  { name: 'May', income: 8900, owners: 850 },
  { name: 'Jun', income: 11000, owners: 1204 },
]

const topBrands = [
  { name: 'Nike Energy', revenue: '5,420', scans: 1240 },
  { name: 'Tesla Motors', revenue: '3,100', scans: 842 },
  { name: 'Apple Digital', revenue: '2,800', scans: 915 },
]

const topOwners = [
  { id: 'TOKENOWNER_882', scans: 42, spent: '1,450' },
  { id: 'TOKENOWNER_104', scans: 38, spent: '1,200' },
  { id: 'TOKENOWNER_651', scans: 31, spent: '980' },
]

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 lg:ml-0 overflow-x-hidden">
      
      {/* 1. Technical Header */}
      <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-emerald-500/50 text-[9px] font-black tracking-[0.7em] uppercase mb-3 block italic">Market Intelligence Unit</span>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">
            Growth <span className="text-emerald-500">Metrics</span>
          </h1>
        </div>
        
        <div className="flex gap-16 border-l border-white/10 pl-10">
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1 italic">Active Tokenowners</span>
            <p className="text-4xl font-black italic tracking-tighter leading-none">1,204</p>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-emerald-500/60 font-black uppercase tracking-widest mb-1 italic">Conversion Rate</span>
            <p className="text-4xl font-black italic tracking-tighter text-emerald-500 leading-none">12.4%</p>
          </div>
        </div>
      </header>

      {/* 2. Dual-Line Growth Chart */}
      <section className="bg-[#040d08]/40 border border-white/5 rounded-[55px] p-12 mb-12 backdrop-blur-3xl relative overflow-hidden group">
        <div className="flex justify-between items-center mb-12">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] italic">Revenue & Tokenowner Growth Index</h3>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-6 bg-emerald-500 rounded-full shadow-[0_0_10px_#10B981]" />
              <span className="text-[8px] text-white/50 uppercase font-black tracking-widest">Income Stream</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-6 bg-white rounded-full shadow-[0_0_10px_#fff]" />
              <span className="text-[8px] text-white/50 uppercase font-black tracking-widest">Tokenowners</span>
            </div>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" hide={true} domain={[0, 'dataMax + 2000']} />
              <YAxis yAxisId="right" hide={true} domain={[0, 'dataMax + 200']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#040d08', border: '1px solid #ffffff10', borderRadius: '20px', fontSize: '10px' }}
                itemStyle={{ fontWeight: '900', textTransform: 'uppercase' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="income" stroke="#10B981" strokeWidth={4} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="owners" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#ffffff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Competitive Intelligence Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Brand Performance */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.5em] ml-4 mb-8 italic">Partner Revenue Yield</h4>
          {topBrands.map((brand, i) => (
            <motion.div key={i} whileHover={{ x: 5 }} className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 flex items-center group transition-all duration-500 hover:border-emerald-500/20">
              <div className="w-1/2">
                <span className="text-2xl font-black italic tracking-tighter uppercase leading-none">{brand.name}</span>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-2 italic">Verified Brand Pool</p>
              </div>
              <div className="w-1/4 text-center">
                <p className="text-[7px] text-gray-600 uppercase font-black mb-1 italic">Gross Scans</p>
                <p className="text-2xl font-black text-white/40 italic tracking-tighter leading-none">{brand.scans}</p>
              </div>
              <div className="w-1/4 text-right">
                <p className="text-[7px] text-gray-600 uppercase font-black mb-1 italic">Total Revenue</p>
                <div className="flex items-baseline justify-end gap-1">
                  <p className="text-2xl font-black text-emerald-500 italic tracking-tighter leading-none">{brand.revenue}</p>
                  <span className="text-[8px] font-black text-emerald-500 uppercase opacity-60">GEL</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tokenowner Engagement */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] ml-4 mb-8 italic">Elite Tokenowner Ranking</h4>
          {topOwners.map((owner, i) => (
            <motion.div key={i} whileHover={{ x: -5 }} className="bg-[#040d08]/60 border border-white/5 rounded-[40px] p-8 flex items-center group transition-all duration-500 hover:border-white/20">
              {/* RANK - Fixed Width */}
              <div className="w-20">
                <span className="text-[10px] text-emerald-500 font-black italic tracking-widest">RANK_0{i+1}</span>
              </div>
              {/* ID - Fixed Width */}
              <div className="flex-1">
                <span className="text-xl font-black tracking-tighter uppercase text-white/80 leading-none">{owner.id}</span>
              </div>
              {/* SCANS - Fixed Center Aligned */}
              <div className="w-32 text-center">
                <p className="text-[7px] text-gray-600 uppercase font-black mb-1 italic">Total Scans</p>
                <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{owner.scans}</p>
              </div>
              {/* SPENT - Fixed Right Aligned */}
              <div className="w-40 text-right">
                <p className="text-[7px] text-gray-600 uppercase font-black mb-1 italic">Net Spending</p>
                <div className="flex items-baseline justify-end gap-2">
                  <p className="text-2xl font-black text-emerald-500 italic tracking-tighter leading-none">{owner.spent}</p>
                  <span className="text-[9px] font-black text-emerald-500 uppercase border border-emerald-500/20 px-1.5 py-0.5 rounded-md bg-emerald-500/5">
                    GEL
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  )
}