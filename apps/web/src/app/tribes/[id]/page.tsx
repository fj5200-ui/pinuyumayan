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
  const [sites, setSites] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "sites" | "articles" | "events">("overview");

  useEffect(() => {
    if (!params.id) return;
    api.get<any>(`/api/tribes/${params.id}`).then(d => { setTribe(d.tribe || d); setLoading(false); }).catch(() => setLoading(false));
    api.get<any>(`/api/follows/tribe/${params.id}/count`).then(d => setFollowerCount(d.count || 0)).catch(() => {});
    // Load related data
    api.get<any>(`/api/cultural-sites?tribeId=${params.id}`).then(d => setSites(d.sites || [])).catch(() => {});
    api.get<any>(`/api/articles?limit=6`).then(d => setArticles((d.articles || []).slice(0, 4))).catch(() => {});
    api.get<any>(`/api/events`).then(d => setEvents((d.events || []).filter((e: any) => String(e.tribeId) === String(params.id)).slice(0, 4))).catch(() => {});
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

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 border dark:border-stone-700">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-stone-200 dark:bg-stone-700 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-8 w-40 bg-stone-200 dark:bg-stone-700 rounded" />
              <div className="h-5 w-28 bg-stone-200 dark:bg-stone-700 rounded" />
            </div>
          </div>
          {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-stone-200 dark:bg-stone-700 rounded mt-4" style={{ width: `${90 - i * 10}%` }} />)}
        </div>
      </div>
    </div>
  );

  if (!tribe) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🏔️</div>
      <h1 className="text-2xl font-bold dark:text-stone-100 mb-2">找不到此部落</h1>
      <p className="text-stone-400 mb-6">部落資料可能已被移除</p>
      <Link href="/tribes" className="inline-block px-6 py-3 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition">← 返回部落列表</Link>
    </div>
  );

  const siteTypeIcons: Record<string, string> = {
    "集會所": "🏛️", "祭祀場": "🔥", "會所": "🏠", "獵場": "🏹",
    "文化區": "🎭", "遺址": "🏺", "工藝": "🧵", "祭典場": "⛩️",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500 mb-6">
        <Link href="/" className="hover:text-amber-700 dark:hover:text-amber-400 transition">首頁</Link>
        <span>/</span>
        <Link href="/tribes" className="hover:text-amber-700 dark:hover:text-amber-400 transition">部落</Link>
        <span>/</span>
        <span className="text-stone-600 dark:text-stone-300">{tribe.name}</span>
      </nav>

      {/* Hero card */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden mb-6">
        {/* Gradient header */}
        <div className="h-32 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-stone-800" />
        </div>

        <div className="px-8 pb-8 -mt-12 relative">
          <div className="flex items-end gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/80 dark:to-orange-900/80 rounded-2xl flex items-center justify-center text-4xl shadow-lg border-4 border-white dark:border-stone-800">
              🏔️
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">{tribe.name}</h1>
              {tribe.traditionalName && <p className="text-amber-600 dark:text-amber-400 text-lg font-medium">{tribe.traditionalName}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-400">{followerCount} 人追蹤</span>
              <button onClick={toggleFollow} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${following ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700" : "bg-amber-700 text-white hover:bg-amber-800 shadow-sm"}`}>
                {following ? "✓ 已追蹤" : "+ 追蹤"}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {tribe.region && (
              <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3 text-center">
                <span className="text-lg">📍</span>
                <p className="text-xs text-stone-400 mt-1">地區</p>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-200 truncate">{tribe.region}</p>
              </div>
            )}
            {tribe.population && (
              <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3 text-center">
                <span className="text-lg">👥</span>
                <p className="text-xs text-stone-400 mt-1">人口</p>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-200">~{tribe.population?.toLocaleString()}</p>
              </div>
            )}
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3 text-center">
              <span className="text-lg">🏛️</span>
              <p className="text-xs text-stone-400 mt-1">文化景點</p>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{sites.length}</p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3 text-center">
              <span className="text-lg">🎉</span>
              <p className="text-xs text-stone-400 mt-1">相關活動</p>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{events.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b dark:border-stone-700 gap-1 -mx-2">
            {([
              { id: "overview", label: "總覽", icon: "📋" },
              { id: "sites", label: `景點 (${sites.length})`, icon: "🏛️" },
              { id: "articles", label: `文章 (${articles.length})`, icon: "📝" },
              { id: "events", label: `活動 (${events.length})`, icon: "🎉" },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab.id ? "border-amber-700 text-amber-700 dark:text-amber-400 dark:border-amber-400" : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {tribe.description && (
            <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
              <h2 className="text-xl font-bold mb-3 dark:text-stone-100">📋 部落簡介</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">{tribe.description}</p>
            </div>
          )}
          {tribe.history && (
            <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
              <h2 className="text-xl font-bold mb-3 dark:text-stone-100">📜 歷史沿革</h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">{tribe.history}</p>
            </div>
          )}
          {tribe.latitude && tribe.longitude && (
            <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
              <h2 className="text-xl font-bold mb-3 dark:text-stone-100">📍 地理位置</h2>
              <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4">
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">座標：{tribe.latitude.toFixed(4)}, {tribe.longitude.toFixed(4)}</p>
                <div className="flex gap-3">
                  <a href={`https://www.google.com/maps?q=${tribe.latitude},${tribe.longitude}`} target="_blank" rel="noopener"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg text-sm hover:bg-amber-800 transition">
                    🗺️ Google Maps
                  </a>
                  <Link href="/tribes/map" className="flex items-center gap-2 px-4 py-2 border dark:border-stone-600 rounded-lg text-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition dark:text-stone-300">
                    🗺️ 部落地圖
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "sites" && (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-stone-100">🏛️ 文化景點</h2>
          {sites.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <p className="text-4xl mb-3">🏛️</p>
              <p>暫無文化景點資料</p>
              <Link href="/cultural-sites" className="text-amber-700 dark:text-amber-400 text-sm mt-2 inline-block hover:underline">瀏覽所有文化景點 →</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sites.map((s: any) => (
                <div key={s.id} className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4 hover:bg-stone-100 dark:hover:bg-stone-700 transition">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{siteTypeIcons[s.type] || "📌"}</span>
                    <div>
                      <h3 className="font-bold text-stone-800 dark:text-stone-100">{s.name}</h3>
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">{s.type}</span>
                      {s.description && <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 line-clamp-2">{s.description}</p>}
                      {s.latitude && (
                        <a href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`} target="_blank" rel="noopener"
                          className="text-xs text-amber-700 dark:text-amber-400 mt-2 inline-block hover:underline">📍 查看地圖</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "articles" && (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold dark:text-stone-100">📝 相關文章</h2>
            <Link href="/articles" className="text-sm text-amber-700 dark:text-amber-400 hover:underline">查看全部 →</Link>
          </div>
          {articles.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <p className="text-4xl mb-3">📝</p>
              <p>暫無相關文章</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {articles.map((a: any) => (
                <Link key={a.id} href={`/articles/${a.slug}`}
                  className="group bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4 hover:bg-stone-100 dark:hover:bg-stone-700 transition">
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 px-2 py-0.5 rounded-full">{a.category}</span>
                  <h3 className="font-medium mt-2 dark:text-stone-200 line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">{a.title}</h3>
                  {a.excerpt && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{a.excerpt}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
                    <span>👁️ {a.views || 0}</span>
                    <span>{new Date(a.createdAt).toLocaleDateString("zh-TW")}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "events" && (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold dark:text-stone-100">🎉 部落活動</h2>
            <Link href="/events" className="text-sm text-amber-700 dark:text-amber-400 hover:underline">查看全部 →</Link>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <p className="text-4xl mb-3">🎉</p>
              <p>暫無相關活動</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((e: any) => (
                <div key={e.id} className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4 hover:bg-stone-100 dark:hover:bg-stone-700 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{e.type}</span>
                    <span className="text-xs text-stone-400">📅 {e.startDate}</span>
                  </div>
                  <h3 className="font-bold text-stone-800 dark:text-stone-100">{e.title}</h3>
                  {e.description && <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">{e.description}</p>}
                  {e.location && <p className="text-xs text-stone-400 mt-2">📍 {e.location}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
