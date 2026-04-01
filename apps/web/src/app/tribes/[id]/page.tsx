"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function TribeDetail() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tribe, setTribe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!params.id) return;
    api.get<any>(`/api/tribes/${params.id}`).then(d => { setTribe(d.tribe || d); setLoading(false); }).catch(() => setLoading(false));
    api.get<any>(`/api/follows/tribe/${params.id}/count`).then(d => setFollowerCount(d.count || 0)).catch(() => {});
  }, [params.id]);

  useEffect(() => {
    if (!user || !params.id) return;
    api.get<any>(`/api/follows/check/${params.id}`).then(d => setFollowing(d.following)).catch(() => {});
  }, [user, params.id]);

  const toggleFollow = async () => {
    if (!user) { toast("請先登入", "error"); return; }
    try {
      await api.post(`/api/follows/${params.id}`, {});
      setFollowing(!following);
      setFollowerCount(c => following ? c - 1 : c + 1);
      toast(following ? "已取消追蹤" : "已追蹤部落", "success");
    } catch { toast("操作失敗", "error"); }
  };

  if (loading) return <div className="text-center py-20 text-stone-400">載入中...</div>;
  if (!tribe) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold dark:text-stone-100">找不到此部落</h1><Link href="/tribes" className="text-amber-700 dark:text-amber-400 mt-4 inline-block">← 返回部落列表</Link></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/tribes" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 text-sm mb-6 inline-block">← 返回部落列表</Link>
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-8 border border-stone-100 dark:border-stone-700">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-xl flex items-center justify-center text-3xl">🏔️</div>
            <div>
              <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">{tribe.name}</h1>
              {tribe.traditionalName && <p className="text-amber-600 dark:text-amber-400 text-lg">{tribe.traditionalName}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-400">{followerCount} 人追蹤</span>
            <button onClick={toggleFollow} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${following ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700" : "bg-amber-700 text-white hover:bg-amber-800"}`}>
              {following ? "✓ 已追蹤" : "+ 追蹤"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          {tribe.region && <span className="bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-full">📍 {tribe.region}</span>}
          {tribe.population && <span className="bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-full">👥 約 {tribe.population?.toLocaleString()} 人</span>}
        </div>
        {tribe.description && <div className="mb-6"><h2 className="text-xl font-bold mb-2 dark:text-stone-100">部落簡介</h2><p className="text-stone-600 dark:text-stone-300 leading-relaxed">{tribe.description}</p></div>}
        {tribe.history && <div className="mb-6"><h2 className="text-xl font-bold mb-2 dark:text-stone-100">歷史沿革</h2><p className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">{tribe.history}</p></div>}
        {tribe.latitude && tribe.longitude && (
          <div className="mt-6 bg-stone-50 dark:bg-stone-700 rounded-xl p-4">
            <h3 className="font-bold mb-2 dark:text-stone-100">📍 地理位置</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">緯度: {tribe.latitude}, 經度: {tribe.longitude}</p>
            <div className="flex gap-3 mt-2">
              <a href={`https://www.google.com/maps?q=${tribe.latitude},${tribe.longitude}`} target="_blank" rel="noopener" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">在 Google Maps 中查看 →</a>
              <Link href="/tribes/map" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">在部落地圖中查看 →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
