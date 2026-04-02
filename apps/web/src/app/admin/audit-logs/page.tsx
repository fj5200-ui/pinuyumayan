"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/api/admin/audit-logs").then(d => { setLogs(d.logs || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const actionColor = (a: string) => {
    if (a.startsWith("DELETE")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (a.startsWith("CREATE")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (a.startsWith("UPDATE")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    return "bg-gray-100 text-[var(--text-soft)] dark:bg-[#222] dark:text-[var(--text-light)]";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">📋 操作日誌</h1>
        <p className="text-sm text-[var(--text-soft)]">管理員操作紀錄 (本次啟動後)</p>
      </div>
      {loading ? <div className="text-center py-10 text-[var(--text-light)]">載入中...</div> : logs.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-[var(--text-soft)] dark:text-[var(--text-light)]">目前沒有操作紀錄</p>
          <p className="text-sm text-[var(--text-light)] mt-1">管理操作（新增/編輯/刪除）將自動記錄在此</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b dark:border-[#333] text-left">
              <th className="p-3 text-[var(--text-soft)]">時間</th><th className="p-3 text-[var(--text-soft)]">操作</th><th className="p-3 text-[var(--text-soft)]">目標</th><th className="p-3 text-[var(--text-soft)]">詳情</th><th className="p-3 text-[var(--text-soft)]">用戶ID</th>
            </tr></thead>
            <tbody className="divide-y dark:divide-[#333]">
              {logs.map((l: any) => (
                <tr key={l.id} className="hover:bg-[var(--cream)] dark:hover:bg-[#333]/50">
                  <td className="p-3 text-[var(--text-light)] text-xs whitespace-nowrap">{new Date(l.timestamp).toLocaleString("zh-TW")}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${actionColor(l.action)}`}>{l.action}</span></td>
                  <td className="p-3 dark:text-[var(--text-light)] text-xs">{l.target}</td>
                  <td className="p-3 text-[var(--text-light)] text-xs">{l.detail || "-"}</td>
                  <td className="p-3 text-[var(--text-light)] text-xs">#{l.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
