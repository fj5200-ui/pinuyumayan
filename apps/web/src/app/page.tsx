"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";

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
          const eased = 1 - Math.pow(1 - progress, 3);
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
  const [tribes, setTribes] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [vocab, setVocab] = useState<any[]>([]);
  const [daily, setDaily] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tribes: 8, vocab: 15, articles: 6, events: 6 });

  useEffect(() => {
    Promise.all([
      api.get<any>("/api/tribes").catch(() => ({ tribes: [] })),
      api.get<any>("/api/articles").catch(() => ({ articles: [] })),
      api.get<any>("/api/events").catch(() => ({ events: [] })),
      api.get<any>("/api/language/vocabulary?limit=6").catch(() => ({ vocabulary: [], words: [] })),
      api.get<any>("/api/language/daily").catch(() => null),
      api.get<any>("/api/cultural-sites").catch(() => ({ sites: [] })),
      api.get<any>("/api/learning/leaderboard").catch(() => ({ leaderboard: [] })),
    ]).then(([t, a, e, v, d, cs, lb]) => {
      const tList = t.tribes || [];
      const aList = a.articles || [];
      const eList = e.events || [];
      const vList = v.vocabulary || v.words || [];
      setTribes(tList.slice(0, 4));
      setArticles(aList.slice(0, 3));
      setEvents(eList.slice(0, 3));
      setVocab(vList.slice(0, 6));
      setDaily(d);
      setSites((cs.sites || []).slice(0, 6));
      setLeaderboard((lb.leaderboard || []).slice(0, 5));
      setStats({
        tribes: tList.length || 8,
        vocab: vList.length || 15,
        articles: aList.length || 6,
        events: eList.length || 6,
      });
      setLoading(false);
    });
  }, []);

  const typeColors: Record<string, string> = {
    "祭典": "tag-red", "文化": "tag-yellow", "教育": "tag-green",
    "體育": "tag-green", "社區": "tag-yellow",
  };

  return (
    <>
      {/* ===== Hero — 穩重文化主視覺 ===== */}
      <section className="hero-section" style={{ background: "var(--cream)" }}>
        <div className="w-[min(1180px,92%)] mx-auto">
          <div className="py-16 md:py-24">
            <p className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: "var(--red)" }}>
              Puyuma Cultural Portal
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Pinuyumayan<br />
              <span style={{ color: "var(--red)" }}>卑南族</span>入口網
            </h1>
            <p className="text-lg max-w-2xl mb-8" style={{ color: "var(--text-soft)" }}>
              探索卑南族豐富的文化遺產 — 從部落歷史、傳統祭儀，到族語學習與文化藝術，一起守護這份珍貴的文化寶藏。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/tribes" className="btn-brand">
                探索部落 →
              </Link>
              <Link href="/language" className="btn-glass">
                📖 學習族語
              </Link>
              <Link href="/tribes/map" className="btn-glass">
                🗺️ 部落地圖
              </Link>
              <Link href="/cultural-sites" className="btn-glass hidden sm:inline-flex">
                🏺 文化景點
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Color bar */}
      <div className="color-bar-6" />

      {/* ===== Daily Word ===== */}
      {daily && (
        <section style={{ background: "var(--black)", color: "white" }}>
          <div className="w-[min(1180px,92%)] mx-auto py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="icon-brand">📖</div>
              <div>
                <p className="text-sm text-white/60 font-bold">每日一詞</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-2xl font-black">{daily.puyumaWord}</span>
                  <span className="text-white/50">—</span>
                  <span className="text-white/80">{daily.chineseMeaning}</span>
                  {daily.pronunciation && <span className="text-sm text-white/40 hidden sm:inline">/{daily.pronunciation}/</span>}
                </div>
              </div>
            </div>
            <Link href="/language/quiz" className="btn-brand text-sm">🎯 開始測驗</Link>
          </div>
        </section>
      )}

      {/* ===== Stats ===== */}
      <section className="bg-white dark:bg-[#1a1a1a] border-b border-[var(--border)] dark:border-[#333]">
        <div className="w-[min(1180px,92%)] mx-auto py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: stats.tribes, l: "卑南八社", icon: "🏘️", suffix: "" },
            { n: stats.vocab, l: "族語詞彙", icon: "📖", suffix: "+" },
            { n: stats.articles, l: "文化文章", icon: "📝", suffix: "+" },
            { n: stats.events, l: "活動祭典", icon: "🎉", suffix: "+" },
          ].map(s => (
            <div key={s.l} className="group hover:-translate-y-1 transition-transform duration-300">
              <p className="text-3xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</p>
              <p className="text-4xl font-black" style={{ color: "var(--red)" }}>
                <AnimatedNumber target={s.n} />{s.suffix}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-soft)" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="w-[min(1180px,92%)] mx-auto py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="card-solid">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-2/3 mb-3" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-3 w-full mb-2" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ===== Tribes ===== */}
          <section className="section" style={{ background: "var(--cream)" }}>
            <div className="w-[min(1180px,92%)] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="section-heading" style={{ marginBottom: 0 }}>
                  <h2>🏘️ 卑南八社</h2>
                  <p>認識卑南族各部落的歷史與文化</p>
                </div>
                <Link href="/tribes" className="text-sm font-bold hover:text-[var(--red)] transition" style={{ color: "var(--text-soft)" }}>
                  查看全部 →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {tribes.map((t: any) => (
                  <Link key={t.id} href={`/tribes/${t.id}`} className="card-solid group">
                    <div className="icon-brand mb-4 group-hover:scale-110 transition-transform">🏔️</div>
                    <h3 className="font-bold text-lg group-hover:text-[var(--red)] transition">{t.name}</h3>
                    {t.traditionalName && <p className="text-sm mt-0.5" style={{ color: "var(--yellow)" }}>{t.traditionalName}</p>}
                    <p className="text-sm mt-2 line-clamp-2" style={{ color: "var(--text-soft)" }}>{t.description}</p>
                    {t.population && (
                      <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: "var(--text-light)" }}>
                        👥 人口約 {t.population?.toLocaleString()} 人
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ===== Cultural Sites ===== */}
          {sites.length > 0 && (
            <section className="section bg-white dark:bg-[#1a1a1a]">
              <div className="w-[min(1180px,92%)] mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="section-heading" style={{ marginBottom: 0 }}>
                    <h2>🏺 文化景點</h2>
                    <p>探訪卑南族重要的文化遺址與祭典場域</p>
                  </div>
                  <Link href="/cultural-sites" className="text-sm font-bold hover:text-[var(--red)] transition" style={{ color: "var(--text-soft)" }}>
                    查看全部 →
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sites.map((s: any) => (
                    <div key={s.id} className="card-solid group">
                      <div className="flex items-start gap-3">
                        <div className="icon-brand shrink-0 group-hover:scale-110 transition-transform">📍</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold truncate">{s.name}</h3>
                            <span className="tag-red shrink-0">{s.type}</span>
                          </div>
                          <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--text-soft)" }}>{s.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ===== Articles ===== */}
          <section className="section bg-white dark:bg-[#1a1a1a]">
            <div className="w-[min(1180px,92%)] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="section-heading" style={{ marginBottom: 0 }}>
                  <h2>📝 文化誌</h2>
                  <p>深入了解卑南族文化的各個面向</p>
                </div>
                <Link href="/articles" className="text-sm font-bold hover:text-[var(--red)] transition" style={{ color: "var(--text-soft)" }}>
                  查看全部 →
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {articles.map((a: any) => (
                  <Link key={a.id} href={`/articles/${a.slug}`} className="card-solid group overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="tag-yellow">{a.category}</span>
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-[var(--red)] transition line-clamp-2">{a.title}</h3>
                    <p className="text-sm mt-2 line-clamp-2" style={{ color: "var(--text-soft)" }}>{a.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 text-xs" style={{ color: "var(--text-light)" }}>
                      <span>👤 {a.authorName || "佚名"}</span>
                      <div className="flex items-center gap-3">
                        <span>👁️ {a.views}</span>
                        <span>📅 {a.createdAt ? new Date(a.createdAt).toLocaleDateString("zh-TW", { month: "short", day: "numeric" }) : ""}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ===== Vocab + Leaderboard ===== */}
          <section className="section" style={{ background: "var(--cream)" }}>
            <div className="w-[min(1180px,92%)] mx-auto">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Vocab */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="section-heading" style={{ marginBottom: 0 }}>
                      <h2>📖 族語學習</h2>
                      <p>一起來學卑南語</p>
                    </div>
                    <div className="flex gap-3">
                      <Link href="/language/quiz" className="text-sm font-bold hover:text-[var(--red)] transition" style={{ color: "var(--text-soft)" }}>🎯 測驗 →</Link>
                      <Link href="/language" className="text-sm font-bold hover:text-[var(--red)] transition" style={{ color: "var(--text-soft)" }}>更多詞彙 →</Link>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {vocab.map((v: any) => (
                      <div key={v.id} className="card-solid text-center group">
                        <p className="text-2xl font-black mb-1 group-hover:scale-110 transition-transform" style={{ color: "var(--red)" }}>{v.puyumaWord}</p>
                        <p className="font-bold">{v.chineseMeaning}</p>
                        <p className="text-sm" style={{ color: "var(--text-soft)" }}>{v.englishMeaning}</p>
                        <p className="text-xs mt-2 tag-yellow inline-block">{v.category}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard */}
                <div>
                  <div className="section-heading mb-6">
                    <h2 className="!text-xl">🏆 學習排行榜</h2>
                  </div>
                  <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-sm)]">
                    {leaderboard.length > 0 ? (
                      <div className="divide-y divide-[var(--border)] dark:divide-[#333]">
                        {leaderboard.map((u: any, i: number) => (
                          <div key={u.userId || i} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#222] transition group">
                            <span className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center text-sm font-black shrink-0 ${
                              i === 0 ? "text-white" : i === 1 ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300" : i === 2 ? "bg-[rgba(217,119,6,0.1)] dark:bg-orange-900/40 text-[var(--yellow)]" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                            }`} style={i === 0 ? { background: "var(--red)" } : undefined}>
                              {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{u.userName || `用戶 #${u.userId}`}</p>
                              <p className="text-xs" style={{ color: "var(--text-light)" }}>{u.learnedCount || 0} 詞彙已學</p>
                            </div>
                            <p className="text-lg font-black" style={{ color: "var(--red)" }}>{u.learnedCount || 0}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-3xl mb-2">🎯</p>
                        <p className="text-sm" style={{ color: "var(--text-soft)" }}>還沒有人開始學習</p>
                        <Link href="/language/quiz" className="text-sm font-bold hover:underline mt-1 inline-block" style={{ color: "var(--red)" }}>成為第一個 →</Link>
                      </div>
                    )}
                    <div className="p-4 border-t border-[var(--border)] dark:border-[#333] bg-gray-50 dark:bg-[#222]">
                      <Link href="/language" className="text-sm font-bold block text-center hover:underline" style={{ color: "var(--red)" }}>開始學習族語 →</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== Events ===== */}
          <section className="section bg-white dark:bg-[#1a1a1a]">
            <div className="w-[min(1180px,92%)] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="section-heading" style={{ marginBottom: 0 }}>
                  <h2>🎉 活動祭典</h2>
                  <p>即將舉行的文化活動</p>
                </div>
                <Link href="/events" className="text-sm font-bold hover:text-[var(--red)] transition" style={{ color: "var(--text-soft)" }}>
                  查看全部 →
                </Link>
              </div>
              {events.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-5">
                  {events.map((e: any) => {
                    const startDate = e.startDate ? new Date(e.startDate) : null;
                    const isUpcoming = startDate && startDate > new Date();
                    return (
                      <div key={e.id} className="card-solid group">
                        <div className="flex items-start justify-between mb-3">
                          <span className={typeColors[e.type] || "tag-yellow"}>{e.type}</span>
                          {isUpcoming && (
                            <span className="tag-green flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: "var(--green)" }} />
                              即將到來
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg group-hover:text-[var(--red)] transition">{e.title}</h3>
                        <p className="text-sm mt-2 line-clamp-2" style={{ color: "var(--text-soft)" }}>{e.description}</p>
                        <div className="flex items-center gap-3 mt-4 text-sm flex-wrap" style={{ color: "var(--text-light)" }}>
                          {startDate && <span>📅 {startDate.toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}</span>}
                          {e.location && <span>📍 {e.location}</span>}
                        </div>
                        {e.tribeName && <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "var(--text-light)" }}>🏘️ {e.tribeName}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10" style={{ color: "var(--text-soft)" }}>目前沒有活動</div>
              )}
            </div>
          </section>

          {/* ===== CTA Banner ===== */}
          <section className="py-16" style={{ background: "var(--cream)" }}>
            <div className="banner-dark w-[min(1180px,92%)] mx-auto">
              <h2 className="text-3xl md:text-4xl font-black mb-4">加入 Pinuyumayan 社群</h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                一起記錄、分享、傳承卑南族珍貴的文化遺產。每個人的參與都是文化延續的重要力量。
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/register" className="btn-brand">免費註冊</Link>
                <Link href="/community" className="btn-glass !border-white/50 !text-white hover:!bg-white/10">💬 瀏覽社群</Link>
                <Link href="/about" className="btn-glass !border-white/50 !text-white hover:!bg-white/10 hidden sm:inline-flex">ℹ️ 了解更多</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
