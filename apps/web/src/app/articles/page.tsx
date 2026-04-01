"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  const categories = ["全部", ...Object.keys(catColors)];

  useEffect(() => { api.get<any>("/api/articles?limit=50").then(d => { setArticles(d.articles || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const filtered = category === "全部" ? articles : articles.filter(a => a.category === category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">📝 文化誌</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">深入了解卑南族文化的各個面向</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${category === c ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>{c}</button>
        ))}
      </div>
      {loading ? <GridSkeleton count={6} /> : filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">此分類暫無文章</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a: any) => (
            <Link key={a.id} href={`/articles/${a.slug}`} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group hover:-translate-y-1 border dark:border-stone-700">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 h-44 flex items-center justify-center text-5xl">📜</div>
              <div className="p-5">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${catColors[a.category] || "bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300"}`}>{a.category}</span>
                <h2 className="font-bold text-lg mt-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition line-clamp-2 dark:text-stone-100">{a.title}</h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 line-clamp-3">{a.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-stone-400 mt-4">
                  <span>👤 {a.authorName || "佚名"}</span><span>👁️ {a.views} 次瀏覽</span><span>{new Date(a.createdAt).toLocaleDateString("zh-TW")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
