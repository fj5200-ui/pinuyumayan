import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getTribes() {
  try { const r = await fetch(`${API}/api/tribes`, { next: { revalidate: 60 } }); return (await r.json()).tribes || []; } catch { return []; }
}

export const metadata = { title: "部落介紹 — Pinuyumayan", description: "認識卑南族八社的歷史與文化" };

export default async function TribesPage() {
  const tribes = await getTribes();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-stone-800">🏘️ 卑南八社</h1>
        <p className="text-stone-500 mt-2 text-lg">卑南族傳統上由八個主要部落組成，各有其獨特的文化與歷史</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {tribes.map((t: any) => (
          <Link key={t.id} href={`/tribes/${t.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-stone-100 flex gap-5 group hover:-translate-y-1">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🏔️</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-stone-800 group-hover:text-amber-700 transition">{t.name}</h2>
              {t.traditionalName && <p className="text-amber-600 text-sm">{t.traditionalName}</p>}
              <p className="text-stone-500 text-sm mt-2 line-clamp-2">{t.description}</p>
              <div className="flex gap-4 mt-3 text-xs text-stone-400">
                {t.region && <span>📍 {t.region}</span>}
                {t.population && <span>👥 約 {t.population?.toLocaleString()} 人</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
