"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, getUser, getToken, logout } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || !getToken()) { router.push("/login"); return; }
    setUser(u);
    api.get<any>("/api/auth/me").then(d => { setUser(d.user || d); }).catch(() => {});
    api.get<any>("/api/bookmarks").then(d => { setBookmarks(d.bookmarks || []); }).catch(() => {});
    setLoading(false);
  }, [router]);

  if (loading || !user) return <div className="text-center py-20 text-stone-400">載入中...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-8 border mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-2xl">{user.avatarUrl ? "👤" : "👤"}</div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-stone-500">{user.email}</p>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{user.role === "admin" ? "管理員" : user.role === "editor" ? "編輯者" : "一般用戶"}</span>
          </div>
        </div>
        {user.bio && <p className="text-stone-600 mb-4">{user.bio}</p>}
        <button onClick={() => { logout(); router.push("/"); }} className="text-red-600 text-sm hover:underline">登出帳號</button>
      </div>
      {bookmarks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-8 border">
          <h2 className="text-xl font-bold mb-4">📚 我的收藏</h2>
          <div className="space-y-3">
            {bookmarks.map((b: any) => (
              <a key={b.id} href={`/articles/${b.articleSlug || b.articleId}`} className="block p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition">
                <h3 className="font-medium">{b.articleTitle || `文章 #${b.articleId}`}</h3>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
