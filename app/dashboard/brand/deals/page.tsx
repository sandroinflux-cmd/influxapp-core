'use client'

import { motion } from 'framer-motion'

const deals = [
  { id: 1, brand: 'Adidas', offer: '20% OFF Node', status: 'ACTIVE', earnings: '450 GEL', color: '#10b981' },
  { id: 2, brand: 'Apple', offer: 'VIP Access Token', status: 'PENDING', earnings: '0 GEL', color: '#f59e0b' },
  { id: 3, brand: 'Tesla', offer: '15% Matrix Deal', status: 'COMPLETED', earnings: '1,200 GEL', color: '#3b82f6' },
]

export default function MyDealsPage() {
  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-10 max-w-5xl mx-auto pb-24">
      
      {/* 💠 Section Header */}
      <header>
        <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white">
          My <span className="text-emerald-500 italic">Deals</span>
        </h1>
        <p className="text-[8px] font-black tracking-[0.5em] text-gray-600 uppercase mt-2 italic">Matrix Agreement Logs</p>
      </header>

      {/* 📑 Deals List */}
      <div className="space-y-4">
        {deals.map((deal, i) => (
          <motion.div 
            key={deal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#030804] border border-white/5 rounded-[30px] p-6 flex items-center justify-between group hover:border-emerald-500/20 transition-all duration-500"
          >
            <div className="flex items-center gap-6">
              <div 
                className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl border border-white/5"
                style={{ backgroundColor: `${deal.color}10`, color: deal.color }}
              >
                {deal.brand[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white italic tracking-tight">{deal.brand}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{deal.offer}</p>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="text-right hidden md:block">
                <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest block mb-1 italic">Earnings</span>
                <p className="text-sm font-black text-white italic">{deal.earnings}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${
                  deal.status === 'ACTIVE' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 
                  deal.status === 'PENDING' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : 
                  'border-blue-500/20 text-blue-500 bg-blue-500/5'
                }`}>
                  {deal.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  )
}