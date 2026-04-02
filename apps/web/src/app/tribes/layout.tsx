import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "卑南八社",
  description: "認識卑南族八個主要部落 — 知本、建和、利嘉、泰安、初鹿、龍過脈、檳榔、寶桑的歷史文化與傳統。",
  openGraph: { title: "卑南八社 — Pinuyumayan", description: "探索卑南族八大部落的歷史與文化傳承" },
};
export default function TribesLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
