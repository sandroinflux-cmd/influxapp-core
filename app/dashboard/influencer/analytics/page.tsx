'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { supabase } from '@/lib/supabase'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [topBrands, setTopBrands] = useState<any[]>([])
  const [topOwners, setTopOwners] = useState<any[]>([])
  const [totalOwners, setTotalOwners] = useState(0)
  const [conversionRate, setConversionRate] = useState('0.0')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: txs, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('influencer_id', user.id)
        .eq('status', 'approved') // 🎯 გასწორდა
        .order('created_at', { ascending: true })

      if (error) throw error

      const { data: brandsData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'brand')

      const brandMap = new Map(brandsData?.map(b => [b.id, b.full_name]) || [])

      if (txs && txs.length > 0) {
        const monthlyData: Record<string, { name: string, income: number, ownerSet: Set<string> }> = {}
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const allUniqueOwners = new Set<string>()

        txs.forEach(tx => {
          const date = new Date(tx.created_at)
          const monthStr = monthNames[date.getMonth()]
          
          const amount = Number(tx.influencer_earned) || 0
          const ownerId = tx.token_id || 'unknown'

          allUniqueOwners.add(ownerId)

          if (!monthlyData[monthStr]) {
            monthlyData[monthStr] = { name: monthStr, income: 0, ownerSet: new Set() }
          }
          monthlyData[monthStr].income += amount
          monthlyData[monthStr].ownerSet.add(ownerId)
        })

        setChartData(Object.values(monthlyData).map(data => ({
          name: data.name,
          income: Math.round(data.income),
          owners: data.ownerSet.size
        })))

        setTotalOwners(allUniqueOwners.size)
        setConversionRate((Math.min(100, (allUniqueOwners.size / (txs.length || 1)) * 45)).toFixed(1))

        const brandStats: Record<string, { scans: number, revenue: number }> = {}
        txs.forEach(tx => {
          const bId = tx.brand_id || 'unknown'
          if (!brandStats[bId]) brandStats[bId] = { scans: 0, revenue: 0 }
          brandStats[bId].scans += 1
          brandStats[bId].revenue += Number(tx.influencer_earned) || 0
        })

        setTopBrands(Object.entries(brandStats).map(([bId, stats]) => ({
          name: brandMap.get(bId) || 'MATRIX NODE',
          revenue: stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 }),
          rawRevenue: stats.revenue,
          scans: stats.scans
        })).sort((a, b) => b.rawRevenue - a.rawRevenue).slice(0, 3))

        const ownerStats: Record<string, { scans: number, spent: number }> = {}
        txs.forEach(tx => {
          const oId = tx.token_id || 'UNKNOWN'
          if (!ownerStats[oId]) ownerStats[oId] = { scans: 0, spent: 0 }
          ownerStats[oId].scans += 1
          ownerStats[oId].spent += Number(tx.influencer_earned) || 0
        })

        setTopOwners(Object.entries(ownerStats).map(([oId, stats]) => ({
          id: `OWNER_${oId.substring(0, 4).toUpperCase()}`,
          spent: stats.spent.toLocaleString('en-US', { minimumFractionDigits: 2 }),
          rawSpent: stats.spent,
          scans: stats.scans
        })).sort((a, b) => b.rawSpent - a.rawSpent).slice(0, 3))
      }
    } catch (error) {
      console.error('Analytics Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#010201] flex items-center justify-center text-emerald-500 font-black italic animate-pulse uppercase tracking-widest">Analyzing Matrix...</div>

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 italic font-black uppercase">
      <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-emerald-500/50 text-[9px] tracking-[0.7em] mb-3 block">Intelligence Unit</span>
          <h1 className="text-6xl tracking-tighter">Growth <span className="text-emerald-500">Metrics</span></h1>
        </div>
        <div className="flex gap-16 border-l border-white/10 pl-10">
          <div><span className="text-[8px] text-gray-600 block mb-1">Total Owners</span><p className="text-4xl">{totalOwners}</p></div>
          <div><span className="text-[8px] text-emerald-500/60 block mb-1">Conversion</span><p className="text-4xl text-emerald-500">{conversionRate}%</p></div>
        </div>
      </header>

      <section className="bg-[#040d08]/40 border border-white/5 rounded-[55px] p-12 mb-12 backdrop-blur-3xl h-[450px]">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#040d08', border: 'none', borderRadius: '20px' }} />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={4} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h4 className="text-[10px] text-emerald-500/40 tracking-[0.5em] ml-4">Partner Yield</h4>
          {topBrands.map((brand, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 flex justify-between items-center transition-all hover:border-emerald-500/20">
              <div><span className="text-2xl truncate block">{brand.name}</span><p className="text-[8px] text-gray-600 mt-2">Verified Node</p></div>
              <div className="text-right">
                <p className="text-[7px] text-gray-600 mb-1">Your Earned</p>
                <p className="text-2xl text-emerald-500">{brand.revenue} ₾</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}