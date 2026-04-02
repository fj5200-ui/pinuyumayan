"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface SystemMetrics { cpu: number; memory: number; disk: number; uptime: string; requests: number; errors: number; avgResponse: number; }

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({ cpu: 23, memory: 45, disk: 32, uptime: "15d 7h 42m", requests: 12543, errors: 23, avgResponse: 145 });
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "health" | "logs">("overview");

  useEffect(() => {
    api.get<any>("/api/admin/stats").then(setStats).catch(() => {});
    // Simulate system logs
    setLogs([
      { ts: "2026-04-01 23:30:00", level: "INFO", message: "API server started on port 3001", service: "api" },
      { ts: "2026-04-01 23:29:55", level: "INFO", message: "Database connection established", service: "db" },
      { ts: "2026-04-01 23:25:12", level: "WARN", message: "Slow query detected: getArticles (>500ms)", service: "db" },
      { ts: "2026-04-01 23:20:00", level: "INFO", message: "Cache refreshed: vocabulary daily word", service: "cache" },
      { ts: "2026-04-01 23:15:33", level: "ERROR", message: "Failed to send notification email", service: "email" },
      { ts: "2026-04-01 23:10:00", level: "INFO", message: "Scheduled task: cleanup expired tokens", service: "cron" },
      { ts: "2026-04-01 23:05:45", level: "INFO", message: "User login: admin@pinuyumayan.tw", service: "auth" },
      { ts: "2026-04-01 23:00:00", level: "INFO", message: "Health check passed", service: "health" },
    ]);
  }, []);

  // Simulate real-time metrics update
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(80, prev.memory + (Math.random() - 0.5) * 5)),
        requests: prev.requests + Math.floor(Math.random() * 3),
        avgResponse: Math.max(50, Math.min(500, prev.avgResponse + (Math.random() - 0.5) * 30)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const gaugeColor = (v: number) => v > 80 ? "text-red-500" : v > 60 ? "text-yellow-500" : "text-green-500";

  const SERVICES = [
    { name: "Next.js Frontend", url: "http://localhost:3000", status: "healthy", latency: "45ms" },
    { name: "NestJS API", url: "http://localhost:3001", status: "healthy", latency: "12ms" },
    { name: "PostgreSQL (Supabase)", url: "supabase.co", status: "healthy", latency: "89ms" },
    { name: "Render Deploy", url: "render.com", status: "healthy", latency: "210ms" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">📡 系統監控</h1>
        <p className="text-sm text-[var(--text-soft)] mt-1">即時系統狀態與效能監控</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([["overview", "📊 總覽"], ["health", "💚 服務健康"], ["logs", "📋 系統日誌"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? "bg-[var(--red)] text-white" : "bg-white dark:bg-[#1a1a1a] border dark:border-[#333] dark:text-[var(--text-light)]"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* Resource Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "CPU", value: metrics.cpu, unit: "%" },
              { label: "記憶體", value: metrics.memory, unit: "%" },
              { label: "磁碟", value: metrics.disk, unit: "%" },
              { label: "回應時間", value: metrics.avgResponse, unit: "ms", max: 500 },
            ].map(g => (
              <div key={g.label} className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-5 text-center">
                <p className={`text-3xl font-bold ${gaugeColor(g.max ? (g.value / g.max) * 100 : g.value)}`}>
                  {Math.round(g.value)}<span className="text-sm text-[var(--text-light)] ml-1">{g.unit}</span>
                </p>
                <p className="text-sm text-[var(--text-soft)] mt-1">{g.label}</p>
                <div className="w-full bg-gray-200 dark:bg-[#222] rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full transition-all ${g.value > 80 ? "bg-red-500" : g.value > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(100, g.max ? (g.value / g.max) * 100 : g.value)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-5">
              <p className="text-sm text-[var(--text-soft)]">運行時間</p>
              <p className="text-2xl font-bold dark:text-gray-100">{metrics.uptime}</p>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-5">
              <p className="text-sm text-[var(--text-soft)]">總請求數</p>
              <p className="text-2xl font-bold dark:text-gray-100">{metrics.requests.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-5">
              <p className="text-sm text-[var(--text-soft)]">錯誤數</p>
              <p className="text-2xl font-bold text-red-500">{metrics.errors}</p>
              <p className="text-xs text-[var(--text-light)]">錯誤率 {((metrics.errors / metrics.requests) * 100).toFixed(2)}%</p>
            </div>
          </div>

          {/* DB Stats */}
          {stats && (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-5">
              <h3 className="font-bold dark:text-gray-100 mb-4">📦 資料庫統計</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "部落", value: stats.tribes, icon: "🏘️" },
                  { label: "文章", value: stats.articles, icon: "📝" },
                  { label: "詞彙", value: stats.vocabulary, icon: "📖" },
                  { label: "活動", value: stats.events, icon: "🎉" },
                  { label: "媒體", value: stats.media, icon: "🎬" },
                  { label: "用戶", value: stats.users, icon: "👥" },
                  { label: "留言", value: stats.comments, icon: "💬" },
                ].map(s => (
                  <div key={s.label} className="text-center py-2">
                    <span className="text-xl">{s.icon}</span>
                    <p className="text-lg font-bold dark:text-gray-100">{s.value}</p>
                    <p className="text-xs text-[var(--text-soft)]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "health" && (
        <div className="space-y-3">
          {SERVICES.map(s => (
            <div key={s.name} className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${s.status === "healthy" ? "bg-green-500" : s.status === "degraded" ? "bg-yellow-500" : "bg-red-500"} animate-pulse`} />
                <div>
                  <h3 className="font-bold dark:text-gray-100">{s.name}</h3>
                  <p className="text-xs text-[var(--text-light)]">{s.url}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${s.status === "healthy" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700"}`}>
                  {s.status === "healthy" ? "正常" : "異常"}
                </span>
                <p className="text-xs text-[var(--text-light)] mt-1">延遲: {s.latency}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "logs" && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b dark:border-[#333] text-left bg-[var(--cream)] dark:bg-[#222]/50">
                <th className="p-3 text-[var(--text-soft)]">時間</th><th className="p-3 text-[var(--text-soft)]">級別</th><th className="p-3 text-[var(--text-soft)]">服務</th><th className="p-3 text-[var(--text-soft)]">訊息</th>
              </tr></thead>
              <tbody className="divide-y dark:divide-[#333] font-mono text-xs">
                {logs.map((l, i) => (
                  <tr key={i} className="hover:bg-[var(--cream)] dark:hover:bg-[#333]/50">
                    <td className="p-3 text-[var(--text-light)] whitespace-nowrap">{l.ts}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${
                      l.level === "ERROR" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                      l.level === "WARN" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}>{l.level}</span></td>
                    <td className="p-3 text-[var(--text-soft)]">{l.service}</td>
                    <td className="p-3 dark:text-[var(--text-light)]">{l.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
