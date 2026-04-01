"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    loadNotifications();
  }, [user, authLoading, router]);

  const loadNotifications = async () => {
    try { const d = await api.get<any>("/api/notifications"); setNotifications(d.notifications || []); } catch {}
    setLoading(false);
  };

  const markAllRead = async () => {
    try { await api.put("/api/notifications/read-all", {}); loadNotifications(); } catch {}
  };

  const markRead = async (id: number) => {
    try { await api.put(`/api/notifications/${id}/read`, {}); loadNotifications(); } catch {}
  };

  const deleteNotif = async (id: number) => {
    try { await api.del(`/api/notifications/${id}`); loadNotifications(); } catch {}
  };

  const icons: Record<string, string> = { comment: "💬", like: "❤️", follow: "🏘️", article: "📝", system: "🔔" };

  if (authLoading || loading) return <div className="text-center py-20 text-stone-400">載入中...</div>;
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">🔔 通知</h1>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllRead} className="text-sm text-amber-700 dark:text-amber-400 hover:underline">全部標為已讀</button>
        )}
      </div>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-xl border transition flex items-start gap-3 ${n.read ? "bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700" : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"}`}>
            <span className="text-2xl">{icons[n.type] || "🔔"}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800 dark:text-stone-100">{n.title}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{n.message}</p>
              <p className="text-xs text-stone-400 mt-2">{new Date(n.createdAt).toLocaleDateString("zh-TW")}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-amber-700 dark:text-amber-400 hover:underline">已讀</button>}
              <button onClick={() => deleteNotif(n.id)} className="text-xs text-red-500 hover:underline ml-2">刪除</button>
            </div>
          </div>
        ))}
        {notifications.length === 0 && <div className="text-center py-20 text-stone-400">暫無通知</div>}
      </div>
    </div>
  );
}
