"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

const BOARDS = [
  { id: "general", name: "綜合討論", icon: "💬", desc: "部落大小事、族人交流" },
  { id: "language", name: "族語學習", icon: "📖", desc: "族語學習心得、教學分享" },
  { id: "culture", name: "文化分享", icon: "🎭", desc: "傳統文化、祭典活動" },
  { id: "events", name: "活動公告", icon: "📢", desc: "部落活動、社區資訊" },
];

interface Post { id: number; board: string; title: string; content: string; authorName: string; repliesCount?: number; likes: number; createdAt: string; }

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [board, setBoard] = useState("general");
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    try {
      const r = await api.get<any>(`/api/discussions?board=${board}`);
      setPosts(r.discussions || []);
    } catch {
      // Fallback demo data
      setPosts([
        { id: 1, board: "general", title: "歡迎來到 Pinuyumayan 社群！", content: "這是一個讓所有關心卑南族文化的朋友交流的空間。", authorName: "Admin", repliesCount: 3, likes: 8, createdAt: "2026-03-30" },
        { id: 2, board: "language", title: "族語日常問候用語整理", content: "常用的卑南語問候語：uninan (謝謝)、marekumare (你好)", authorName: "族語教師", repliesCount: 5, likes: 12, createdAt: "2026-03-29" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, [board]);

  const submitPost = async () => {
    if (!user) { toast("請先登入", "error"); return; }
    if (!title.trim() || !content.trim()) { toast("請填寫標題和內容", "error"); return; }
    try {
      await api.post("/api/discussions", { board, title, content });
      setShowNewPost(false); setTitle(""); setContent("");
      toast("貼文已發布", "success");
      loadPosts();
    } catch (e: any) { toast(e.message || "發布失敗", "error"); }
  };

  const openPost = async (id: number) => {
    try {
      const r = await api.get<any>(`/api/discussions/${id}`);
      setSelectedPost(r.discussion);
    } catch { toast("載入失敗", "error"); }
  };

  const submitReply = async () => {
    if (!user) { toast("請先登入", "error"); return; }
    if (!replyText.trim()) return;
    try {
      await api.post(`/api/discussions/${selectedPost.id}/replies`, { content: replyText });
      setReplyText("");
      openPost(selectedPost.id); // Refresh
      toast("回覆已送出", "success");
    } catch { toast("回覆失敗", "error"); }
  };

  const toggleLike = async (id: number) => {
    if (!user) { toast("請先登入", "error"); return; }
    try {
      await api.post(`/api/discussions/${id}/like`, {});
      loadPosts();
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">💬 族人社群</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">分享故事、討論文化、一起學習族語</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Boards sidebar */}
        <aside className="md:col-span-1">
          <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-4 sticky top-20">
            <h3 className="font-bold text-sm text-stone-500 dark:text-stone-400 mb-3">討論板</h3>
            {BOARDS.map(b => (
              <button key={b.id} onClick={() => { setBoard(b.id); setSelectedPost(null); }}
                className={`w-full text-left p-3 rounded-lg mb-1 transition text-sm ${board === b.id ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300" : "hover:bg-stone-50 dark:hover:bg-stone-700/50 text-stone-600 dark:text-stone-400"}`}>
                <span className="mr-2">{b.icon}</span>{b.name}
                <p className="text-xs text-stone-400 mt-0.5 ml-6">{b.desc}</p>
              </button>
            ))}
            <hr className="my-3 dark:border-stone-700" />
            {user ? (
              <button onClick={() => { setShowNewPost(true); setSelectedPost(null); }} className="w-full bg-amber-700 text-white py-2.5 rounded-lg hover:bg-amber-800 transition text-sm font-medium">
                ✏️ 發新貼文
              </button>
            ) : (
              <Link href="/login" className="block text-center w-full bg-stone-100 dark:bg-stone-700 py-2.5 rounded-lg text-sm dark:text-stone-300">
                登入後發文
              </Link>
            )}
          </div>
        </aside>

        {/* Posts / Detail */}
        <div className="md:col-span-3">
          {/* New post form */}
          {showNewPost && (
            <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6 mb-4">
              <h3 className="font-bold dark:text-stone-100 mb-4">✏️ 新貼文 — {BOARDS.find(b => b.id === board)?.name}</h3>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="標題" className="w-full px-4 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 mb-3" />
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="寫下你的想法..." rows={4} className="w-full px-4 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 mb-3" />
              <div className="flex gap-2">
                <button onClick={submitPost} className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800 text-sm">發布</button>
                <button onClick={() => setShowNewPost(false)} className="px-6 py-2 rounded-lg border dark:border-stone-600 dark:text-stone-300 text-sm">取消</button>
              </div>
            </div>
          )}

          {/* Post Detail View */}
          {selectedPost ? (
            <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
              <button onClick={() => setSelectedPost(null)} className="text-sm text-amber-700 dark:text-amber-400 hover:underline mb-4 block">← 返回列表</button>
              <h2 className="text-2xl font-bold dark:text-stone-100 mb-2">{selectedPost.title}</h2>
              <div className="flex items-center gap-3 text-sm text-stone-400 mb-4">
                <span>👤 {selectedPost.authorName}</span>
                <span>📅 {selectedPost.createdAt}</span>
                <span>❤️ {selectedPost.likes}</span>
              </div>
              <p className="text-stone-700 dark:text-stone-300 whitespace-pre-wrap mb-6">{selectedPost.content}</p>

              {/* Replies */}
              <div className="border-t dark:border-stone-700 pt-4">
                <h3 className="font-bold dark:text-stone-100 mb-4">💬 回覆 ({selectedPost.replies?.length || 0})</h3>
                {selectedPost.replies?.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {selectedPost.replies.map((r: any) => (
                      <div key={r.id} className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4">
                        <p className="text-stone-700 dark:text-stone-300">{r.content}</p>
                        <p className="text-xs text-stone-400 mt-2">👤 {r.authorName} · {r.createdAt}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-stone-400 text-sm mb-4">暫無回覆</p>}

                {user ? (
                  <div className="flex gap-2">
                    <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === "Enter" && submitReply()}
                      placeholder="輸入回覆..." className="flex-1 px-4 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 text-sm" />
                    <button onClick={submitReply} className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 text-sm">送出</button>
                  </div>
                ) : <p className="text-sm text-stone-400"><Link href="/login" className="text-amber-700 dark:text-amber-400 hover:underline">登入</Link>後即可回覆</p>}
              </div>
            </div>
          ) : (
            /* Post List */
            <>
              {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : posts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700">
                  <p className="text-4xl mb-4">💬</p>
                  <p className="text-stone-500">此討論板暫無貼文</p>
                  {user && <button onClick={() => setShowNewPost(true)} className="text-amber-700 dark:text-amber-400 text-sm mt-2 hover:underline">成為第一個發文者</button>}
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map(p => (
                    <div key={p.id} onClick={() => openPost(p.id)}
                      className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-5 hover:shadow-sm transition cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg dark:text-stone-100 mb-1 hover:text-amber-700 dark:hover:text-amber-400 transition">{p.title}</h3>
                          <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-2">{p.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-stone-400">
                            <span>👤 {p.authorName}</span>
                            <span>📅 {p.createdAt}</span>
                            <span>💬 {p.repliesCount || 0} 回覆</span>
                            <button onClick={(e) => { e.stopPropagation(); toggleLike(p.id); }} className="hover:text-red-500 transition">
                              ❤️ {p.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
