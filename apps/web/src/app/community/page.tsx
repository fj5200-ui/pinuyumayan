"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

const BOARDS = [
  { id: "general", name: "綜合討論", icon: "💬", desc: "部落大小事、族人交流", color: "from-amber-400 to-orange-400" },
  { id: "language", name: "族語學習", icon: "📖", desc: "族語學習心得、教學分享", color: "from-teal-400 to-cyan-400" },
  { id: "culture", name: "文化分享", icon: "🎭", desc: "傳統文化、祭典活動", color: "from-purple-400 to-pink-400" },
  { id: "events", name: "活動公告", icon: "📢", desc: "部落活動、社區資訊", color: "from-blue-400 to-indigo-400" },
];

interface Post { id: number; board: string; title: string; content: string; authorId?: number; authorName: string; repliesCount?: number; likes: number; createdAt: string; }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "剛剛";
  if (mins < 60) return `${mins} 分鐘前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString("zh-TW");
}

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
  const [sort, setSort] = useState<"newest" | "popular">("newest");
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showMobileBoards, setShowMobileBoards] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const r = await api.get<any>(`/api/discussions?board=${board}`);
      setPosts(r.discussions || []);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, [board]);

  const sortedPosts = useMemo(() => {
    const sorted = [...posts];
    if (sort === "popular") sorted.sort((a, b) => b.likes - a.likes || (b.repliesCount || 0) - (a.repliesCount || 0));
    else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted;
  }, [posts, sort]);

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
      setSelectedPost(r.discussion || r);
    } catch { toast("載入失敗", "error"); }
  };

  const submitReply = async () => {
    if (!user) { toast("請先登入", "error"); return; }
    if (!replyText.trim()) return;
    try {
      await api.post(`/api/discussions/${selectedPost.id}/replies`, { content: replyText });
      setReplyText("");
      openPost(selectedPost.id);
      toast("回覆已送出", "success");
    } catch { toast("回覆失敗", "error"); }
  };

  const toggleLike = async (id: number) => {
    if (!user) { toast("請先登入", "error"); return; }
    try {
      await api.post(`/api/discussions/${id}/like`, {});
      loadPosts();
      if (selectedPost?.id === id) openPost(id);
    } catch {}
  };

  const deletePost = async (id: number) => {
    if (!confirm("確定要刪除此貼文？")) return;
    try {
      await api.del(`/api/discussions/${id}`);
      toast("已刪除", "success");
      setSelectedPost(null);
      loadPosts();
    } catch { toast("刪除失敗", "error"); }
  };

  const currentBoard = BOARDS.find(b => b.id === board)!;
  const totalPosts = posts.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">💬 族人社群</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">分享故事、討論文化、一起學習族語</p>
      </div>

      {/* Mobile board selector */}
      <div className="md:hidden mb-4">
        <button onClick={() => setShowMobileBoards(!showMobileBoards)}
          className="w-full flex items-center justify-between bg-white dark:bg-stone-800 border dark:border-stone-700 rounded-xl px-4 py-3">
          <span className="flex items-center gap-2">
            <span>{currentBoard.icon}</span>
            <span className="font-medium dark:text-stone-100">{currentBoard.name}</span>
          </span>
          <span className="text-stone-400">{showMobileBoards ? "▲" : "▼"}</span>
        </button>
        {showMobileBoards && (
          <div className="mt-2 bg-white dark:bg-stone-800 border dark:border-stone-700 rounded-xl p-2 space-y-1">
            {BOARDS.map(b => (
              <button key={b.id} onClick={() => { setBoard(b.id); setSelectedPost(null); setShowMobileBoards(false); }}
                className={`w-full text-left p-3 rounded-lg text-sm ${board === b.id ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300" : "text-stone-600 dark:text-stone-400"}`}>
                {b.icon} {b.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block md:col-span-1">
          <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-4 sticky top-20">
            <h3 className="font-bold text-sm text-stone-500 dark:text-stone-400 mb-3">討論板</h3>
            {BOARDS.map(b => (
              <button key={b.id} onClick={() => { setBoard(b.id); setSelectedPost(null); }}
                className={`w-full text-left p-3 rounded-lg mb-1 transition text-sm ${board === b.id ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-medium" : "hover:bg-stone-50 dark:hover:bg-stone-700/50 text-stone-600 dark:text-stone-400"}`}>
                <span className="mr-2">{b.icon}</span>{b.name}
                <p className="text-xs text-stone-400 mt-0.5 ml-6">{b.desc}</p>
              </button>
            ))}

            {/* Stats */}
            <div className="mt-4 pt-4 border-t dark:border-stone-700 space-y-2 text-xs text-stone-400">
              <div className="flex justify-between"><span>當前版面</span><span className="font-medium text-stone-600 dark:text-stone-300">{totalPosts} 篇</span></div>
            </div>

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

        {/* Main content */}
        <div className="md:col-span-3">
          {/* Board header */}
          <div className={`bg-gradient-to-r ${currentBoard.color} rounded-xl p-5 mb-4 text-white`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentBoard.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{currentBoard.name}</h2>
                <p className="text-sm opacity-90">{currentBoard.desc}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold">{totalPosts}</p>
                <p className="text-xs opacity-80">篇貼文</p>
              </div>
            </div>
          </div>

          {/* New post form */}
          {showNewPost && (
            <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6 mb-4">
              <h3 className="font-bold dark:text-stone-100 mb-4">✏️ 新貼文 — {currentBoard.name}</h3>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="標題"
                className="w-full px-4 py-2.5 border rounded-xl dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 mb-3 focus:border-amber-500 outline-none transition" />
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="寫下你的想法..." rows={5}
                className="w-full px-4 py-2.5 border rounded-xl dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 mb-3 focus:border-amber-500 outline-none transition resize-none" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowNewPost(false); setTitle(""); setContent(""); }}
                  className="px-5 py-2 rounded-lg border dark:border-stone-600 dark:text-stone-300 text-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition">取消</button>
                <button onClick={submitPost} className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800 text-sm font-medium transition">發布貼文</button>
              </div>
            </div>
          )}

          {/* Post Detail View */}
          {selectedPost ? (
            <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 overflow-hidden">
              <div className="p-6">
                <button onClick={() => setSelectedPost(null)} className="text-sm text-amber-700 dark:text-amber-400 hover:underline mb-4 flex items-center gap-1">← 返回列表</button>
                <h2 className="text-2xl font-bold dark:text-stone-100 mb-3">{selectedPost.title}</h2>
                <div className="flex items-center gap-3 text-sm text-stone-400 mb-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-7 h-7 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center text-xs text-white font-bold">{(selectedPost.authorName || '?')[0]}</span>
                    <span className="text-stone-600 dark:text-stone-300 font-medium">{selectedPost.authorName}</span>
                  </span>
                  <span>{timeAgo(selectedPost.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <button onClick={() => toggleLike(selectedPost.id)} className="hover:scale-110 transition">❤️</button> {selectedPost.likes}
                  </span>
                  {user && (user.role === 'admin' || user.name === selectedPost.authorName) && (
                    <button onClick={() => deletePost(selectedPost.id)} className="ml-auto text-red-400 hover:text-red-600 text-xs transition">🗑️ 刪除</button>
                  )}
                </div>
                <div className="text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed mb-6 p-4 bg-stone-50 dark:bg-stone-700/30 rounded-xl">{selectedPost.content}</div>

                {/* Replies */}
                <div className="border-t dark:border-stone-700 pt-5">
                  <h3 className="font-bold dark:text-stone-100 mb-4">💬 回覆 ({selectedPost.replies?.length || 0})</h3>
                  {selectedPost.replies?.length > 0 ? (
                    <div className="space-y-3 mb-5">
                      {selectedPost.replies.map((r: any, i: number) => (
                        <div key={r.id || i} className="flex gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-600 dark:to-stone-700 rounded-full flex items-center justify-center text-xs font-bold text-stone-600 dark:text-stone-300 flex-shrink-0">
                            {(r.authorName || '?')[0]}
                          </div>
                          <div className="flex-1 bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-stone-700 dark:text-stone-200">{r.authorName}</span>
                              <span className="text-xs text-stone-400">{timeAgo(r.createdAt)}</span>
                            </div>
                            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{r.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-stone-400 text-sm mb-5">暫無回覆，成為第一個回覆的人！</p>}

                  {user ? (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                        {(user.name || '?')[0]}
                      </div>
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === "Enter" && submitReply()}
                        placeholder="輸入回覆..." className="flex-1 px-4 py-2.5 border rounded-xl dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 text-sm focus:border-amber-500 outline-none transition" />
                      <button onClick={submitReply} className="bg-amber-700 text-white px-5 py-2.5 rounded-xl hover:bg-amber-800 text-sm font-medium transition">送出</button>
                    </div>
                  ) : <p className="text-sm text-stone-400"><Link href="/login" className="text-amber-700 dark:text-amber-400 hover:underline">登入</Link>後即可回覆</p>}
                </div>
              </div>
            </div>
          ) : (
            /* Post List */
            <>
              {/* Sort controls */}
              {!loading && posts.length > 0 && (
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-stone-400">{totalPosts} 篇貼文</p>
                  <div className="flex gap-1 bg-white dark:bg-stone-800 border dark:border-stone-700 rounded-lg p-0.5">
                    <button onClick={() => setSort("newest")}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition ${sort === "newest" ? "bg-amber-700 text-white" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
                      🕐 最新
                    </button>
                    <button onClick={() => setSort("popular")}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition ${sort === "popular" ? "bg-amber-700 text-white" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
                      🔥 最熱
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-5 animate-pulse">
                      <div className="h-5 w-2/3 bg-stone-200 dark:bg-stone-700 rounded mb-3" />
                      <div className="h-4 w-full bg-stone-200 dark:bg-stone-700 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-stone-200 dark:bg-stone-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : sortedPosts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700">
                  <p className="text-5xl mb-4">💬</p>
                  <p className="text-stone-500 dark:text-stone-400 text-lg">此討論板暫無貼文</p>
                  {user && <button onClick={() => setShowNewPost(true)} className="text-amber-700 dark:text-amber-400 text-sm mt-3 hover:underline">✏️ 成為第一個發文者</button>}
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedPosts.map(p => (
                    <div key={p.id} onClick={() => openPost(p.id)}
                      className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-5 hover:shadow-sm hover:border-amber-200 dark:hover:border-amber-800 transition cursor-pointer group">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(p.authorName || '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg dark:text-stone-100 mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition truncate">{p.title}</h3>
                          <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-2 leading-relaxed">{p.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-stone-400">
                            <span className="font-medium text-stone-500 dark:text-stone-400">{p.authorName}</span>
                            <span>{timeAgo(p.createdAt)}</span>
                            <span className="flex items-center gap-1">💬 {p.repliesCount || 0}</span>
                            <button onClick={(e) => { e.stopPropagation(); toggleLike(p.id); }} className="flex items-center gap-1 hover:text-red-500 transition">
                              ❤️ {p.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile new post FAB */}
              {user && !showNewPost && (
                <button onClick={() => setShowNewPost(true)}
                  className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-amber-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-amber-800 transition z-40">
                  ✏️
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
