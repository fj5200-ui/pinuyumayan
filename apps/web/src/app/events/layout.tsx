import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "活動祭典",
  description: "瀏覽卑南族即將舉行的文化活動、傳統祭典與部落聚會，支援線上報名。",
  openGraph: { title: "活動祭典 — Pinuyumayan", description: "卑南族文化活動與祭典行事曆" },
};
export default function EventsLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
