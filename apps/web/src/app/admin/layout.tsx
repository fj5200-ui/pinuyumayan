"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";

/* ── Accordion menu structure ── */
const MENU_GROUPS = [
  {
    id: "content",
    label: "內容管理",
    items: [
      { href: "/admin/articles", label: "文章管理" },
      { href: "/admin/tribes", label: "部落管理" },
      { href: "/admin/vocabulary", label: "族語管理" },
      { href: "/admin/events", label: "活動管理" },
      { href: "/admin/media", label: "媒體管理" },
      { href: "/admin/cultural-sites", label: "景點管理" },
      { href: "/admin/map-markers", label: "地圖標記" },
    ],
  },
  {
    id: "community",
    label: "社群管理",
    items: [
      { href: "/admin/users", label: "會員管理" },
      { href: "/admin/comments", label: "留言管理" },
      { href: "/admin/discussions", label: "討論管理" },
      { href: "/admin/approval", label: "審核管理" },
    ],
  },
  {
    id: "appearance",
    label: "外觀設定",
    items: [
      { href: "/admin/appearance", label: "首頁與輪播" },
      { href: "/admin/settings", label: "系統設定" },
    ],
  },
  {
    id: "system",
    label: "系統工具",
    items: [
      { href: "/admin/feature-flags", label: "Feature Flags" },
      { href: "/admin/agents", label: "AI Agent" },
      { href: "/admin/ai-tools", label: "AI 工具" },
      { href: "/admin/revenue", label: "收入管理" },
      { href: "/admin/monitoring", label: "系統監控" },
      { href: "/admin/audit-logs", label: "操作日誌" },
      { href: "/admin/exports", label: "資料匯出" },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Auto-open the group containing current path
  const activeGroupId = MENU_GROUPS.find(g => g.items.some(i => pathname.startsWith(i.href)))?.id || "";
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ [activeGroupId]: true });

  useEffect(() => {
    if (activeGroupId) setOpenGroups(prev => ({ ...prev, [activeGroupId]: true }));
  }, [activeGroupId]);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      <div className="animate-spin w-8 h-8 border-4 border-[var(--red)] border-t-transparent rounded-full" />
    </div>
  );
  if (!user || !isAdmin) { router.push("/login"); return null; }

  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-[#f1f3f5] dark:bg-[#0a0a0a]">
      {/* ── Mobile toggle ── */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-5 right-5 z-50 w-12 h-12 flex items-center justify-center bg-[var(--black)] text-white rounded-full shadow-xl">
        {sidebarOpen ? "×" : "≡"}
      </button>

      {/* ── Sidebar ── */}
      <aside className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40
        ${collapsed ? "w-16" : "w-[260px]"}
        h-screen bg-[var(--black)] text-white
        transition-all duration-300 flex flex-col
      `}>
        {/* Admin header */}
        <div className={`shrink-0 border-b border-white/10 ${collapsed ? "px-2 py-4" : "px-5 py-5"}`}>
          {collapsed ? (
            <div className="w-8 h-8 mx-auto rounded bg-[var(--red)] flex items-center justify-center text-xs font-black">P</div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[var(--red)] flex items-center justify-center text-xs font-black shrink-0">P</div>
                <div className="min-w-0">
                  <h2 className="font-black text-sm tracking-wider">管理後台</h2>
                  <p className="text-[10px] text-white/40 truncate">{user.name} · {user.role}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dashboard link */}
        <div className={`shrink-0 ${collapsed ? "px-2 py-2" : "px-3 py-2"}`}>
          <Link href="/admin" onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2.5 rounded-md transition-all text-sm font-medium
              ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
              ${pathname === "/admin"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {!collapsed && "總覽"}
          </Link>
        </div>

        {/* Accordion nav */}
        <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"} pb-4 space-y-0.5`}
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          {MENU_GROUPS.map(group => {
            const isOpen = openGroups[group.id] ?? false;
            const hasActive = group.items.some(i => isActive(i.href));

            return (
              <div key={group.id}>
                {/* Group header */}
                <button onClick={() => !collapsed && toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between rounded-md transition-all
                    ${collapsed ? "justify-center px-2 py-2" : "px-3 py-2"}
                    ${hasActive ? "text-white" : "text-white/40 hover:text-white/70"}
                    text-[11px] font-bold uppercase tracking-wider mt-3 mb-0.5`}>
                  {!collapsed && <span>{group.label}</span>}
                  {!collapsed && <ChevronIcon open={isOpen} />}
                  {collapsed && (
                    <div className={`w-1.5 h-1.5 rounded-full ${hasActive ? "bg-[var(--red)]" : "bg-white/20"}`} />
                  )}
                </button>

                {/* Group items */}
                {(isOpen || collapsed) && (
                  <div className={`space-y-0.5 ${collapsed ? "" : "ml-1 border-l border-white/10 pl-2"}`}>
                    {group.items.map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 rounded-md text-[13px] font-medium transition-all
                          ${collapsed ? "justify-center px-2 py-2" : "px-3 py-2"}
                          ${isActive(item.href)
                            ? "bg-[var(--red)] text-white shadow-sm"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                          }`}
                        title={collapsed ? item.label : undefined}>
                        {collapsed ? (
                          <span className="text-[10px] leading-none">{item.label.charAt(0)}</span>
                        ) : (
                          item.label
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className={`shrink-0 border-t border-white/10 ${collapsed ? "px-2 py-3" : "px-4 py-3"} space-y-1`}>
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white/70 text-xs py-1 transition">
            <svg className={`w-3.5 h-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {!collapsed && "收合側邊欄"}
          </button>
          <Link href="/"
            className={`flex items-center justify-center gap-2 text-white/40 hover:text-white text-xs py-1 transition ${collapsed ? "" : ""}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!collapsed && "回到前台"}
          </Link>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Admin top bar */}
        <header className="shrink-0 h-14 bg-white dark:bg-[#111] border-b border-[var(--border)] dark:border-[#222] flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-[var(--text-main)] dark:text-gray-200">
              Pinuyumayan 管理系統
            </h1>
            <span className="text-[10px] px-2 py-0.5 bg-[rgba(153,27,27,0.06)] dark:bg-[#222] text-[var(--red)] dark:text-[var(--yellow)] rounded font-bold">
              v5.3
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-light)] hidden md:inline">
              {new Date().toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "short" })}
            </span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[var(--red)] flex items-center justify-center text-[10px] font-black text-white">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
              <span className="text-xs font-bold hidden sm:inline dark:text-gray-200">{user.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                user.role === "admin" ? "tag-red" : "tag-yellow"
              }`} style={{ fontSize: "10px" }}>{user.role}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
