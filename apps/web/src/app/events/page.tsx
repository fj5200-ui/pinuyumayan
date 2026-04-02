"use client";
import { useEffect, useState, useMemo } from "react";
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
const typeIcons: Record<string, string> = {
  "祭典": "🔥", "活動": "🎊", "工作坊": "🛠️", "展覽": "🖼️", "其他": "📌",
};

function getEventStatus(startDate: string, endDate?: string): { label: string; color: string; icon: string } {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  if (now < start) {
    const days = Math.ceil((start.getTime() - now.getTime()) / 86400000);
    if (days <= 7) return { label: `${days} 天後開始`, color: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300", icon: "⏳" };
    return { label: "即將舉辦", color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300", icon: "📅" };
  }
  if (now >= start && now <= end) return { label: "進行中", color: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300", icon: "🟢" };
  return { label: "已結束", color: "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400", icon: "✅" };
}

function CountdownTimer({ startDate }: { startDate: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const start = new Date(startDate);
  const diff = start.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 30) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">
      <span>⏰</span>
      <span className="font-mono font-medium">
        {days > 0 && `${days}天 `}{hours}小時後開始
      </span>
    </div>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Record<number, boolean>>({});
  const [regCounts, setRegCounts] = useState<Record<number, number>>({});
  const [registering, setRegistering] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState("全部");
  const [statusFilter, setStatusFilter] = useState("全部");

  useEffect(() => {
    api.get<any>("/api/events").then(d => {
      setEvents(d.events || []);
      setLoading(false);
      if (user) {
        (d.events || []).forEach((e: any) => {
          api.get<any>(`/api/registrations/check/${e.id}`).then(r => {
            setRegistrations(prev => ({ ...prev, [e.id]: r.registered }));
          }).catch(() => {});
        });
      }
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

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (typeFilter !== "全部" && e.type !== typeFilter) return false;
      if (statusFilter !== "全部") {
        const status = getEventStatus(e.startDate, e.endDate);
        if (statusFilter === "即將舉辦" && !status.label.includes("天後") && status.label !== "即將舉辦") return false;
        if (statusFilter === "進行中" && status.label !== "進行中") return false;
        if (statusFilter === "已結束" && status.label !== "已結束") return false;
      }
      return true;
    });
  }, [events, typeFilter, statusFilter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return counts;
  }, [events]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">🎉 活動祭典</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">卑南族的文化活動、祭典與工作坊</p>
        </div>
        {user && (
          <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 border dark:border-stone-700 rounded-xl text-sm text-amber-700 dark:text-amber-400 hover:bg-stone-50 dark:hover:bg-stone-700 transition">
            📋 我的報名
          </Link>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "全部活動", count: events.length, icon: "📊" },
          { label: "即將/進行中", count: events.filter(e => { const s = getEventStatus(e.startDate, e.endDate); return s.label !== "已結束"; }).length, icon: "🟢" },
          { label: "已報名", count: Object.values(registrations).filter(Boolean).length, icon: "✅" },
          { label: "總報名人次", count: Object.values(regCounts).reduce((a, b) => a + b, 0), icon: "👥" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-stone-800 rounded-xl p-3 border dark:border-stone-700 text-center">
            <span className="text-lg">{s.icon}</span>
            <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">{s.count}</p>
            <p className="text-xs text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-stone-400 self-center mr-1">類型：</span>
        {["全部", ...Object.keys(typeColors)].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${typeFilter === t ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
            {t !== "全部" && <span className="mr-1">{typeIcons[t]}</span>}{t}
            {t !== "全部" && typeCounts[t] && <span className="ml-1 opacity-60">({typeCounts[t]})</span>}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-xs text-stone-400 self-center mr-1">狀態：</span>
        {["全部", "即將舉辦", "進行中", "已結束"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${statusFilter === s ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Results info */}
      <p className="text-sm text-stone-400 mb-4">
        顯示 {filteredEvents.length} 項活動
        {typeFilter !== "全部" && <span>（類型：{typeFilter}）</span>}
        {statusFilter !== "全部" && <span>（狀態：{statusFilter}）</span>}
      </p>

      {loading ? <GridSkeleton count={6} /> : filteredEvents.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-4">📭</div>
          <p>沒有符合條件的活動</p>
          <button onClick={() => { setTypeFilter("全部"); setStatusFilter("全部"); }} className="mt-4 text-amber-700 dark:text-amber-400 underline text-sm">清除篩選</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((e: any) => {
            const status = getEventStatus(e.startDate, e.endDate);
            return (
              <div key={e.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 hover:shadow-md transition overflow-hidden group">
                {/* Cover gradient */}
                <div className={`h-2 ${e.type === "祭典" ? "bg-gradient-to-r from-red-400 to-orange-400" : e.type === "活動" ? "bg-gradient-to-r from-blue-400 to-cyan-400" : e.type === "工作坊" ? "bg-gradient-to-r from-green-400 to-emerald-400" : "bg-gradient-to-r from-purple-400 to-pink-400"}`} />

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[e.type] || typeColors["其他"]}`}>
                      {typeIcons[e.type]} {e.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                    {regCounts[e.id] > 0 && (
                      <span className="text-xs text-stone-400 ml-auto">👥 {regCounts[e.id]}</span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">{e.title}</h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-2 mb-4">{e.description}</p>

                  <CountdownTimer startDate={e.startDate} />

                  <div className="border-t dark:border-stone-700 pt-3 mt-3 space-y-1 text-sm text-stone-500 dark:text-stone-400">
                    <p>📅 {e.startDate}{e.endDate && e.endDate !== e.startDate ? ` ~ ${e.endDate}` : ""}</p>
                    {e.location && <p>📍 {e.location}</p>}
                    {e.tribeName && <p>🏘️ {e.tribeName}</p>}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setSelectedEvent(e)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium border dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 transition">
                      📖 詳情
                    </button>
                    <button onClick={() => handleRegister(e.id)} disabled={registering === e.id || status.label === "已結束"}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                        status.label === "已結束" ? "bg-stone-100 dark:bg-stone-700 text-stone-400 cursor-not-allowed" :
                        registrations[e.id]
                          ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100"
                          : "bg-amber-700 text-white hover:bg-amber-800"
                      } disabled:opacity-50`}>
                      {status.label === "已結束" ? "已結束" : registering === e.id ? "處理中..." : registrations[e.id] ? "取消報名" : "立即報名"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white dark:bg-stone-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header gradient */}
            <div className={`h-3 rounded-t-2xl ${selectedEvent.type === "祭典" ? "bg-gradient-to-r from-red-400 to-orange-400" : selectedEvent.type === "活動" ? "bg-gradient-to-r from-blue-400 to-cyan-400" : "bg-gradient-to-r from-green-400 to-emerald-400"}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[selectedEvent.type] || typeColors["其他"]}`}>
                    {typeIcons[selectedEvent.type]} {selectedEvent.type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEventStatus(selectedEvent.startDate, selectedEvent.endDate).color}`}>
                    {getEventStatus(selectedEvent.startDate, selectedEvent.endDate).icon} {getEventStatus(selectedEvent.startDate, selectedEvent.endDate).label}
                  </span>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
              </div>

              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">{selectedEvent.title}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
                  <span className="text-lg">📅</span>
                  <div>
                    <p className="font-medium text-stone-700 dark:text-stone-200 text-sm">活動日期</p>
                    <p className="text-stone-500 dark:text-stone-400 text-sm">{selectedEvent.startDate}{selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate ? ` ~ ${selectedEvent.endDate}` : ""}</p>
                  </div>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
                    <span className="text-lg">📍</span>
                    <div>
                      <p className="font-medium text-stone-700 dark:text-stone-200 text-sm">活動地點</p>
                      <p className="text-stone-500 dark:text-stone-400 text-sm">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
                  <span className="text-lg">👥</span>
                  <div>
                    <p className="font-medium text-stone-700 dark:text-stone-200 text-sm">報名人數</p>
                    <p className="text-stone-500 dark:text-stone-400 text-sm">{regCounts[selectedEvent.id] || 0} 人已報名</p>
                  </div>
                </div>
              </div>

              <CountdownTimer startDate={selectedEvent.startDate} />

              <div className="mt-4 mb-6">
                <h3 className="font-bold text-stone-700 dark:text-stone-200 mb-2">活動說明</h3>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">{selectedEvent.description}</p>
              </div>

              <button onClick={() => { handleRegister(selectedEvent.id); }}
                disabled={registering === selectedEvent.id || getEventStatus(selectedEvent.startDate, selectedEvent.endDate).label === "已結束"}
                className={`w-full py-3 rounded-xl text-sm font-medium transition ${
                  getEventStatus(selectedEvent.startDate, selectedEvent.endDate).label === "已結束" ? "bg-stone-100 dark:bg-stone-700 text-stone-400 cursor-not-allowed" :
                  registrations[selectedEvent.id]
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 border border-red-200 hover:bg-red-100"
                    : "bg-amber-700 text-white hover:bg-amber-800"
                } disabled:opacity-50`}>
                {getEventStatus(selectedEvent.startDate, selectedEvent.endDate).label === "已結束" ? "活動已結束" :
                  registering === selectedEvent.id ? "處理中..." : registrations[selectedEvent.id] ? "❌ 取消報名" : "✅ 立即報名"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
