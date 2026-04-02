"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

export default function AdminDiscussions() {
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");

  const load = (p = page) => {
    setLoading(true);
    api.get<any>(`/api/admin/discussions?page=${p}&limit=20`).then(d => {
      setDiscussions(d.discussions || []);
      setPagination(d.pagination || { total: 0, totalPages: 1 });
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => load(page), [page]);

  const del = async (id: number) => {
    if (!confirm("確定刪除此討論？所有回覆也會一併刪除。")) return;
    try { await api.del(`/api/admin/discussions/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  const filtered = discussions.filter(d =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.content?.toLowerCase().includes(search.toLowerCase()) || d.authorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div><h1 className="text-2xl font-bold dark:text-stone-100">💬 討論管理</h1><p className="text-sm text-stone-500">共 {pagination.total} 篇討論</p></div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋討論..." className="px-3 py-2 border rounded-lg text-sm dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 w-56" />
      </div>

      {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-2">💬</p>
          <p className="font-bold">尚無討論</p>
          <p className="text-sm mt-1">社群中的討論將顯示在這裡</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <div key={d.id} className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    {d.board && <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full font-bold">{d.board}</span>}
                    {d.pinned && <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full">📌 置頂</span>}
                  </div>
                  <h3 className="font-bold dark:text-stone-100 mb-1">{d.title}</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">{d.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                    <span>👤 {d.authorName || d.author?.name || "匿名"}</span>
                    <span>💬 {d.replyCount || d._count?.replies || 0} 回覆</span>
                    <span>❤️ {d.likeCount || d._count?.likes || 0} 讚</span>
                    <span>📅 {d.createdAt ? new Date(d.createdAt).toLocaleDateString("zh-TW") : ""}</span>
                  </div>
                </div>
                <button onClick={() => del(d.id)} className="text-red-500 text-xs hover:underline whitespace-nowrap px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  🗑️ 刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border dark:border-stone-600 text-sm disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-700 transition dark:text-stone-300">← 上一頁</button>
          <span className="text-sm text-stone-400 px-3">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="px-3 py-1.5 rounded-lg border dark:border-stone-600 text-sm disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-700 transition dark:text-stone-300">下一頁 →</button>
        </div>
      )}
    </div>
  );
}
