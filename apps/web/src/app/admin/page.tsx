"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [dash, setDash] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/api/admin/dashboard").then(d => { setDash(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto" /></div>;
  if (!dash) return <div className="text-center py-20 text-stone-400">無法載入數據</div>;

  const statCards = [
    { label: "總用戶", value: dash.stats.users, icon: "👥", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300", link: "/admin/users" },
    { label: "文章數", value: dash.stats.articles, icon: "📝", color: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300", link: "/admin/articles" },
    { label: "詞彙數", value: dash.stats.vocabulary, icon: "📖", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300", link: "/admin/vocabulary" },
    { label: "部落數", value: dash.stats.tribes, icon: "🏘️", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300", link: "/admin/tribes" },
    { label: "活動數", value: dash.stats.events, icon: "🎉", color: "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300", link: "/admin/events" },
    { label: "媒體數", value: dash.stats.media, icon: "🎬", color: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300", link: "/admin/media" },
    { label: "留言數", value: dash.stats.comments, icon: "💬", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300", link: "/admin/comments" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">📊 管理總覽</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">Pinuyumayan 管理後台 Dashboard</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {statCards.map(s => (
          <Link key={s.label} href={s.link} className={`${s.color} rounded-xl p-4 hover:shadow-md transition`}>
            <p className="text-2xl">{s.icon}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
            <p className="text-sm opacity-80">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent 7 days */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "7日新用戶", value: dash.recent.newUsers, icon: "👤" },
          { label: "7日新文章", value: dash.recent.newArticles, icon: "📄" },
          { label: "7日新留言", value: dash.recent.newComments, icon: "💬" },
        ].map(r => (
          <div key={r.label} className="bg-white dark:bg-stone-800 rounded-xl p-6 border dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-stone-500 dark:text-stone-400">{r.label}</p><p className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-1">{r.value}</p></div>
              <span className="text-4xl opacity-50">{r.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700">
          <div className="p-4 border-b dark:border-stone-700 flex items-center justify-between">
            <h3 className="font-bold text-stone-800 dark:text-stone-100">📝 最新文章</h3>
            <Link href="/admin/articles" className="text-sm text-amber-700 dark:text-amber-400">查看全部 →</Link>
          </div>
          <div className="divide-y dark:divide-stone-700">
            {dash.recentArticles.map((a: any) => (
              <div key={a.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm dark:text-stone-200">{a.title}</p>
                  <p className="text-xs text-stone-400">{a.authorName} · {a.category} · 👁️{a.views}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${a.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400"}`}>
                  {a.published ? "已發布" : "草稿"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700">
          <div className="p-4 border-b dark:border-stone-700">
            <h3 className="font-bold text-stone-800 dark:text-stone-100">🔥 熱門文章</h3>
          </div>
          <div className="divide-y dark:divide-stone-700">
            {dash.topArticles.map((a: any, i: number) => (
              <div key={a.id} className="p-4 flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" : "bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400"}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate dark:text-stone-200">{a.title}</p>
                  <p className="text-xs text-stone-400">{a.category}</p>
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-300">👁️ {a.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 md:col-span-2">
          <div className="p-4 border-b dark:border-stone-700 flex items-center justify-between">
            <h3 className="font-bold text-stone-800 dark:text-stone-100">💬 最新留言</h3>
            <Link href="/admin/comments" className="text-sm text-amber-700 dark:text-amber-400">管理留言 →</Link>
          </div>
          <div className="divide-y dark:divide-stone-700">
            {dash.recentComments.length === 0 ? (
              <p className="p-4 text-sm text-stone-400">暫無留言</p>
            ) : dash.recentComments.map((c: any) => (
              <div key={c.id} className="p-4">
                <p className="text-sm dark:text-stone-200">{c.content}</p>
                <p className="text-xs text-stone-400 mt-1">{c.authorName} · {c.articleTitle} · {new Date(c.createdAt).toLocaleDateString("zh-TW")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
