'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase' 
import { QRCodeSVG } from 'qrcode.react'

export default function BrandSettingsPage() {
  const [brandId, setBrandId] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [brandName, setBrandName] = useState('')
  const [iban, setIban] = useState('')
  const [sector, setSector] = useState('')
  const [address, setAddress] = useState('')
  const [bio, setBio] = useState('')
  
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const qrRef = useRef<SVGSVGElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const fetchBrandData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setBrandId(user.id)
        const { data } = await supabase
          .from('profiles')
          .select('iban, full_name, avatar_url, sector, address, bio')
          .eq('id', user.id)
          .single()

        if (data) {
          setIban(data.iban || '')
          setBrandName(data.full_name || '')
          setSector(data.sector || '')
          setAddress(data.address || '')
          setBio(data.bio || '')
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url)
            setAvatarPreview(data.avatar_url)
          }
        }
      }
    }
    fetchBrandData()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !brandId) return
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${brandId}-${Date.now()}.${fileExt}`
      const filePath = `brand-logos/${fileName}`
      const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath)
      setAvatarUrl(publicUrl)
    } catch (error: any) {
      alert("Matrix Upload Error: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCommit = async () => {
    if (!brandId) return
    setIsSaving(true)
    try {
      // 🚀 IBAN-ის გასუფთავება (სპეისების მოშორება და UpperCase)
      const cleanIban = iban.replace(/\s/g, '').toUpperCase();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          iban: cleanIban, 
          full_name: brandName, 
          avatar_url: avatarUrl, 
          sector, 
          address, 
          bio 
        })
        .eq('id', brandId)
      if (error) throw error

      const { error: dealsError } = await supabase
        .from('deals')
        .update({
          logo: avatarUrl || '💠',
          title: brandName || 'MATRIX BRAND',
          intel: { 
            type: sector || 'Active Venture', 
            location: address || 'Digital Node', 
            phone: bio || 'Mission intel remains classified.' 
          }
        })
        .eq('brand_id', brandId)
        
      if (dealsError) console.error("Sync Alert:", dealsError)

      setIban(cleanIban); // სტეიტის განახლება გასუფთავებული ვერსიით
      alert("IDENTITY COMMITTED 🦾")
    } catch (error: any) {
      alert("MATRIX ERROR: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const terminalUrl = isMounted ? `${window.location.origin}/dashboard/cashier/monitor?brand=${brandId}` : ''
  const copyTerminalLink = () => { navigator.clipboard.writeText(terminalUrl); alert("TERMINAL LINK SECURED 📟"); }
  
  const downloadQR = () => {
    if (!qrRef.current) return
    const svgData = new XMLSerializer().serializeToString(qrRef.current)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `MATRIX-QR.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  const qrUrl = `https://shordomain.com/pay/${brandId || 'demo'}`

  return (
    <main className="min-h-screen w-full bg-[#010201] text-white p-6 md:p-14 overflow-x-hidden font-sans">
      <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
        <div>
          <span className="text-blue-500/40 text-[9px] font-black tracking-[0.7em] uppercase mb-4 block italic">Brand Configuration v2.6</span>
          <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">
            Identity <span className="text-blue-500 text-glow italic">Center</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-6 py-3 rounded-2xl">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Master Node Active</span>
        </div>
      </header>

      <div className="max-w-6xl space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 border-t border-white/5 pt-16">
          <div className="space-y-10">
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-500 italic mb-2">Identity Protocol</h3>
              <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest italic">Visual credentials and brand passport.</p>
            </div>
            <div className="flex items-center gap-10">
              <label className="relative cursor-pointer group/avatar">
                <motion.div whileHover={{ scale: 1.05 }} className="h-32 w-32 rounded-[40px] bg-[#020502] border-2 border-blue-500/20 flex items-center justify-center overflow-hidden transition-all group-hover/avatar:border-blue-500 relative">
                  {isUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm"><div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
                  {avatarPreview ? <img src={avatarPreview} alt="Logo" className="h-full w-full object-cover" /> : <span className="opacity-40 text-4xl">🏢</span>}
                </motion.div>
                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
              </label>
              <button onClick={() => document.querySelector('input')?.click()} className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-white transition-all italic border-b border-blue-500/20 pb-1">Deploy Master Logo ↑</button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-600 uppercase font-black tracking-widest italic ml-4">Legal Brand Name</label>
                <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="BRAND NAME" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm font-black focus:border-blue-500/40 outline-none transition-all uppercase italic tracking-[2px]" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-gray-600 uppercase font-black tracking-widest italic ml-4">Industry Sector</label>
                <input type="text" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="e.g. SPECIALTY COFFEE" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm font-black focus:border-blue-500/40 outline-none transition-all uppercase italic tracking-[2px]" />
              </div>
              <div className="space-y-2 pt-4">
                <label className="text-[9px] text-gray-600 uppercase font-black tracking-widest italic ml-4">Brand Mission</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="ENTER BRAND MISSION..." className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 h-40 text-sm font-black focus:border-blue-500/40 outline-none transition-all uppercase italic resize-none shadow-inner" />
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-10 relative overflow-hidden h-fit shadow-2xl">
              <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-500 italic mb-2">Payment Protocol</h3>
              <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest italic mb-10">Financial routing node.</p>
              <div className="space-y-4 mb-10">
                <label className="text-[9px] text-gray-600 uppercase font-black tracking-[0.4em] mb-2 block italic">Bank Account (IBAN)</label>
                <input type="text" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="GE00TB..." className="w-full bg-[#010201] border border-white/10 rounded-2xl p-6 text-sm font-black focus:border-blue-500/40 outline-none transition-all uppercase italic" />
              </div>
              <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                <div className="bg-white p-3 rounded-2xl shadow-xl"><QRCodeSVG id="brand-qr-code" value={qrUrl} size={110} level="H" includeMargin={true} ref={qrRef} /></div>
                <div className="space-y-2">
                  <p className="text-[8px] text-gray-500 tracking-[0.3em] uppercase italic font-black">Universal QR Asset</p>
                  <button onClick={downloadQR} className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-white transition-all italic border-b border-blue-500/20 pb-1 text-left">Download PNG ↓</button>
                </div>
              </div>
            </div>

            <div className="bg-blue-600/[0.03] border border-blue-500/20 rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-500 italic mb-2">Terminal Node</h3>
                <span className="text-blue-500 text-xs italic">📟</span>
              </div>
              <div className="space-y-4">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="overflow-hidden">
                    <p className="text-[8px] text-gray-700 uppercase font-black tracking-widest mb-1 italic">Access Endpoint</p>
                    <p className="text-[10px] text-blue-500/60 font-black italic truncate uppercase">{terminalUrl || 'Syncing...'}</p>
                  </div>
                  <button onClick={copyTerminalLink} className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all">Copy Link</button>
                </div>
                <p className="px-4 text-[8px] text-gray-700 font-black uppercase italic leading-relaxed tracking-wider">⚠️ share only with cashier nodes.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-16 border-t border-white/5 flex justify-end items-center gap-10">
          <button className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700 hover:text-white transition-all italic">Abort Changes</button>
          <button onClick={handleCommit} disabled={isSaving || isUploading} className="px-20 py-6 bg-white text-black rounded-full text-[12px] font-black uppercase tracking-[0.6em] hover:bg-blue-600 hover:text-white transition-all duration-500 italic shadow-2xl disabled:opacity-50">{isSaving ? 'Syncing...' : 'Commit Identity'}</button>
        </div>
      </div>
    </main>
  )
}