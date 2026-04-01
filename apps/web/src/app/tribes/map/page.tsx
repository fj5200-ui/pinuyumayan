"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { api } from "@/lib/api";

declare global { interface Window { L: any; } }

export default function TribesMapPage() {
  const [tribes, setTribes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    api.get<any>("/api/tribes").then(d => { setTribes(d.tribes || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!leafletLoaded || tribes.length === 0 || mapReady) return;
    const L = window.L;
    if (!L) return;

    const map = L.map("map-container", { zoomControl: false }).setView([22.77, 121.08], 12);
    L.control.zoom({ position: "topright" }).addTo(map);

    // Multiple tile layers
    const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap", maxZoom: 19 });
    const topoLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenTopoMap", maxZoom: 17 });
    osmLayer.addTo(map);

    L.control.layers({ "街道圖": osmLayer, "地形圖": topoLayer }, {}, { position: "topright" }).addTo(map);

    const markers: any[] = [];
    tribes.forEach(t => {
      if (!t.latitude || !t.longitude) return;
      const marker = L.marker([t.latitude, t.longitude]).addTo(map);
      marker.bindPopup(`
        <div style="min-width:160px">
          <strong style="font-size:14px">${t.name}</strong>
          ${t.traditionalName ? `<br><span style="color:#b45309;font-size:12px">${t.traditionalName}</span>` : ""}
          ${t.population ? `<br><span style="font-size:11px;color:#666">👥 約 ${t.population.toLocaleString()} 人</span>` : ""}
          ${t.region ? `<br><span style="font-size:11px;color:#666">📍 ${t.region}</span>` : ""}
          <br><a href="/tribes/${t.id}" style="color:#b45309;font-size:12px">查看詳情 →</a>
        </div>
      `);
      marker.tribeId = t.id;
      markers.push(marker);
    });

    mapRef.current = map;
    markersRef.current = markers;
    setMapReady(true);

    return () => { map.remove(); };
  }, [leafletLoaded, tribes, mapReady]);

  const selectTribe = (t: any) => {
    setSelected(t);
    if (mapRef.current && t.latitude && t.longitude) {
      mapRef.current.setView([t.latitude, t.longitude], 14, { animate: true });
      const marker = markersRef.current.find(m => m.tribeId === t.id);
      if (marker) marker.openPopup();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onLoad={() => setLeafletLoaded(true)} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🗺️ 部落地圖</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">卑南族八社的地理位置</p>
        </div>
        <Link href="/tribes" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 text-sm">← 返回列表</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Map */}
        <div className="md:col-span-2">
          <div id="map-container" className="w-full h-[500px] rounded-xl overflow-hidden border dark:border-stone-700 bg-stone-100 dark:bg-stone-800">
            {!mapReady && <div className="flex items-center justify-center h-full text-stone-400">🗺️ 載入地圖中...</div>}
          </div>
        </div>

        {/* Tribe list */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : tribes.map(t => (
            <button key={t.id} onClick={() => selectTribe(t)}
              className={`w-full text-left p-4 rounded-xl border transition ${selected?.id === t.id ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700" : "bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 hover:border-amber-200 dark:hover:border-amber-800"}`}>
              <h3 className="font-bold dark:text-stone-100 text-sm">{t.name}</h3>
              {t.traditionalName && <p className="text-xs text-amber-600 dark:text-amber-400">{t.traditionalName}</p>}
              <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                {t.population && <span>👥 {t.population.toLocaleString()}</span>}
                {t.region && <span>📍 {t.region}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected tribe detail */}
      {selected && (
        <div className="mt-6 bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold dark:text-stone-100">{selected.name}</h2>
              {selected.traditionalName && <p className="text-amber-600 dark:text-amber-400">{selected.traditionalName}</p>}
            </div>
            <Link href={`/tribes/${selected.id}`} className="text-amber-700 dark:text-amber-400 text-sm hover:underline">查看詳情 →</Link>
          </div>
          <p className="text-stone-600 dark:text-stone-400 mt-3 text-sm">{selected.description}</p>
        </div>
      )}
    </div>
  );
}
