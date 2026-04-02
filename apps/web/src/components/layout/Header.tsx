"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { api } from "@/lib/api";

const NAV = [
  { href: "/", label: "首頁", icon: "🏠" },
  { href: "/tribes", label: "部落", icon: "🏘️" },
  { href: "/articles", label: "文化誌", icon: "📝" },
  { href: "/language", label: "族語", icon: "📖" },
  { href: "/events", label: "活動", icon: "🎉" },
  { href: "/cultural-sites", label: "景點", icon: "🏺" },
  { href: "/community", label: "社群", icon: "💬" },
  { href: "/media", label: "媒體", icon: "🎬" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get<any>("/api/notifications?unread=true").then(r => {
      setNotifCount(r.notifications?.filter((n: any) => !n.read)?.length || r.unreadCount || 0);
    }).catch(() => {});
  }, [user, pathname]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); setUserMenuOpen(false); }, [pathname]);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  }, [searchQ, router]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(v => !v); }
      if (e.key === "Escape") { setSearchOpen(false); setUserMenuOpen(false); }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className={`navbar-glass transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className={`flex items-center justify-between transition-all ${scrolled ? "h-14" : "h-[68px]"}`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-wide shrink-0 group">
              <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🌾</span>
              <span className="hidden sm:inline bg-gradient-to-r from-[var(--red)] via-[var(--yellow)] to-[var(--green)] bg-clip-text text-transparent">Pinuyumayan</span>
              <span className="sm:hidden text-[var(--red)] font-black">卑南族</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map(n => (
                <Link key={n.href} href={n.href}
                  className={`relative px-3 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive(n.href)
                      ? "text-[var(--green)] bg-[rgba(34,197,94,0.12)]"
                      : "text-[var(--text-main)] dark:text-stone-300 hover:bg-[rgba(245,158,11,0.12)] hover:text-[var(--green)]"
                  }`}>
                  <span className="mr-1">{n.icon}</span>{n.label}
                  {isActive(n.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full" style={{ background: "var(--gradient-brand)" }} />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-[rgba(245,158,11,0.1)] transition text-[var(--text-soft)] hover:text-[var(--yellow)] flex items-center gap-1"
                title="搜尋 (⌘K)">
                🔍 <span className="text-xs bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded hidden xl:inline text-stone-400">⌘K</span>
              </button>

              <button onClick={toggle} className="p-2 rounded-full hover:bg-[rgba(245,158,11,0.1)] transition text-[var(--text-soft)]" title="切換主題">
                {dark ? "☀️" : "🌙"}
              </button>

              {user ? (
                <>
                  <Link href="/notifications" className="p-2 rounded-full hover:bg-[rgba(245,158,11,0.1)] transition relative text-[var(--text-soft)]">
                    🔔
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 text-white text-xs min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-bounce" style={{ background: "var(--red)" }}>
                        {notifCount > 9 ? "9+" : notifCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[rgba(245,158,11,0.1)] transition text-sm font-bold text-[var(--text-main)] dark:text-stone-200">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: "var(--gradient-brand)" }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <span className="max-w-[80px] truncate hidden xl:inline">{user.name}</span>
                      <span className={`text-xs transition-transform ${userMenuOpen ? "rotate-180" : ""}`}>▾</span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 glass overflow-hidden animate-fade-in z-50" style={{ borderRadius: "var(--radius-lg)" }}>
                        <div className="p-3 border-b border-white/20 dark:border-stone-700">
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-xs text-[var(--text-soft)] truncate">{user.email}</p>
                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold ${user.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : user.role === "editor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400"}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[rgba(245,158,11,0.1)] transition">
                            <span>👤</span> 個人檔案
                          </Link>
                          <Link href="/notifications" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[rgba(245,158,11,0.1)] transition">
                            <span>🔔</span> 通知 {notifCount > 0 && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(185,28,28,0.1)", color: "var(--red)" }}>{notifCount}</span>}
                          </Link>
                          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[rgba(245,158,11,0.1)] transition">
                            <span>📚</span> 我的書籤
                          </Link>
                          {isAdmin && (
                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-[rgba(185,28,28,0.1)] transition" style={{ color: "var(--red)" }}>
                              <span>⚙️</span> 管理後台
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-white/20 dark:border-stone-700 py-1">
                          <button onClick={() => { logout(); setUserMenuOpen(false); window.location.href = "/"; }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-soft)] hover:text-[var(--red)] hover:bg-[rgba(185,28,28,0.06)] transition w-full text-left">
                            <span>🚪</span> 登出
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm font-bold text-[var(--text-soft)] hover:text-[var(--green)] transition px-3 py-1.5">登入</Link>
                  <Link href="/register" className="btn-brand text-sm !min-h-[36px] !px-5 !rounded-full">註冊</Link>
                </div>
              )}
            </div>

            {/* Mobile right */}
            <div className="lg:hidden flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-[var(--text-soft)]">🔍</button>
              <button onClick={toggle} className="p-2 text-[var(--text-soft)]">{dark ? "☀️" : "🌙"}</button>
              {user && (
                <Link href="/notifications" className="p-2 relative text-[var(--text-soft)]">
                  🔔
                  {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ background: "var(--red)" }}>{notifCount > 9 ? "9+" : notifCount}</span>}
                </Link>
              )}
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-[var(--text-main)] dark:text-stone-200">
                <span className="text-2xl font-bold">{menuOpen ? "✕" : "☰"}</span>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <div className="lg:hidden pb-4 border-t border-white/20 dark:border-stone-700 mt-1 pt-3 animate-fade-in space-y-1">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition ${isActive(n.href) ? "bg-[rgba(34,197,94,0.12)] text-[var(--green)]" : "text-[var(--text-main)] dark:text-stone-300 hover:bg-[rgba(245,158,11,0.1)]"}`}>
                  <span className="text-lg">{n.icon}</span> {n.label}
                </Link>
              ))}
              <div className="border-t border-white/20 dark:border-stone-700 mt-3 pt-3 space-y-1">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-2 text-sm">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: "var(--gradient-brand)" }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <div>
                        <span className="font-bold">{user.name}</span>
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "var(--yellow)" }}>{user.role}</span>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[rgba(245,158,11,0.1)] rounded-xl transition">👤 個人檔案</Link>
                    <Link href="/notifications" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[rgba(245,158,11,0.1)] rounded-xl transition">
                      🔔 通知 {notifCount > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full ml-1 text-white" style={{ background: "var(--red)" }}>{notifCount}</span>}
                    </Link>
                    {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-bold hover:bg-[rgba(185,28,28,0.08)] rounded-xl transition" style={{ color: "var(--red)" }}>⚙️ 管理後台</Link>}
                    <button onClick={() => { logout(); setMenuOpen(false); window.location.href = "/"; }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-soft)] hover:text-[var(--red)] hover:bg-[rgba(185,28,28,0.06)] rounded-xl transition w-full text-left">
                      🚪 登出
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3 px-4">
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center btn-glass !min-h-[40px] text-sm">登入</Link>
                    <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center btn-brand !min-h-[40px] text-sm">註冊</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <div className="glass w-full max-w-lg overflow-hidden" style={{ borderRadius: "var(--radius-xl)" }}>
            <form onSubmit={handleSearch} className="flex items-center gap-3 p-4 border-b border-white/20 dark:border-stone-700">
              <span className="text-xl">🔍</span>
              <input ref={searchRef} type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="搜尋文章、部落、詞彙..."
                className="flex-1 bg-transparent outline-none text-lg placeholder:text-[var(--text-soft)]" />
              <kbd className="hidden sm:inline text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-lg">ESC</kbd>
            </form>
            <div className="p-4 space-y-1">
              <p className="text-xs text-[var(--text-soft)] mb-2 font-bold">快速前往</p>
              {[
                { href: "/tribes", label: "🏘️ 部落巡禮" },
                { href: "/articles", label: "📝 文化誌" },
                { href: "/language", label: "📖 族語學習" },
                { href: "/language/quiz", label: "🎯 族語測驗" },
                { href: "/events", label: "🎉 活動祭典" },
                { href: "/cultural-sites", label: "🏺 文化景點" },
              ].map(q => (
                <Link key={q.href} href={q.href} onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[rgba(245,158,11,0.1)] text-sm font-medium transition">
                  {q.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
