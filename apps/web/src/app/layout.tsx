import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Pinuyumayan 卑南族入口網", template: "%s | Pinuyumayan" },
  description: "卑南族文化入口網 — 保存與推廣卑南族語言、文化與傳統知識",
  keywords: "卑南族,Puyuma,原住民,部落,族語,文化,台東,祭典",
  openGraph: { title: "Pinuyumayan 卑南族入口網", description: "探索卑南族豐富的文化遺產", type: "website", locale: "zh_TW", siteName: "Pinuyumayan" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 min-h-screen flex flex-col transition-colors" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
