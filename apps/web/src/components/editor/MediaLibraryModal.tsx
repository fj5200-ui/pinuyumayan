"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";

interface MediaItem {
  id: number;
  title: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaLibraryModal({ open, onClose, onSelect }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState("photo");
  const [searchTerm, setSearchTerm] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.get<{ media: MediaItem[] }>("/api/media?limit=100")
      .then(d => { setItems(d.media || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await api.upload<{ url: string }>("/api/media/upload", formData);
      onSelect(result.url);
      onClose();
    } catch (err: any) {
      alert(err.message || "上傳失敗");
    } finally {
      setUploading(false);
    }
  };

  const filtered = items
    .filter(m => !filterType || m.type === filterType)
    .filter(m => !searchTerm || m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Modal open={open} onClose={onClose} title="媒體庫" size="lg">
      <div className="space-y-4">
        {/* Top bar: search + filter + upload */}
        <div className="flex gap-2 flex-wrap items-center">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜尋媒體..."
            className="px-3 py-2 border rounded-lg text-sm dark:bg-stone-700 dark:border-stone-600 dark:text-stone-100 flex-1 min-w-40"
          />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm dark:bg-stone-700 dark:border-stone-600 dark:text-stone-100"
          >
            <option value="">全部</option>
            <option value="photo">圖片</option>
            <option value="video">影片</option>
            <option value="audio">音檔</option>
          </select>
          <label className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition ${uploading ? "bg-stone-300 text-stone-500" : "bg-amber-700 text-white hover:bg-amber-800"}`}>
            {uploading ? "上傳中..." : "本地上傳"}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Media grid */}
        {loading ? (
          <div className="text-center py-10 text-stone-400">載入中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-stone-400">
            <p className="text-3xl mb-2">🖼️</p>
            <p>沒有找到媒體</p>
            <p className="text-xs mt-1">請上傳新圖片或調整篩選條件</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
            {filtered.map(m => (
              <button
                key={m.id}
                onClick={() => { onSelect(m.url || ""); onClose(); }}
                className="group relative bg-stone-100 dark:bg-stone-700 rounded-lg overflow-hidden border-2 border-transparent hover:border-amber-500 transition aspect-square"
              >
                {m.type === "photo" && m.url ? (
                  <img
                    src={m.url}
                    alt={m.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {m.type === "video" ? "🎬" : m.type === "audio" ? "🎵" : "📷"}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 truncate opacity-0 group-hover:opacity-100 transition">
                  {m.title}
                </div>
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-stone-400 text-center">
          顯示 {filtered.length} / {items.length} 個媒體 · 點選即可插入
        </p>
      </div>
    </Modal>
  );
}
