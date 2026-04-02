"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { GridSkeleton } from "@/components/ui/Skeleton";

const catColors: Record<string, string> = {
  "文化": "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
  "部落": "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
  "歷史": "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
  "音樂": "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300",
  "工藝": "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
  "信仰": "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
  "語言": "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300",
  "教育": "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300",
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const categories = ["全部", ...Object.keys(catColors)];

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (category !== "全部") params.set("category", category);
      if (search) params.set("search", search);
      const d = await api.get<any>(`/api/articles?${params}`);
      setArticles(d.articles || []);
      setPagination(d.pagination || null);
    } catch { setArticles([]); }
    setLoading(false);
  }, [page, category, search]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleSearch = () => { setSearch(searchInput); setPage(1); };
  const handleCategoryChange = (c: string) => { setCategory(c); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">📝 文化誌</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">深入了解卑南族文化的各個面向</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="搜尋文章標題..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 focus:border-amber-500 outline-none transition"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
        </div>
        <button onClick={handleSearch} className="px-5 py-2.5 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition">搜尋</button>
        {search && (
          <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="px-4 py-2.5 border dark:border-stone-600 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition text-sm">清除</button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(c => (
          <button key={c} onClick={() => handleCategoryChange(c)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${category === c ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>{c}</button>
        ))}
      </div>

      {/* Results info */}
      {pagination && (
        <div className="mb-4 text-sm text-stone-500 dark:text-stone-400">
          共 {pagination.total} 篇文章
          {search && <span className="ml-2">（搜尋：「{search}」）</span>}
          {category !== "全部" && <span className="ml-2">（分類：{category}）</span>}
        </div>
      )}

      {loading ? <GridSkeleton count={6} /> : articles.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-4">📭</div>
          <p>沒有找到符合條件的文章</p>
          {(search || category !== "全部") && (
            <button onClick={() => { setSearch(""); setSearchInput(""); setCategory("全部"); setPage(1); }}
              className="mt-4 text-amber-700 dark:text-amber-400 underline">清除所有篩選</button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a: any) => (
            <Link key={a.id} href={`/articles/${a.slug}`} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group hover:-translate-y-1 border dark:border-stone-700">
              {a.coverImage ? (
                <div className="h-44 overflow-hidden"><img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 h-44 flex items-center justify-center text-5xl">📜</div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${catColors[a.category] || "bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300"}`}>{a.category}</span>
                  <span className="text-xs text-stone-400">~{Math.max(1, Math.ceil((a.excerpt || '').length / 100))} 分鐘</span>
                </div>
                <h2 className="font-bold text-lg mt-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition line-clamp-2 dark:text-stone-100">{a.title}</h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-2">{a.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-stone-400 mt-4">
                  <span className="flex items-center gap-1">
                    <span className="w-5 h-5 bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">{(a.authorName || '?')[0]}</span>
                    {a.authorName || "佚名"}
                  </span>
                  <span>👁️ {a.views}</span>
                  <span className="ml-auto">{new Date(a.createdAt).toLocaleDateString("zh-TW")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 上一頁
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | string)[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              typeof p === 'string' ? (
                <span key={`dot-${i}`} className="px-2 text-stone-400">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl font-medium text-sm transition ${p === page ? "bg-amber-700 text-white" : "border dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>{p}</button>
              )
            )}
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="px-4 py-2 rounded-xl border dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            下一頁 →
          </button>
        </div>
      )}
    </div>
  );
}
