'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: any) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const isScanningRef = useRef(false) 

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode("matrix-qr-reader")
        
        await scannerRef.current.start(
          { facingMode: "environment" },
          { 
            fps: 10, 
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.floor(minEdge * 0.7); 
              return { width: size, height: size };
            },
            aspectRatio: 1.0 
          },
          (decodedText) => {
            if (isMounted && !isScanningRef.current) {
              isScanningRef.current = true; 
              
              if (scannerRef.current?.getState() === 2) { 
                scannerRef.current.pause(true);
              }
              
              onScanSuccess(decodedText)
            }
          },
          (err: any) => {
            if (isMounted && onScanError && !isScanningRef.current) {
              // 🚀 ფიქსი: უსაფრთხოდ ვამოწმებთ ტექსტს (TypeScript ერორის გარეშე)
              if (!String(err).includes('NotFoundException')) {
                 onScanError(err)
              }
            }
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
        try {
           const state = scannerRef.current.getState();
           if (state === 2 || state === 3) { 
             scannerRef.current.stop().then(() => {
               scannerRef.current?.clear();
             }).catch(() => {});
           }
        } catch(e) {
           console.error("Cleanup error", e);
        }
      }
    }
  }, [onScanSuccess, onScanError])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingFile(true)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setIsProcessingFile(false)
          return
        }
        
        ctx.drawImage(img, 0, 0, img.width, img.height)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          if (!isScanningRef.current) {
             isScanningRef.current = true;
             onScanSuccess(code.data)
          }
        } else {
          alert("QR Code not found in the image. Please try a clearer image.")
        }
        setIsProcessingFile(false)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="w-full flex flex-col items-center relative z-10 space-y-6">
      
      <div className="w-full max-w-sm overflow-hidden rounded-[30px] border-2 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-black relative">
        <div id="matrix-qr-reader" className="w-full h-[320px] object-cover [&>video]:object-cover"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-emerald-500/80 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_#10b981] z-30 pointer-events-none" />
      </div>
      
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