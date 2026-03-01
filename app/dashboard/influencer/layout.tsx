import Sidebar from '@/components/Sidebar'

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#010201]">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}