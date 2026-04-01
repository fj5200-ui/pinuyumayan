"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function ArticleDetail() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.slug) return;
    api.get<any>(`/api/articles/${params.slug}`).then(d => {
      const a = d.article || d;
      setArticle(a);
      setLoading(false);
      if (a?.id) {
        api.get<any>(`/api/comments/article/${a.id}`).then(cd => setComments(cd.comments || [])).catch(() => {});
      }
    }).catch(() => setLoading(false));
  }, [params.slug]);

  useEffect(() => {
    if (!article || !user) return;
    api.get<any>(`/api/bookmarks/check/${article.id}`).then(d => setBookmarked(d.bookmarked)).catch(() => {});
  }, [article, user]);

  const submitComment = async () => {
    if (!newComment.trim() || !user) { toast("請先登入", "error"); return; }
    try {
      await api.post(`/api/comments/article/${article.id}`, { content: newComment });
      setNewComment("");
      const d = await api.get<any>(`/api/comments/article/${article.id}`);
      setComments(d.comments || []);
      toast("留言成功", "success");
    } catch { toast("留言失敗", "error"); }
  };

  const toggleLike = async () => {
    if (!user) { toast("請先登入", "error"); return; }
    try {
      await api.post(`/api/comments/article/${article.id}/like`, {});
      setLiked(!liked); setLikeCount(c => liked ? c - 1 : c + 1);
    } catch { toast("操作失敗", "error"); }
  };

  const toggleBookmark = async () => {
    if (!user) { toast("請先登入", "error"); return; }
    try {
      await api.post(`/api/bookmarks/${article.id}`, {});
      setBookmarked(!bookmarked);
      toast(bookmarked ? "已取消收藏" : "已加入收藏", "success");
    } catch { toast("操作失敗", "error"); }
  };

  if (loading) return <div className="text-center py-20 text-stone-400">載入中...</div>;
  if (!article) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold dark:text-stone-100">找不到此文章</h1><Link href="/articles" className="text-amber-700 mt-4 inline-block">← 返回文章列表</Link></div>;

  const tags = (() => { try { return JSON.parse(article.tags || "[]"); } catch { return []; } })();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/articles" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 text-sm mb-6 inline-block">← 返回文化誌</Link>
      <article className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-8 border border-stone-100 dark:border-stone-700">
        <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full font-medium">{article.category}</span>
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-3 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-stone-400 dark:text-stone-500 mb-6 pb-6 border-b dark:border-stone-700">
          <span>👤 {article.authorName || "佚名"}</span><span>👁️ {article.views} 次瀏覽</span><span>📅 {new Date(article.createdAt).toLocaleDateString("zh-TW")}</span>
        </div>
        {article.excerpt && <p className="text-lg text-stone-600 dark:text-stone-300 italic mb-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl">{article.excerpt}</p>}
        <div className="prose prose-stone dark:prose-invert max-w-none leading-relaxed whitespace-pre-line">{article.content}</div>
        {tags.length > 0 && (
          <div className="mt-8 pt-6 border-t dark:border-stone-700 flex flex-wrap gap-2">
            {tags.map((tag: string) => <span key={tag} className="bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-full text-sm">#{tag}</span>)}
          </div>
        )}
        {/* Actions */}
        <div className="mt-6 pt-6 border-t dark:border-stone-700 flex items-center gap-4">
          <button onClick={toggleLike} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${liked ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400" : "border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
            {liked ? "❤️" : "🤍"} {likeCount > 0 && likeCount}
          </button>
          <button onClick={toggleBookmark} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${bookmarked ? "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400" : "border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
            {bookmarked ? "🔖 已收藏" : "📑 收藏"}
          </button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast("已複製連結", "success"); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 transition">🔗 分享</button>
        </div>
      </article>

      {/* Comments */}
      <div className="mt-8 bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-6 border dark:border-stone-700">
        <h2 className="text-xl font-bold mb-4 dark:text-stone-100">💬 留言 ({comments.length})</h2>
        {user ? (
          <div className="flex gap-3 mb-6">
            <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && submitComment()}
              placeholder="分享你的想法..." className="flex-1 px-4 py-2.5 rounded-xl border dark:border-stone-600 dark:bg-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" />
            <button onClick={submitComment} className="px-5 py-2.5 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition">送出</button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-700 rounded-xl text-center"><Link href="/login" className="text-amber-700 dark:text-amber-400 font-medium">登入後即可留言</Link></div>
        )}
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-sm">👤</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">{c.authorName || c.userName || "匿名"}</span>
                <span className="text-xs text-stone-400">{new Date(c.createdAt).toLocaleDateString("zh-TW")}</span>
              </div>
              <p className="text-stone-600 dark:text-stone-300 pl-10">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-center text-stone-400 py-4">還沒有留言，來當第一個吧！</p>}
        </div>
      </div>
    </div>
  );
}
