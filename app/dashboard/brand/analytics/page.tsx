'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({ revenue: 0, sales: 0, loyalty: '0.0x' })
  const [chartData, setChartData] = useState<any[]>([])
  const [influencerNodes, setInfluencerNodes] = useState<any[]>([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('brand_id', user.id)
        .eq('status', 'approved') // 🎯 გასწორდა

      const { data: profiles } = await supabase.from('profiles').select('id, full_name')
      const profileMap: Record<string, string> = {}
      profiles?.forEach(p => { profileMap[p.id] = p.full_name || 'Anonymous Node' })

      if (txData && txData.length > 0) {
        let totalNetRev = 0
        let totalSales = txData.length

        const monthlyData: Record<string, { month: string, revenue: number, sales: number, loyalty: number }> = {}
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        const infMap: Record<string, { id: string, revenue: number, sales: number }> = {}

        txData.forEach(tx => {
          const netAmt = tx.brand_earned || 0 
          totalNetRev += netAmt

          const dateObj = new Date(tx.created_at)
          const monthStr = monthNames[dateObj.getMonth()]
          
          if (!monthlyData[monthStr]) {
            monthlyData[monthStr] = { month: monthStr, revenue: 0, sales: 0, loyalty: (Math.random() * 2 + 1.5) } 
          }
          monthlyData[monthStr].revenue += netAmt
          monthlyData[monthStr].sales += 1

          const infId = tx.influencer_id
          if (infId) {
            if (!infMap[infId]) infMap[infId] = { id: infId, revenue: 0, sales: 0 }
            infMap[infId].revenue += netAmt
            infMap[infId].sales += 1
          }
        })

        setMetrics({
          revenue: totalNetRev,
          sales: totalSales,
          loyalty: (totalSales > 10 ? '3.2x' : '1.5x') 
        })

        setChartData(Object.values(monthlyData))

        const formattedInfluencers = Object.values(infMap)
          .map(inf => ({
            name: profileMap[inf.id] || `NODE_${inf.id.substring(0, 5).toUpperCase()}`,
            token: `$INFLUX`, 
            revenue: inf.revenue,
            sales: inf.sales,
            loyalty: (inf.sales > 5 ? '3.4x' : '2.1x')
          }))
          .sort((a, b) => b.revenue - a.revenue)

        setInfluencerNodes(formattedInfluencers)
      } else {
        setMetrics({ revenue: 0, sales: 0, loyalty: '0.0x' })
        setChartData([{ month: 'JAN', revenue: 0, sales: 0, loyalty: 0 }])
      }
      setLoading(false)
    }

    fetchAnalytics()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-500 font-black animate-pulse uppercase italic text-xs tracking-widest">Compiling Matrix...</div>

  return (
    <div className="p-4 md:p-10 lg:p-14 space-y-20 max-w-7xl mx-auto pb-40 font-sans text-white uppercase italic font-black">
      <header className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <h1 className="text-6xl tracking-tighter leading-none text-white">Strategic <span className="text-blue-500">Analysis</span></h1>
            <p className="text-[10px] tracking-[0.6em] text-gray-600">Ecosystem Intelligence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-l border-white/10 pl-12">
             <div className="space-y-1">
                <span className="text-[8px] text-blue-500 tracking-widest block">Net Revenue</span>
                <p className="text-5xl tracking-tighter">{metrics.revenue.toLocaleString()} <span className="text-xs opacity-30">₾</span></p>
             </div>
             <div className="space-y-1">
                <span className="text-[8px] text-gray-600 tracking-widest block">Sales Units</span>
                <p className="text-5xl tracking-tighter">{metrics.sales}</p>
             </div>
             <div className="space-y-1">
                <span className="text-[8px] text-emerald-500 tracking-widest block">Loyalty Index</span>
                <p className="text-5xl tracking-tighter text-emerald-500">{metrics.loyalty}</p>
             </div>
          </div>
        </div>
      </header>

      <div className="space-y-10">
        <span className="text-[10px] text-gray-600 tracking-[0.5em] px-8">Influencer Performance (Net Yield)</span>
        <div className="grid grid-cols-1 gap-8">
          {influencerNodes.map((inf, i) => (
            <div key={i} className="bg-[#010201] border border-white/5 rounded-[45px] p-10 flex flex-col lg:grid lg:grid-cols-4 items-center gap-12 hover:border-blue-500/30 transition-all">
              <div className="col-span-1 flex items-center gap-6 w-full">
                <div className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-3xl">🤖</div>
                <div>
                  <h4 className="text-xl text-white leading-none">{inf.name}</h4>
                  <p className="text-[10px] text-blue-500 mt-2">{inf.token}</p>
                </div>
              </div>
              <div className="col-span-1"><span className="text-[8px] text-gray-700 block mb-2">Your Net</span><p className="text-3xl">{inf.revenue.toLocaleString()} ₾</p></div>
              <div className="col-span-1"><span className="text-[8px] text-gray-700 block mb-2">Units Sold</span><p className="text-3xl">{inf.sales}</p></div>
              <div className="col-span-1"><span className="text-[8px] text-emerald-500 block mb-2">Loyalty</span><p className="text-3xl text-emerald-400">{inf.loyalty}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}