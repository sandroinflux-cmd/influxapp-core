import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Noto_Sans_Georgian,
  Noto_Serif_Georgian,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

const notoSerifGeorgian = Noto_Serif_Georgian({
  subsets: ["georgian"],
  weight: ["400", "500", "600"],
  variable: "--font-serif-ka",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif-en",
  display: "swap",
});

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-ka",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-en",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#090808",
};

export const metadata: Metadata = {
  title: "InfluX — Exclusive Access",
  description: "დახურული VIP წვდომა რჩეულ კლინიკებსა და ბუტიკ-სასტუმროებში — 15-წამიანი გადახდით.",
  openGraph: {
    title: "InfluX — Exclusive Access",
    description: "დახურული VIP წვდომა რჩეულ კლინიკებსა და ბუტიკ-სასტუმროებში — 15-წამიანი გადახდით.",
  },
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
    <html
      lang="ka"
      className={`${notoSerifGeorgian.variable} ${cormorantGaramond.variable} ${notoSansGeorgian.variable} ${plusJakartaSans.variable} bg-[#090808]`}
    >
      <body className="antialiased overflow-x-hidden bg-[#090808] font-sans text-[#F2EFE9]">
        {children}
      </body>
    </html>
  );
}
