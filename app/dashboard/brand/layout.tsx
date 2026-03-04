'use client'

import BrandSidebar from '@/components/BrandSidebar'
import BrandNavbar from '@/components/BrandNavbar'

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#020202] text-white flex overflow-hidden">
      {/* 🛠️ საიდბარი იტვირთება მხოლოდ აქ, ერთხელ */}
      <BrandSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative no-scrollbar">
        {/* 🚀 ნავბარიც აქვეა, რომ ყველა გვერდზე გამოჩნდეს */}
        <BrandNavbar />

        {/* 📊 აქ ჩაიტვირთება კონკრეტული გვერდის (page.tsx) კონტენტი */}
        <div className="pt-32 w-full">
          {children}
        </div>
      </div>
    </div>
  )
}