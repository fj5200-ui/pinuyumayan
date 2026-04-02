"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { GridSkeleton } from "@/components/ui/Skeleton";

/* ---------- Animated counter ---------- */
function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !animated.current) {
        animated.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setValue(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{value}</span>;
}

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
      api.get<any>("/api/language/vocabulary?limit=6").catch(() => ({ vocabulary: [], words: [] })),
      api.get<any>("/api/language/daily").catch(() => null),
      api.get<any>("/api/admin/stats").catch(() => null),
      api.get<any>("/api/cultural-sites").catch(() => ({ sites: [] })),
      api.get<any>("/api/learning/leaderboard").catch(() => ({ leaderboard: [] })),
    ]).then(([t, a, e, v, d, s, cs, lb]) => {
      setData({
        tribes: (t.tribes || []).slice(0, 4),
        articles: (a.articles || []).slice(0, 3),
        events: (e.events || []).slice(0, 3),
        vocab: (v.vocabulary || v.words || []).slice(0, 6),
      });
      setDaily(d);
      setStats(s);
      setSites((cs.sites || []).slice(0, 6));
      setLeaderboard((lb.leaderboard || []).slice(0, 5));
      setLoading(false);
    });
  }, []);

  const { tribes, articles, events, vocab } = data;

  const siteTypeIcons: Record<string, string> = {
    "集會所": "🏛️", "祭祀場": "🔥", "會所": "🏠", "獵場": "🏹",
    "文化區": "🎭", "遺址": "🏺", "工藝": "🧵", "祭典場": "⛩️",
  };

  const typeColors: Record<string, string> = {
    "祭典": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    "文化": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "教育": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "體育": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "社區": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  };

  return (
    <>
      {/* Hero — enhanced parallax-like */}
      <section className="relative bg-gradient-to-br from-amber-800 via-amber-700 to-orange-600 dark:from-stone-900 dark:via-amber-900/80 dark:to-stone-900 text-white overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        {/* Gradient orbs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-56 h-56 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <p className="text-amber-200/90 text-lg mb-3 tracking-wider font-medium animate-fade-in">Puyuma Cultural Portal</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Pinuyumayan
              <br />
              <span className="text-amber-200">卑南族入口網</span>
            </h1>
            <p className="text-xl text-white/85 mb-10 leading-relaxed max-w-2xl">
              探索卑南族豐富的文化遺產 — 從部落歷史、傳統祭儀，到族語學習與文化藝術，一起守護這份珍貴的文化寶藏。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/tribes" className="group bg-white text-amber-800 px-7 py-3.5 rounded-xl font-semibold hover:bg-amber-50 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                探索部落 <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link href="/language" className="border-2 border-white/50 px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition backdrop-blur-sm">📖 學習族語</Link>
              <Link href="/tribes/map" className="border-2 border-white/50 px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition backdrop-blur-sm">🗺️ 部落地圖</Link>
              <Link href="/cultural-sites" className="border-2 border-white/50 px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition backdrop-blur-sm hidden sm:inline-flex">🏺 文化景點</Link>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <svg className="absolute bottom-0 left-0 w-full h-8 text-stone-50 dark:text-stone-900" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0 20c240 20 480-20 720 0s480 20 720 0v20H0z" fill="currentColor" />
        </svg>
      </section>

      {/* Daily Word — compact highlight bar */}
      {daily && (
        <section className="bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-800 dark:to-orange-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">📖</div>
              <div>
                <p className="text-amber-100/80 text-sm font-medium">每日一詞 Daily Word</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-2xl font-bold">{daily.puyumaWord}</span>
                  <span className="text-amber-100">—</span>
                  <span className="text-amber-100">{daily.chineseMeaning}</span>
                  {daily.pronunciation && <span className="text-sm text-amber-200/70 hidden sm:inline">/{daily.pronunciation}/</span>}
                </div>
              </div>
            </div>
            <Link href="/language/quiz" className="bg-white/20 px-5 py-2.5 rounded-xl font-medium hover:bg-white/30 transition text-sm backdrop-blur-sm">🎯 開始測驗</Link>
          </div>
        </section>
      )}

      {/* Animated Stats */}
      <section className="bg-white dark:bg-stone-800 border-b dark:border-stone-700">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: stats?.tribes || 8, l: "卑南八社", icon: "🏘️", suffix: "" },
            { n: stats?.vocabulary || 15, l: "族語詞彙", icon: "📖", suffix: "+" },
            { n: stats?.articles || 6, l: "文化文章", icon: "📝", suffix: "+" },
            { n: stats?.events || 6, l: "活動祭典", icon: "🎉", suffix: "+" },
          ].map(s => (
            <div key={s.l} className="group hover:-translate-y-1 transition-transform duration-300">
              <p className="text-3xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</p>
              <p className="text-4xl font-bold text-amber-700 dark:text-amber-400">
                <AnimatedNumber target={s.n} />{s.suffix}
              </p>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 py-16"><GridSkeleton count={4} /></div>
      ) : (
        <>
          {/* Tribes — enhanced cards */}
          <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🏘️ 卑南八社</h2>
                <p className="text-stone-500 dark:text-stone-400 mt-1">認識卑南族各部落的歷史與文化</p>
              </div>
              <Link href="/tribes" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium group">
                查看全部 <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tribes.map((t: any, i: number) => (
                <Link key={t.id} href={`/tribes/${t.id}`}
                  className="bg-white dark:bg-stone-800 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-stone-100 dark:border-stone-700 hover:-translate-y-1.5 group"
                  style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">🏔️</div>
                  <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">{t.name}</h3>
                  {t.traditionalName && <p className="text-amber-600 dark:text-amber-400 text-sm mt-0.5">{t.traditionalName}</p>}
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-2">{t.description}</p>
                  {t.population && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-stone-400">
                      <span>👥</span> 人口約 {t.population?.toLocaleString()} 人
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>

          {/* Cultural Sites */}
          {sites.length > 0 && (
            <section className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-stone-800/50 dark:to-stone-900/50 py-16">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🏺 文化景點</h2>
                    <p className="text-stone-500 dark:text-stone-400 mt-1">探訪卑南族重要的文化遺址與祭典場域</p>
                  </div>
                  <Link href="/cultural-sites" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium group">
                    查看全部 <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sites.map((s: any) => (
                    <div key={s.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-5 border dark:border-stone-700 hover:shadow-lg hover:-translate-y-1 transition-all group">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                          {siteTypeIcons[s.type] || "📍"}
                        </div>
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

          {/* Articles — enhanced cards with hover */}
          <section className="bg-white dark:bg-stone-800/50 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">📝 文化誌</h2>
                  <p className="text-stone-500 dark:text-stone-400 mt-1">深入了解卑南族文化的各個面向</p>
                </div>
                <Link href="/articles" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium group">
                  查看全部 <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {articles.map((a: any) => (
                  <Link key={a.id} href={`/articles/${a.slug}`} className="bg-stone-50 dark:bg-stone-800 rounded-xl hover:shadow-lg transition-all overflow-hidden group border dark:border-stone-700 hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 h-44 flex items-center justify-center relative overflow-hidden">
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-500">📜</span>
                      <div className="absolute top-3 left-3">
                        <span className="text-xs bg-amber-600 text-white px-2.5 py-1 rounded-full font-medium shadow-sm">{a.category}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg group-hover:text-amber-700 dark:group-hover:text-amber-400 transition line-clamp-2 dark:text-stone-100">{a.title}</h3>
                      <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-2">{a.excerpt}</p>
                      <div className="flex items-center justify-between mt-4 text-xs text-stone-400">
                        <span className="flex items-center gap-1">👤 {a.authorName || "佚名"}</span>
                        <div className="flex items-center gap-3">
                          <span>👁️ {a.views}</span>
                          <span>📅 {a.createdAt ? new Date(a.createdAt).toLocaleDateString("zh-TW", { month: "short", day: "numeric" }) : ""}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Vocab + Leaderboard */}
          <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Vocab */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">📖 族語學習</h2>
                    <p className="text-stone-500 dark:text-stone-400 mt-1">一起來學卑南語</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/language/quiz" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium text-sm">🎯 測驗 →</Link>
                    <Link href="/language" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium text-sm">更多詞彙 →</Link>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {vocab.map((v: any, i: number) => (
                    <div key={v.id}
                      className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-5 border border-stone-100 dark:border-stone-700 text-center hover:shadow-lg hover:-translate-y-1 transition-all group"
                      style={{ animationDelay: `${i * 80}ms` }}>
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform">{v.puyumaWord}</p>
                      <p className="text-stone-800 dark:text-stone-200 font-medium">{v.chineseMeaning}</p>
                      <p className="text-stone-400 text-sm">{v.englishMeaning}</p>
                      <p className="text-xs text-stone-400 mt-2 bg-stone-50 dark:bg-stone-700 rounded-full px-2 py-1 inline-block">{v.category}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">🏆 學習排行榜</h2>
                </div>
                <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border dark:border-stone-700 overflow-hidden">
                  {leaderboard.length > 0 ? (
                    <div className="divide-y dark:divide-stone-700">
                      {leaderboard.map((u: any, i: number) => (
                        <div key={u.userId || i} className="flex items-center gap-3 px-5 py-4 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition group">
                          <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i === 0 ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 ring-2 ring-yellow-300" : i === 1 ? "bg-stone-200 dark:bg-stone-600 text-stone-600 dark:text-stone-300" : i === 2 ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" : "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400"}`}>
                            {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm dark:text-stone-200 truncate">{u.userName || `用戶 #${u.userId}`}</p>
                            <p className="text-xs text-stone-400">{u.learnedCount || 0} 詞彙已學</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">{u.learnedCount || 0}</p>
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

          {/* Events — enhanced */}
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800/50 dark:to-stone-800/30 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🎉 活動祭典</h2>
                  <p className="text-stone-500 dark:text-stone-400 mt-1">即將舉行的文化活動</p>
                </div>
                <Link href="/events" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium group">
                  查看全部 <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              {events.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {events.map((e: any) => {
                    const startDate = e.startDate ? new Date(e.startDate) : null;
                    const isUpcoming = startDate && startDate > new Date();
                    return (
                      <div key={e.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm hover:shadow-lg transition-all border dark:border-stone-700 overflow-hidden group hover:-translate-y-1">
                        <div className={`h-2 ${isUpcoming ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-amber-400 to-orange-500"}`} />
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[e.type] || "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"}`}>{e.type}</span>
                            {isUpcoming && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                即將到來
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-lg dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">{e.title}</h3>
                          <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-2">{e.description}</p>
                          <div className="flex items-center gap-3 mt-4 text-sm text-stone-400 flex-wrap">
                            {startDate && <span className="flex items-center gap-1">📅 {startDate.toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}</span>}
                            {e.location && <span className="flex items-center gap-1">📍 {e.location}</span>}
                          </div>
                          {e.tribeName && <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">🏘️ {e.tribeName}</p>}
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

          {/* Community CTA — enhanced */}
          <section className="relative bg-gradient-to-r from-amber-700 to-orange-600 dark:from-stone-800 dark:to-stone-900 text-white py-20 overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l2 3-2 3zM0 20h2l3-2-3-2H0v4zm40 0h-2l-3-2 3-2h2v4zm-20 0l2-3-2-3v2H0v2h20v2z' fill='%23ffffff' fill-opacity='.3'/%3E%3C/svg%3E\")" }} />
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-4xl font-bold mb-4">加入 Pinuyumayan 社群</h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">一起記錄、分享、傳承卑南族珍貴的文化遺產。每個人的參與都是文化延續的重要力量。</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register" className="bg-white text-amber-800 px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-50 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">免費註冊</Link>
                <Link href="/community" className="border-2 border-white/50 px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition backdrop-blur-sm">💬 瀏覽社群</Link>
                <Link href="/about" className="border-2 border-white/50 px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition backdrop-blur-sm hidden sm:inline-flex">ℹ️ 了解更多</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
