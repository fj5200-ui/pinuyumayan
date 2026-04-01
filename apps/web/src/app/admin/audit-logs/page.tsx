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
    return "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-stone-100">📋 操作日誌</h1>
        <p className="text-sm text-stone-500">管理員操作紀錄 (本次啟動後)</p>
      </div>
      {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : logs.length === 0 ? (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-stone-500 dark:text-stone-400">目前沒有操作紀錄</p>
          <p className="text-sm text-stone-400 mt-1">管理操作（新增/編輯/刪除）將自動記錄在此</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b dark:border-stone-700 text-left">
              <th className="p-3 text-stone-500">時間</th><th className="p-3 text-stone-500">操作</th><th className="p-3 text-stone-500">目標</th><th className="p-3 text-stone-500">詳情</th><th className="p-3 text-stone-500">用戶ID</th>
            </tr></thead>
            <tbody className="divide-y dark:divide-stone-700">
              {logs.map((l: any) => (
                <tr key={l.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <td className="p-3 text-stone-400 text-xs whitespace-nowrap">{new Date(l.timestamp).toLocaleString("zh-TW")}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${actionColor(l.action)}`}>{l.action}</span></td>
                  <td className="p-3 dark:text-stone-300 text-xs">{l.target}</td>
                  <td className="p-3 text-stone-400 text-xs">{l.detail || "-"}</td>
                  <td className="p-3 text-stone-400 text-xs">#{l.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
