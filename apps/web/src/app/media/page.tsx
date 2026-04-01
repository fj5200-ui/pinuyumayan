"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GridSkeleton } from "@/components/ui/Skeleton";

const typeIcon: Record<string, string> = { photo: "📷", video: "🎬", audio: "🎵" };

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  useEffect(() => { api.get<any>("/api/media").then(d => { setMedia(d.media || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const filtered = filter === "all" ? media : media.filter(m => m.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">🎬 媒體庫</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">珍貴的卑南族文化影像與多媒體資料</p>
      </div>
      <div className="flex gap-2 mb-8">
        {[["all", "全部"], ["photo", "📷 照片"], ["video", "🎬 影片"], ["audio", "🎵 音檔"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === k ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>{l}</button>
        ))}
      </div>
      {loading ? <GridSkeleton count={6} /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m: any) => (
            <div key={m.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm overflow-hidden border border-stone-100 dark:border-stone-700 hover:shadow-md transition">
              <div className="bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-600 h-48 flex items-center justify-center text-6xl">{typeIcon[m.type] || "📁"}</div>
              <div className="p-5">
                <span className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2 py-1 rounded-full">{m.type === "photo" ? "照片" : m.type === "video" ? "影片" : "音檔"}</span>
                <h2 className="font-bold text-lg mt-2 dark:text-stone-100">{m.title}</h2>
                {m.description && <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-2">{m.description}</p>}
                <p className="text-xs text-stone-400 mt-3">{new Date(m.createdAt).toLocaleDateString("zh-TW")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && <div className="text-center py-20 text-stone-400">此類型暫無媒體</div>}
    </div>
  );
}
