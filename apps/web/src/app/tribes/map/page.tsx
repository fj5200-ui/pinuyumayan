"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function TribesMapPage() {
  const [tribes, setTribes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    api.get<any>("/api/tribes").then(d => { setTribes(d.tribes || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tribes.length === 0 || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    if (mapInstance.current) mapInstance.current.remove();
    const map = L.map(mapRef.current).setView([22.77, 121.08], 12);
    mapInstance.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; OpenStreetMap' }).addTo(map);
    tribes.forEach(t => {
      if (!t.latitude || !t.longitude) return;
      const marker = L.marker([t.latitude, t.longitude]).addTo(map);
      marker.bindPopup(`<b>${t.name}</b><br/>${t.traditionalName || ""}<br/>人口: ${t.population?.toLocaleString() || "未知"}`);
      marker.on("click", () => setSelected(t));
    });
  }, [tribes]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">🗺️ 部落地圖</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">卑南八社地理分佈</p>
        </div>
        <Link href="/tribes" className="text-amber-700 dark:text-amber-400 hover:underline">← 部落列表</Link>
      </div>
      {/* Load Leaflet CSS and JS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" async />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-[500px] bg-stone-200 dark:bg-stone-700 rounded-2xl animate-pulse flex items-center justify-center text-stone-400">載入地圖中...</div>
          ) : (
            <div ref={mapRef} className="h-[500px] rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 z-0" />
          )}
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">卑南八社</h2>
          {tribes.map(t => (
            <button key={t.id} onClick={() => {
              setSelected(t);
              if (mapInstance.current && t.latitude) mapInstance.current.setView([t.latitude, t.longitude], 14);
            }} className={`w-full text-left p-3 rounded-xl border transition ${selected?.id === t.id ? "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700" : "bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750"}`}>
              <div className="font-bold text-stone-800 dark:text-stone-100">{t.name}</div>
              <div className="text-sm text-amber-600 dark:text-amber-400">{t.traditionalName}</div>
              <div className="text-xs text-stone-400 mt-1">{t.region} · 人口 {t.population?.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <div className="mt-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-6 border dark:border-stone-700 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{selected.name} <span className="text-amber-600 dark:text-amber-400 text-lg">{selected.traditionalName}</span></h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">{selected.region}</p>
            </div>
            <Link href={`/tribes/${selected.id}`} className="text-amber-700 dark:text-amber-400 text-sm hover:underline">查看詳情 →</Link>
          </div>
          <p className="text-stone-600 dark:text-stone-300 mt-3">{selected.description}</p>
        </div>
      )}
    </div>
  );
}
