"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GridSkeleton } from "@/components/ui/Skeleton";

const typeIcon: Record<string, string> = { photo: "📷", video: "🎬", audio: "🎵" };
const typeLabel: Record<string, string> = { photo: "照片", video: "影片", audio: "音檔" };
const typeColors: Record<string, string> = {
  photo: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  video: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  audio: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    api.get<any>("/api/media").then(d => { setMedia(d.media || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // ESC to close lightbox
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const filtered = media
    .filter(m => filter === "all" || m.type === filter)
    .filter(m => !searchQ || m.title?.toLowerCase().includes(searchQ.toLowerCase()) || m.description?.toLowerCase().includes(searchQ.toLowerCase()));

  const counts = { all: media.length, photo: media.filter(m => m.type === "photo").length, video: media.filter(m => m.type === "video").length, audio: media.filter(m => m.type === "audio").length };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">🎬 媒體庫</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">珍貴的卑南族文化影像與多媒體資料</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="搜尋媒體..."
              className="pl-9 pr-4 py-2 rounded-xl border dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 text-sm w-48 focus:w-64 transition-all focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-700 outline-none" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
          </div>
          {/* View mode */}
          <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === "grid" ? "bg-white dark:bg-stone-700 shadow-sm text-stone-800 dark:text-stone-200" : "text-stone-500"}`}>
              📋 網格
            </button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === "list" ? "bg-white dark:bg-stone-700 shadow-sm text-stone-800 dark:text-stone-200" : "text-stone-500"}`}>
              📄 列表
            </button>
          </div>
        </div>
      </div>

      {/* Type filters with counts */}
      <div className="flex gap-2 mb-8">
        {([["all", "全部", null], ["photo", "📷 照片", "photo"], ["video", "🎬 影片", "video"], ["audio", "🎵 音檔", "audio"]] as [string, string, string | null][]).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${filter === k ? "bg-amber-700 text-white shadow-sm" : "bg-white dark:bg-stone-800 border dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
            {l}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === k ? "bg-white/20" : "bg-stone-100 dark:bg-stone-700"}`}>
              {counts[k as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {loading ? <GridSkeleton count={6} /> : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-stone-400 text-lg">{searchQ ? `找不到「${searchQ}」的相關媒體` : "此類型暫無媒體"}</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m: any) => (
            <div key={m.id} onClick={() => setSelected(m)}
              className="bg-white dark:bg-stone-800 rounded-xl shadow-sm overflow-hidden border border-stone-100 dark:border-stone-700 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
              {/* Thumbnail area */}
              <div className="relative bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-600 h-48 flex items-center justify-center overflow-hidden">
                {m.url && m.type === "photo" ? (
                  <img src={m.url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform">{typeIcon[m.type] || "📁"}</span>
                </div>
                {/* Play button overlay for video/audio */}
                {(m.type === "video" || m.type === "audio") && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition">
                    <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-stone-800/90 flex items-center justify-center shadow-lg">
                      <span className="text-2xl ml-1">▶️</span>
                    </div>
                  </div>
                )}
                {/* Type badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[m.type] || "bg-stone-100 text-stone-600"}`}>
                    {typeIcon[m.type]} {typeLabel[m.type]}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-bold text-lg dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition truncate">{m.title}</h2>
                {m.description && <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-2">{m.description}</p>}
                <div className="flex items-center justify-between mt-3 text-xs text-stone-400">
                  <span>📅 {new Date(m.createdAt).toLocaleDateString("zh-TW")}</span>
                  {m.tribeName && <span>🏘️ {m.tribeName}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="space-y-3">
          {filtered.map((m: any) => (
            <div key={m.id} onClick={() => setSelected(m)}
              className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-4 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
              <div className="w-16 h-16 rounded-xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                {typeIcon[m.type] || "📁"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition truncate">{m.title}</h3>
                {m.description && <p className="text-stone-500 dark:text-stone-400 text-sm truncate">{m.description}</p>}
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${typeColors[m.type]}`}>{typeLabel[m.type]}</span>
              <span className="text-xs text-stone-400 shrink-0">{new Date(m.createdAt).toLocaleDateString("zh-TW")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <div className="flex items-center justify-between p-4 border-b dark:border-stone-700">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[selected.type]}`}>
                  {typeIcon[selected.type]} {typeLabel[selected.type]}
                </span>
                <h2 className="font-bold text-lg dark:text-stone-100">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xl p-1">✕</button>
            </div>

            {/* Media content */}
            <div className="p-6">
              {/* Photo */}
              {selected.type === "photo" && selected.url && (
                <div className="rounded-xl overflow-hidden mb-4 bg-stone-100 dark:bg-stone-700">
                  <img src={selected.url} alt={selected.title} className="w-full max-h-[60vh] object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                </div>
              )}

              {/* Video */}
              {selected.type === "video" && selected.url && (
                <div className="rounded-xl overflow-hidden mb-4 bg-black">
                  {selected.url.includes("youtube") || selected.url.includes("youtu.be") ? (
                    <iframe src={selected.url.replace("watch?v=", "embed/")} className="w-full aspect-video" allowFullScreen title={selected.title} />
                  ) : (
                    <video controls className="w-full max-h-[60vh]" src={selected.url}>
                      <track kind="captions" />
                    </video>
                  )}
                </div>
              )}

              {/* Audio */}
              {selected.type === "audio" && selected.url && (
                <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8 text-center">
                  <p className="text-6xl mb-4">🎵</p>
                  <p className="font-bold text-lg dark:text-stone-100 mb-4">{selected.title}</p>
                  <audio controls className="w-full max-w-md mx-auto" src={selected.url}>
                    <track kind="captions" />
                  </audio>
                </div>
              )}

              {/* No URL fallback */}
              {!selected.url && (
                <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-12 text-center mb-4">
                  <p className="text-6xl mb-4">{typeIcon[selected.type] || "📁"}</p>
                  <p className="text-stone-400">此媒體目前無可播放的檔案連結</p>
                </div>
              )}

              {/* Description */}
              {selected.description && (
                <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4 mb-4">
                  <h3 className="font-medium text-stone-800 dark:text-stone-200 mb-2 text-sm">📝 說明</h3>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed">{selected.description}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3">
                  <p className="text-stone-400 text-xs mb-1">上傳日期</p>
                  <p className="font-medium dark:text-stone-200">{new Date(selected.createdAt).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3">
                  <p className="text-stone-400 text-xs mb-1">媒體類型</p>
                  <p className="font-medium dark:text-stone-200">{typeIcon[selected.type]} {typeLabel[selected.type]}</p>
                </div>
                {selected.tribeName && (
                  <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3">
                    <p className="text-stone-400 text-xs mb-1">所屬部落</p>
                    <p className="font-medium dark:text-stone-200">🏘️ {selected.tribeName}</p>
                  </div>
                )}
                {selected.url && (
                  <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3">
                    <p className="text-stone-400 text-xs mb-1">來源</p>
                    <a href={selected.url} target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 hover:underline text-xs truncate block">
                      🔗 開啟原始連結
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
