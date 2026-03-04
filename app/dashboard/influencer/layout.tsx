import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import InfluencerSidebar from "@/components/Sidebar"; // შენი არსებული საიდბარი
import InfluencerNavbar from "@/components/InfluencerNavbar"; // ახალი ნავბარი

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} flex min-h-screen bg-[#010201] text-white`}>
      
      {/* 🚀 Static-Speed Sidebar - რჩება უცვლელი */}
      <InfluencerSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto scrollbar-hide relative bg-[#010201]">
        
        {/* ⚡ Emerald Navbar - დაემატა აქ, რომ ყველა გვერდს ჰქონდეს Logout */}
        <InfluencerNavbar />

        {/* გვერდის კონტენტი (Marketplace, Wallet და ა.შ.) */}
        <div className="pt-32 p-4 md:p-8">
          {children}
        </div>

        {/* Matrix Noise Overlay */}
        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </main>
    </div>
  );
}