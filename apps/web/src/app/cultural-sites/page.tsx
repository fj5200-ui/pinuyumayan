"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface CulturalSite {
  id: number; name: string; type: string; description: string;
  lat: number; lng: number; tribeId?: number; tribeName?: string;
  images: string[]; tags: string[];
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
  "遺址": "bg-[rgba(153,27,27,0.06)] dark:bg-[#222]/40 text-[var(--red)] dark:text-[var(--yellow)]",
  "工藝": "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
  "祭典場": "bg-[rgba(217,119,6,0.1)] dark:bg-orange-900/40 text-[var(--yellow)] dark:text-orange-300",
};
const TYPE_BAR: Record<string, string> = {
  "集會所": "bg-blue-500", "祭祀場": "bg-red-500", "會所": "bg-green-500",
  "獵場": "bg-emerald-500", "文化區": "bg-purple-500", "遺址": "bg-white0",
  "工藝": "bg-pink-500", "祭典場": "bg-orange-500",
};

export default function CulturalSitesPage() {
  const [sites, setSites] = useState<CulturalSite[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [filterType, setFilterType] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CulturalSite | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "type" | "tribe">("name");
  const [nearbyMode, setNearbyMode] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  // Hero animation
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeroVisible(true); }, { threshold: 0.2 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  // Fetch sites
  useEffect(() => {
    const url = filterType === "全部" ? "/api/cultural-sites" : `/api/cultural-sites?type=${filterType}`;
    setLoading(true);
    api.get<any>(url).then(d => {
      setSites(d.sites || []);
      if (d.types) setTypes(d.types);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filterType]);

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setNearbyMode(true); },
      () => { setNearbyMode(false); }
    );
  };

  // Distance calculation (Haversine)
  const calcDist = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Filtered & sorted sites
  const filteredSites = useMemo(() => {
    let result = sites.filter(s =>
      !searchQ || s.name.includes(searchQ) || s.description.includes(searchQ) || s.tribeName?.includes(searchQ) || s.tags?.some(t => t.includes(searchQ))
    );
    if (nearbyMode && userLoc) {
      result = result.map(s => ({ ...s, _dist: calcDist(userLoc.lat, userLoc.lng, s.lat, s.lng) }))
        .sort((a: any, b: any) => a._dist - b._dist);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "type") {
      result.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
    } else if (sortBy === "tribe") {
      result.sort((a, b) => (a.tribeName || "").localeCompare(b.tribeName || "") || a.name.localeCompare(b.name));
    }
    return result;
  }, [sites, searchQ, sortBy, nearbyMode, userLoc]);

  // Stats
  const stats = useMemo(() => {
    const tribeSet = new Set(sites.map(s => s.tribeName).filter(Boolean));
    return { total: sites.length, types: types.length, tribes: tribeSet.size };
  }, [sites, types]);

  // Leaflet map
  useEffect(() => {
    if (viewMode !== "map" || !mapRef.current || typeof window === "undefined") return;
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const loadMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([22.76, 121.05], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
      }
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      // User location marker
      if (userLoc) {
        const userIcon = L.divIcon({ html: '<div style="font-size:20px;text-align:center">📍</div>', className: "user-loc-marker", iconSize: [24, 24], iconAnchor: [12, 24] });
        const um = L.marker([userLoc.lat, userLoc.lng], { icon: userIcon }).addTo(mapInstanceRef.current).bindPopup("<strong>📍 你的位置</strong>");
        markersRef.current.push(um);
      }
      filteredSites.forEach(site => {
        const icon = L.divIcon({
          html: `<div style="font-size:24px;text-align:center;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${TYPE_ICONS[site.type] || "📍"}</div>`,
          className: "custom-marker", iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
        });
        const dist = userLoc ? calcDist(userLoc.lat, userLoc.lng, site.lat, site.lng) : null;
        const marker = L.marker([site.lat, site.lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="min-width:200px;font-family:system-ui">
              <strong style="font-size:14px">${site.name}</strong><br/>
              <span style="color:#777;font-size:12px">${site.type}${site.tribeName ? " · " + site.tribeName : ""}</span>
              ${dist !== null ? `<br/><span style="color:#b45309;font-size:11px;font-weight:600">📏 距離 ${dist.toFixed(1)} km</span>` : ""}
              <p style="font-size:12px;margin-top:4px;color:#555">${site.description.slice(0, 100)}...</p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}" target="_blank" rel="noopener"
                style="display:inline-block;margin-top:6px;background:#b45309;color:white;padding:4px 12px;border-radius:8px;font-size:11px;text-decoration:none">
                🧭 導航
              </a>
            </div>
          `);
        marker.on("click", () => { setSelected(site); setShowDetail(true); });
        markersRef.current.push(marker);
      });
      if (filteredSites.length > 0) {
        const allPts = filteredSites.map(s => [s.lat, s.lng]);
        if (userLoc) allPts.push([userLoc.lat, userLoc.lng]);
        const bounds = L.latLngBounds(allPts);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    };
    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setTimeout(loadMap, 100);
      document.head.appendChild(script);
    } else { loadMap(); }
  }, [viewMode, filteredSites, userLoc]);

  // Fly to selected
  useEffect(() => {
    if (selected && mapInstanceRef.current && viewMode === "map") {
      mapInstanceRef.current.flyTo([selected.lat, selected.lng], 15, { duration: 0.8 });
    }
  }, [selected, viewMode]);

  const distToSite = (site: CulturalSite) => {
    if (!userLoc) return null;
    return calcDist(userLoc.lat, userLoc.lng, site.lat, site.lng);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-gradient-to-br from-[#222] via-[#1a1a1a] to-[#111] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🏺</div>
          <div className="absolute bottom-10 right-10 text-8xl">⛩️</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] opacity-5">🏛️</div>
        </div>
        <div className={`max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10 transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">🏺 文化景點巡禮</h1>
              <p className="text-white/80 text-lg md:text-xl max-w-xl">
                探索卑南族的文化遺產與重要場域 — 從古老集會所到神聖祭祀場，每個地點都承載著祖先的智慧
              </p>
            </div>
            {/* Stats pills */}
            <div className="flex gap-4">
              {[
                { icon: "🏺", value: stats.total, label: "景點" },
                { icon: "📂", value: stats.types, label: "類型" },
                { icon: "🏘️", value: stats.tribes, label: "部落" },
              ].map((s, i) => (
                <div key={i} className={`text-center bg-white/10 backdrop-blur-sm rounded-[var(--radius-md)] px-5 py-4 transition-all duration-700 delay-${i * 200} ${heroVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-[var(--yellow)]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Wave separator */}
        <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,40 C360,0 720,60 1080,20 C1260,5 1380,35 1440,30 L1440,60 L0,60 Z" className="fill-[var(--cream)] dark:fill-[#111]" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 bg-[var(--cream)] dark:bg-[#111] min-h-screen">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="搜尋景點名稱、部落..."
                className="pl-9 pr-4 py-2.5 rounded-[var(--radius-md)] border dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-100 text-sm w-48 focus:w-64 transition-all focus:ring-2 focus:ring-red-300 outline-none" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] text-sm">🔍</span>
            </div>
            {/* Sort */}
            <select value={sortBy} onChange={e => { setSortBy(e.target.value as any); setNearbyMode(false); }}
              className="px-3 py-2.5 rounded-[var(--radius-md)] border dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-200 text-sm outline-none cursor-pointer">
              <option value="name">名稱排序</option>
              <option value="type">類型排序</option>
              <option value="tribe">部落排序</option>
            </select>
            {/* Nearby */}
            <button onClick={getUserLocation}
              className={`px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition flex items-center gap-1.5 ${nearbyMode ? "bg-[var(--red)] text-white" : "bg-white dark:bg-[#1a1a1a] border dark:border-[#333] text-[var(--text-soft)] dark:text-[var(--text-light)] hover:bg-white"}`}>
              📍 {nearbyMode ? "附近優先" : "附近的景點"}
            </button>
          </div>
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-[#1a1a1a] rounded-[var(--radius-md)] p-1">
            <button onClick={() => setViewMode("grid")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${viewMode === "grid" ? "bg-white dark:bg-[#222] shadow-sm text-[var(--text-main)] dark:text-gray-200" : "text-[var(--text-soft)]"}`}>
              📋 列表
            </button>
            <button onClick={() => setViewMode("map")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${viewMode === "map" ? "bg-white dark:bg-[#222] shadow-sm text-[var(--text-main)] dark:text-gray-200" : "text-[var(--text-soft)]"}`}>
              🗺️ 地圖
            </button>
          </div>
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setFilterType("全部")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filterType === "全部" ? "bg-[var(--red)] text-white shadow-sm" : "bg-white dark:bg-[#1a1a1a] text-[var(--text-soft)] dark:text-[var(--text-light)] hover:bg-white dark:hover:bg-[#333] border dark:border-[#333]"}`}>
            全部 ({sites.length})
          </button>
          {types.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${filterType === t ? "bg-[var(--red)] text-white shadow-sm" : "bg-white dark:bg-[#1a1a1a] text-[var(--text-soft)] dark:text-[var(--text-light)] hover:bg-white dark:hover:bg-[#333] border dark:border-[#333]"}`}>
              {TYPE_ICONS[t] || "📍"} {t} ({sites.filter(s => s.type === t).length})
            </button>
          ))}
        </div>

        {/* Map view */}
        {viewMode === "map" && (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div ref={mapRef} className="rounded-[var(--radius-md)] overflow-hidden border dark:border-[#333] shadow-md" style={{ height: "580px", zIndex: 1 }} />
              {/* Map legend */}
              <div className="flex flex-wrap gap-2 mt-3">
                {types.map(t => (
                  <span key={t} className="text-xs flex items-center gap-1 bg-white dark:bg-[#1a1a1a] px-2 py-1 rounded-full border dark:border-[#333]">
                    {TYPE_ICONS[t]} {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-hidden flex flex-col shadow-md" style={{ maxHeight: "580px" }}>
              {showDetail && selected ? (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b dark:border-[#333] flex items-center justify-between bg-gradient-to-r from-[var(--cream)] to-white/50 dark:from-[#1a1a1a] dark:to-[#1a1a1a]">
                    <h3 className="font-bold dark:text-gray-100 flex items-center gap-2">
                      <span className="text-xl">{TYPE_ICONS[selected.type] || "📍"}</span> 景點詳情
                    </h3>
                    <button onClick={() => { setShowDetail(false); setSelected(null); }} className="text-[var(--text-light)] hover:text-[var(--text-soft)] text-sm px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333]">✕</button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="font-bold text-xl dark:text-gray-100">{selected.name}</h4>
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full mt-1 ${TYPE_COLORS[selected.type] || "bg-gray-100 text-[var(--text-soft)]"}`}>{selected.type}</span>
                    </div>
                    <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-sm leading-relaxed">{selected.description}</p>
                    
                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {selected.tribeName && (
                        <div className="bg-[var(--cream)] dark:bg-[#222]/50 rounded-[var(--radius-md)] p-3">
                          <p className="text-xs text-[var(--text-light)] mb-1">所屬部落</p>
                          <p className="text-sm font-medium dark:text-gray-200">🏘️ {selected.tribeName}</p>
                        </div>
                      )}
                      <div className="bg-[var(--cream)] dark:bg-[#222]/50 rounded-[var(--radius-md)] p-3">
                        <p className="text-xs text-[var(--text-light)] mb-1">座標</p>
                        <p className="text-sm font-medium dark:text-gray-200">{selected.lat.toFixed(4)}°N</p>
                      </div>
                      {userLoc && (
                        <div className="bg-white dark:bg-[#222]/20 rounded-[var(--radius-md)] p-3 col-span-2">
                          <p className="text-xs text-[var(--text-light)] mb-1">距離你</p>
                          <p className="text-sm font-bold text-[var(--red)] dark:text-[var(--yellow)]">📏 {distToSite(selected)?.toFixed(1)} 公里</p>
                        </div>
                      )}
                    </div>

                    {selected.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selected.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 dark:bg-[#222] text-[var(--text-soft)] dark:text-[var(--text-light)] px-2.5 py-1 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-2">
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="block w-full text-center bg-[var(--red)] text-white py-2.5 rounded-[var(--radius-md)] text-sm font-medium hover:bg-[var(--red)] transition">
                        🧭 Google Maps 導航
                      </a>
                      <a href={`https://www.google.com/maps/@${selected.lat},${selected.lng},17z`}
                        target="_blank" rel="noopener noreferrer"
                        className="block w-full text-center bg-gray-100 dark:bg-[#222] text-[var(--text-main)] dark:text-gray-200 py-2.5 rounded-[var(--radius-md)] text-sm font-medium hover:bg-gray-200 dark:hover:bg-[#444] transition">
                        🌍 在 Google Maps 查看
                      </a>
                      {selected.tribeId && (
                        <Link href={`/tribes/${selected.tribeId}`}
                          className="block w-full text-center bg-gray-100 dark:bg-[#222] text-[var(--text-main)] dark:text-gray-200 py-2.5 rounded-[var(--radius-md)] text-sm font-medium hover:bg-gray-200 dark:hover:bg-[#444] transition">
                          🏘️ 前往部落頁面
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b dark:border-[#333] bg-gradient-to-r from-[var(--cream)] to-white/50 dark:from-[#1a1a1a] dark:to-[#1a1a1a]">
                    <h3 className="font-bold dark:text-gray-100 text-sm">📍 景點列表 ({filteredSites.length})</h3>
                  </div>
                  <div className="divide-y dark:divide-[#333]">
                    {filteredSites.map(site => {
                      const dist = distToSite(site);
                      return (
                        <button key={site.id} onClick={() => { setSelected(site); setShowDetail(true); }}
                          className="w-full text-left p-4 hover:bg-[var(--cream)] dark:hover:bg-[#333]/50 transition group">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg group-hover:scale-110 transition-transform">{TYPE_ICONS[site.type] || "📍"}</span>
                            <span className="font-bold text-sm dark:text-gray-100 truncate flex-1">{site.name}</span>
                            {dist !== null && <span className="text-xs text-[var(--yellow)] dark:text-[var(--yellow)] font-medium shrink-0">{dist.toFixed(1)}km</span>}
                          </div>
                          <p className="text-xs text-[var(--text-light)] line-clamp-1 pl-7">{site.description}</p>
                          <div className="flex items-center gap-2 mt-1 pl-7">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TYPE_COLORS[site.type] || "bg-gray-100 text-[var(--text-soft)]"}`}>{site.type}</span>
                            {site.tribeName && <span className="text-[10px] text-[var(--text-light)]">{site.tribeName}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && (
          loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-hidden animate-pulse">
                  <div className="h-2 bg-gray-200 dark:bg-[#222]" />
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-[#222] rounded-[var(--radius-md)]" />
                      <div className="w-16 h-5 bg-gray-200 dark:bg-[#222] rounded-full" />
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-[#222] rounded w-3/4" />
                    <div className="h-4 bg-gray-100 dark:bg-[#222] rounded w-full" />
                    <div className="h-4 bg-gray-100 dark:bg-[#222] rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333]">
              <p className="text-5xl mb-4">🏺</p>
              <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-lg">{searchQ ? `找不到「${searchQ}」的景點` : "暫無此類型的文化景點"}</p>
              <button onClick={() => { setSearchQ(""); setFilterType("全部"); }}
                className="mt-4 text-[var(--red)] dark:text-[var(--yellow)] text-sm hover:underline">清除篩選 →</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSites.map((site, idx) => {
                const dist = distToSite(site);
                return (
                  <div key={site.id}
                    className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] shadow-sm border border-[var(--border)] dark:border-[#333] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group"
                    style={{ animationDelay: `${idx * 50}ms` }}>
                    {/* Color bar */}
                    <div className={`h-1.5 ${TYPE_BAR[site.type] || "bg-gray-400"}`} />
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform">{TYPE_ICONS[site.type] || "📍"}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[site.type] || "bg-gray-100 text-[var(--text-soft)]"}`}>{site.type}</span>
                        {dist !== null && (
                          <span className="text-xs text-[var(--yellow)] dark:text-[var(--yellow)] font-medium ml-auto">📏 {dist.toFixed(1)}km</span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-[var(--text-main)] dark:text-gray-100 mb-2 group-hover:text-[var(--red)] dark:group-hover:text-[var(--yellow)] transition">{site.name}</h2>
                      <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-sm line-clamp-3 mb-4 leading-relaxed">{site.description}</p>
                      <div className="border-t dark:border-[#333] pt-3 flex items-center justify-between text-sm text-[var(--text-soft)] dark:text-[var(--text-light)]">
                        <div>
                          {site.tribeName && <p className="text-xs flex items-center gap-1">🏘️ {site.tribeName}</p>}
                          <p className="text-xs flex items-center gap-1 mt-0.5">📍 {site.lat.toFixed(4)}°N, {site.lng.toFixed(4)}°E</p>
                        </div>
                        <button onClick={() => { setSelected(site); setViewMode("map"); setShowDetail(true); }}
                          className="text-xs bg-white dark:bg-[#222]/20 text-[var(--red)] dark:text-[var(--yellow)] px-3 py-1.5 rounded-lg hover:bg-[rgba(153,27,27,0.06)] dark:hover:bg-[#222]/40 transition font-medium">
                          🗺️ 地圖
                        </button>
                      </div>
                      {site.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {site.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 dark:bg-[#222] text-[var(--text-soft)] dark:text-[var(--text-light)] px-2 py-1 rounded-full">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Bottom navigation */}
        <div className="mt-16 bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-8">
          <h3 className="text-lg font-bold text-[var(--text-main)] dark:text-gray-100 text-center mb-6">🌿 探索更多卑南族文化</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🗺️", label: "部落地圖", href: "/tribes/map", desc: "互動式地圖總覽" },
              { icon: "🏘️", label: "部落列表", href: "/tribes", desc: "認識各部落特色" },
              { icon: "🎉", label: "活動祭典", href: "/events", desc: "傳統祭儀與活動" },
              { icon: "📖", label: "族語學習", href: "/language", desc: "學習卑南族語言" },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-center p-4 rounded-[var(--radius-md)] bg-[var(--cream)] dark:bg-[#222]/50 hover:bg-white dark:hover:bg-[#333] transition group">
                <p className="text-3xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</p>
                <p className="font-medium dark:text-gray-200 text-sm">{link.label}</p>
                <p className="text-xs text-[var(--text-light)] mt-1">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
