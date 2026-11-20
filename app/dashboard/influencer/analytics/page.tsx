'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { supabase } from '@/lib/supabase'

function uniqueVisitors(rows: any[]) {
  return new Set(rows.map((row) => row.visitor_id || row.id)).size
}

function percent(part: number, whole: number) {
  if (!whole) return '0.0'
  return ((part / whole) * 100).toFixed(1)
}

function money(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function dealTitle(partnership: any) {
  const deal = Array.isArray(partnership?.deals) ? partnership.deals[0] : partnership?.deals
  return deal?.title || null
}

async function fetchAll(run: (from: number, to: number) => PromiseLike<{ data: any[] | null; error: any }>) {
  const pageSize = 1000
  const rows: any[] = []
  let from = 0
  while (from <= 20000) {
    const { data, error } = await run(from, from + pageSize - 1)
    if (error) throw error
    const batch = data || []
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }
  return rows
}

const EMPTY_FUNNEL = {
  views: 0,
  flips: 0,
  clickUnique: 0,
  clickTotal: 0,
  checkoutViews: 0,
  paymentInits: 0,
  claims: 0,
  purchases: 0,
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [topBrands, setTopBrands] = useState<any[]>([])
  const [brandRows, setBrandRows] = useState<any[]>([])
  const [totalOwners, setTotalOwners] = useState(0)
  const [conversionRate, setConversionRate] = useState('0.0')
  const [funnel, setFunnel] = useState(EMPTY_FUNNEL)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let events: any[] = []
      let partnerships: any[] = []
      let txs: any[] = []

      try {
        events = await fetchAll((from, to) =>
          supabase
            .from('token_events')
            .select('id, visitor_id, event_type, brand_id, influencer_id')
            .eq('influencer_id', user.id)
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(from, to)
        )
      } catch (error) {
        console.error('Token events unavailable:', error)
      }

      try {
        const { data, error } = await supabase
          .from('partnerships')
          .select('*, deals(*)')
          .eq('influencer_id', user.id)
        if (error) throw error
        partnerships = data || []
      } catch (error) {
        console.error('Partnerships unavailable:', error)
      }

      try {
        txs = await fetchAll((from, to) =>
          supabase
            .from('transactions')
            .select('*')
            .eq('influencer_id', user.id)
            .in('status', ['approved', 'success'])
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(from, to)
        )
      } catch (error) {
        console.error('Transactions unavailable:', error)
      }

      const viewRows = events.filter((event) => event.event_type === 'view')
      const flipRows = events.filter((event) => event.event_type === 'flip')
      const clickRows = events.filter((event) => event.event_type === 'deal_click')
      const checkoutRows = events.filter((event) => event.event_type === 'checkout_view')
      const paymentRows = events.filter((event) => event.event_type === 'payment_init')
      const claimRows = events.filter((event) => event.event_type === 'claim')
      const views = uniqueVisitors(viewRows)
      const flips = uniqueVisitors(flipRows)
      const clickUnique = uniqueVisitors(clickRows)
      const checkoutViews = uniqueVisitors(checkoutRows)
      const paymentInits = uniqueVisitors(paymentRows)
      const claims = uniqueVisitors(claimRows)

      setFunnel({
        views,
        flips,
        clickUnique,
        clickTotal: clickRows.length,
        checkoutViews,
        paymentInits,
        claims,
        purchases: txs.length,
      })
      setConversionRate(percent(txs.length, paymentInits))

      const brandIds = [...new Set(
        [...events.map((event) => event.brand_id), ...txs.map((tx) => tx.brand_id), ...partnerships.map((partnership) => partnership.brand_id)].filter(Boolean)
      )]
      let brandProfiles: any[] = []
      if (brandIds.length > 0) {
        const { data } = await supabase.from('profiles').select('id, full_name').in('id', brandIds)
        brandProfiles = data || []
      }
      const profileName = new Map(brandProfiles.map((brand) => [brand.id, brand.full_name]))
      const dealName = new Map<string, string>()
      partnerships.forEach((partnership) => {
        if (!partnership.brand_id || dealName.has(partnership.brand_id)) return
        const title = dealTitle(partnership)
        if (title) dealName.set(partnership.brand_id, title)
      })

      const buckets = new Map<string, { clickVisitors: Set<string>; clicks: number; checkout: Set<string>; payments: Set<string>; claimVisitors: Set<string>; purchases: number; revenue: number }>()
      const ensure = (brandId: string) => {
        if (!buckets.has(brandId)) {
          buckets.set(brandId, { clickVisitors: new Set(), clicks: 0, checkout: new Set(), payments: new Set(), claimVisitors: new Set(), purchases: 0, revenue: 0 })
        }
        return buckets.get(brandId)!
      }

      partnerships.forEach((partnership) => {
        if (partnership.brand_id) ensure(partnership.brand_id)
      })
      events.forEach((event) => {
        if (!event.brand_id) return
        const bucket = ensure(event.brand_id)
        const visitor = event.visitor_id || event.id
        if (event.event_type === 'deal_click') {
          bucket.clicks += 1
          bucket.clickVisitors.add(visitor)
        }
        if (event.event_type === 'checkout_view') bucket.checkout.add(visitor)
        if (event.event_type === 'payment_init') bucket.payments.add(visitor)
        if (event.event_type === 'claim') bucket.claimVisitors.add(visitor)
      })
      txs.forEach((tx) => {
        if (!tx.brand_id) return
        const bucket = ensure(tx.brand_id)
        bucket.purchases += 1
        bucket.revenue += Number(tx.influencer_earned) || 0
      })

      setBrandRows([...buckets.entries()].map(([brandId, bucket]) => ({
        id: brandId,
        name: profileName.get(brandId) || dealName.get(brandId) || 'MATRIX NODE',
        uniqueClicks: bucket.clickVisitors.size,
        totalClicks: bucket.clicks,
        checkoutViews: bucket.checkout.size,
        paymentInits: bucket.payments.size,
        claims: bucket.claimVisitors.size,
        purchases: bucket.purchases,
        revenue: money(bucket.revenue),
        rawRevenue: bucket.revenue,
      })).sort((a, b) => b.rawRevenue - a.rawRevenue || b.totalClicks - a.totalClicks))

      const { data: brandsData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'brand')

      const brandMap = new Map(brandsData?.map(b => [b.id, b.full_name]) || [])

      if (txs.length > 0) {
        const monthlyData: Record<string, { name: string, income: number, ownerSet: Set<string> }> = {}
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const allUniqueOwners = new Set<string>()

        txs.forEach(tx => {
          const date = new Date(tx.created_at)
          const monthStr = monthNames[date.getMonth()]
          
          const amount = Number(tx.influencer_earned) || 0
          const ownerId = tx.customer_phone || tx.id

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
      } else {
        setChartData([])
        setTopBrands([])
        setTotalOwners(0)
      }
    } catch (error) {
      console.error('Analytics Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const stages = [
    { label: 'Views', value: funnel.views, detail: 'Unique people' },
    { label: 'Flips', value: funnel.flips, detail: `${percent(funnel.flips, funnel.views)}% of views` },
    { label: 'Deal Clicks', value: funnel.clickUnique, detail: `${funnel.clickTotal} clicks · ${percent(funnel.clickUnique, funnel.views)}% of views` },
    { label: 'Checkout Views', value: funnel.checkoutViews, detail: `${percent(funnel.checkoutViews, funnel.clickUnique)}% of deal clicks` },
    { label: 'Payment Inits', value: funnel.paymentInits, detail: `${percent(funnel.paymentInits, funnel.checkoutViews)}% of checkout views` },
    { label: 'Approved Orders', value: funnel.purchases, detail: `${percent(funnel.purchases, funnel.paymentInits)}% of payment inits` },
  ]

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

      <section className="mb-12">
        <h4 className="text-[10px] text-emerald-500/40 tracking-[0.5em] ml-4 mb-6">Token Funnel</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stages.map((stage) => (
            <div key={stage.label} className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6">
              <span className="text-[8px] text-gray-600 tracking-[0.2em] block mb-3">{stage.label}</span>
              <p className="text-4xl tracking-tighter">{stage.value}</p>
              <p className="text-[8px] text-emerald-500/70 mt-3 tracking-[0.12em] normal-case">{stage.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h4 className="text-[10px] text-emerald-500/40 tracking-[0.5em] ml-4 mb-6">Per-Brand Breakdown</h4>
        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="text-[8px] text-gray-600 tracking-[0.3em] border-b border-white/5">
                <th className="px-8 py-5 font-black">Brand Name</th>
                <th className="px-6 py-5 font-black">Deal Clicks</th>
                <th className="px-6 py-5 font-black">Checkout</th>
                <th className="px-6 py-5 font-black">Payment</th>
                <th className="px-6 py-5 font-black">Orders</th>
                <th className="px-8 py-5 font-black text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {brandRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-[10px] text-gray-600 tracking-[0.3em]">No partnered brands yet</td>
                </tr>
              ) : brandRows.map((brand) => (
                <tr key={brand.id} className="border-b border-white/5 last:border-0">
                  <td className="px-8 py-6 text-lg">{brand.name}</td>
                  <td className="px-6 py-6">{brand.uniqueClicks} <span className="text-[10px] text-gray-600">unique</span> · {brand.totalClicks}</td>
                  <td className="px-6 py-6">{brand.checkoutViews}</td>
                  <td className="px-6 py-6">{brand.paymentInits}</td>
                  <td className="px-6 py-6">{brand.purchases}</td>
                  <td className="px-8 py-6 text-right text-emerald-500">{brand.revenue} ₾</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
