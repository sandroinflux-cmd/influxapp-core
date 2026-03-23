'use client'

import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: any) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // 🛡️ ვქმნით სკანერს მხოლოდ ერთხელ (იცავს React Strict Mode-ის ორმაგი რენდერისგან)
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "matrix-qr-reader", 
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          // 📷 აიძულებს ტელეფონს გახსნას უკანა (მთავარი) კამერა:
          videoConstraints: {
            facingMode: "environment"
          }
        }, 
        false
      )
      
      scannerRef.current.render(
        (decodedText) => {
          // 🚀 როგორც კი დაასკანერებს, სკანერს ვთიშავთ მანამ, სანამ React-ი კომპონენტს წაშლის!
          if (scannerRef.current) {
            scannerRef.current.clear().catch(() => {})
            scannerRef.current = null
          }
          // ვაწვდით მშობელ კომპონენტს შედეგს
          onScanSuccess(decodedText)
        },
        (err) => {
          if (onScanError) onScanError(err)
        }
      )
    }

    // 🧹 Cleanup ფუნქცია კომპონენტის დახურვისას
    return () => {
      if (scannerRef.current) {
        try {
          // ვცდილობთ გასუფთავებას. თუ ვერ იპოვა ელემენტი, ვაიგნორებთ (Catch)
          scannerRef.current.clear().catch(() => {
            console.log("Scanner automatically cleared by React DOM.")
          })
        } catch (error) {
          // ვიჭერთ სინქრონულ DOM ერორებს
          console.log("DOM already modified.")
        }
        scannerRef.current = null
      }
    }
  }, [onScanSuccess, onScanError])

  return (
    <div className="w-full overflow-hidden rounded-[30px] border-2 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)] bg-black relative z-10">
      {/* ეს ID აუცილებელია html5-qrcode-სთვის */}
      <div id="matrix-qr-reader" className="w-full !border-none [&>div]:!border-none"></div>
      
      {/* ენერგიის პულსაციის ეფექტი ქვემოთ */}
      <div className="h-1 w-full bg-emerald-500/50 animate-pulse"></div>
    </div>
  )
}