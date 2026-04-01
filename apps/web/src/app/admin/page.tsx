"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, getUser, getToken } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "comments">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || !getToken() || u.role !== "admin") { router.push("/login"); return; }
    loadData();
  }, [tab, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "users") { const d = await api.get<any>("/api/admin/users"); setUsers(d.users || []); }
      else { const d = await api.get<any>("/api/admin/comments"); setComments(d.comments || []); }
    } catch {}
    setLoading(false);
  };

  const updateRole = async (id: number, role: string) => {
    try { await api.put(`/api/admin/users/${id}/role`, { role }); loadData(); } catch {}
  };

  const deleteComment = async (id: number) => {
    if (!confirm("確定刪除此留言？")) return;
    try { await api.del(`/api/admin/comments/${id}`); loadData(); } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">⚙️ 管理後台</h1>
      <div className="flex gap-2 mb-6">
        {(["users", "comments"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg font-medium transition ${tab === t ? "bg-amber-700 text-white" : "bg-white text-stone-600 border hover:bg-stone-50"}`}>
            {t === "users" ? "👥 用戶管理" : "💬 留言管理"}
          </button>
        ))}
      </div>
      {loading ? <div className="text-center py-20 text-stone-400">載入中...</div> : tab === "users" ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50"><tr>
              <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">名稱</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">角色</th><th className="px-4 py-3 text-left">操作</th>
            </tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">{u.id}</td>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-stone-500">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-red-100 text-red-700" : u.role === "editor" ? "bg-blue-100 text-blue-700" : "bg-stone-100 text-stone-600"}`}>{u.role}</span></td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="text-xs border rounded px-2 py-1">
                    <option value="user">user</option><option value="editor">editor</option><option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-xl border flex items-start justify-between">
              <div>
                <p className="text-stone-800">{c.content}</p>
                <div className="text-xs text-stone-400 mt-2 flex gap-3">
                  <span>👤 {c.authorName}</span>
                  <span>📝 {c.articleTitle}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString("zh-TW")}</span>
                </div>
              </div>
              <button onClick={() => deleteComment(c.id)} className="text-red-500 text-sm hover:text-red-700 flex-shrink-0 ml-4">刪除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
