import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "文化景點",
  description: "探訪卑南族重要的文化遺址、祭典場域、集會所與傳統獵場，含互動地圖。",
  openGraph: { title: "文化景點 — Pinuyumayan", description: "卑南族文化遺址與景點互動地圖" },
};
export default function CulturalSitesLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
