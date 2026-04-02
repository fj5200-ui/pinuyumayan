import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "文化誌",
  description: "深入了解卑南族的歷史文化、傳統祭儀、音樂藝術與工藝技藝等各面向的文章。",
  openGraph: { title: "文化誌 — Pinuyumayan", description: "卑南族文化深度文章與報導" },
};
export default function ArticlesLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
