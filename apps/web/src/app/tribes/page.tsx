"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GridSkeleton } from "@/components/ui/Skeleton";

export default function TribesPage() {
  const [tribes, setTribes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get<any>("/api/tribes").then(d => { setTribes(d.tribes || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-main)] dark:text-gray-100">卑南八社</h1>
          <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] mt-2 text-lg">卑南族傳統上由八個主要部落組成，各有其獨特的文化與歷史</p>
        </div>
        <Link href="/tribes/map" className="px-4 py-2 bg-[var(--red)] text-white rounded-[var(--radius-md)] text-sm font-medium hover:bg-[var(--red)] transition">地圖檢視</Link>
      </div>
      {loading ? <GridSkeleton count={8} /> : (
        <div className="grid md:grid-cols-2 gap-6">
          {tribes.map((t: any) => (
            <Link key={t.id} href={`/tribes/${t.id}`} className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] shadow-sm hover:shadow-lg transition-all p-6 border border-[var(--border)] dark:border-[#333] flex gap-5 group hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-white to-white dark:from-[#222]/50 dark:to-[#222]/50 rounded-[var(--radius-md)] flex items-center justify-center text-3xl flex-shrink-0"></div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[var(--text-main)] dark:text-gray-100 group-hover:text-[var(--red)] dark:group-hover:text-[var(--yellow)] transition">{t.name}</h2>
                {t.traditionalName && <p className="text-[var(--yellow)] dark:text-[var(--yellow)] text-sm">{t.traditionalName}</p>}
                <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-sm mt-2 line-clamp-2">{t.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-[var(--text-light)]">
                  {t.region && <span>{t.region}</span>}
                  {t.population && <span>約 {t.population?.toLocaleString()} 人</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
