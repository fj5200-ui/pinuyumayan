import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getEvents() {
  try { const r = await fetch(`${API}/api/events`, { next: { revalidate: 60 } }); return (await r.json()).events || []; } catch { return []; }
}

export const metadata = { title: "活動祭典 — Pinuyumayan", description: "卑南族文化活動與祭典" };

const typeColors: Record<string, string> = { "祭典": "bg-red-100 text-red-700", "活動": "bg-blue-100 text-blue-700", "工作坊": "bg-green-100 text-green-700", "展覽": "bg-purple-100 text-purple-700", "其他": "bg-stone-100 text-stone-700" };

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-stone-800">🎉 活動祭典</h1>
        <p className="text-stone-500 mt-2 text-lg">卑南族的文化活動、祭典與工作坊</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((e: any) => (
          <div key={e.id} className="bg-white rounded-xl shadow-sm p-6 border border-stone-100 hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[e.type] || typeColors["其他"]}`}>{e.type}</span>
              {e.tribeName && <span className="text-xs text-stone-400">🏘️ {e.tribeName}</span>}
            </div>
            <h2 className="text-lg font-bold text-stone-800 mb-2">{e.title}</h2>
            <p className="text-stone-500 text-sm line-clamp-3 mb-4">{e.description}</p>
            <div className="border-t pt-3 space-y-1 text-sm text-stone-500">
              <p>📅 {e.startDate}{e.endDate && e.endDate !== e.startDate ? ` ~ ${e.endDate}` : ""}</p>
              {e.location && <p>📍 {e.location}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
