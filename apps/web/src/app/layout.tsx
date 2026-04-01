import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Pinuyumayan 卑南族入口網",
  description: "卑南族文化入口網 — 保存與推廣卑南族語言、文化與傳統知識",
  keywords: "卑南族,Puyuma,原住民,部落,族語,文化",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-stone-50 text-stone-800 min-h-screen flex flex-col" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
