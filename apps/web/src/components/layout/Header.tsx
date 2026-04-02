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

  // Track scroll for compact header
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Fetch notification count
  useEffect(() => {
    if (!user) return;
    api.get<any>("/api/notifications?unread=true").then(r => {
      setNotifCount(r.notifications?.filter((n: any) => !n.read)?.length || r.unreadCount || 0);
    }).catch(() => {});
  }, [user, pathname]);

  // Close menus on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); setUserMenuOpen(false); }, [pathname]);

  // Focus search input when opened
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  }, [searchQ, router]);

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
      if (e.key === "Escape") { setSearchOpen(false); setUserMenuOpen(false); }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className={`bg-gradient-to-r from-amber-800 via-amber-700 to-orange-700 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 text-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-xl" : "shadow-lg"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex items-center justify-between transition-all ${scrolled ? "h-14" : "h-16"}`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-wide shrink-0 group">
              <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🌾</span>
              <span className="hidden sm:inline">Pinuyumayan</span>
              <span className="sm:hidden">卑南族</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV.map(n => (
                <Link key={n.href} href={n.href}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(n.href)
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}>
                  <span className="mr-1">{n.icon}</span>{n.label}
                  {isActive(n.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-1.5">
              {/* Search button */}
              <button onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition text-white/80 hover:text-white flex items-center gap-1"
                title="搜尋 (⌘K)">
                🔍 <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded hidden xl:inline">⌘K</span>
              </button>

              {/* Theme toggle */}
              <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/10 transition text-white/80 hover:text-white" title="切換主題">
                {dark ? "☀️" : "🌙"}
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <Link href="/notifications" className="p-2 rounded-lg hover:bg-white/10 transition relative text-white/80 hover:text-white">
                    🔔
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-bounce">
                        {notifCount > 9 ? "9+" : notifCount}
                      </span>
                    )}
                  </Link>

                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 bg-white/10 pl-3 pr-2 py-1.5 rounded-lg hover:bg-white/20 transition text-sm">
                      <span className="w-6 h-6 rounded-full bg-amber-400 dark:bg-amber-600 flex items-center justify-center text-xs font-bold text-white">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <span className="max-w-[80px] truncate">{user.name}</span>
                      <span className={`text-xs transition-transform ${userMenuOpen ? "rotate-180" : ""}`}>▾</span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-stone-800 rounded-xl shadow-2xl border dark:border-stone-700 overflow-hidden animate-fade-in z-50">
                        <div className="p-3 border-b dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80">
                          <p className="font-medium text-stone-800 dark:text-stone-200 text-sm">{user.name}</p>
                          <p className="text-xs text-stone-400 truncate">{user.email}</p>
                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : user.role === "editor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400"}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition">
                            <span>👤</span> 個人檔案
                          </Link>
                          <Link href="/notifications" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition">
                            <span>🔔</span> 通知 {notifCount > 0 && <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs px-1.5 py-0.5 rounded-full">{notifCount}</span>}
                          </Link>
                          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition">
                            <span>📚</span> 我的書籤
                          </Link>
                          {isAdmin && (
                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition font-medium">
                              <span>⚙️</span> 管理後台
                            </Link>
                          )}
                        </div>
                        <div className="border-t dark:border-stone-700 py-1">
                          <button onClick={() => { logout(); setUserMenuOpen(false); window.location.href = "/"; }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-500 hover:text-red-600 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition w-full text-left">
                            <span>🚪</span> 登出
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm text-white/80 hover:text-white transition px-3 py-1.5">登入</Link>
                  <Link href="/register" className="bg-white/20 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-white/30 transition backdrop-blur-sm">註冊</Link>
                </div>
              )}
            </div>

            {/* Mobile right */}
            <div className="lg:hidden flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-white/80 hover:text-white">🔍</button>
              <button onClick={toggle} className="p-2 text-white/80 hover:text-white">{dark ? "☀️" : "🌙"}</button>
              {user && (
                <Link href="/notifications" className="p-2 relative text-white/80 hover:text-white">
                  🔔
                  {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{notifCount > 9 ? "9+" : notifCount}</span>}
                </Link>
              )}
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-white">
                <span className="text-2xl">{menuOpen ? "✕" : "☰"}</span>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <div className="lg:hidden pb-4 border-t border-white/20 mt-1 pt-3 animate-fade-in space-y-1">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${isActive(n.href) ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"}`}>
                  <span className="text-lg">{n.icon}</span> {n.label}
                </Link>
              ))}
              <div className="border-t border-white/20 mt-3 pt-3 space-y-1">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-2 text-sm">
                      <span className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <div>
                        <span className="font-medium">{user.name}</span>
                        <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded">{user.role}</span>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg">👤 個人檔案</Link>
                    <Link href="/notifications" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg">
                      🔔 通知 {notifCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">{notifCount}</span>}
                    </Link>
                    {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-yellow-300 hover:bg-white/10 rounded-lg font-medium">⚙️ 管理後台</Link>}
                    <button onClick={() => { logout(); setMenuOpen(false); window.location.href = "/"; }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg w-full text-left">
                      🚪 登出
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3 px-4">
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center bg-white/20 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition">登入</Link>
                    <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center bg-white py-2 rounded-lg text-sm font-medium text-amber-800 hover:bg-amber-50 transition">註冊</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <form onSubmit={handleSearch} className="flex items-center gap-3 p-4 border-b dark:border-stone-700">
              <span className="text-xl">🔍</span>
              <input ref={searchRef} type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="搜尋文章、部落、詞彙..."
                className="flex-1 bg-transparent outline-none text-lg text-stone-800 dark:text-stone-100 placeholder:text-stone-400" />
              <kbd className="hidden sm:inline text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-1 rounded">ESC</kbd>
            </form>
            <div className="p-4 space-y-2">
              <p className="text-xs text-stone-400 mb-2">快速前往</p>
              {[
                { href: "/tribes", label: "🏘️ 部落巡禮" },
                { href: "/articles", label: "📝 文化誌" },
                { href: "/language", label: "📖 族語學習" },
                { href: "/language/quiz", label: "🎯 族語測驗" },
                { href: "/events", label: "🎉 活動祭典" },
                { href: "/cultural-sites", label: "🏺 文化景點" },
              ].map(q => (
                <Link key={q.href} href={q.href} onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-sm text-stone-600 dark:text-stone-300 transition">
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
