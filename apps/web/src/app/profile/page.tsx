"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refresh } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [follows, setFollows] = useState<any[]>([]);
  const [tab, setTab] = useState<"info" | "bookmarks" | "follows">("info");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    setName(user.name || ""); setBio(user.bio || "");
    api.get<any>("/api/bookmarks").then(d => setBookmarks(d.bookmarks || [])).catch(() => {});
    api.get<any>("/api/follows").then(d => setFollows(d.follows || [])).catch(() => {});
  }, [user, authLoading, router]);

  const saveProfile = async () => {
    try {
      await api.put("/api/auth/me", { name, bio });
      await refresh();
      setEditing(false);
      toast("個人資料已更新", "success");
    } catch { toast("更新失敗", "error"); }
  };

  if (authLoading || !user) return <div className="text-center py-20 text-stone-400">載入中...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile Card */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-8 border dark:border-stone-700 mb-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 rounded-full flex items-center justify-center text-3xl shadow-inner">{user.name?.[0] || "👤"}</div>
            <div>
              {editing ? (
                <div className="space-y-2">
                  <input value={name} onChange={e => setName(e.target.value)} className="px-3 py-1.5 rounded-lg border dark:border-stone-600 dark:bg-stone-700 text-lg font-bold" />
                  <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="自我介紹..." rows={2} className="w-full px-3 py-1.5 rounded-lg border dark:border-stone-600 dark:bg-stone-700 text-sm" />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="px-4 py-1.5 bg-amber-700 text-white rounded-lg text-sm hover:bg-amber-800">儲存</button>
                    <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-stone-200 dark:bg-stone-600 rounded-lg text-sm">取消</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold dark:text-stone-100">{user.name}</h1>
                  <p className="text-stone-500 dark:text-stone-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === "admin" ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400" : user.role === "editor" ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400" : "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300"}`}>
                      {user.role === "admin" ? "管理員" : user.role === "editor" ? "編輯者" : "一般用戶"}
                    </span>
                  </div>
                  {user.bio && <p className="text-stone-600 dark:text-stone-300 mt-2">{user.bio}</p>}
                </>
              )}
            </div>
          </div>
          {!editing && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="text-sm text-amber-700 dark:text-amber-400 hover:underline">編輯</button>
              <button onClick={() => { logout(); router.push("/"); }} className="text-sm text-red-500 hover:underline">登出</button>
            </div>
          )}
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t dark:border-stone-700">
          <div className="text-center"><p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{bookmarks.length}</p><p className="text-sm text-stone-500">收藏文章</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{follows.length}</p><p className="text-sm text-stone-500">追蹤部落</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-amber-700 dark:text-amber-400">0</p><p className="text-sm text-stone-500">測驗成績</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["info", "bookmarks", "follows"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === t ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
            {t === "info" ? "📋 基本資料" : t === "bookmarks" ? `📚 收藏 (${bookmarks.length})` : `🏘️ 追蹤 (${follows.length})`}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-6 border dark:border-stone-700">
        {tab === "info" && (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b dark:border-stone-700"><span className="text-stone-500">Email</span><span className="dark:text-stone-200">{user.email}</span></div>
            <div className="flex justify-between py-2 border-b dark:border-stone-700"><span className="text-stone-500">角色</span><span className="dark:text-stone-200">{user.role}</span></div>
            <div className="flex justify-between py-2 border-b dark:border-stone-700"><span className="text-stone-500">自介</span><span className="dark:text-stone-200">{user.bio || "尚未填寫"}</span></div>
          </div>
        )}
        {tab === "bookmarks" && (
          <div className="space-y-3">
            {bookmarks.length === 0 ? <p className="text-center text-stone-400 py-8">尚未收藏任何文章</p> :
              bookmarks.map(b => (
                <Link key={b.id} href={`/articles/${b.articleSlug || b.articleId}`} className="block p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition">
                  <h3 className="font-medium dark:text-stone-200">{b.articleTitle || `文章 #${b.articleId}`}</h3>
                </Link>
              ))
            }
          </div>
        )}
        {tab === "follows" && (
          <div className="space-y-3">
            {follows.length === 0 ? <p className="text-center text-stone-400 py-8">尚未追蹤任何部落</p> :
              follows.map(f => (
                <Link key={f.id} href={`/tribes/${f.tribeId}`} className="block p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition">
                  <h3 className="font-medium dark:text-stone-200">{f.tribeName || `部落 #${f.tribeId}`}</h3>
                </Link>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
