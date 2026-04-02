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
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [tab, setTab] = useState<"info" | "bookmarks" | "follows" | "registrations" | "learning" | "discussions" | "password">("info");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    setName(user.name || ""); setBio(user.bio || "");
    api.get<any>("/api/bookmarks").then(d => setBookmarks(d.bookmarks || [])).catch(() => {});
    api.get<any>("/api/follows").then(d => setFollows(d.follows || [])).catch(() => {});
    api.get<any>("/api/registrations/my").then(d => setRegistrations(d.registrations || [])).catch(() => {});
    api.get<any>("/api/learning/progress").then(d => setProgress(d)).catch(() => {});
    api.get<any>("/api/discussions").then(d => {
      const all = d.discussions || [];
      setDiscussions(all.filter((p: any) => p.authorId === user.id || p.userId === user.id).slice(0, 20));
    }).catch(() => {});
  }, [user, authLoading, router]);

  const saveProfile = async () => {
    try { await api.put("/api/auth/me", { name, bio }); await refresh(); setEditing(false); toast("個人資料已更新", "success"); }
    catch { toast("更新失敗", "error"); }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast("新密碼不一致", "error"); return; }
    if (newPw.length < 6) { toast("新密碼至少6個字元", "error"); return; }
    setPwLoading(true);
    try {
      await api.post("/api/auth/change-password", { oldPassword: oldPw, newPassword: newPw });
      toast("密碼已更新", "success"); setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch (e: any) { toast(e.message || "密碼更新失敗", "error"); }
    setPwLoading(false);
  };

  const cancelReg = async (eventId: number) => {
    try {
      await api.del(`/api/registrations/events/${eventId}`);
      setRegistrations(prev => prev.filter(r => r.eventId !== eventId));
      toast("已取消報名", "success");
    } catch { toast("取消失敗", "error"); }
  };

  if (authLoading || !user) return <div className="text-center py-20 text-stone-400">載入中...</div>;

  const tabs: [string, string][] = [
    ["info", "📋 基本資料"],
    ["bookmarks", `📚 收藏 (${bookmarks.length})`],
    ["follows", `🏘️ 追蹤 (${follows.length})`],
    ["registrations", `🎉 報名 (${registrations.length})`],
    ["learning", `📊 學習${progress ? ` (${progress.learnedWords})` : ""}`],
    ["discussions", `💬 我的發文 (${discussions.length})`],
    ["password", "🔒 密碼"],
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile Card */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-8 border dark:border-stone-700 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 rounded-full flex items-center justify-center text-3xl shadow-inner">{user.name?.[0] || "👤"}</div>
            <div>
              {editing ? (
                <div className="space-y-2">
                  <input value={name} onChange={e => setName(e.target.value)} className="px-3 py-1.5 rounded-lg border dark:border-stone-600 dark:bg-stone-700 text-lg font-bold dark:text-stone-100" />
                  <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="自我介紹..." rows={2} className="w-full px-3 py-1.5 rounded-lg border dark:border-stone-600 dark:bg-stone-700 text-sm dark:text-stone-100" />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="px-4 py-1.5 bg-amber-700 text-white rounded-lg text-sm hover:bg-amber-800">儲存</button>
                    <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-stone-200 dark:bg-stone-600 rounded-lg text-sm dark:text-stone-200">取消</button>
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
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t dark:border-stone-700">
          <div className="text-center"><p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{bookmarks.length}</p><p className="text-sm text-stone-500">收藏</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{follows.length}</p><p className="text-sm text-stone-500">追蹤</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{registrations.length}</p><p className="text-sm text-stone-500">報名</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{progress?.learnedWords || 0}</p><p className="text-sm text-stone-500">學會</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(([t, label]) => (
          <button key={t} onClick={() => setTab(t as any)} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === t ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-6 border dark:border-stone-700">
        {tab === "info" && (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b dark:border-stone-700"><span className="text-stone-500">Email</span><span className="dark:text-stone-200">{user.email}</span></div>
            <div className="flex justify-between py-2 border-b dark:border-stone-700"><span className="text-stone-500">角色</span><span className="dark:text-stone-200">{user.role}</span></div>
            <div className="flex justify-between py-2 border-b dark:border-stone-700"><span className="text-stone-500">自介</span><span className="dark:text-stone-200">{user.bio || "尚未填寫"}</span></div>
            <div className="flex justify-between py-2"><span className="text-stone-500">註冊日期</span><span className="dark:text-stone-200">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-TW") : "-"}</span></div>
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
                  <h3 className="font-medium dark:text-stone-200">🏘️ {f.tribeName || `部落 #${f.tribeId}`}</h3>
                </Link>
              ))
            }
          </div>
        )}

        {tab === "registrations" && (
          <div className="space-y-3">
            {registrations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-400 mb-2">尚未報名任何活動</p>
                <Link href="/events" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">瀏覽活動 →</Link>
              </div>
            ) : registrations.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
                <div>
                  <h3 className="font-medium dark:text-stone-200">🎉 活動 #{r.eventId}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${r.status === "confirmed" ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" : r.status === "cancelled" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300"}`}>
                      {r.status === "confirmed" ? "已確認" : r.status === "cancelled" ? "已取消" : "待確認"}
                    </span>
                    <span>📅 {new Date(r.createdAt).toLocaleDateString("zh-TW")}</span>
                  </div>
                </div>
                {r.status !== "cancelled" && (
                  <button onClick={() => cancelReg(r.eventId)} className="text-xs text-red-500 hover:underline">取消報名</button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "learning" && (
          <div>
            {progress ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{progress.learnedWords}</p>
                    <p className="text-xs text-stone-500">已學詞彙</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{progress.accuracy}%</p>
                    <p className="text-xs text-stone-500">正確率</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{progress.streak}🔥</p>
                    <p className="text-xs text-stone-500">連續天數</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{progress.totalQuizzes}</p>
                    <p className="text-xs text-stone-500">總測驗</p>
                  </div>
                </div>
                {/* Badges */}
                {progress.allBadges && (
                  <div>
                    <h3 className="font-bold dark:text-stone-100 mb-3">🏅 成就徽章</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {progress.allBadges.map((b: any) => (
                        <div key={b.id} className={`text-center p-3 rounded-xl border ${b.earned ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700" : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-40"}`}>
                          <p className="text-2xl">{b.icon}</p>
                          <p className="text-xs font-bold dark:text-stone-200 mt-1">{b.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <Link href="/language/quiz" className="bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-amber-800 transition inline-block">🎯 開始測驗</Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-stone-400 mb-2">還沒有學習紀錄</p>
                <Link href="/language" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">開始學習族語 →</Link>
              </div>
            )}
          </div>
        )}

        {tab === "discussions" && (
          <div className="space-y-3">
            {discussions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-400 mb-2">尚未發表任何貼文</p>
                <Link href="/community" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">前往社群 →</Link>
              </div>
            ) : discussions.map(d => (
              <div key={d.id} className="p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
                <h3 className="font-medium dark:text-stone-200">{d.title}</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 line-clamp-2">{d.content}</p>
                <div className="flex gap-3 mt-2 text-xs text-stone-400">
                  <span>💬 {d.repliesCount || 0} 回覆</span>
                  <span>❤️ {d.likes || 0}</span>
                  <span>📅 {d.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "password" && (
          <form onSubmit={changePw} className="max-w-md space-y-4">
            <h3 className="font-bold dark:text-stone-100 mb-4">🔒 修改密碼</h3>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-stone-300">目前密碼</label>
              <input type="password" required value={oldPw} onChange={e => setOldPw(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-stone-300">新密碼</label>
              <input type="password" required value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" placeholder="至少6個字元" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-stone-300">確認新密碼</label>
              <input type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" />
            </div>
            <button type="submit" disabled={pwLoading} className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition disabled:opacity-50">
              {pwLoading ? "更新中..." : "更新密碼"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
