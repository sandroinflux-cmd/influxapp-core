'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true)
        // ვიღებთ ყველა დილს და ვაერთებთ ბრენდების ცხრილს
        const { data, error: supabaseError } = await supabase
          .from('deals')
          .select(`
            discount_percent,
            brands ( name )
          `)

        if (supabaseError) throw supabaseError
        
        console.log("ჩატვირთული მონაცემები:", data)
        setDeals(data || [])
      } catch (err: any) {
        console.error("ბაზასთან კავშირის შეცდომა:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  if (loading) return <div className="p-10 font-sans">იტვირთება InfluX ბაზა...</div>
  if (error) return <div className="p-10 text-red-500">შეცდომა: {error}</div>

  return (
    <main className="p-10 font-sans bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">InfluX Core v1.0</h1>
      
      <div className="bg-gray-100 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">აქტიური შეთავაზებები:</h2>
        
        {deals.length === 0 ? (
          <p className="text-gray-500 italic">ბაზაში მონაცემები არ მოიძებნა. (შეამოწმე SQL და RLS)</p>
        ) : (
          <ul className="space-y-4">
            {deals.map((deal, idx) => (
              <li key={idx} className="bg-white p-4 rounded shadow-sm flex justify-between items-center border-l-4 border-blue-500">
                <span className="font-bold text-lg">{deal.brands?.name || 'უცნობი ბრენდი'}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                  {deal.discount_percent}% OFF
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-400">Connected to: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
    </main>
  )
}