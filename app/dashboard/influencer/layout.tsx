import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#010201",
};

export const metadata: Metadata = {
  title: "InfluX Matrix",
  description: "Secure Matrix Node",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#010201]">
      <body className={`${inter.className} antialiased bg-[#010201] text-white flex overflow-x-hidden`}>
        {/* 🚀 Dynamic Mini-Sidebar Component */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 h-screen overflow-y-auto scrollbar-hide">
          {children}
        </div>

        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </body>
    </html>
  );
}