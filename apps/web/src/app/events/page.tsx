"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { GridSkeleton } from "@/components/ui/Skeleton";

const typeColors: Record<string, string> = {
  "祭典": "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
  "活動": "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
  "工作坊": "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
  "展覽": "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
  "其他": "bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300",
};

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Record<number, boolean>>({});
  const [regCounts, setRegCounts] = useState<Record<number, number>>({});
  const [registering, setRegistering] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    api.get<any>("/api/events").then(d => {
      setEvents(d.events || []);
      setLoading(false);
      // Check registration status for each event if logged in
      if (user) {
        (d.events || []).forEach((e: any) => {
          api.get<any>(`/api/registrations/check/${e.id}`).then(r => {
            setRegistrations(prev => ({ ...prev, [e.id]: r.registered }));
          }).catch(() => {});
        });
      }
      // Load registration counts
      (d.events || []).forEach((e: any) => {
        api.get<any>(`/api/registrations/events/${e.id}`).then(r => {
          setRegCounts(prev => ({ ...prev, [e.id]: r.count || 0 }));
        }).catch(() => {});
      });
    }).catch(() => setLoading(false));
  }, [user]);

  const handleRegister = async (eventId: number) => {
    if (!user) { toast("請先登入才能報名", "error"); return; }
    setRegistering(eventId);
    try {
      if (registrations[eventId]) {
        await api.del(`/api/registrations/events/${eventId}`);
        setRegistrations(prev => ({ ...prev, [eventId]: false }));
        setRegCounts(prev => ({ ...prev, [eventId]: Math.max(0, (prev[eventId] || 0) - 1) }));
        toast("已取消報名", "success");
      } else {
        await api.post(`/api/registrations/events/${eventId}`, {});
        setRegistrations(prev => ({ ...prev, [eventId]: true }));
        setRegCounts(prev => ({ ...prev, [eventId]: (prev[eventId] || 0) + 1 }));
        toast("報名成功！", "success");
      }
    } catch (e: any) { toast(e.message || "操作失敗", "error"); }
    setRegistering(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">🎉 活動祭典</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">卑南族的文化活動、祭典與工作坊</p>
        </div>
        {user && (
          <Link href="/profile" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">
            📋 我的報名
          </Link>
        )}
      </div>

      {loading ? <GridSkeleton count={6} /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e: any) => (
            <div key={e.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-6 border border-stone-100 dark:border-stone-700 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[e.type] || typeColors["其他"]}`}>{e.type}</span>
                {e.tribeName && <span className="text-xs text-stone-400">🏘️ {e.tribeName}</span>}
                {regCounts[e.id] > 0 && (
                  <span className="text-xs text-stone-400 ml-auto">👥 {regCounts[e.id]} 人報名</span>
                )}
              </div>
              <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">{e.title}</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-3 mb-4">{e.description}</p>
              <div className="border-t dark:border-stone-700 pt-3 space-y-1 text-sm text-stone-500 dark:text-stone-400">
                <p>📅 {e.startDate}{e.endDate && e.endDate !== e.startDate ? ` ~ ${e.endDate}` : ""}</p>
                {e.location && <p>📍 {e.location}</p>}
              </div>
              <div className="mt-4">
                <button onClick={() => handleRegister(e.id)} disabled={registering === e.id}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                    registrations[e.id]
                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100"
                      : "bg-amber-700 text-white hover:bg-amber-800"
                  } disabled:opacity-50`}>
                  {registering === e.id ? "處理中..." : registrations[e.id] ? "❌ 取消報名" : "✅ 立即報名"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
