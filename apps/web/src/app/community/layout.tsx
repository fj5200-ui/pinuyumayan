import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "社群討論",
  description: "加入 Pinuyumayan 社群 — 與族人及文化愛好者交流討論卑南族語言、文化與部落議題。",
  openGraph: { title: "社群討論 — Pinuyumayan", description: "卑南族文化社群討論區" },
};
export default function CommunityLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
