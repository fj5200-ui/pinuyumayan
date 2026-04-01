"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function TribeDetail() {
  const params = useParams();
  const [tribe, setTribe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) api.get<any>(`/api/tribes/${params.id}`).then(d => { setTribe(d.tribe || d); setLoading(false); }).catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center py-20 text-stone-400">載入中...</div>;
  if (!tribe) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold">找不到此部落</h1><Link href="/tribes" className="text-amber-700 mt-4 inline-block">← 返回部落列表</Link></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/tribes" className="text-amber-700 hover:text-amber-800 text-sm mb-6 inline-block">← 返回部落列表</Link>
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-stone-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center text-3xl">🏔️</div>
          <div><h1 className="text-3xl font-bold text-stone-800">{tribe.name}</h1>{tribe.traditionalName && <p className="text-amber-600 text-lg">{tribe.traditionalName}</p>}</div>
        </div>
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          {tribe.region && <span className="bg-stone-100 px-3 py-1 rounded-full">📍 {tribe.region}</span>}
          {tribe.population && <span className="bg-stone-100 px-3 py-1 rounded-full">👥 約 {tribe.population?.toLocaleString()} 人</span>}
        </div>
        {tribe.description && <div className="mb-6"><h2 className="text-xl font-bold mb-2">部落簡介</h2><p className="text-stone-600 leading-relaxed">{tribe.description}</p></div>}
        {tribe.history && <div className="mb-6"><h2 className="text-xl font-bold mb-2">歷史沿革</h2><p className="text-stone-600 leading-relaxed">{tribe.history}</p></div>}
        {tribe.latitude && tribe.longitude && (
          <div className="mt-6 bg-stone-50 rounded-xl p-4">
            <h3 className="font-bold mb-2">📍 地理位置</h3>
            <p className="text-sm text-stone-500">緯度: {tribe.latitude}, 經度: {tribe.longitude}</p>
            <a href={`https://www.google.com/maps?q=${tribe.latitude},${tribe.longitude}`} target="_blank" rel="noopener" className="text-amber-700 text-sm hover:underline mt-1 inline-block">在 Google Maps 中查看 →</a>
          </div>
        )}
      </div>
    </div>
  );
}
