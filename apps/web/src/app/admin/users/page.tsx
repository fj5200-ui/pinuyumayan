"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

const ROLES = ["admin", "editor", "user"];

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api.get<any>("/api/admin/users").then(d => { setUsers(d.users || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const updateRole = async (id: number, role: string) => {
    try { await api.put(`/api/admin/users/${id}/role`, { role }); toast(`角色已更新為 ${role}`, "success"); load(); }
    catch { toast("更新失敗", "error"); }
  };

  const roleColor = (r: string) => r === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : r === "editor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-gray-100 text-[var(--text-soft)] dark:bg-[#222] dark:text-[var(--text-light)]";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">會員管理</h1>
        <p className="text-sm text-[var(--text-soft)]">{users.length} 位會員</p>
      </div>
      {loading ? <div className="text-center py-10 text-[var(--text-light)]">載入中...</div> : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b dark:border-[#333] text-left">
              <th className="p-3 text-[var(--text-soft)]">ID</th><th className="p-3 text-[var(--text-soft)]">名稱</th><th className="p-3 text-[var(--text-soft)]">Email</th><th className="p-3 text-[var(--text-soft)]">角色</th><th className="p-3 text-[var(--text-soft)]">註冊日期</th><th className="p-3 text-[var(--text-soft)]">操作</th>
            </tr></thead>
            <tbody className="divide-y dark:divide-[#333]">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[var(--cream)] dark:hover:bg-[#333]/50">
                  <td className="p-3 text-[var(--text-light)]">#{u.id}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-[rgba(217,119,6,0.1)] to-orange-200 rounded-full flex items-center justify-center text-sm">{u.name?.[0]}</div>
                      <span className="font-medium dark:text-gray-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-[var(--text-soft)] text-xs">{u.email}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColor(u.role)}`}>{u.role}</span></td>
                  <td className="p-3 text-[var(--text-light)] text-xs">{new Date(u.createdAt).toLocaleDateString("zh-TW")}</td>
                  <td className="p-3">
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="text-xs border rounded px-2 py-1 dark:border-[#444] dark:bg-[#222] dark:text-gray-200">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
