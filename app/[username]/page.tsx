'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function MobileInfluencerPublicProfile() {
  const { username } = useParams()
  const router = useRouter()
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const resolveProfile = async () => {
      const handle = username ? username.toString().toLowerCase() : ''
      if (!handle) {
        setNotFound(true)
        return
      }

      try {
        const response = await fetch(`/api/public/claim?username=${encodeURIComponent(handle)}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data?.profile?.id) {
          setNotFound(true)
          return
        }
        router.replace(`/claim?ref=${data.profile.id}`)
      } catch {
        setNotFound(true)
      }
    }

    resolveProfile()
  }, [username, router])

  if (notFound) {
    return (
      <main className="min-h-screen w-full bg-[#020202] text-white flex flex-col items-center justify-center p-6 font-sans">
        <p className="text-red-500 font-black uppercase tracking-widest italic text-sm mb-2">Node Not Found</p>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">This handle is not linked to a Matrix profile.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full bg-[#020202] text-white flex items-center justify-center font-sans">
      <p className="text-emerald-500 font-black uppercase tracking-[0.5em] italic text-[10px] animate-pulse">
        Routing to claim...
      </p>
    </main>
  )
}
