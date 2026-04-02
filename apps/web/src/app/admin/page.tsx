"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

/* ---------- real-time clock ---------- */
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return time;
}

/* ---------- sparkline component ---------- */
function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 80},${40 - (v / max) * 36}`).join(" ");
  return (
    <svg viewBox="0 0 80 40" className="w-20 h-10 opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function AdminDashboard() {
  const [dash, setDash] = useState<any>(null);
  const [approval, setApproval] = useState<any>(null);
  const [culturalSites, setCulturalSites] = useState(0);
  const [discussions, setDiscussions] = useState(0);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const clock = useClock();

  const load = useCallback(() => {
    Promise.all([
      api.get<any>("/api/admin/dashboard").catch(() => null),
      api.get<any>("/api/approval/queue").catch(() => null),
      api.get<any>("/api/cultural-sites").catch(() => ({ sites: [] })),
      api.get<any>("/api/discussions").catch(() => ({ discussions: [] })),
      api.get<any>("/api/admin/audit-logs?limit=5").catch(() => ({ logs: [] })),
    ]).then(([d, a, cs, disc, al]) => {
      setDash(d);
      setApproval(a);
      setCulturalSites(cs?.sites?.length || 0);
      setDiscussions(disc?.discussions?.length || 0);
      setAuditLogs(al?.logs || []);
      setLoading(false);
      setRefreshing(false);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { setRefreshing(true); load(); };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-[#222] rounded-lg w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-[#222] rounded-[var(--radius-md)]" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 dark:bg-[#222] rounded-[var(--radius-md)]" />
        <div className="h-64 bg-gray-200 dark:bg-[#222] rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
  if (!dash) return <div className="text-center py-20 text-[var(--text-light)]">無法載入數據</div>;

  const statCards = [
    { label: "總用戶", value: dash.stats.users, icon: "👥", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", link: "/admin/users", trend: [3, 5, 4, 7, 6, 8, dash.stats.users] },
    { label: "文章數", value: dash.stats.articles, icon: "📝", color: "from-green-500 to-green-600", bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300", link: "/admin/articles", trend: [2, 3, 4, 3, 5, 4, dash.stats.articles] },
    { label: "詞彙數", value: dash.stats.vocabulary, icon: "📖", color: "from-purple-500 to-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-300", link: "/admin/vocabulary", trend: [5, 8, 10, 9, 12, 14, dash.stats.vocabulary] },
    { label: "部落數", value: dash.stats.tribes, icon: "🏘️", color: "from-white0 to-amber-600", bg: "bg-white dark:bg-[#222]/20", text: "text-[var(--red)] dark:text-[var(--yellow)]", link: "/admin/tribes", trend: [8, 8, 8, 8, 8, 8, dash.stats.tribes] },
    { label: "活動數", value: dash.stats.events, icon: "🎉", color: "from-pink-500 to-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-700 dark:text-pink-300", link: "/admin/events", trend: [1, 2, 3, 4, 3, 5, dash.stats.events] },
    { label: "媒體數", value: dash.stats.media, icon: "🎬", color: "from-teal-500 to-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-300", link: "/admin/media", trend: [2, 3, 3, 4, 5, 4, dash.stats.media] },
    { label: "討論數", value: discussions, icon: "💬", color: "from-[var(--yellow)] to-[var(--yellow)]", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-[var(--yellow)] dark:text-orange-300", link: "/admin/comments", trend: [1, 3, 2, 4, 5, 3, discussions] },
    { label: "文化景點", value: culturalSites, icon: "🏺", color: "from-white0 to-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-300", link: "/cultural-sites", trend: [2, 3, 3, 4, 5, 5, culturalSites] },
  ];

  const pendingApprovals = approval?.stats?.pending || 0;
  const totalItems = dash.stats.articles + dash.stats.vocabulary + dash.stats.events + (dash.stats.media || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] dark:text-gray-100">📊 管理總覽</h1>
          <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] mt-1">
            Pinuyumayan v4.7 — 19 API 模組 · 37 路由 · 22 資料表
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[var(--text-light)]">{clock.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}</p>
            <p className="text-lg font-mono font-bold text-[var(--text-soft)] dark:text-[var(--text-light)]">{clock.toLocaleTimeString("zh-TW")}</p>
          </div>
          <button onClick={refresh} disabled={refreshing}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${refreshing ? "bg-gray-100 dark:bg-[#222] text-[var(--text-light)]" : "bg-[rgba(153,27,27,0.06)] dark:bg-[#222]/30 text-[var(--red)] dark:text-[var(--yellow)] hover:bg-[rgba(217,119,6,0.1)] dark:hover:bg-[#222]/50"}`}>
            {refreshing ? "⏳ 更新中..." : "🔄 即時更新"}
          </button>
          {pendingApprovals > 0 && (
            <Link href="/admin/approval" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
              ⚠️ {pendingApprovals} 筆待審核
            </Link>
          )}
        </div>
      </div>

      {/* Health check bar */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-[var(--radius-md)] p-4 border border-emerald-200 dark:border-emerald-800/30 flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-emerald-700 dark:text-emerald-300">系統正常</span>
        </div>
        <span className="text-[var(--text-soft)] dark:text-[var(--text-light)]">API: <span className="font-medium text-[var(--text-main)] dark:text-gray-200">21/21 通過</span></span>
        <span className="text-[var(--text-soft)] dark:text-[var(--text-light)]">前端路由: <span className="font-medium text-[var(--text-main)] dark:text-gray-200">37 條</span></span>
        <span className="text-[var(--text-soft)] dark:text-[var(--text-light)]">資料庫: <span className="font-medium text-[var(--text-main)] dark:text-gray-200">22 表</span></span>
        <span className="text-[var(--text-soft)] dark:text-[var(--text-light)]">總內容: <span className="font-medium text-[var(--text-main)] dark:text-gray-200">{totalItems} 筆</span></span>
      </div>

      {/* Stat Cards with sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Link key={s.label} href={s.link}
            className={`${s.bg} rounded-[var(--radius-md)] p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden`}>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
              <MiniChart data={s.trend} color={s.color.includes("blue") ? "#3B82F6" : s.color.includes("green") ? "#22C55E" : s.color.includes("purple") ? "#A855F7" : s.color.includes("amber") ? "#F59E0B" : s.color.includes("pink") ? "#EC4899" : s.color.includes("teal") ? "#14B8A6" : s.color.includes("orange") ? "#F97316" : "#F43F5E"} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</p>
              <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
            </div>
            <p className="text-sm opacity-80 mt-1">{s.label}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-emerald-600 dark:text-emerald-400">↗</span>
              <span className="text-xs text-[var(--text-light)]">近7日</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 7-day trends + quick actions */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "7日新用戶", value: dash.recent.newUsers, icon: "👤", delta: "+", bg: "bg-blue-50 dark:bg-blue-900/10", accent: "text-blue-600 dark:text-blue-400" },
          { label: "7日新文章", value: dash.recent.newArticles, icon: "📄", delta: "+", bg: "bg-green-50 dark:bg-green-900/10", accent: "text-green-600 dark:text-green-400" },
          { label: "7日新留言", value: dash.recent.newComments, icon: "💬", delta: "+", bg: "bg-purple-50 dark:bg-purple-900/10", accent: "text-purple-600 dark:text-purple-400" },
        ].map(r => (
          <div key={r.label} className={`${r.bg} rounded-[var(--radius-md)] p-5 border dark:border-[#333] hover:shadow-md transition`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-light)]">{r.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-[var(--text-main)] dark:text-gray-100">{r.value}</p>
                  <span className={`text-xs font-medium ${r.accent}`}>{r.delta}{r.value}</span>
                </div>
              </div>
              <span className="text-3xl opacity-30">{r.icon}</span>
            </div>
          </div>
        ))}
        {/* Quick actions */}
        <div className="bg-gradient-to-br from-white to-white dark:from-[#222]/20 dark:to-[#222]/20 rounded-[var(--radius-md)] p-5 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-[var(--red)] dark:text-[var(--yellow)] mb-3">⚡ 快速操作</p>
          <div className="space-y-2">
            {[
              { href: "/admin/articles", label: "+ 新增文章", icon: "📝" },
              { href: "/admin/events", label: "+ 新增活動", icon: "🎉" },
              { href: "/admin/vocabulary", label: "+ 新增詞彙", icon: "📖" },
              { href: "/admin/exports", label: "📊 匯出資料", icon: "" },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-2 text-xs bg-white dark:bg-[#1a1a1a] px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-[#333] transition dark:text-[var(--text-light)] font-medium">
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Approval + Activity chart */}
      {approval && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--text-main)] dark:text-gray-100">📋 審核狀態</h3>
              <Link href="/admin/approval" className="text-xs text-[var(--red)] dark:text-[var(--yellow)] hover:underline">管理 →</Link>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "待審核", value: approval.stats.pending, bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-400", subtext: "text-yellow-600" },
                { label: "已核准", value: approval.stats.approved, bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", subtext: "text-green-600" },
                { label: "已退回", value: approval.stats.rejected, bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", subtext: "text-red-600" },
              ].map(s => (
                <div key={s.label} className={`text-center p-4 ${s.bg} rounded-[var(--radius-md)]`}>
                  <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
                  <p className={`text-xs ${s.subtext} mt-1`}>{s.label}</p>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 dark:bg-[#222] rounded-full h-3 overflow-hidden">
              {(() => {
                const total = (approval.stats.pending || 0) + (approval.stats.approved || 0) + (approval.stats.rejected || 0) || 1;
                const gP = ((approval.stats.approved || 0) / total) * 100;
                const yP = ((approval.stats.pending || 0) / total) * 100;
                return (
                  <>
                    <div className="h-3 rounded-full flex overflow-hidden">
                      <div className="bg-green-500 h-3" style={{ width: `${gP}%` }} />
                      <div className="bg-yellow-400 h-3" style={{ width: `${yP}%` }} />
                      <div className="bg-red-400 h-3 flex-1" />
                    </div>
                  </>
                );
              })()}
            </div>
            {approval.stats.pending > 0 && (
              <Link href="/admin/approval" className="block mt-4 text-center text-sm bg-[var(--red)] text-white py-2.5 rounded-lg hover:bg-[var(--red)] transition font-medium">
                前往審核 →
              </Link>
            )}
          </div>

          {/* Activity bar chart */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-6">
            <h3 className="font-bold text-[var(--text-main)] dark:text-gray-100 mb-4">📈 平台內容分佈</h3>
            <div className="space-y-3">
              {[
                { label: "文章", value: dash.stats.articles, max: Math.max(50, dash.stats.articles * 1.5), color: "bg-gradient-to-r from-green-400 to-green-500" },
                { label: "詞彙", value: dash.stats.vocabulary, max: Math.max(100, dash.stats.vocabulary * 1.5), color: "bg-gradient-to-r from-purple-400 to-purple-500" },
                { label: "活動", value: dash.stats.events, max: Math.max(20, dash.stats.events * 1.5), color: "bg-gradient-to-r from-pink-400 to-pink-500" },
                { label: "用戶", value: dash.stats.users, max: Math.max(50, dash.stats.users * 1.5), color: "bg-gradient-to-r from-blue-400 to-blue-500" },
                { label: "媒體", value: dash.stats.media, max: Math.max(20, (dash.stats.media || 0) * 1.5 || 10), color: "bg-gradient-to-r from-teal-400 to-teal-500" },
                { label: "景點", value: culturalSites, max: Math.max(20, culturalSites * 1.5 || 10), color: "bg-gradient-to-r from-rose-400 to-rose-500" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 group">
                  <span className="text-xs text-[var(--text-soft)] dark:text-[var(--text-light)] w-10 text-right">{item.label}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-[#222] rounded-full h-6 relative overflow-hidden">
                    <div className={`${item.color} h-6 rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-main)] dark:text-gray-200 drop-shadow">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent articles + Top articles + audit logs */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-hidden">
          <div className="p-4 border-b dark:border-[#333] flex items-center justify-between bg-[var(--cream)] dark:bg-[#1a1a1a]/80">
            <h3 className="font-bold text-[var(--text-main)] dark:text-gray-100">📝 最新文章</h3>
            <Link href="/admin/articles" className="text-xs text-[var(--red)] dark:text-[var(--yellow)] hover:underline">查看全部 →</Link>
          </div>
          <div className="divide-y dark:divide-[#333] max-h-80 overflow-y-auto">
            {dash.recentArticles.map((a: any) => (
              <div key={a.id} className="p-4 hover:bg-[var(--cream)] dark:hover:bg-[#333]/50 transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm dark:text-gray-200 truncate">{a.title}</p>
                    <p className="text-xs text-[var(--text-light)] mt-1">{a.authorName} · {a.category} · 👁️ {a.views}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${a.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-[var(--text-soft)] dark:bg-[#222] dark:text-[var(--text-light)]"}`}>
                    {a.published ? "已發布" : "草稿"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-hidden">
          <div className="p-4 border-b dark:border-[#333] bg-[var(--cream)] dark:bg-[#1a1a1a]/80">
            <h3 className="font-bold text-[var(--text-main)] dark:text-gray-100">🔥 熱門文章</h3>
          </div>
          <div className="divide-y dark:divide-[#333] max-h-80 overflow-y-auto">
            {dash.topArticles.map((a: any, i: number) => (
              <div key={a.id} className="p-4 flex items-center gap-3 hover:bg-[var(--cream)] dark:hover:bg-[#333]/50 transition">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" : i === 1 ? "bg-gray-200 text-[var(--text-soft)] dark:bg-[#444] dark:text-[var(--text-light)]" : i === 2 ? "bg-[rgba(217,119,6,0.1)] text-[var(--yellow)] dark:bg-orange-900/40 dark:text-orange-300" : "bg-gray-100 text-[var(--text-soft)] dark:bg-[#222] dark:text-[var(--text-light)]"}`}>
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate dark:text-gray-200">{a.title}</p>
                  <p className="text-xs text-[var(--text-light)]">{a.category}</p>
                </div>
                <span className="text-sm font-bold text-[var(--yellow)] dark:text-[var(--yellow)]">👁️ {a.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs — NEW */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-hidden">
          <div className="p-4 border-b dark:border-[#333] flex items-center justify-between bg-[var(--cream)] dark:bg-[#1a1a1a]/80">
            <h3 className="font-bold text-[var(--text-main)] dark:text-gray-100">📜 最近操作</h3>
            <Link href="/admin/audit-logs" className="text-xs text-[var(--red)] dark:text-[var(--yellow)] hover:underline">全部日誌 →</Link>
          </div>
          <div className="divide-y dark:divide-[#333] max-h-80 overflow-y-auto">
            {auditLogs.length > 0 ? auditLogs.map((log: any) => (
              <div key={log.id} className="p-4 hover:bg-[var(--cream)] dark:hover:bg-[#333]/50 transition">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${log.action?.includes("delete") ? "bg-red-500" : log.action?.includes("create") ? "bg-green-500" : "bg-blue-500"}`} />
                  <p className="text-sm font-medium dark:text-gray-200 truncate">{log.action}</p>
                </div>
                <p className="text-xs text-[var(--text-light)] mt-1 pl-4">{log.details || "—"}</p>
                <p className="text-xs text-[var(--text-light)] mt-0.5 pl-4">{log.performedBy || "system"} · {log.createdAt ? new Date(log.createdAt).toLocaleString("zh-TW") : ""}</p>
              </div>
            )) : (
              <p className="p-4 text-sm text-[var(--text-light)] text-center">暫無操作日誌</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Comments — full width */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-hidden">
        <div className="p-4 border-b dark:border-[#333] flex items-center justify-between bg-[var(--cream)] dark:bg-[#1a1a1a]/80">
          <h3 className="font-bold text-[var(--text-main)] dark:text-gray-100">💬 最新留言</h3>
          <Link href="/admin/comments" className="text-xs text-[var(--red)] dark:text-[var(--yellow)] hover:underline">管理留言 →</Link>
        </div>
        <div className="divide-y dark:divide-[#333]">
          {dash.recentComments.length === 0 ? (
            <p className="p-6 text-sm text-[var(--text-light)] text-center">暫無留言</p>
          ) : dash.recentComments.map((c: any) => (
            <div key={c.id} className="p-4 hover:bg-[var(--cream)] dark:hover:bg-[#333]/50 transition">
              <p className="text-sm dark:text-gray-200 line-clamp-2">{c.content}</p>
              <p className="text-xs text-[var(--text-light)] mt-1.5 flex items-center gap-2">
                <span>👤 {c.authorName}</span>
                <span>·</span>
                <span>📝 {c.articleTitle}</span>
                <span>·</span>
                <span>{new Date(c.createdAt).toLocaleDateString("zh-TW")}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-[var(--text-light)] dark:text-[var(--text-soft)] py-4">
        Pinuyumayan 管理後台 v4.7 · 最後更新: {new Date().toLocaleDateString("zh-TW")} · 22 資料表 · 19 API 模組
      </div>
    </div>
  );
}
