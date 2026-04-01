"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const doSearch = async () => {
    if (q.length < 2) return;
    setLoading(true);
    try { const r = await api.get<any>(`/api/search?q=${encodeURIComponent(q)}`); setResults(r); } catch { setResults(null); }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-8">🔍 全站搜尋</h1>
      <div className="flex gap-2 mb-8">
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="搜尋文章、詞彙、部落、活動..."
          className="flex-1 px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" />
        <button onClick={doSearch} disabled={loading} className="px-6 py-3 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition disabled:opacity-50">{loading ? "搜尋中..." : "搜尋"}</button>
      </div>
      {results && (
        <div className="space-y-8">
          {results.articles?.length > 0 && (
            <div><h2 className="text-xl font-bold mb-4 dark:text-stone-100">📝 文章 ({results.articles.length})</h2>
              <div className="space-y-3">{results.articles.map((a: any) => (
                <Link key={a.id} href={`/articles/${a.slug}`} className="block bg-white dark:bg-stone-800 p-4 rounded-xl border dark:border-stone-700 hover:shadow-md transition">
                  <h3 className="font-bold text-stone-800 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-400">{a.title}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 line-clamp-2">{a.excerpt}</p>
                  <span className="text-xs text-amber-600 dark:text-amber-400">{a.category}</span>
                </Link>
              ))}</div>
            </div>
          )}
          {results.vocabulary?.length > 0 && (
            <div><h2 className="text-xl font-bold mb-4 dark:text-stone-100">📖 詞彙 ({results.vocabulary.length})</h2>
              <div className="grid md:grid-cols-2 gap-3">{results.vocabulary.map((v: any) => (
                <div key={v.id} className="bg-white dark:bg-stone-800 p-4 rounded-xl border dark:border-stone-700">
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{v.puyumaWord}</p>
                  <p className="text-stone-700 dark:text-stone-200">{v.chineseMeaning}</p>
                  {v.englishMeaning && <p className="text-stone-400 text-sm">{v.englishMeaning}</p>}
                </div>
              ))}</div>
            </div>
          )}
          {results.tribes?.length > 0 && (
            <div><h2 className="text-xl font-bold mb-4 dark:text-stone-100">🏘️ 部落 ({results.tribes.length})</h2>
              <div className="space-y-3">{results.tribes.map((t: any) => (
                <Link key={t.id} href={`/tribes/${t.id}`} className="block bg-white dark:bg-stone-800 p-4 rounded-xl border dark:border-stone-700 hover:shadow-md transition">
                  <h3 className="font-bold dark:text-stone-100">{t.name}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-2 mt-1">{t.description}</p>
                </Link>
              ))}</div>
            </div>
          )}
          {results.events?.length > 0 && (
            <div><h2 className="text-xl font-bold mb-4 dark:text-stone-100">🎉 活動 ({results.events.length})</h2>
              <div className="space-y-3">{results.events.map((e: any) => (
                <div key={e.id} className="bg-white dark:bg-stone-800 p-4 rounded-xl border dark:border-stone-700">
                  <h3 className="font-bold dark:text-stone-100">{e.title}</h3>
                  <p className="text-sm text-stone-400">📅 {e.startDate} | {e.type}</p>
                </div>
              ))}</div>
            </div>
          )}
          {!results.articles?.length && !results.vocabulary?.length && !results.tribes?.length && !results.events?.length && (
            <p className="text-center text-stone-400 py-10">找不到相關結果，請嘗試其他關鍵字</p>
          )}
        </div>
      )}
    </div>
  );
}
