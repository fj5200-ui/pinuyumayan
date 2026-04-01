import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getMedia() {
  try { const r = await fetch(`${API}/api/media`, { next: { revalidate: 60 } }); return (await r.json()).media || []; } catch { return []; }
}

export const metadata = { title: "媒體庫 — Pinuyumayan", description: "卑南族文化影像與媒體資料" };

const typeIcon: Record<string, string> = { photo: "📷", video: "🎬", audio: "🎵" };

export default async function MediaPage() {
  const media = await getMedia();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-stone-800">🎬 媒體庫</h1>
        <p className="text-stone-500 mt-2 text-lg">珍貴的卑南族文化影像與多媒體資料</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((m: any) => (
          <div key={m.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-stone-100 hover:shadow-md transition">
            <div className="bg-gradient-to-br from-stone-100 to-stone-200 h-48 flex items-center justify-center text-6xl">{typeIcon[m.type] || "📁"}</div>
            <div className="p-5">
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">{m.type === "photo" ? "照片" : m.type === "video" ? "影片" : "音檔"}</span>
              <h2 className="font-bold text-lg mt-2">{m.title}</h2>
              {m.description && <p className="text-stone-500 text-sm mt-2 line-clamp-2">{m.description}</p>}
              <p className="text-xs text-stone-400 mt-3">{new Date(m.createdAt).toLocaleDateString("zh-TW")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
