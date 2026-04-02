"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const typeColors: Record<string, string> = {
  "遺址": "tag-red",
  "祭典場域": "tag-yellow",
  "歷史建物": "tag-green",
  "自然景觀": "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
  "文化園區": "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
};

export default function CulturalSiteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedSites, setRelatedSites] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<any>(`/api/cultural-sites/${id}`).catch(() => null),
      api.get<any>("/api/cultural-sites").catch(() => ({ sites: [] })),
    ]).then(([siteData, allSites]) => {
      const s = siteData?.site || siteData;
      if (s && s.id) {
        setSite(s);
        const related = (allSites.sites || [])
          .filter((rs: any) => rs.id !== Number(id) && (rs.type === s.type || rs.tribeId === s.tribeId))
          .slice(0, 3);
        setRelatedSites(related);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">找不到此景點</h1>
        <p className="text-[var(--text-soft)] mb-6">景點可能已被移除或不存在</p>
        <Link href="/cultural-sites" className="btn-brand">返回景點列表</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: "var(--text-light)" }}>
        <Link href="/" className="hover:text-[var(--red)] transition">首頁</Link>
        <span>/</span>
        <Link href="/cultural-sites" className="hover:text-[var(--red)] transition">文化景點</Link>
        <span>/</span>
        <span style={{ color: "var(--text-main)" }} className="dark:text-gray-200">{site.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${typeColors[site.type] || "tag-yellow"}`}>
                {site.type}
              </span>
              {site.tribeName && (
                <Link href={`/tribes/${site.tribeId}`}
                  className="text-xs px-2.5 py-1 rounded-full font-bold bg-[var(--cream)] dark:bg-[#222] text-[var(--text-soft)] hover:text-[var(--red)] transition">
                  {site.tribeName}
                </Link>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">{site.name}</h1>
            {site.location && (
              <p className="text-sm" style={{ color: "var(--text-soft)" }}>{site.location}</p>
            )}
          </div>

          {/* Color bar */}
          <div className="color-bar-6" />

          {/* Description */}
          <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-6">
            <h2 className="font-bold text-lg mb-4 pb-3 border-b border-[var(--border)] dark:border-[#333]">
              景點介紹
            </h2>
            <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] leading-relaxed whitespace-pre-line">
              {site.description || "暫無詳細介紹。"}
            </p>
          </div>

          {/* Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-light)" }}>類型</p>
              <p className="font-bold dark:text-gray-100">{site.type}</p>
            </div>

            {site.location && (
              <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-5">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-light)" }}>位置</p>
                <p className="font-bold dark:text-gray-100">{site.location}</p>
              </div>
            )}

            {site.tribeName && (
              <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-5">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-light)" }}>所屬部落</p>
                <Link href={`/tribes/${site.tribeId}`} className="font-bold hover:text-[var(--red)] transition dark:text-gray-100">
                  {site.tribeName}
                </Link>
              </div>
            )}

            {(site.latitude && site.longitude) && (
              <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-5">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-light)" }}>座標</p>
                <p className="font-mono text-sm dark:text-gray-100">{site.latitude}, {site.longitude}</p>
              </div>
            )}
          </div>

          {/* Historical significance */}
          {site.historicalSignificance && (
            <div className="bg-[var(--cream)] dark:bg-[#222] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-6">
              <h2 className="font-bold text-lg mb-3" style={{ color: "var(--red)" }}>歷史意義</h2>
              <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] leading-relaxed whitespace-pre-line">
                {site.historicalSignificance}
              </p>
            </div>
          )}

          {/* Related sites */}
          {relatedSites.length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-4">相關景點</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {relatedSites.map((rs: any) => (
                  <Link key={rs.id} href={`/cultural-sites/${rs.id}`}
                    className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-4 hover:shadow-md transition group">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${typeColors[rs.type] || "tag-yellow"}`}>{rs.type}</span>
                    <h3 className="font-bold text-sm mt-2 group-hover:text-[var(--red)] transition line-clamp-2">{rs.name}</h3>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-soft)" }}>{rs.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-6 sticky top-20">
            <h3 className="font-bold mb-4 pb-3 border-b border-[var(--border)] dark:border-[#333]">景點資訊</h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-light)" }}>景點名稱</p>
                <p className="font-bold dark:text-gray-200">{site.name}</p>
              </div>

              <div>
                <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-light)" }}>景點類型</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${typeColors[site.type] || "tag-yellow"}`}>{site.type}</span>
              </div>

              {site.location && (
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-light)" }}>地址位置</p>
                  <p className="dark:text-gray-200">{site.location}</p>
                </div>
              )}

              {site.tribeName && (
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-light)" }}>相關部落</p>
                  <Link href={`/tribes/${site.tribeId}`} className="font-bold hover:text-[var(--red)] transition dark:text-gray-200">
                    {site.tribeName} →
                  </Link>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="border-t border-[var(--border)] dark:border-[#333] mt-4 pt-4 space-y-2">
              <Link href="/tribes/map" className="block w-full text-center py-2.5 rounded-[var(--radius-md)] text-sm font-bold bg-[var(--cream)] dark:bg-[#222] hover:bg-[rgba(153,27,27,0.06)] transition">
                部落地圖
              </Link>
              <Link href="/cultural-sites" className="text-sm font-bold block text-center hover:text-[var(--red)] transition mt-2" style={{ color: "var(--text-soft)" }}>
                ← 返回景點列表
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
