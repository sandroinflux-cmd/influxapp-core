'use client'

import { useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  useEffect(() => {
    // სკანერის კონფიგურაცია
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }, 
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        scanner.clear(); // სკანირების შემდეგ ვთიშავთ კამერას
      },
      (error) => {
        if (onScanError) onScanError(error);
      }
    );

    // კომპონენტის დახურვისას ვასუფთავებთ სკანერს
    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full bg-black rounded-3xl overflow-hidden border border-blue-500/30">
      <div id="reader" className="w-full"></div>
      <p className="text-[10px] text-center py-4 text-gray-500 uppercase tracking-widest">
        Align Store QR inside the frame
      </p>
    </div>
  );
}