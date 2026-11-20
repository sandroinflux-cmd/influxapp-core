'use client'

import { useEffect, useState } from 'react'
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
  const [metrics, setMetrics] = useState({ revenue: 0, sales: 0, loyalty: '0.0x' })
  const [funnel, setFunnel] = useState(EMPTY_FUNNEL)
  const [influencerRows, setInfluencerRows] = useState<any[]>([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      let events: any[] = []
      let partnerships: any[] = []
      let txData: any[] = []

      try {
        events = await fetchAll((from, to) =>
          supabase
            .from('token_events')
            .select('id, visitor_id, event_type, brand_id, influencer_id')
            .eq('brand_id', user.id)
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
          .select('influencer_id, brand_id')
          .eq('brand_id', user.id)
        if (error) throw error
        partnerships = data || []
      } catch (error) {
        console.error('Partnerships unavailable:', error)
      }

      try {
        txData = await fetchAll((from, to) =>
          supabase
            .from('transactions')
            .select('*')
            .eq('brand_id', user.id)
            .in('status', ['approved', 'success'])
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(from, to)
        )
      } catch (error) {
        console.error('Transactions unavailable:', error)
      }

      const viewRows = events.filter((event) => event.event_type === 'view')
      const clickRows = events.filter((event) => event.event_type === 'deal_click')
      const claimRows = events.filter((event) => event.event_type === 'claim')
      const checkoutRows = events.filter((event) => event.event_type === 'checkout_view')
      const paymentRows = events.filter((event) => event.event_type === 'payment_init')
      const partnerIds = [...new Set(partnerships.map((row) => row.influencer_id).filter(Boolean))]
      let flipRows = events.filter((event) => event.event_type === 'flip')
      if (partnerIds.length > 0) {
        try {
          const extraFlips = await fetchAll((from, to) =>
            supabase
              .from('token_events')
              .select('id, visitor_id, event_type, influencer_id')
              .in('influencer_id', partnerIds)
              .eq('event_type', 'flip')
              .order('created_at', { ascending: true })
              .order('id', { ascending: true })
              .range(from, to)
          )
          const seen = new Set(flipRows.map((row) => row.id))
          extraFlips.forEach((row) => {
            if (!seen.has(row.id)) flipRows.push(row)
          })
        } catch (error) {
          console.error('Flip events unavailable:', error)
        }
      }

      setFunnel({
        views: uniqueVisitors(viewRows),
        flips: uniqueVisitors(flipRows),
        clickUnique: uniqueVisitors(clickRows),
        clickTotal: clickRows.length,
        checkoutViews: uniqueVisitors(checkoutRows),
        paymentInits: uniqueVisitors(paymentRows),
        claims: uniqueVisitors(claimRows),
        purchases: txData.length,
      })

      const influencerIds = [...new Set(
        [
          ...events.map((event) => event.influencer_id),
          ...txData.map((tx) => tx.influencer_id),
          ...partnerships.map((partnership) => partnership.influencer_id),
        ].filter(Boolean)
      )]

      let profiles: any[] = []
      if (influencerIds.length > 0) {
        const { data } = await supabase.from('profiles').select('id, full_name').in('id', influencerIds)
        profiles = data || []
      }
      const profileMap: Record<string, string> = {}
      profiles.forEach((profile) => { profileMap[profile.id] = profile.full_name || 'Anonymous Node' })

      if (txData.length > 0) {
        let totalNetRev = 0
        txData.forEach((tx) => { totalNetRev += tx.brand_earned || 0 })
        setMetrics({
          revenue: totalNetRev,
          sales: txData.length,
          loyalty: (txData.length > 10 ? '3.2x' : '1.5x'),
        })
      } else {
        setMetrics({ revenue: 0, sales: 0, loyalty: '0.0x' })
      }

      const buckets = new Map<string, { views: Set<string>; flips: Set<string>; clickVisitors: Set<string>; clicks: number; checkout: Set<string>; payments: Set<string>; claims: Set<string>; purchases: number; revenue: number }>()
      const ensure = (influencerId: string) => {
        if (!buckets.has(influencerId)) {
          buckets.set(influencerId, { views: new Set(), flips: new Set(), clickVisitors: new Set(), clicks: 0, checkout: new Set(), payments: new Set(), claims: new Set(), purchases: 0, revenue: 0 })
        }
        return buckets.get(influencerId)!
      }

      partnerships.forEach((partnership) => {
        if (partnership.influencer_id) ensure(partnership.influencer_id)
      })
      events.forEach((event) => {
        if (!event.influencer_id) return
        const bucket = ensure(event.influencer_id)
        const visitor = event.visitor_id || event.id
        if (event.event_type === 'view') bucket.views.add(visitor)
        if (event.event_type === 'flip') bucket.flips.add(visitor)
        if (event.event_type === 'deal_click') {
          bucket.clicks += 1
          bucket.clickVisitors.add(visitor)
        }
        if (event.event_type === 'checkout_view') bucket.checkout.add(visitor)
        if (event.event_type === 'payment_init') bucket.payments.add(visitor)
        if (event.event_type === 'claim') bucket.claims.add(visitor)
      })
      flipRows.forEach((event) => {
        if (!event.influencer_id) return
        ensure(event.influencer_id).flips.add(event.visitor_id || event.id)
      })
      txData.forEach((tx) => {
        if (!tx.influencer_id) return
        const bucket = ensure(tx.influencer_id)
        bucket.purchases += 1
        bucket.revenue += Number(tx.brand_earned) || 0
      })

      setInfluencerRows([...buckets.entries()].map(([influencerId, bucket]) => ({
        id: influencerId,
        name: profileMap[influencerId] || `NODE_${influencerId.substring(0, 5).toUpperCase()}`,
        views: bucket.views.size,
        flips: bucket.flips.size,
        uniqueClicks: bucket.clickVisitors.size,
        totalClicks: bucket.clicks,
        checkoutViews: bucket.checkout.size,
        paymentInits: bucket.payments.size,
        claims: bucket.claims.size,
        purchases: bucket.purchases,
        revenue: bucket.revenue,
      })).sort((a, b) => b.revenue - a.revenue || b.views - a.views))

      setLoading(false)
    }

    fetchAnalytics()
  }, [])

  const stages = [
    { label: 'Views', value: funnel.views, detail: 'Unique people' },
    { label: 'Flips', value: funnel.flips, detail: `${percent(funnel.flips, funnel.views)}% of views` },
    { label: 'Deal Clicks', value: funnel.clickUnique, detail: `${funnel.clickTotal} clicks · ${percent(funnel.clickUnique, funnel.views)}% of views` },
    { label: 'Checkout Views', value: funnel.checkoutViews, detail: `${percent(funnel.checkoutViews, funnel.clickUnique)}% of deal clicks` },
    { label: 'Payment Inits', value: funnel.paymentInits, detail: `${percent(funnel.paymentInits, funnel.checkoutViews)}% of checkout views` },
    { label: 'Approved Orders', value: funnel.purchases, detail: `${percent(funnel.purchases, funnel.paymentInits)}% of payment inits` },
  ]

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

      <section className="space-y-6">
        <span className="text-[10px] text-gray-600 tracking-[0.5em] px-2">Token Funnel</span>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stages.map((stage) => (
            <div key={stage.label} className="bg-[#010201] border border-white/5 rounded-[32px] p-6">
              <span className="text-[8px] text-gray-600 tracking-[0.2em] block mb-3">{stage.label}</span>
              <p className="text-4xl tracking-tighter">{stage.value}</p>
              <p className="text-[8px] text-blue-400/80 mt-3 tracking-[0.12em] normal-case">{stage.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-10">
        <span className="text-[10px] text-gray-600 tracking-[0.5em] px-2">Per-Influencer Breakdown</span>
        <div className="bg-[#010201] border border-white/5 rounded-[45px] overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead>
              <tr className="text-[8px] text-gray-600 tracking-[0.3em] border-b border-white/5">
                <th className="px-8 py-5 font-black">Influencer Name</th>
                <th className="px-6 py-5 font-black">Views</th>
                <th className="px-6 py-5 font-black">Flips</th>
                <th className="px-6 py-5 font-black">Deal Clicks</th>
                <th className="px-6 py-5 font-black">Checkout</th>
                <th className="px-6 py-5 font-black">Payment</th>
                <th className="px-6 py-5 font-black">Orders</th>
                <th className="px-8 py-5 font-black text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {influencerRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-10 text-[10px] text-gray-600 tracking-[0.3em]">No influencer signal yet</td>
                </tr>
              ) : influencerRows.map((inf) => (
                <tr key={inf.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-8 py-6 text-lg text-white">{inf.name}</td>
                  <td className="px-6 py-6">{inf.views}</td>
                  <td className="px-6 py-6">{inf.flips}</td>
                  <td className="px-6 py-6">{inf.uniqueClicks} <span className="text-[10px] text-gray-600">unique</span> · {inf.totalClicks}</td>
                  <td className="px-6 py-6">{inf.checkoutViews}</td>
                  <td className="px-6 py-6">{inf.paymentInits}</td>
                  <td className="px-6 py-6">{inf.purchases}</td>
                  <td className="px-8 py-6 text-right">{money(inf.revenue)} ₾</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
