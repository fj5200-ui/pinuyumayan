"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [dash, setDash] = useState<any>(null);
  const [approval, setApproval] = useState<any>(null);
  const [culturalSites, setCulturalSites] = useState(0);
  const [discussions, setDiscussions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/api/admin/dashboard").catch(() => null),
      api.get<any>("/api/approval/queue").catch(() => null),
      api.get<any>("/api/cultural-sites").catch(() => ({ sites: [] })),
      api.get<any>("/api/discussions").catch(() => ({ discussions: [] })),
    ]).then(([d, a, cs, disc]) => {
      setDash(d);
      setApproval(a);
      setCulturalSites(cs?.sites?.length || 0);
      setDiscussions(disc?.discussions?.length || 0);
      setLoading(false);
    });
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
    { label: "討論數", value: discussions, icon: "💬", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300", link: "/admin/comments" },
    { label: "文化景點", value: culturalSites, icon: "🏺", color: "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300", link: "/cultural-sites" },
  ];

  const pendingApprovals = approval?.stats?.pending || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">📊 管理總覽</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Pinuyumayan v4.4 — 18 API 模組 · 35 路由</p>
        </div>
        <div className="flex gap-2">
          {pendingApprovals > 0 && (
            <Link href="/admin/approval" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
              ⚠️ {pendingApprovals} 筆待審核
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <Link key={s.label} href={s.link} className={`${s.color} rounded-xl p-4 hover:shadow-md transition group`}>
            <div className="flex items-center justify-between">
              <p className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
            <p className="text-sm opacity-80 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* 7-day trends + quick actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "7日新用戶", value: dash.recent.newUsers, icon: "👤", trend: "↑" },
          { label: "7日新文章", value: dash.recent.newArticles, icon: "📄", trend: "→" },
          { label: "7日新留言", value: dash.recent.newComments, icon: "💬", trend: "→" },
        ].map(r => (
          <div key={r.label} className="bg-white dark:bg-stone-800 rounded-xl p-5 border dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-stone-500 dark:text-stone-400">{r.label}</p><p className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-1">{r.value}</p></div>
              <span className="text-3xl opacity-30">{r.icon}</span>
            </div>
          </div>
        ))}
        {/* Quick actions */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-3">⚡ 快速操作</p>
          <div className="space-y-2">
            <Link href="/admin/articles" className="block text-xs bg-white dark:bg-stone-800 px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-stone-700 transition dark:text-stone-300">+ 新增文章</Link>
            <Link href="/admin/events" className="block text-xs bg-white dark:bg-stone-800 px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-stone-700 transition dark:text-stone-300">+ 新增活動</Link>
            <Link href="/admin/exports" className="block text-xs bg-white dark:bg-stone-800 px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-stone-700 transition dark:text-stone-300">📊 匯出資料</Link>
          </div>
        </div>
      </div>

      {/* Approval + Activity bar chart */}
      {approval && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
            <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4">📋 審核狀態</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{approval.stats.pending}</p>
                <p className="text-xs text-yellow-600">待審核</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{approval.stats.approved}</p>
                <p className="text-xs text-green-600">已核准</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{approval.stats.rejected}</p>
                <p className="text-xs text-red-600">已退回</p>
              </div>
            </div>
            {approval.stats.pending > 0 && (
              <Link href="/admin/approval" className="block mt-4 text-center text-sm bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition">前往審核 →</Link>
            )}
          </div>

          {/* Simple activity bar chart */}
          <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
            <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4">📈 平台概覽</h3>
            <div className="space-y-3">
              {[
                { label: "文章", value: dash.stats.articles, max: 50, color: "bg-green-500" },
                { label: "詞彙", value: dash.stats.vocabulary, max: 100, color: "bg-purple-500" },
                { label: "活動", value: dash.stats.events, max: 20, color: "bg-pink-500" },
                { label: "用戶", value: dash.stats.users, max: 50, color: "bg-blue-500" },
                { label: "媒體", value: dash.stats.media, max: 20, color: "bg-teal-500" },
                { label: "景點", value: culturalSites, max: 20, color: "bg-rose-500" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-stone-500 w-10">{item.label}</span>
                  <div className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full h-5 relative overflow-hidden">
                    <div className={`${item.color} h-5 rounded-full transition-all`} style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-stone-700 dark:text-stone-200">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-stone-200 text-stone-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400"}`}>
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </span>
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
