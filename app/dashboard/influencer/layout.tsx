import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import InfluencerSidebar from "@/components/Sidebar"; 
import InfluencerNavbar from "@/components/InfluencerNavbar"; 
import StatusGuard from "@/components/StatusGuard";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#010201",
};

export const metadata: Metadata = {
  title: "InfluX Matrix | Vault",
  description: "Secure Matrix Node Asset",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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
    <div className={`${inter.className} flex min-h-screen bg-[#010201] text-white`}>
      
      {/* 🚀 სტატუსს ვაწვდით საიდბარს */}
      <InfluencerSidebar status={profile?.account_status} />
      
      <main className="flex-1 min-w-0 h-screen overflow-y-auto scrollbar-hide relative bg-[#010201]">
        <InfluencerNavbar />

        <div className="pt-32 p-4 md:p-8 h-full">
          {/* 🛡️ მცველი კომპონენტი */}
          <StatusGuard status={profile?.account_status} role={profile?.role}>
            {children}
          </StatusGuard>
        </div>

        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </main>
    </div>
  );
}