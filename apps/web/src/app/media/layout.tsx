import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "多媒體資料庫",
  description: "卑南族文化多媒體資料庫 — 照片、影片、音檔等珍貴文化素材。",
  openGraph: { title: "多媒體資料庫 — Pinuyumayan", description: "卑南族文化影音與照片資料庫" },
};
export default function MediaLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
