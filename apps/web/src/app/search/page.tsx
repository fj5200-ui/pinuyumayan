"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const TYPE_FILTERS = [
  { key: "all", label: "全部", icon: "🔍" },
  { key: "articles", label: "文章", icon: "📝" },
  { key: "vocabulary", label: "詞彙", icon: "📖" },
  { key: "tribes", label: "部落", icon: "🏘️" },
  { key: "events", label: "活動", icon: "🎉" },
];

function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword || keyword.length < 2 || !text) return <>{text}</>;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return <>{parts.map((part, i) => regex.test(part) ? <mark key={i} className="bg-amber-200 dark:bg-amber-700/50 text-amber-900 dark:text-amber-100 rounded px-0.5">{part}</mark> : part)}</>;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
    try { const r = await api.get<any>(`/api/search?q=${encodeURIComponent(searchQ)}`); setResults(r); } catch { setResults(null); }
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-8">🔍 全站搜尋</h1>

      {/* Search Box with Autocomplete */}
      <div className="relative mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") doSearch(); if (e.key === "Escape") setShowSuggest(false); }}
              onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
              placeholder="搜尋文章、詞彙、部落、活動..."
              className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 outline-none pr-10" />
            {q && <button onClick={() => { setQ(""); setResults(null); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">✕</button>}

            {/* Autocomplete Dropdown */}
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 shadow-lg mt-1 z-20 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 dark:hover:bg-stone-700 transition flex items-center gap-2 border-b dark:border-stone-700 last:border-0">
                    <span className="text-stone-400">🔍</span>
                    <Highlight text={s} keyword={q} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => doSearch()} disabled={loading} className="px-6 py-3 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition disabled:opacity-50 shrink-0">
            {loading ? "搜尋中..." : "搜尋"}
          </button>
        </div>
        {/* Click outside to close */}
        {showSuggest && <div className="fixed inset-0 z-10" onClick={() => setShowSuggest(false)} />}
      </div>

      {/* Type Filters */}
      {results && (
        <div className="flex flex-wrap gap-2 mb-6">
          {TYPE_FILTERS.map(f => {
            const count = f.key === "all" ? totalCount : filterCount(f.key);
            return (
              <button key={f.key} onClick={() => setTypeFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  typeFilter === f.key ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700"
                }`}>
                <span>{f.icon}</span>{f.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeFilter === f.key ? "bg-white/20" : "bg-stone-100 dark:bg-stone-700"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-8">
          {/* Articles */}
          {(typeFilter === "all" || typeFilter === "articles") && results.articles?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 dark:text-stone-100 flex items-center gap-2">📝 文章 <span className="text-sm font-normal text-stone-400">({results.articles.length})</span></h2>
              <div className="space-y-3">{results.articles.map((a: any) => (
                <Link key={a.id} href={`/articles/${a.slug}`} className="block bg-white dark:bg-stone-800 p-4 rounded-xl border dark:border-stone-700 hover:shadow-md transition group">
                  <h3 className="font-bold text-stone-800 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400"><Highlight text={a.title} keyword={q} /></h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 line-clamp-2"><Highlight text={a.excerpt || a.content?.slice(0, 100) || ""} keyword={q} /></p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                    <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">{a.category}</span>
                    <span>👁️ {a.views}</span>
                  </div>
                </Link>
              ))}</div>
            </div>
          )}

          {/* Vocabulary */}
          {(typeFilter === "all" || typeFilter === "vocabulary") && results.vocabulary?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 dark:text-stone-100 flex items-center gap-2">📖 詞彙 <span className="text-sm font-normal text-stone-400">({results.vocabulary.length})</span></h2>
              <div className="grid md:grid-cols-2 gap-3">{results.vocabulary.map((v: any) => (
                <div key={v.id} className="bg-white dark:bg-stone-800 p-4 rounded-xl border dark:border-stone-700 hover:shadow-sm transition">
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400"><Highlight text={v.puyumaWord} keyword={q} /></p>
                  <p className="text-stone-700 dark:text-stone-200"><Highlight text={v.chineseMeaning} keyword={q} /></p>
                  {v.englishMeaning && <p className="text-stone-400 text-sm"><Highlight text={v.englishMeaning} keyword={q} /></p>}
                  {v.pronunciation && <p className="text-xs text-stone-400 mt-1">🔊 {v.pronunciation}</p>}
                </div>
              ))}</div>
            </div>
          )}

          {/* Tribes */}
          {(typeFilter === "all" || typeFilter === "tribes") && results.tribes?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 dark:text-stone-100 flex items-center gap-2">🏘️ 部落 <span className="text-sm font-normal text-stone-400">({results.tribes.length})</span></h2>
              <div className="space-y-3">{results.tribes.map((t: any) => (
                <Link key={t.id} href={`/tribes/${t.id}`} className="block bg-white dark:bg-stone-800 p-4 rounded-xl border dark:border-stone-700 hover:shadow-md transition group">
                  <h3 className="font-bold dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400"><Highlight text={t.name} keyword={q} /></h3>
                  {t.traditionalName && <p className="text-amber-600 dark:text-amber-400 text-sm"><Highlight text={t.traditionalName} keyword={q} /></p>}
                  <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-2 mt-1"><Highlight text={t.description || ""} keyword={q} /></p>
                </Link>
              ))}</div>
            </div>
          )}

          {/* Events */}
          {(typeFilter === "all" || typeFilter === "events") && results.events?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 dark:text-stone-100 flex items-center gap-2">🎉 活動 <span className="text-sm font-normal text-stone-400">({results.events.length})</span></h2>
              <div className="space-y-3">{results.events.map((e: any) => (
                <div key={e.id} className="bg-white dark:bg-stone-800 p-4 rounded-xl border dark:border-stone-700 hover:shadow-sm transition">
                  <h3 className="font-bold dark:text-stone-100"><Highlight text={e.title} keyword={q} /></h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-2"><Highlight text={e.description || ""} keyword={q} /></p>
                  <p className="text-xs text-stone-400 mt-2">📅 {e.startDate} | <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">{e.type}</span></p>
                </div>
              ))}</div>
            </div>
          )}

          {/* No Results */}
          {totalCount === 0 && (
            <div className="text-center py-16 bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-stone-500 text-lg">找不到「{q}」的相關結果</p>
              <p className="text-stone-400 text-sm mt-2">試試其他關鍵字，或使用更簡短的搜尋詞</p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!results && !loading && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg">輸入關鍵字搜尋文章、族語詞彙、部落資訊</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["卑南", "祭典", "uninan", "南王", "工藝"].map(kw => (
              <button key={kw} onClick={() => { setQ(kw); doSearch(kw); }}
                className="px-4 py-2 bg-white dark:bg-stone-800 border dark:border-stone-700 rounded-full text-sm hover:bg-amber-50 dark:hover:bg-stone-700 transition">
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
