"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

const CATEGORIES = ["文化", "部落", "歷史", "音樂", "工藝", "信仰", "語言", "教育"];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<"articles" | "users" | "comments">("articles");
  const [articles, setArticles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editArticle, setEditArticle] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", excerpt: "", category: "文化", tags: "", published: true });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) { router.push("/login"); return; }
    loadData();
  }, [tab, user, authLoading, isAdmin, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "articles") { const d = await api.get<any>("/api/articles?limit=50"); setArticles(d.articles || []); }
      else if (tab === "users") { const d = await api.get<any>("/api/admin/users"); setUsers(d.users || []); }
      else { const d = await api.get<any>("/api/admin/comments"); setComments(d.comments || []); }
    } catch {}
    setLoading(false);
  };

  const openEditor = (article?: any) => {
    if (article) {
      setEditArticle(article);
      const tags = (() => { try { return JSON.parse(article.tags || "[]"); } catch { return []; } })();
      setForm({ title: article.title, slug: article.slug, content: article.content, excerpt: article.excerpt || "", category: article.category, tags: tags.join(", "), published: article.published });
    } else {
      setEditArticle(null);
      setForm({ title: "", slug: "", content: "", excerpt: "", category: "文化", tags: "", published: true });
    }
    setShowEditor(true);
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");

  const saveArticle = async () => {
    const body = { ...form, tags: JSON.stringify(form.tags.split(",").map(t => t.trim()).filter(Boolean)) };
    try {
      if (editArticle) { await api.put(`/api/articles/${editArticle.id}`, body); toast("文章已更新", "success"); }
      else { await api.post("/api/articles", body); toast("文章已建立", "success"); }
      setShowEditor(false);
      loadData();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const deleteArticle = async (id: number) => {
    if (!confirm("確定刪除此文章？")) return;
    try { await api.del(`/api/articles/${id}`); loadData(); toast("已刪除", "success"); } catch { toast("刪除失敗", "error"); }
  };

  const updateRole = async (id: number, role: string) => {
    try { await api.put(`/api/admin/users/${id}/role`, { role }); loadData(); toast("角色已更新", "success"); } catch {}
  };

  const deleteComment = async (id: number) => {
    if (!confirm("確定刪除此留言？")) return;
    try { await api.del(`/api/admin/comments/${id}`); loadData(); toast("已刪除", "success"); } catch {}
  };

  if (authLoading) return <div className="text-center py-20 text-stone-400">載入中...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 dark:text-stone-100">⚙️ 管理後台</h1>
      <div className="flex gap-2 mb-6">
        {(["articles", "users", "comments"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg font-medium transition ${tab === t ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
            {t === "articles" ? `📝 文章 (${articles.length})` : t === "users" ? "👥 用戶" : "💬 留言"}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-20 text-stone-400">載入中...</div> : tab === "articles" ? (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => openEditor()} className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition">+ 新增文章</button>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border dark:border-stone-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 dark:bg-stone-700"><tr>
                <th className="px-4 py-3 text-left">標題</th><th className="px-4 py-3 text-left">分類</th><th className="px-4 py-3 text-left">狀態</th><th className="px-4 py-3 text-left">瀏覽</th><th className="px-4 py-3 text-left">操作</th>
              </tr></thead>
              <tbody>{articles.map(a => (
                <tr key={a.id} className="border-t dark:border-stone-700">
                  <td className="px-4 py-3 font-medium dark:text-stone-200">{a.title}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">{a.category}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${a.published ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400" : "bg-stone-100 dark:bg-stone-700 text-stone-500"}`}>{a.published ? "已發布" : "草稿"}</span></td>
                  <td className="px-4 py-3 text-stone-500">{a.views}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEditor(a)} className="text-amber-700 dark:text-amber-400 text-xs hover:underline">編輯</button>
                    <button onClick={() => deleteArticle(a.id)} className="text-red-500 text-xs hover:underline">刪除</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      ) : tab === "users" ? (
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border dark:border-stone-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-700"><tr>
              <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">名稱</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">角色</th><th className="px-4 py-3 text-left">操作</th>
            </tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id} className="border-t dark:border-stone-700">
                <td className="px-4 py-3">{u.id}</td>
                <td className="px-4 py-3 font-medium dark:text-stone-200">{u.name}</td>
                <td className="px-4 py-3 text-stone-500">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400" : u.role === "editor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300"}`}>{u.role}</span></td>
                <td className="px-4 py-3"><select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="text-xs border dark:border-stone-600 dark:bg-stone-700 rounded px-2 py-1"><option value="user">user</option><option value="editor">editor</option><option value="admin">admin</option></select></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.length === 0 ? <p className="text-center text-stone-400 py-10">暫無留言</p> : comments.map(c => (
            <div key={c.id} className="bg-white dark:bg-stone-800 p-4 rounded-xl border dark:border-stone-700 flex items-start justify-between">
              <div>
                <p className="text-stone-800 dark:text-stone-200">{c.content}</p>
                <div className="text-xs text-stone-400 mt-2 flex gap-3"><span>👤 {c.authorName}</span><span>📝 {c.articleTitle}</span><span>{new Date(c.createdAt).toLocaleDateString("zh-TW")}</span></div>
              </div>
              <button onClick={() => deleteComment(c.id)} className="text-red-500 text-sm hover:text-red-700 flex-shrink-0 ml-4">刪除</button>
            </div>
          ))}
        </div>
      )}

      {/* Article Editor Modal */}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editArticle ? "編輯文章" : "新增文章"} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-stone-200">標題</label>
            <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value, slug: editArticle ? f.slug : generateSlug(e.target.value) })); }}
              className="w-full px-4 py-2 rounded-lg border dark:border-stone-600 dark:bg-stone-700" placeholder="文章標題" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-stone-200">Slug</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border dark:border-stone-600 dark:bg-stone-700 text-sm" placeholder="article-slug" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-stone-200">分類</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border dark:border-stone-600 dark:bg-stone-700">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-stone-200">標籤 (逗號分隔)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border dark:border-stone-600 dark:bg-stone-700" placeholder="文化, 祭典" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-stone-200">摘要</label>
            <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2}
              className="w-full px-4 py-2 rounded-lg border dark:border-stone-600 dark:bg-stone-700" placeholder="文章摘要..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-stone-200">內容</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12}
              className="w-full px-4 py-2 rounded-lg border dark:border-stone-600 dark:bg-stone-700 font-mono text-sm" placeholder="文章內容..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} id="pub" />
            <label htmlFor="pub" className="text-sm dark:text-stone-200">立即發布</label>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t dark:border-stone-700">
            <button onClick={() => setShowEditor(false)} className="px-5 py-2 bg-stone-200 dark:bg-stone-600 rounded-lg text-sm">取消</button>
            <button onClick={saveArticle} className="px-5 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800">儲存文章</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
