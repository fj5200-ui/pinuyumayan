"use client";
import { useState, useEffect, useRef } from "react";
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
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeroVisible(true); }, { threshold: 0.2 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

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

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" />
    </div>
  );

  const memberDays = user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const tabs: [string, string, string][] = [
    ["info", "📋", "基本資料"],
    ["bookmarks", "📚", `收藏 (${bookmarks.length})`],
    ["follows", "🏘️", `追蹤 (${follows.length})`],
    ["registrations", "🎉", `報名 (${registrations.length})`],
    ["learning", "📊", `學習${progress ? ` (${progress.learnedWords})` : ""}`],
    ["discussions", "💬", `發文 (${discussions.length})`],
    ["password", "🔒", "密碼"],
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Profile Hero */}
      <div ref={heroRef} className="bg-gradient-to-br from-amber-900 via-stone-800 to-stone-900 text-white">
        <div className={`max-w-4xl mx-auto px-4 py-12 md:py-16 transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full flex items-center justify-center text-4xl shadow-xl ring-4 ring-white/20">
                {user.name?.[0] || "👤"}
              </div>
              <span className={`absolute -bottom-1 -right-1 text-xs px-2 py-0.5 rounded-full font-bold ${user.role === "admin" ? "bg-red-500 text-white" : user.role === "editor" ? "bg-blue-500 text-white" : "bg-stone-500 text-white"}`}>
                {user.role === "admin" ? "管理員" : user.role === "editor" ? "編輯者" : "會員"}
              </span>
            </div>
            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-stone-400 mt-1">{user.email}</p>
              {user.bio && <p className="text-amber-200 mt-2 text-sm">{user.bio}</p>}
              <div className="flex items-center gap-4 mt-3 justify-center md:justify-start text-sm text-stone-400">
                <span>📅 加入 {memberDays} 天</span>
                {user.createdAt && <span>🗓️ {new Date(user.createdAt).toLocaleDateString("zh-TW")}</span>}
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setEditing(true); setTab("info"); }}
                className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl text-sm hover:bg-white/25 transition border border-white/20">
                ✏️ 編輯
              </button>
              <button onClick={() => { logout(); router.push("/"); }}
                className="px-4 py-2 bg-red-500/20 rounded-xl text-sm hover:bg-red-500/30 transition text-red-200 border border-red-400/20">
                🚪 登出
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className={`grid grid-cols-4 gap-4 mt-8 transition-all duration-700 delay-300 ${heroVisible ? "opacity-100" : "opacity-0"}`}>
            {[
              { icon: "📚", value: bookmarks.length, label: "收藏" },
              { icon: "🏘️", value: follows.length, label: "追蹤" },
              { icon: "🎉", value: registrations.length, label: "報名" },
              { icon: "📖", value: progress?.learnedWords || 0, label: "學會" },
            ].map((s, i) => (
              <div key={i} className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3 px-2">
                <p className="text-xl mb-0.5">{s.icon}</p>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <svg className="block w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,25 C360,0 720,40 1080,15 C1260,5 1380,25 1440,20 L1440,40 L0,40 Z" className="fill-stone-50 dark:fill-stone-900" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map(([t, icon, label]) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-3 py-2 rounded-xl font-medium text-sm transition whitespace-nowrap flex items-center gap-1.5 ${tab === t ? "bg-amber-700 text-white shadow-sm" : "bg-white dark:bg-stone-800 border dark:border-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border dark:border-stone-700 overflow-hidden">
          {/* ===== INFO TAB ===== */}
          {tab === "info" && (
            <div className="p-6">
              {editing ? (
                <div className="max-w-md space-y-4">
                  <h3 className="font-bold dark:text-stone-100 text-lg mb-4">✏️ 編輯個人資料</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 dark:text-stone-300">顯示名稱</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border dark:border-stone-600 dark:bg-stone-700 text-lg font-medium dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 dark:text-stone-300">自我介紹</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="分享你的故事..." rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-stone-600 dark:bg-stone-700 text-sm dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="px-6 py-2.5 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 transition">💾 儲存</button>
                    <button onClick={() => setEditing(false)} className="px-6 py-2.5 bg-stone-200 dark:bg-stone-600 rounded-xl text-sm dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-500 transition">取消</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-0 divide-y dark:divide-stone-700">
                  {[
                    { label: "Email", value: user.email, icon: "📧" },
                    { label: "顯示名稱", value: user.name, icon: "👤" },
                    { label: "角色", value: user.role === "admin" ? "管理員" : user.role === "editor" ? "編輯者" : "一般會員", icon: "🏷️" },
                    { label: "自我介紹", value: user.bio || "尚未填寫", icon: "📝" },
                    { label: "註冊日期", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-TW") : "-", icon: "📅" },
                    { label: "會員天數", value: `${memberDays} 天`, icon: "⏱️" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-4">
                      <span className="text-stone-500 dark:text-stone-400 text-sm flex items-center gap-2"><span>{item.icon}</span>{item.label}</span>
                      <span className="dark:text-stone-200 text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== BOOKMARKS TAB ===== */}
          {tab === "bookmarks" && (
            <div className="p-6">
              {bookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📚</p>
                  <p className="text-stone-500 dark:text-stone-400 mb-2">尚未收藏任何文章</p>
                  <Link href="/articles" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">瀏覽文章 →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map(b => (
                    <Link key={b.id} href={`/articles/${b.articleSlug || b.articleId}`}
                      className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-700 transition group">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-lg shrink-0">📄</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium dark:text-stone-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition truncate">{b.articleTitle || `文章 #${b.articleId}`}</h3>
                        {b.createdAt && <p className="text-xs text-stone-400 mt-0.5">收藏於 {new Date(b.createdAt).toLocaleDateString("zh-TW")}</p>}
                      </div>
                      <span className="text-stone-300 dark:text-stone-600 group-hover:text-amber-400 transition">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== FOLLOWS TAB ===== */}
          {tab === "follows" && (
            <div className="p-6">
              {follows.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🏘️</p>
                  <p className="text-stone-500 dark:text-stone-400 mb-2">尚未追蹤任何部落</p>
                  <Link href="/tribes" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">探索部落 →</Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {follows.map(f => (
                    <Link key={f.id} href={`/tribes/${f.tribeId}`}
                      className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-700 transition group">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-lg shrink-0">🏘️</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium dark:text-stone-200 group-hover:text-amber-700 truncate">{f.tribeName || `部落 #${f.tribeId}`}</h3>
                      </div>
                      <span className="text-stone-300 group-hover:text-amber-400 transition">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== REGISTRATIONS TAB ===== */}
          {tab === "registrations" && (
            <div className="p-6">
              {registrations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="text-stone-500 dark:text-stone-400 mb-2">尚未報名任何活動</p>
                  <Link href="/events" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">瀏覽活動 →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${r.status === "confirmed" ? "bg-green-100 dark:bg-green-900/30" : r.status === "cancelled" ? "bg-red-100 dark:bg-red-900/30" : "bg-yellow-100 dark:bg-yellow-900/30"}`}>
                          {r.status === "confirmed" ? "✅" : r.status === "cancelled" ? "❌" : "⏳"}
                        </div>
                        <div>
                          <h3 className="font-medium dark:text-stone-200">{r.eventTitle || `活動 #${r.eventId}`}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${r.status === "confirmed" ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" : r.status === "cancelled" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300"}`}>
                              {r.status === "confirmed" ? "已確認" : r.status === "cancelled" ? "已取消" : "待確認"}
                            </span>
                            <span>📅 {new Date(r.createdAt).toLocaleDateString("zh-TW")}</span>
                          </div>
                        </div>
                      </div>
                      {r.status !== "cancelled" && (
                        <button onClick={() => cancelReg(r.eventId)}
                          className="text-xs text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg transition hover:bg-red-100 dark:hover:bg-red-900/40">
                          取消報名
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== LEARNING TAB ===== */}
          {tab === "learning" && (
            <div className="p-6">
              {progress ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: "📖", value: progress.learnedWords, label: "已學詞彙", bg: "bg-amber-50 dark:bg-amber-900/20", color: "text-amber-700 dark:text-amber-400" },
                      { icon: "✅", value: `${progress.accuracy}%`, label: "正確率", bg: "bg-green-50 dark:bg-green-900/20", color: "text-green-700 dark:text-green-400" },
                      { icon: "🔥", value: `${progress.streak}`, label: "連續天數", bg: "bg-orange-50 dark:bg-orange-900/20", color: "text-orange-700 dark:text-orange-400" },
                      { icon: "🎯", value: progress.totalQuizzes, label: "總測驗", bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-700 dark:text-blue-400" },
                    ].map((s, i) => (
                      <div key={i} className={`text-center p-4 ${s.bg} rounded-xl`}>
                        <p className="text-lg mb-1">{s.icon}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-stone-500">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {progress.allBadges && (
                    <div>
                      <h3 className="font-bold dark:text-stone-100 mb-3 flex items-center gap-2">🏅 成就徽章</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {progress.allBadges.map((b: any) => (
                          <div key={b.id} className={`text-center p-3 rounded-xl border ${b.earned ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700" : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-40 grayscale"}`}>
                            <p className="text-2xl">{b.icon}</p>
                            <p className="text-xs font-bold dark:text-stone-200 mt-1">{b.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <Link href="/language/quiz" className="bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-amber-800 transition inline-block">🎯 繼續測驗</Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📊</p>
                  <p className="text-stone-500 dark:text-stone-400 mb-2">還沒有學習紀錄</p>
                  <Link href="/language" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">開始學習族語 →</Link>
                </div>
              )}
            </div>
          )}

          {/* ===== DISCUSSIONS TAB ===== */}
          {tab === "discussions" && (
            <div className="p-6">
              {discussions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-stone-500 dark:text-stone-400 mb-2">尚未發表任何貼文</p>
                  <Link href="/community" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">前往社群 →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {discussions.map(d => (
                    <div key={d.id} className="p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition">
                      <h3 className="font-medium dark:text-stone-200">{d.title}</h3>
                      <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 line-clamp-2">{d.content}</p>
                      <div className="flex gap-3 mt-2 text-xs text-stone-400">
                        <span>💬 {d.repliesCount || 0} 回覆</span>
                        <span>❤️ {d.likes || 0}</span>
                        <span>📅 {d.createdAt ? new Date(d.createdAt).toLocaleDateString("zh-TW") : ""}</span>
                        {d.board && <span className="bg-stone-200 dark:bg-stone-600 px-1.5 rounded">{d.board}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== PASSWORD TAB ===== */}
          {tab === "password" && (
            <div className="p-6">
              <form onSubmit={changePw} className="max-w-md space-y-4">
                <h3 className="font-bold dark:text-stone-100 text-lg mb-4 flex items-center gap-2">🔒 修改密碼</h3>
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-stone-300">目前密碼</label>
                  <input type="password" required value={oldPw} onChange={e => setOldPw(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-stone-300">新密碼</label>
                  <input type="password" required value={newPw} onChange={e => setNewPw(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-300" placeholder="至少6個字元" />
                  {newPw && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition ${newPw.length >= i * 3 ? (i >= 3 ? "bg-green-500" : i >= 2 ? "bg-amber-500" : "bg-red-500") : "bg-stone-200 dark:bg-stone-700"}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 dark:text-stone-300">確認新密碼</label>
                  <input type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 outline-none focus:ring-2 ${confirmPw && confirmPw === newPw ? "focus:ring-green-300 border-green-300" : "focus:ring-amber-300"}`} />
                  {confirmPw && confirmPw !== newPw && <p className="text-xs text-red-500 mt-1">密碼不一致</p>}
                </div>
                <button type="submit" disabled={pwLoading || !oldPw || !newPw || newPw !== confirmPw}
                  className="bg-amber-700 text-white px-6 py-2.5 rounded-xl hover:bg-amber-800 transition disabled:opacity-50 font-medium">
                  {pwLoading ? "更新中..." : "🔒 更新密碼"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
