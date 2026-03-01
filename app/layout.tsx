import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 🛡️ მობილურის ოპტიმიზაცია: უსაფრთხოებისთვის ვზღუდავთ Zoom-ს და გაწელვას
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#010201", // Matrix Deep Black
};

export const metadata: Metadata = {
  title: "InfluX Matrix | Node Asset v1.0",
  description: "Secure Digital Asset Management Protocol",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#010201] selection:bg-emerald-500/30">
      <body className={`${inter.className} antialiased overflow-x-hidden bg-[#010201]`}>
        {/* 🌌 Global Grain Overlay - ფუტურისტული ტექსტურისთვის */}
        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        
        {children}
      </body>
    </html>
  );
}