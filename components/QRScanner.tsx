'use client'

import { useRef, useState } from 'react'
import { QrReader } from 'react-qr-reader'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: any) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  // 📷 კამერის სკანირების დამუშავება
  const handleCameraScan = (result: any, error: any) => {
    if (result) {
      onScanSuccess(result?.text)
    }
    if (error && onScanError) {
      // ვაიგნორებთ ჩვეულებრივ "QR ვერ ვიპოვე" ერორებს, რომ კონსოლი არ გადაივსოს
      if (error?.name !== 'NotFoundException') {
        onScanError(error)
      }
    }
  }

  // 📁 ფაილის (სურათის) ატვირთვის დამუშავება (jsQR ბიბლიოთეკით)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingFile(true)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // ვქმნით ვირტუალურ Canvas-ს სურათის წასაკითხად
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
        
        // ვასკანერებთ jsQR-ით
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          onScanSuccess(code.data)
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
      
      {/* 📹 კამერის სკანერი */}
      <div className="w-full max-w-sm overflow-hidden rounded-[30px] border-2 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-black relative">
        {/* ლამაზი მწვანე ჩარჩო (Viewfinder) */}
        <div className="absolute inset-0 z-20 pointer-events-none border-[40px] border-black/50" />
        
        <div className="relative z-10 h-[300px] w-full">
          <QrReader
            onResult={handleCameraScan}
            constraints={{ facingMode: 'environment' }}
            containerStyle={{ width: '100%', height: '100%' }}
            videoStyle={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
        
        {/* Matrix პულსაცია */}
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