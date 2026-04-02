"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GridSkeleton } from "@/components/ui/Skeleton";

export default function Home() {
  const [data, setData] = useState<any>({ tribes: [], articles: [], events: [], vocab: [] });
  const [daily, setDaily] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/api/tribes").catch(() => ({ tribes: [] })),
      api.get<any>("/api/articles").catch(() => ({ articles: [] })),
      api.get<any>("/api/events").catch(() => ({ events: [] })),
      api.get<any>("/api/language/vocabulary?limit=5").catch(() => ({ vocabulary: [], words: [] })),
      api.get<any>("/api/language/daily").catch(() => null),
      api.get<any>("/api/admin/stats").catch(() => null),
      api.get<any>("/api/cultural-sites").catch(() => ({ sites: [] })),
      api.get<any>("/api/learning/leaderboard").catch(() => ({ leaderboard: [] })),
    ]).then(([t, a, e, v, d, s, cs, lb]) => {
      setData({
        tribes: (t.tribes || []).slice(0, 4),
        articles: (a.articles || []).slice(0, 3),
        events: (e.events || []).slice(0, 3),
        vocab: (v.vocabulary || v.words || []).slice(0, 5),
      });
      setDaily(d);
      setStats(s);
      setSites((cs.sites || []).slice(0, 6));
      setLeaderboard((lb.leaderboard || []).slice(0, 5));
      setLoading(false);
    });
  }, []);

  const { tribes, articles, events, vocab } = data;
  const statItems = stats
    ? [
        { n: stats.tribes, l: "卑南八社", icon: "🏘️" },
        { n: `${stats.vocabulary}+`, l: "族語詞彙", icon: "📖" },
        { n: `${stats.articles}+`, l: "文化文章", icon: "📝" },
        { n: `${stats.events}+`, l: "活動祭典", icon: "🎉" },
      ]
    : [
        { n: "8", l: "卑南八社", icon: "🏘️" },
        { n: "15+", l: "族語詞彙", icon: "📖" },
        { n: "6+", l: "文化文章", icon: "📝" },
        { n: "6+", l: "活動祭典", icon: "🎉" },
      ];

  const siteTypeIcons: Record<string, string> = {
    "集會所": "🏛️", "祭祀場": "🔥", "會所": "🏠", "獵場": "🏹",
    "文化區": "🎭", "遺址": "🏺", "工藝": "🧵", "祭典場": "⛩️",
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-800 via-amber-700 to-orange-600 dark:from-stone-900 dark:via-amber-900 dark:to-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl">
            <p className="text-amber-200 text-lg mb-2 tracking-wider">Puyuma Cultural Portal</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Pinuyumayan<br /><span className="text-amber-200">卑南族入口網</span></h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">探索卑南族豐富的文化遺產 — 從部落歷史、傳統祭儀，到族語學習與文化藝術，一起守護這份珍貴的文化寶藏。</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/tribes" className="bg-white text-amber-800 px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 transition shadow-lg">探索部落</Link>
              <Link href="/language" className="border-2 border-white/50 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition">學習族語</Link>
              <Link href="/tribes/map" className="border-2 border-white/50 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition">🗺️ 部落地圖</Link>
              <Link href="/cultural-sites" className="border-2 border-white/50 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition">🏺 文化景點</Link>
              <Link href="/community" className="border-2 border-white/50 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition">💬 社群</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Word */}
      {daily && (
        <section className="bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-800 dark:to-orange-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📖</span>
              <div>
                <p className="text-amber-100 text-sm">每日一詞</p>
                <p className="text-2xl font-bold">{daily.puyumaWord}</p>
              </div>
              <div className="text-amber-100">
                <p>{daily.chineseMeaning}</p>
                {daily.pronunciation && <p className="text-sm opacity-80">{daily.pronunciation}</p>}
              </div>
            </div>
            <Link href="/language/quiz" className="bg-white/20 px-5 py-2 rounded-xl font-medium hover:bg-white/30 transition text-sm">🎯 測驗</Link>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="bg-white dark:bg-stone-800 border-b dark:border-stone-700">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {statItems.map(s => (
            <div key={s.l} className="group">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{s.n}</p>
              <p className="text-stone-500 dark:text-stone-400 text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {loading ? <div className="max-w-7xl mx-auto px-4 py-16"><GridSkeleton count={4} /></div> : (
        <>
          {/* Tribes */}
          <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <div><h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🏘️ 卑南八社</h2><p className="text-stone-500 dark:text-stone-400 mt-1">認識卑南族各部落的歷史與文化</p></div>
              <Link href="/tribes" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium">查看全部 →</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tribes.map((t: any) => (
                <Link key={t.id} href={`/tribes/${t.id}`} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-stone-100 dark:border-stone-700 hover:-translate-y-1">
                  <div className="text-4xl mb-3">🏔️</div>
                  <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">{t.name}</h3>
                  {t.traditionalName && <p className="text-amber-600 dark:text-amber-400 text-sm mb-2">{t.traditionalName}</p>}
                  <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-2">{t.description}</p>
                  {t.population && <p className="text-xs text-stone-400 mt-3">人口約 {t.population?.toLocaleString()} 人</p>}
                </Link>
              ))}
            </div>
          </section>

          {/* Cultural Sites — NEW */}
          {sites.length > 0 && (
            <section className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-stone-800/50 dark:to-stone-900/50 py-16">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🏺 文化景點</h2>
                    <p className="text-stone-500 dark:text-stone-400 mt-1">探訪卑南族重要的文化遺址與祭典場域</p>
                  </div>
                  <Link href="/cultural-sites" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium">查看全部 →</Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sites.map((s: any) => (
                    <div key={s.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-5 border dark:border-stone-700 hover:shadow-md transition group">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{siteTypeIcons[s.type] || "📍"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-stone-800 dark:text-stone-100 truncate">{s.name}</h3>
                            <span className="text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full shrink-0">{s.type}</span>
                          </div>
                          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 line-clamp-2">{s.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                            {s.tribeName && <span>🏘️ {s.tribeName}</span>}
                            {s.tags?.length > 0 && <span className="truncate">{s.tags.slice(0, 3).map((t: string) => `#${t}`).join(" ")}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Articles */}
          <section className="bg-white dark:bg-stone-800/50 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">📝 文化誌</h2><p className="text-stone-500 dark:text-stone-400 mt-1">深入了解卑南族文化的各個面向</p></div>
                <Link href="/articles" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium">查看全部 →</Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {articles.map((a: any) => (
                  <Link key={a.id} href={`/articles/${a.slug}`} className="bg-stone-50 dark:bg-stone-800 rounded-xl hover:shadow-md transition-all overflow-hidden group border dark:border-stone-700">
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 h-40 flex items-center justify-center text-5xl">📜</div>
                    <div className="p-5">
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full font-medium">{a.category}</span>
                      <h3 className="font-bold text-lg mt-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition line-clamp-2 dark:text-stone-100">{a.title}</h3>
                      <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-2">{a.excerpt}</p>
                      <div className="text-xs text-stone-400 mt-3 flex items-center gap-3"><span>👤 {a.authorName || "佚名"}</span><span>👁️ {a.views}</span></div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Vocab + Leaderboard row */}
          <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Vocab */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div><h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">📖 族語學習</h2><p className="text-stone-500 dark:text-stone-400 mt-1">一起來學卑南語</p></div>
                  <div className="flex gap-3">
                    <Link href="/language/quiz" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium text-sm">🎯 測驗 →</Link>
                    <Link href="/language" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium text-sm">更多詞彙 →</Link>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {vocab.map((v: any) => (
                    <div key={v.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-5 border border-stone-100 dark:border-stone-700 text-center hover:shadow-md transition">
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-1">{v.puyumaWord}</p>
                      <p className="text-stone-800 dark:text-stone-200 font-medium">{v.chineseMeaning}</p>
                      <p className="text-stone-400 text-sm">{v.englishMeaning}</p>
                      <p className="text-xs text-stone-400 mt-2 bg-stone-50 dark:bg-stone-700 rounded-full px-2 py-1">{v.category}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard — NEW */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">🏆 學習排行榜</h2>
                </div>
                <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border dark:border-stone-700 overflow-hidden">
                  {leaderboard.length > 0 ? (
                    <div className="divide-y dark:divide-stone-700">
                      {leaderboard.map((u: any, i: number) => (
                        <div key={u.userId || i} className="flex items-center gap-3 px-5 py-4 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i === 0 ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300" : i === 1 ? "bg-stone-200 dark:bg-stone-600 text-stone-600 dark:text-stone-300" : i === 2 ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" : "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400"}`}>
                            {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm dark:text-stone-200 truncate">{u.userName || `用戶 #${u.userId}`}</p>
                            <p className="text-xs text-stone-400">{u.learnedCount || 0} 詞彙</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{u.learnedCount || 0}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-3xl mb-2">🎯</p>
                      <p className="text-stone-400 text-sm">還沒有人開始學習</p>
                      <Link href="/language/quiz" className="text-amber-700 dark:text-amber-400 text-sm hover:underline mt-1 inline-block">成為第一個 →</Link>
                    </div>
                  )}
                  <div className="p-4 bg-stone-50 dark:bg-stone-700/50 border-t dark:border-stone-700">
                    <Link href="/language" className="text-amber-700 dark:text-amber-400 text-sm hover:underline font-medium block text-center">開始學習族語 →</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Upcoming Events — Enhanced */}
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800/50 dark:to-stone-800/30 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🎉 活動祭典</h2><p className="text-stone-500 dark:text-stone-400 mt-1">即將舉行的文化活動</p></div>
                <Link href="/events" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium">查看全部 →</Link>
              </div>
              {events.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {events.map((e: any) => {
                    const startDate = e.startDate ? new Date(e.startDate) : null;
                    const isUpcoming = startDate && startDate > new Date();
                    return (
                      <div key={e.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm hover:shadow-md transition border dark:border-stone-700 overflow-hidden group">
                        <div className={`h-2 ${isUpcoming ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-amber-400 to-orange-500"}`} />
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-medium">{e.type}</span>
                            {isUpcoming && <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium animate-pulse">即將到來</span>}
                          </div>
                          <h3 className="font-bold text-lg dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">{e.title}</h3>
                          <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-2">{e.description}</p>
                          <div className="flex items-center gap-3 mt-4 text-sm text-stone-400">
                            {startDate && (
                              <span className="flex items-center gap-1">
                                📅 {startDate.toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
                              </span>
                            )}
                            {e.location && <span className="flex items-center gap-1">📍 {e.location}</span>}
                          </div>
                          {e.tribeName && <p className="text-xs text-stone-400 mt-2">🏘️ {e.tribeName}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-stone-400">目前沒有活動</div>
              )}
            </div>
          </section>

          {/* Community CTA */}
          <section className="bg-gradient-to-r from-amber-700 to-orange-600 dark:from-stone-800 dark:to-stone-900 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">加入 Pinuyumayan 社群</h2>
              <p className="text-white/80 text-lg mb-8">一起記錄、分享、傳承卑南族珍貴的文化遺產</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register" className="bg-white text-amber-800 px-8 py-3 rounded-xl font-semibold hover:bg-amber-50 transition">免費註冊</Link>
                <Link href="/community" className="border-2 border-white/50 px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition">瀏覽社群</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
