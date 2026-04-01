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

interface Post { id: string; board: string; title: string; content: string; author: string; authorId?: number; replies: number; likes: number; createdAt: string; }

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [board, setBoard] = useState("general");
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Demo posts (in production, this would be a real API)
  useEffect(() => {
    setLoading(true);
    const demoPosts: Post[] = [
      { id: "1", board: "general", title: "歡迎來到 Pinuyumayan 社群！", content: "這是一個讓所有關心卑南族文化的朋友交流的空間。歡迎大家分享部落故事、族語學習心得，或任何文化相關的話題。", author: "Admin", replies: 3, likes: 8, createdAt: "2026-03-30" },
      { id: "2", board: "language", title: "族語日常問候用語整理", content: "整理了一些常用的卑南語問候語，分享給正在學習的朋友們。uninan (謝謝)、marekumare (你好)...", author: "族語教師", replies: 5, likes: 12, createdAt: "2026-03-29" },
      { id: "3", board: "culture", title: "2026年大獵祭準備工作開始", content: "今年的大獵祭將在12月舉行，各位族人開始準備了嗎？歡迎分享準備的過程和心得。", author: "部落幹部", replies: 7, likes: 15, createdAt: "2026-03-28" },
      { id: "4", board: "events", title: "南王部落春季文化體驗營", content: "4月底將舉辦為期兩天的文化體驗營，內容包含族語教學、傳統工藝和部落導覽。歡迎報名參加！", author: "活動組", replies: 2, likes: 6, createdAt: "2026-03-27" },
      { id: "5", board: "general", title: "有人知道卑南族的創世傳說嗎？", content: "最近在研究各族的創世神話，想了解卑南族的創世傳說，有族人可以分享嗎？", author: "文化研究者", replies: 4, likes: 9, createdAt: "2026-03-26" },
      { id: "6", board: "language", title: "分享：用族語說顏色", content: "紅色 kavaang、白色 palit、黑色 tulem、藍色/綠色 hiyumang，大家來補充更多吧！", author: "學習者", replies: 6, likes: 11, createdAt: "2026-03-25" },
    ];
    setTimeout(() => { setPosts(demoPosts.filter(p => board === "all" ? true : p.board === board)); setLoading(false); }, 300);
  }, [board]);

  const submitPost = () => {
    if (!user) { toast("請先登入", "error"); return; }
    if (!title.trim() || !content.trim()) { toast("請填寫標題和內容", "error"); return; }
    const newPost: Post = { id: Date.now().toString(), board, title, content, author: user.name, authorId: user.id, replies: 0, likes: 0, createdAt: new Date().toISOString().split("T")[0] };
    setPosts(prev => [newPost, ...prev]);
    setShowNewPost(false); setTitle(""); setContent("");
    toast("貼文已發布", "success");
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
              <button key={b.id} onClick={() => setBoard(b.id)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition text-sm ${board === b.id ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300" : "hover:bg-stone-50 dark:hover:bg-stone-700/50 text-stone-600 dark:text-stone-400"}`}>
                <span className="mr-2">{b.icon}</span>{b.name}
              </button>
            ))}
            <hr className="my-3 dark:border-stone-700" />
            {user ? (
              <button onClick={() => setShowNewPost(true)} className="w-full bg-amber-700 text-white py-2.5 rounded-lg hover:bg-amber-800 transition text-sm font-medium">
                ✏️ 發新貼文
              </button>
            ) : (
              <Link href="/login" className="block text-center w-full bg-stone-100 dark:bg-stone-700 py-2.5 rounded-lg text-sm dark:text-stone-300">
                登入後發文
              </Link>
            )}
          </div>
        </aside>

        {/* Posts */}
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

          {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : posts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700">
              <p className="text-4xl mb-4">💬</p>
              <p className="text-stone-500">此討論板暫無貼文</p>
              {user && <button onClick={() => setShowNewPost(true)} className="text-amber-700 dark:text-amber-400 text-sm mt-2 hover:underline">成為第一個發文者</button>}
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(p => (
                <div key={p.id} className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg dark:text-stone-100 mb-1">{p.title}</h3>
                      <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-2">{p.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-stone-400">
                        <span>👤 {p.author}</span>
                        <span>📅 {p.createdAt}</span>
                        <span>💬 {p.replies} 回覆</span>
                        <span>❤️ {p.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
