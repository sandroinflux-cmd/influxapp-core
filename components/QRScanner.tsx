'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: any) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode("matrix-qr-reader")
        
        await scannerRef.current.start(
          { facingMode: "environment" },
          { 
            fps: 10, 
            // 🚀 დინამიური ჩარჩო: ყოველთვის ეკრანის 70% იქნება და ზუსტ კვადრატს შექმნის!
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.floor(minEdge * 0.7);
              return { width: size, height: size };
            },
            aspectRatio: 1.0 
          },
          (decodedText) => {
            if (isMounted && scannerRef.current) {
              scannerRef.current.stop().catch(() => {})
              onScanSuccess(decodedText)
            }
          },
          (err) => {
            if (isMounted && onScanError) onScanError(err)
          }
        )
      } catch (err) {
        console.error("Camera error:", err)
      }
    }

    startScanner()

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current.clear()
      }
    }
  }, [onScanSuccess, onScanError])

  // 📁 ფაილის ატვირთვა სტაბილური მეთოდით
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingFile(true)
    try {
      // ვქმნით დროებით ინსტანსს მხოლოდ სურათის წასაკითხად
      const tempScanner = new Html5Qrcode("matrix-qr-reader")
      const decodedText = await tempScanner.scanFile(file, true)
      onScanSuccess(decodedText)
    } catch (err) {
      alert("QR Code not found in the image. Please try a clearer image.")
    } finally {
      setIsProcessingFile(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center relative z-10 space-y-6">
      
      {/* 📹 კამერის სკანერი დინამიური ჩარჩოთი */}
      <div className="w-full max-w-sm overflow-hidden rounded-[30px] border-2 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-black relative">
        <div id="matrix-qr-reader" className="w-full h-[320px] object-cover [&>video]:object-cover"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-emerald-500/80 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_#10b981] z-30" />
      </div>
      
      {/* 📁 ფაილის ატვირთვის ღილაკი */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessingFile}
        className="px-8 py-3.5 bg-[#010201] border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-95 italic disabled:opacity-50"
      >
        {isProcessingFile ? 'PROCESSING IMAGE...' : '+ SCAN AN IMAGE FILE'}
      </button>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-150px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(150px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}