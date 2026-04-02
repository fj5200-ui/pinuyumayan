"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

const EXPORT_TYPES = [
  { id: "users", name: "使用者", icon: "👥", description: "匯出所有使用者資料（ID、email、姓名、角色、註冊日期）", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
  { id: "articles", name: "文章", icon: "📝", description: "匯出所有文章資料（標題、分類、觀看數、狀態、日期）", color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
  { id: "vocabulary", name: "詞彙", icon: "📖", description: "匯出卑南語詞彙庫（族語、中文、英文、分類、發音）", color: "bg-white dark:bg-[#222]/20 border-amber-200 dark:border-amber-800" },
  { id: "events", name: "活動", icon: "🎉", description: "匯出活動祭典資料（標題、類型、地點、日期）", color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" },
  { id: "tribes", name: "部落", icon: "🏘️", description: "匯出部落資料（名稱、傳統名、區域、人口、座標）", color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
];

export default function AdminExportsPage() {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<{ type: string; date: string }[]>([]);

  const handleExport = async (type: string) => {
    setDownloading(type);
    try {
      // Direct fetch for CSV (bypasses JSON parsing)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/exports/${type}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`${EXPORT_TYPES.find(t => t.id === type)?.name || type} 匯出成功`, "success");
      setRecentExports(prev => [{ type, date: new Date().toLocaleString("zh-TW") }, ...prev.slice(0, 9)]);
    } catch (e: any) {
      toast(`匯出失敗: ${e.message || "未知錯誤"}`, "error");
    }
    setDownloading(null);
  };

  const handleExportAll = async () => {
    for (const t of EXPORT_TYPES) {
      await handleExport(t.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">📊 資料匯出</h1>
          <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] mt-1">將平台資料匯出為 CSV 格式</p>
        </div>
        <button onClick={handleExportAll} disabled={!!downloading}
          className="px-4 py-2 bg-[var(--red)] text-white rounded-lg text-sm hover:bg-[var(--red)] transition disabled:opacity-50">
          📦 全部匯出
        </button>
      </div>

      {/* Export cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {EXPORT_TYPES.map(t => (
          <div key={t.id} className={`rounded-[var(--radius-md)] p-6 border transition hover:shadow-md ${t.color}`}>
            <div className="text-3xl mb-3">{t.icon}</div>
            <h3 className="font-bold text-lg dark:text-gray-100 mb-1">{t.name}</h3>
            <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-sm mb-4">{t.description}</p>
            <button onClick={() => handleExport(t.id)} disabled={downloading === t.id}
              className="w-full px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border dark:border-[#444] rounded-lg text-sm font-medium hover:bg-[var(--cream)] dark:hover:bg-[#333] transition disabled:opacity-50 dark:text-gray-200">
              {downloading === t.id ? "⏳ 匯出中..." : `⬇️ 下載 ${t.name} CSV`}
            </button>
          </div>
        ))}
      </div>

      {/* Recent exports */}
      {recentExports.length > 0 && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-6">
          <h3 className="font-bold dark:text-gray-100 mb-4">📜 本次匯出紀錄</h3>
          <div className="space-y-2">
            {recentExports.map((exp, i) => {
              const info = EXPORT_TYPES.find(t => t.id === exp.type);
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b dark:border-[#333] last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{info?.icon || "📄"}</span>
                    <span className="text-sm dark:text-gray-200">{info?.name || exp.type}</span>
                  </div>
                  <span className="text-xs text-[var(--text-light)]">{exp.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-[var(--cream)] dark:bg-[#1a1a1a]/50 rounded-[var(--radius-md)] p-6 border dark:border-[#333]">
        <h3 className="font-bold dark:text-gray-100 mb-2">ℹ️ 匯出說明</h3>
        <ul className="text-sm text-[var(--text-soft)] dark:text-[var(--text-light)] space-y-1">
          <li>• 匯出格式為 CSV（逗號分隔值），可用 Excel 或 Google Sheets 開啟</li>
          <li>• 檔案編碼為 UTF-8 (with BOM)，確保中文正確顯示</li>
          <li>• 匯出操作僅限管理員使用</li>
          <li>• 大量資料匯出可能需要等待數秒</li>
        </ul>
      </div>
    </div>
  );
}
