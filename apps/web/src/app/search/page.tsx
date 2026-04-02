"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const TYPE_FILTERS = [
  { key: "all", label: "全部", icon: "" },
  { key: "articles", label: "文章", icon: "" },
  { key: "vocabulary", label: "詞彙", icon: "" },
  { key: "tribes", label: "部落", icon: "" },
  { key: "events", label: "活動", icon: "" },
];

const TRENDING_KEYWORDS = ["卑南族", "祭典", "uninan", "南王", "工藝", "會所", "猴祭", "大獵祭", "少年會所"];

function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword || keyword.length < 2 || !text) return <>{text}</>;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return <>{parts.map((part, i) => regex.test(part) ? <mark key={i} className="bg-[rgba(217,119,6,0.1)] dark:bg-[var(--red)]/50 text-[var(--red)] dark:text-white/60 rounded px-0.5">{part}</mark> : part)}</>;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [searchTime, setSearchTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pinuyumayan_search_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveHistory = useCallback((query: string) => {
    setHistory(prev => {
      const next = [query, ...prev.filter(h => h !== query)].slice(0, 10);
      localStorage.setItem("pinuyumayan_search_history", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("pinuyumayan_search_history");
  };

  // Autocomplete suggestions
  useEffect(() => {
    if (q.length < 2) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await api.get<any>(`/api/search?q=${encodeURIComponent(q)}`);
        const s: string[] = [];
        r.articles?.forEach((a: any) => s.push(a.title));
        r.vocabulary?.forEach((v: any) => { s.push(v.puyumaWord); s.push(v.chineseMeaning); });
        r.tribes?.forEach((t: any) => s.push(t.name));
        r.events?.forEach((e: any) => s.push(e.title));
        setSuggestions([...new Set(s)].slice(0, 8));
        setShowSuggest(true);
      } catch { setSuggestions([]); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  const doSearch = async (query?: string) => {
    const searchQ = query || q;
    if (searchQ.length < 2) return;
    setShowSuggest(false);
    setLoading(true);
    const startTime = Date.now();
    try {
      const r = await api.get<any>(`/api/search?q=${encodeURIComponent(searchQ)}`);
      setResults(r);
      setSearchTime(Date.now() - startTime);
      saveHistory(searchQ);
    } catch { setResults(null); }
    setLoading(false);
  };

  const selectSuggestion = (s: string) => {
    setQ(s);
    setShowSuggest(false);
    doSearch(s);
  };

  const totalCount = results ? (results.articles?.length || 0) + (results.vocabulary?.length || 0) + (results.tribes?.length || 0) + (results.events?.length || 0) : 0;
  const filterCount = (key: string) => results ? (results[key]?.length || 0) : 0;

  return (
    <div className="min-h-screen bg-[var(--cream)] dark:bg-[#111]">
      {/* Search Hero */}
      <div className="bg-gradient-to-br from-[#1a1a1a] via-[#111] to-[#111] text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">全站搜尋</h1>
          <p className="text-center text-[var(--text-light)] mb-8">搜尋文章、族語詞彙、部落資訊、活動祭典</p>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") doSearch(); if (e.key === "Escape") setShowSuggest(false); }}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggest(true); }}
                  placeholder="輸入關鍵字搜尋..."
                  className="w-full px-5 py-4 rounded-[var(--radius-md)] bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-stone-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/30 outline-none pr-10 text-lg" />
                {q && <button onClick={() => { setQ(""); setResults(null); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] hover:text-white transition">✕</button>}

                {/* Autocomplete Dropdown */}
                {showSuggest && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] shadow-xl mt-2 z-20 overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-4 py-3 text-sm text-[var(--text-main)] dark:text-gray-200 hover:bg-white dark:hover:bg-[#333] transition flex items-center gap-2 border-b dark:border-[#333] last:border-0">
                        <span className="text-[var(--text-light)]"></span>
                        <Highlight text={s} keyword={q} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => doSearch()} disabled={loading}
                className="px-8 py-4 bg-[var(--yellow)] text-white rounded-[var(--radius-md)] font-bold hover:bg-[var(--red)] transition disabled:opacity-50 shrink-0 text-lg">
                {loading ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "搜尋"}
              </button>
            </div>
            {showSuggest && <div className="fixed inset-0 z-10" onClick={() => setShowSuggest(false)} />}
          </div>

          {/* Trending keywords */}
          {!results && (
            <div className="max-w-2xl mx-auto mt-6 text-center">
              <p className="text-xs text-[var(--text-soft)] mb-2">熱門搜尋</p>
              <div className="flex flex-wrap justify-center gap-2">
                {TRENDING_KEYWORDS.map(kw => (
                  <button key={kw} onClick={() => { setQ(kw); doSearch(kw); }}
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm hover:bg-white/20 transition text-[var(--text-light)] hover:text-white">
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <svg className="block w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,25 C360,0 720,40 1080,15 C1260,5 1380,25 1440,20 L1440,40 L0,40 Z" className="fill-[var(--cream)] dark:fill-[#111]" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search history (when no results) */}
        {!results && !loading && history.length > 0 && (
          <div className="mb-8 bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold dark:text-gray-100 text-sm flex items-center gap-2">搜尋歷史</h3>
              <button onClick={clearHistory} className="text-xs text-[var(--text-light)] hover:text-red-500 transition">清除全部</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <button key={i} onClick={() => { setQ(h); doSearch(h); }}
                  className="px-3 py-1.5 bg-[var(--cream)] dark:bg-[#222] rounded-full text-sm text-[var(--text-soft)] dark:text-[var(--text-light)] hover:bg-white dark:hover:bg-[#444] transition flex items-center gap-1.5">
                  <span className="text-[var(--text-light)] dark:text-[var(--text-soft)]"></span> {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results header */}
        {results && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-light)]">
                找到 <span className="font-bold text-[var(--text-main)] dark:text-gray-200">{totalCount}</span> 個關於
                「<span className="text-[var(--red)] dark:text-[var(--yellow)] font-medium">{q}</span>」的結果
                <span className="text-[var(--text-light)] ml-2">({(searchTime / 1000).toFixed(2)} 秒)</span>
              </p>
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map(f => {
                const count = f.key === "all" ? totalCount : filterCount(f.key);
                return (
                  <button key={f.key} onClick={() => setTypeFilter(f.key)}
                    className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition flex items-center gap-1.5 ${
                      typeFilter === f.key ? "bg-[var(--red)] text-white shadow-sm" : "bg-white dark:bg-[#1a1a1a] border dark:border-[#333] text-[var(--text-soft)] dark:text-[var(--text-light)] hover:bg-[var(--cream)] dark:hover:bg-[#333]"
                    }`}>
                    <span>{f.icon}</span>{f.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeFilter === f.key ? "bg-white/20" : "bg-gray-100 dark:bg-[#222]"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-[var(--radius-md)] border dark:border-[#333] animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-[#222] rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 dark:bg-[#222] rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-[#222] rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="space-y-8">
            {/* Articles */}
            {(typeFilter === "all" || typeFilter === "articles") && results.articles?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 dark:text-gray-100 flex items-center gap-2">
                  文章 <span className="text-sm font-normal text-[var(--text-light)]">({results.articles.length})</span>
                </h2>
                <div className="space-y-3">{results.articles.map((a: any) => (
                  <Link key={a.id} href={`/articles/${a.slug}`}
                    className="block bg-white dark:bg-[#1a1a1a] p-5 rounded-[var(--radius-md)] border dark:border-[#333] hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--text-main)] dark:text-gray-100 group-hover:text-[var(--red)] dark:group-hover:text-[var(--yellow)] transition text-base">
                          <Highlight text={a.title} keyword={q} />
                        </h3>
                        <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-sm mt-1.5 line-clamp-2">
                          <Highlight text={a.excerpt || a.content?.slice(0, 120) || ""} keyword={q} />
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-light)]">
                          <span className="bg-[rgba(153,27,27,0.06)] dark:bg-[#222]/50 text-[var(--red)] dark:text-[var(--yellow)] px-2.5 py-0.5 rounded-full font-medium">{a.category}</span>
                          <span>{a.views}</span>
                          {a.authorName && <span>{a.authorName}</span>}
                        </div>
                      </div>
                      <span className="text-[var(--text-light)] dark:text-[var(--text-soft)] group-hover:text-[var(--yellow)] transition text-xl shrink-0">→</span>
                    </div>
                  </Link>
                ))}</div>
              </div>
            )}

            {/* Vocabulary */}
            {(typeFilter === "all" || typeFilter === "vocabulary") && results.vocabulary?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 dark:text-gray-100 flex items-center gap-2">
                  詞彙 <span className="text-sm font-normal text-[var(--text-light)]">({results.vocabulary.length})</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-3">{results.vocabulary.map((v: any) => (
                  <div key={v.id} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-[var(--radius-md)] border dark:border-[#333] hover:shadow-sm transition group">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xl font-bold text-[var(--red)] dark:text-[var(--yellow)]"><Highlight text={v.puyumaWord} keyword={q} /></p>
                        <p className="text-[var(--text-main)] dark:text-gray-200 mt-1"><Highlight text={v.chineseMeaning} keyword={q} /></p>
                        {v.englishMeaning && <p className="text-[var(--text-light)] text-sm"><Highlight text={v.englishMeaning} keyword={q} /></p>}
                      </div>
                      <Link href="/language" className="text-xs text-[var(--yellow)] dark:text-[var(--yellow)] hover:underline shrink-0">學習 →</Link>
                    </div>
                    {v.pronunciation && <p className="text-xs text-[var(--text-light)] mt-2 italic">/{v.pronunciation}/</p>}
                    {v.category && <span className="inline-block text-xs bg-gray-100 dark:bg-[#222] text-[var(--text-soft)] dark:text-[var(--text-light)] px-2 py-0.5 rounded-full mt-2">{v.category}</span>}
                  </div>
                ))}</div>
              </div>
            )}

            {/* Tribes */}
            {(typeFilter === "all" || typeFilter === "tribes") && results.tribes?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 dark:text-gray-100 flex items-center gap-2">
                  部落 <span className="text-sm font-normal text-[var(--text-light)]">({results.tribes.length})</span>
                </h2>
                <div className="space-y-3">{results.tribes.map((t: any) => (
                  <Link key={t.id} href={`/tribes/${t.id}`}
                    className="block bg-white dark:bg-[#1a1a1a] p-5 rounded-[var(--radius-md)] border dark:border-[#333] hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[rgba(217,119,6,0.1)] to-orange-200 dark:from-[var(--red)] dark:to-orange-800 rounded-[var(--radius-md)] flex items-center justify-center text-xl shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold dark:text-gray-100 group-hover:text-[var(--red)] dark:group-hover:text-[var(--yellow)] transition">
                          <Highlight text={t.name} keyword={q} />
                        </h3>
                        {t.traditionalName && <p className="text-[var(--yellow)] dark:text-[var(--yellow)] text-sm"><Highlight text={t.traditionalName} keyword={q} /></p>}
                        <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-sm line-clamp-1 mt-1"><Highlight text={t.description || ""} keyword={q} /></p>
                      </div>
                      <span className="text-[var(--text-light)] dark:text-[var(--text-soft)] group-hover:text-[var(--yellow)] transition text-xl shrink-0">→</span>
                    </div>
                  </Link>
                ))}</div>
              </div>
            )}

            {/* Events */}
            {(typeFilter === "all" || typeFilter === "events") && results.events?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 dark:text-gray-100 flex items-center gap-2">
                  活動 <span className="text-sm font-normal text-[var(--text-light)]">({results.events.length})</span>
                </h2>
                <div className="space-y-3">{results.events.map((e: any) => (
                  <div key={e.id} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-[var(--radius-md)] border dark:border-[#333] hover:shadow-sm transition group">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 dark:from-[#222]/30 dark:to-red-900/30 rounded-[var(--radius-md)] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-[var(--text-light)] uppercase font-medium">{e.startDate?.slice(5, 7)}月</span>
                        <span className="text-lg font-bold text-[var(--yellow)] dark:text-orange-400">{e.startDate?.slice(8, 10)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold dark:text-gray-100"><Highlight text={e.title} keyword={q} /></h3>
                        <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-light)] mt-1 line-clamp-2"><Highlight text={e.description || ""} keyword={q} /></p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-[rgba(217,119,6,0.1)] dark:bg-orange-900/50 text-[var(--yellow)] dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">{e.type}</span>
                          {e.location && <span className="text-xs text-[var(--text-light)]">{e.location}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}</div>
              </div>
            )}

            {/* No Results */}
            {totalCount === 0 && (
              <div className="text-center py-16 bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333]">
                <p className="text-5xl mb-4"></p>
                <p className="text-[var(--text-main)] dark:text-gray-200 text-xl font-medium">找不到「{q}」的相關結果</p>
                <p className="text-[var(--text-light)] text-sm mt-2 mb-6">試試其他關鍵字，或使用更簡短的搜尋詞</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {TRENDING_KEYWORDS.slice(0, 5).map(kw => (
                    <button key={kw} onClick={() => { setQ(kw); doSearch(kw); }}
                      className="px-4 py-2 bg-[var(--cream)] dark:bg-[#222] border dark:border-[#444] rounded-full text-sm hover:bg-white dark:hover:bg-[#444] transition">
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!results && !loading && (
          <div className="space-y-8">
            {/* Quick explore */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-8">
              <h3 className="font-bold dark:text-gray-100 text-lg mb-6 text-center">快速探索</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "", label: "文化文章", desc: "深度部落報導", href: "/articles" },
                  { icon: "", label: "族語詞彙", desc: "學習卑南語", href: "/language" },
                  { icon: "", label: "部落巡禮", desc: "認識各部落", href: "/tribes" },
                  { icon: "", label: "活動祭典", desc: "傳統祭儀", href: "/events" },
                ].map(link => (
                  <Link key={link.href} href={link.href}
                    className="text-center p-5 rounded-[var(--radius-md)] bg-[var(--cream)] dark:bg-[#222]/50 hover:bg-white dark:hover:bg-[#333] transition group">
                    <p className="text-3xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</p>
                    <p className="font-medium dark:text-gray-200 text-sm">{link.label}</p>
                    <p className="text-xs text-[var(--text-light)] mt-0.5">{link.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
