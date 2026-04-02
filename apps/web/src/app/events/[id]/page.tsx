"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

const typeColors: Record<string, string> = {
  "祭典": "tag-red",
  "活動": "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
  "工作坊": "tag-green",
  "展覽": "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
  "其他": "bg-gray-100 dark:bg-[#222] text-[var(--text-main)] dark:text-[var(--text-light)]",
};

function getEventStatus(startDate: string, endDate?: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  if (now < start) {
    const days = Math.ceil((start.getTime() - now.getTime()) / 86400000);
    if (days <= 7) return { label: `${days} 天後開始`, color: "bg-[rgba(153,27,27,0.06)] dark:bg-[#222]/50 text-[var(--red)] dark:text-[var(--yellow)]" };
    return { label: "即將舉辦", color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" };
  }
  if (now >= start && now <= end) return { label: "進行中", color: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" };
  return { label: "已結束", color: "bg-gray-100 dark:bg-[#222] text-[var(--text-soft)] dark:text-[var(--text-light)]" };
}

function CountdownTimer({ startDate }: { startDate: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const start = new Date(startDate);
  const diff = start.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (days > 60) return null;
  return (
    <div className="bg-[var(--cream)] dark:bg-[#222] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-6 text-center">
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-light)" }}>倒數計時</p>
      <div className="flex justify-center gap-4">
        {[
          { value: days, label: "天" },
          { value: hours, label: "時" },
          { value: minutes, label: "分" },
          { value: seconds, label: "秒" },
        ].map(u => (
          <div key={u.label}>
            <p className="text-3xl font-black font-mono" style={{ color: "var(--red)" }}>{String(u.value).padStart(2, "0")}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-soft)" }}>{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [regCount, setRegCount] = useState(0);
  const [registering, setRegistering] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<any>(`/api/events/${id}`).catch(() => null),
      api.get<any>("/api/events").catch(() => ({ events: [] })),
    ]).then(([eventData, allEvents]) => {
      if (eventData?.event) {
        setEvent(eventData.event);
        const related = (allEvents.events || [])
          .filter((e: any) => e.id !== Number(id) && (e.type === eventData.event.type || e.tribeId === eventData.event.tribeId))
          .slice(0, 3);
        setRelatedEvents(related);
      }
      setLoading(false);
    });

    // Check registration status
    if (user) {
      api.get<any>(`/api/registrations/check/${id}`).then(r => setRegistered(r.registered)).catch(() => {});
    }
    api.get<any>(`/api/registrations/events/${id}`).then(r => setRegCount(r.count || 0)).catch(() => {});
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) { toast("請先登入才能報名", "error"); return; }
    setRegistering(true);
    try {
      if (registered) {
        await api.del(`/api/registrations/events/${id}`);
        setRegistered(false);
        setRegCount(prev => Math.max(0, prev - 1));
        toast("已取消報名", "success");
      } else {
        await api.post(`/api/registrations/events/${id}`, {});
        setRegistered(true);
        setRegCount(prev => prev + 1);
        toast("報名成功！", "success");
      }
    } catch (e: any) { toast(e.message || "操作失敗", "error"); }
    setRegistering(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">找不到此活動</h1>
        <p className="text-[var(--text-soft)] mb-6">活動可能已被移除或不存在</p>
        <Link href="/events" className="btn-brand">返回活動列表</Link>
      </div>
    );
  }

  const status = getEventStatus(event.startDate, event.endDate);
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const isEnded = status.label === "已結束";
  const durationDays = endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1 : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: "var(--text-light)" }}>
        <Link href="/" className="hover:text-[var(--red)] transition">首頁</Link>
        <span>/</span>
        <Link href="/events" className="hover:text-[var(--red)] transition">活動祭典</Link>
        <span>/</span>
        <span style={{ color: "var(--text-main)" }} className="dark:text-gray-200">{event.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${typeColors[event.type] || typeColors["其他"]}`}>
                {event.type}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${status.color}`}>
                {status.label}
              </span>
              {event.tribeName && (
                <Link href={`/tribes/${event.tribeId}`} className="text-xs px-2.5 py-1 rounded-full font-bold bg-[var(--cream)] dark:bg-[#222] text-[var(--text-soft)] hover:text-[var(--red)] transition">
                  {event.tribeName}
                </Link>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black mb-3">{event.title}</h1>

            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-soft)" }}>
              <span>{startDate.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}</span>
              {endDate && endDate.getTime() !== startDate.getTime() && (
                <>
                  <span>~</span>
                  <span>{endDate.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}</span>
                </>
              )}
              <span className="text-xs px-2 py-0.5 border border-[var(--border)] dark:border-[#333] rounded" style={{ color: "var(--text-light)" }}>
                {durationDays} 天
              </span>
            </div>
          </div>

          {/* Color bar */}
          <div className="color-bar-6" />

          {/* Description */}
          <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-6">
            <h2 className="font-bold text-lg mb-4 pb-3 border-b border-[var(--border)] dark:border-[#333]" style={{ color: "var(--text-main)" }}>
              活動說明
            </h2>
            <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Details grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-light)" }}>日期</p>
              <p className="font-bold dark:text-gray-100">
                {startDate.toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
                {endDate && endDate.getTime() !== startDate.getTime() && ` ~ ${endDate.toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}`}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-soft)" }}>
                {startDate.getFullYear()} 年
              </p>
            </div>

            {event.location && (
              <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-5">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-light)" }}>地點</p>
                <p className="font-bold dark:text-gray-100">{event.location}</p>
                {event.tribeRegion && <p className="text-sm mt-1" style={{ color: "var(--text-soft)" }}>{event.tribeRegion}</p>}
              </div>
            )}

            <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-light)" }}>類型</p>
              <p className="font-bold dark:text-gray-100">{event.type}</p>
              {event.tribeName && <p className="text-sm mt-1" style={{ color: "var(--text-soft)" }}>{event.tribeName} 主辦</p>}
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-light)" }}>報名人數</p>
              <p className="font-bold dark:text-gray-100">
                <span style={{ color: "var(--red)" }}>{regCount}</span> 人已報名
              </p>
            </div>
          </div>

          {/* Countdown */}
          {!isEnded && <CountdownTimer startDate={event.startDate} />}

          {/* Related events */}
          {relatedEvents.length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-4">相關活動</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {relatedEvents.map((e: any) => {
                  const s = getEventStatus(e.startDate, e.endDate);
                  return (
                    <Link key={e.id} href={`/events/${e.id}`}
                      className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-4 hover:shadow-md transition group">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${typeColors[e.type] || typeColors["其他"]}`}>{e.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.color}`}>{s.label}</span>
                      </div>
                      <h3 className="font-bold text-sm group-hover:text-[var(--red)] transition line-clamp-2">{e.title}</h3>
                      <p className="text-xs mt-2" style={{ color: "var(--text-light)" }}>
                        {new Date(e.startDate).toLocaleDateString("zh-TW", { month: "short", day: "numeric" })}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Register card */}
          <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] p-6 sticky top-20">
            <div className="text-center mb-4">
              <p className="text-3xl font-black" style={{ color: "var(--red)" }}>{regCount}</p>
              <p className="text-sm" style={{ color: "var(--text-soft)" }}>人已報名</p>
            </div>

            <button onClick={handleRegister} disabled={registering || isEnded}
              className={`w-full py-3 rounded-[var(--radius-md)] text-sm font-bold transition ${
                isEnded ? "bg-gray-100 dark:bg-[#222] text-[var(--text-light)] cursor-not-allowed" :
                registered
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40"
                  : "bg-[var(--red)] text-white hover:opacity-90"
              } disabled:opacity-50`}>
              {isEnded ? "活動已結束" : registering ? "處理中..." : registered ? "取消報名" : "立即報名"}
            </button>

            {!user && !isEnded && (
              <p className="text-xs text-center mt-3" style={{ color: "var(--text-light)" }}>
                <Link href="/login" className="font-bold hover:text-[var(--red)] transition" style={{ color: "var(--red)" }}>登入</Link> 後即可報名
              </p>
            )}

            <div className="border-t border-[var(--border)] dark:border-[#333] mt-4 pt-4 space-y-3 text-sm">
              <div>
                <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-light)" }}>日期</p>
                <p className="dark:text-gray-200">{startDate.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              {event.location && (
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-light)" }}>地點</p>
                  <p className="dark:text-gray-200">{event.location}</p>
                </div>
              )}
              {event.tribeName && (
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-light)" }}>主辦部落</p>
                  <Link href={`/tribes/${event.tribeId}`} className="hover:text-[var(--red)] transition dark:text-gray-200">{event.tribeName}</Link>
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border)] dark:border-[#333] mt-4 pt-4">
              <Link href="/events" className="text-sm font-bold block text-center hover:text-[var(--red)] transition" style={{ color: "var(--text-soft)" }}>
                ← 返回活動列表
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
