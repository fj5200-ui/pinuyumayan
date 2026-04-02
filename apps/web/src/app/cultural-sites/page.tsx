"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface CulturalSite {
  id: number; name: string; type: string; description: string;
  lat: number; lng: number; tribeId?: number; tribeName?: string;
  images: string[]; tags: string[]; distance?: number;
}

const TYPE_ICONS: Record<string, string> = {
  "集會所": "🏛️", "祭祀場": "⛩️", "會所": "🏠", "獵場": "🌲",
  "文化區": "🎭", "遺址": "🏺", "工藝": "🧶", "祭典場": "🎪",
};

const TYPE_COLORS: Record<string, string> = {
  "集會所": "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  "祭祀場": "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  "會所": "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  "獵場": "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  "文化區": "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  "遺址": "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  "工藝": "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
  "祭典場": "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
};

export default function CulturalSitesPage() {
  const [sites, setSites] = useState<CulturalSite[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [filterType, setFilterType] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CulturalSite | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  useEffect(() => {
    const url = filterType === "全部" ? "/api/cultural-sites" : `/api/cultural-sites?type=${filterType}`;
    setLoading(true);
    api.get<any>(url).then(d => {
      setSites(d.sites || []);
      if (d.types) setTypes(d.types);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filterType]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">🏺 文化景點</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">探索卑南族的文化遺產與重要場域</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === "grid" ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 dark:text-stone-300"}`}>
            📋 列表
          </button>
          <button onClick={() => setViewMode("map")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === "map" ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 dark:text-stone-300"}`}>
            🗺️ 地圖
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setFilterType("全部")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${filterType === "全部" ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-700 border dark:border-stone-700"}`}>
          全部
        </button>
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filterType === t ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-700 border dark:border-stone-700"}`}>
            {TYPE_ICONS[t] || "📍"} {t}
          </button>
        ))}
      </div>

      {/* Map view */}
      {viewMode === "map" && (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6 mb-8">
          <div className="relative bg-gradient-to-b from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl h-[500px] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl mb-4">🗺️</p>
                <p className="text-stone-600 dark:text-stone-400 font-medium">卑南族文化景點分佈</p>
                <p className="text-stone-400 text-sm mt-1">台東縣區域</p>
              </div>
            </div>
            {/* Map markers */}
            {sites.map(site => {
              const x = ((site.lng - 120.95) / 0.25) * 100;
              const y = (1 - (site.lat - 22.65) / 0.2) * 100;
              return (
                <button key={site.id} onClick={() => setSelected(site)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                  style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg transition-transform group-hover:scale-125 ${selected?.id === site.id ? "ring-4 ring-amber-400 scale-125" : ""} bg-white dark:bg-stone-700`}>
                    {TYPE_ICONS[site.type] || "📍"}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-white dark:bg-stone-800 px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition dark:text-stone-200">
                    {site.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected site info */}
          {selected && (
            <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{TYPE_ICONS[selected.type] || "📍"}</span>
                    <h3 className="text-xl font-bold dark:text-stone-100">{selected.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[selected.type] || "bg-stone-100 text-stone-600"}`}>{selected.type}</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400">{selected.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-stone-500 dark:text-stone-400">
                    {selected.tribeName && <span>🏘️ {selected.tribeName}</span>}
                    <span>📍 {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</span>
                  </div>
                  {selected.tags.length > 0 && (
                    <div className="flex gap-1 mt-3">
                      {selected.tags.map(tag => (
                        <span key={tag} className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid view */}
      {viewMode === "grid" && (
        loading ? (
          <div className="text-center py-20 text-stone-400">載入中...</div>
        ) : sites.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <p className="text-4xl mb-4">🏺</p>
            <p>暫無此類型的文化景點</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map(site => (
              <div key={site.id} onClick={() => { setSelected(site); setViewMode("map"); }}
                className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 p-6 hover:shadow-md transition cursor-pointer group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{TYPE_ICONS[site.type] || "📍"}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[site.type] || "bg-stone-100 text-stone-600"}`}>{site.type}</span>
                </div>
                <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">{site.name}</h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-3 mb-4">{site.description}</p>
                <div className="border-t dark:border-stone-700 pt-3 space-y-1 text-sm text-stone-500 dark:text-stone-400">
                  {site.tribeName && <p>🏘️ {site.tribeName}</p>}
                  <p>📍 {site.lat.toFixed(4)}°N, {site.lng.toFixed(4)}°E</p>
                </div>
                {site.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {site.tags.map(tag => (
                      <span key={tag} className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Links */}
      <div className="mt-12 flex justify-center gap-4">
        <Link href="/tribes/map" className="text-amber-700 dark:text-amber-400 hover:underline text-sm">🗺️ 部落地圖</Link>
        <Link href="/tribes" className="text-amber-700 dark:text-amber-400 hover:underline text-sm">🏘️ 部落列表</Link>
        <Link href="/events" className="text-amber-700 dark:text-amber-400 hover:underline text-sm">🎉 活動祭典</Link>
      </div>
    </div>
  );
}
