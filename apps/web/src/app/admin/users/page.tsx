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

  const roleColor = (r: string) => r === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : r === "editor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-stone-100">👥 會員管理</h1>
        <p className="text-sm text-stone-500">{users.length} 位會員</p>
      </div>
      {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b dark:border-stone-700 text-left">
              <th className="p-3 text-stone-500">ID</th><th className="p-3 text-stone-500">名稱</th><th className="p-3 text-stone-500">Email</th><th className="p-3 text-stone-500">角色</th><th className="p-3 text-stone-500">註冊日期</th><th className="p-3 text-stone-500">操作</th>
            </tr></thead>
            <tbody className="divide-y dark:divide-stone-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <td className="p-3 text-stone-400">#{u.id}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center text-sm">{u.name?.[0]}</div>
                      <span className="font-medium dark:text-stone-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-stone-500 text-xs">{u.email}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColor(u.role)}`}>{u.role}</span></td>
                  <td className="p-3 text-stone-400 text-xs">{new Date(u.createdAt).toLocaleDateString("zh-TW")}</td>
                  <td className="p-3">
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="text-xs border rounded px-2 py-1 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-200">
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
