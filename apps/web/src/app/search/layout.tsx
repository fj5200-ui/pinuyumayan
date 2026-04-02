import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "搜尋",
  description: "搜尋 Pinuyumayan 平台上的部落、文章、詞彙、活動與文化景點。",
};
export default function SearchLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
