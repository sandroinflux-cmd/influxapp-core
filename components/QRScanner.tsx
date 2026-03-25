'use client'

import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: any) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const startScanner = async () => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("matrix-qr-reader")
        try {
          // 🚀 პირდაპირ და ავტომატურად რთავს უკანა კამერას!
          await scannerRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {})
                scannerRef.current.clear()
              }
              onScanSuccess(decodedText)
            },
            (err) => {
              if (onScanError) onScanError(err)
            }
          )
        } catch (err) {
          console.error("Camera start error:", err)
        }
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
  }, [onScanSuccess, onScanError])

  // 📁 ფაილის (სურათის) ატვირთვის ფუნქცია
  const handleFileUpload = async (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      if (scannerRef.current) {
        try {
          const decodedText = await scannerRef.current.scanFile(e.target.files[0], true)
          onScanSuccess(decodedText)
        } catch (err) {
          alert("No QR code found in the image.")
        }
      }
    }
  }

  return (
    <div className="w-full flex flex-col items-center relative z-10">
      <div className="w-full overflow-hidden rounded-[30px] border-2 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)] bg-black relative">
        <div id="matrix-qr-reader" className="w-full h-[300px] object-cover"></div>
        <div className="absolute bottom-0 h-1 w-full bg-emerald-500/50 animate-pulse"></div>
      </div>
      
      {/* 🚀 Scan an Image File ღილაკი */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg italic"
      >
        + Scan an Image File
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  )
}