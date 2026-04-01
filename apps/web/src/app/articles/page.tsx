"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const catColors: Record<string, string> = { "文化": "bg-blue-100 text-blue-700", "部落": "bg-green-100 text-green-700", "歷史": "bg-purple-100 text-purple-700", "音樂": "bg-pink-100 text-pink-700", "工藝": "bg-yellow-100 text-yellow-700", "信仰": "bg-red-100 text-red-700", "語言": "bg-teal-100 text-teal-700", "教育": "bg-indigo-100 text-indigo-700" };

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get<any>("/api/articles").then(d => { setArticles(d.articles || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10"><h1 className="text-4xl font-bold text-stone-800">📝 文化誌</h1><p className="text-stone-500 mt-2 text-lg">深入了解卑南族文化的各個面向</p></div>
      {loading ? <div className="text-center py-20 text-stone-400">載入中...</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a: any) => (
            <Link key={a.id} href={`/articles/${a.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group hover:-translate-y-1">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 h-44 flex items-center justify-center text-5xl">📜</div>
              <div className="p-5">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${catColors[a.category] || "bg-stone-100 text-stone-700"}`}>{a.category}</span>
                <h2 className="font-bold text-lg mt-2 group-hover:text-amber-700 transition line-clamp-2">{a.title}</h2>
                <p className="text-stone-500 text-sm mt-2 line-clamp-3">{a.excerpt}</p>
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
