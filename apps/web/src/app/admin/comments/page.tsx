"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

export default function AdminComments() {
  const { toast } = useToast();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api.get<any>("/api/admin/comments").then(d => { setComments(d.comments || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const del = async (id: number) => {
    if (!confirm("確定刪除此留言？")) return;
    try { await api.del(`/api/admin/comments/${id}`); toast("留言已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-stone-100">💬 留言管理</h1>
        <p className="text-sm text-stone-500">{comments.length} 則留言</p>
      </div>
      {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : comments.length === 0 ? (
        <div className="text-center py-20 text-stone-400">暫無留言</div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm dark:text-stone-200">{c.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                    <span>👤 {c.authorName}</span>
                    {c.authorRole && <span className="bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded">{c.authorRole}</span>}
                    <span>📝 {c.articleTitle}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString("zh-TW")}</span>
                  </div>
                </div>
                <button onClick={() => del(c.id)} className="text-red-500 hover:text-red-700 text-xs ml-4 shrink-0">刪除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
