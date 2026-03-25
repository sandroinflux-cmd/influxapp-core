'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

const defaultSparkData = [
  { name: 'Mon', v: 0 }, { name: 'Tue', v: 0 }, { name: 'Wed', v: 0 }
]

export default function BrandDashboardHome() {
  const [profile, setProfile] = useState<any>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [chartData, setChartData] = useState<any[]>(defaultSparkData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 1. პროფილის წამოღება
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(profileData)

        // 2. დილების წამოღება
        const { data: dealsData } = await supabase
          .from('deals')
          .select('*')
          .eq('brand_id', user.id)
          .order('created_at', { ascending: false })
        setDeals(dealsData || [])

        // 🚀 3. ტრანზაქციების წამოღება 
        const { data: txData } = await supabase
          .from('transactions')
          .select('brand_earned, created_at')
          .eq('brand_id', user.id)
          .eq('status', 'approved') // 🎯 გასწორდა: ბაზაში სტატუსი არის 'approved'

        if (txData && txData.length > 0) {
          let revenue = 0;
          const dailyTotals: Record<string, number> = {};

          txData.forEach(tx => {
            const earned = Number(tx.brand_earned) || 0;
            revenue += earned;

            const dateStr = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + earned;
          });

          setTotalRevenue(revenue)
          setTotalSales(txData.length)

          const formattedChart = Object.keys(dailyTotals).map(date => ({
            name: date,
            v: dailyTotals[date]
          }));
          setChartData(formattedChart)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="p-6 md:p-10 lg:p-14 space-y-16 max-w-7xl mx-auto pb-40 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 italic font-black uppercase">
        <div className="space-y-4 tracking-tighter leading-none">
          <span className="text-blue-500/40 text-[9px] tracking-[0.7em] block italic">System Terminal v2.6</span>
          <h1 className="text-6xl italic">
            {loading ? 'SYNCING...' : (profile?.full_name?.split(' ')[0] || profile?.name || 'Matrix')}{' '}
            <span className="text-blue-500 text-glow italic">Overview</span>
          </h1>
        </div>
        
        <div className="grid grid-cols-3 gap-10 border-l border-white/10 pl-10">
           <div>
             <span className="text-[8px] text-blue-500 tracking-widest block mb-2">Total Revenue</span>
             <p className="text-4xl leading-none">{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs opacity-30 italic">₾</span></p>
           </div>
           <div>
             <span className="text-[8px] text-emerald-500 tracking-widest block mb-2">Total Sales</span>
             <p className="text-4xl leading-none">{totalSales}</p>
           </div>
           <div>
             <span className="text-[8px] text-purple-500 tracking-widest block mb-2">Active Deals</span>
             <p className="text-4xl leading-none">{deals.length}</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#010201] border border-white/5 rounded-[50px] p-10 shadow-2xl relative overflow-hidden group">
            <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black italic absolute top-10 left-10">Revenue Pulse</h3>
            <div className="h-[300px] w-full mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#010201', borderColor: 'rgba(59,130,246,0.2)', borderRadius: '15px', fontStyle: 'italic', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={5} fill="rgba(59,130,246,0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-[#010201] border border-white/5 rounded-[50px] p-10 flex flex-col justify-between shadow-2xl">
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">Live Deals</span>
                 <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar italic font-black uppercase">
                 {deals.map((deal) => (
                   <div key={deal.id} className="flex justify-between items-center group p-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg italic">💎</div>
                         <div>
                            <p className="text-[11px] text-white leading-none mb-1">{deal.title}</p>
                            <p className="text-[8px] text-blue-500 tracking-widest">{deal.user_discount_pct}% Split</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}