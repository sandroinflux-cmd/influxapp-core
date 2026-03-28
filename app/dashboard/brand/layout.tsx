import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import BrandSidebar from '@/components/BrandSidebar'
import BrandNavbar from '@/components/BrandNavbar'
import StatusGuard from '@/components/StatusGuard'

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 🛡️ სერვერული შემოწმება
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()

  return (
    <div className="min-h-screen bg-[#020202] text-white flex overflow-hidden">
      {/* 🚀 სტატუსს ვაწვდით საიდბარს, რომ ზედმეტი ღილაკები დამალოს */}
      <BrandSidebar status={profile?.account_status} />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative no-scrollbar">
        <BrandNavbar />

        <div className="pt-32 w-full h-full">
          {/* 🛡️ Guard ბლოკავს კონტენტს, თუ pending არის და Settings-ში არაა */}
          <StatusGuard status={profile?.account_status} role={profile?.role}>
            {children}
          </StatusGuard>
        </div>
      </div>
    </div>
  )
}