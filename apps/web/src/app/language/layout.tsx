import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "族語學習",
  description: "線上學習卑南族語 — 包含詞彙庫、發音、例句、每日一詞、互動測驗與學習進度追蹤。",
  openGraph: { title: "族語學習 — Pinuyumayan", description: "線上卑南語學習平台：詞彙、測驗、進度追蹤" },
};
export default function LanguageLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
