'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

function QuietSpinner() {
  return (
    <div className="h-8 w-8 animate-spin rounded-full border border-[#C9B087]/25 border-t-[#C9B087]" />
  )
}

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
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#090808] p-6 text-[#F2EFE9]">
        <p className="font-sans text-sm text-[#F2EFE9]">გვერდი ვერ მოიძებნა</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#090808] text-[#F2EFE9]">
      <QuietSpinner />
    </main>
  )
}
