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
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">🏘️ 卑南八社</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">卑南族傳統上由八個主要部落組成，各有其獨特的文化與歷史</p>
        </div>
        <Link href="/tribes/map" className="px-4 py-2 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 transition">🗺️ 地圖檢視</Link>
      </div>
      {loading ? <GridSkeleton count={8} /> : (
        <div className="grid md:grid-cols-2 gap-6">
          {tribes.map((t: any) => (
            <Link key={t.id} href={`/tribes/${t.id}`} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-stone-100 dark:border-stone-700 flex gap-5 group hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🏔️</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">{t.name}</h2>
                {t.traditionalName && <p className="text-amber-600 dark:text-amber-400 text-sm">{t.traditionalName}</p>}
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-2">{t.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-stone-400">
                  {t.region && <span>📍 {t.region}</span>}
                  {t.population && <span>👥 約 {t.population?.toLocaleString()} 人</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
