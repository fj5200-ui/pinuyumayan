"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { api } from "@/lib/api";

const DEFAULT_NAV = [
  { href: "/", label: "首頁" },
  { href: "/tribes", label: "部落" },
  { href: "/articles", label: "文化誌" },
  { href: "/language", label: "族語" },
  { href: "/events", label: "活動" },
  { href: "/cultural-sites", label: "景點" },
  { href: "/community", label: "社群" },
  { href: "/media", label: "媒體" },
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
  const [brand, setBrand] = useState("Pinuyumayan");
  const [NAV, setNAV] = useState(DEFAULT_NAV);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<any>("/api/admin/site-settings")
      .then(r => {
        if (r.settings?.headerBrand) setBrand(r.settings.headerBrand);
        if (r.settings?.headerNav?.length) setNAV(r.settings.headerNav);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get<any>("/api/notifications?unread=true").then(r => {
      setNotifCount(r.notifications?.filter((n: any) => !n.read)?.length || r.unreadCount || 0);
    }).catch(() => {});
  }, [user, pathname]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); setUserMenuOpen(false); }, [pathname]);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) { router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`); setSearchOpen(false); setSearchQ(""); }
  }, [searchQ, router]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(v => !v); }
      if (e.key === "Escape") { setSearchOpen(false); setUserMenuOpen(false); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Top color bar */}
      <div className="color-bar" />

      <header className={`navbar-solid ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-[1180px] w-[92%] mx-auto">
          <div className={`flex items-center justify-between transition-all ${scrolled ? "h-[60px]" : "h-[72px]"}`}>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="font-black text-xl tracking-wider" style={{ color: "var(--black)" }}>
                <span className="dark:text-gray-100">{brand}</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map(n => (
                <Link key={n.href} href={n.href}
                  className={`px-3 py-1.5 text-sm font-bold transition-all border-b-2 ${
                    isActive(n.href)
                      ? "border-[var(--red)] text-[var(--red)]"
                      : "border-transparent text-[var(--text-main)] dark:text-gray-300 hover:border-[var(--red)] hover:text-[var(--red)]"
                  }`}>
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* Desktop right */}
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)}
                className="px-2.5 py-1.5 text-sm text-[var(--text-soft)] hover:text-[var(--red)] transition flex items-center gap-1"
                title="搜尋 (⌘K)">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <span className="text-xs border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-light)] hidden xl:inline">⌘K</span>
              </button>

              <button onClick={toggle} className="px-2 py-1.5 text-sm text-[var(--text-soft)] hover:text-[var(--yellow)] transition" title="切換主題">
                {dark ? "☀" : "☽"}
              </button>

              {user ? (
                <>
                  <Link href="/notifications" className="px-2 py-1.5 relative text-[var(--text-soft)] hover:text-[var(--red)] transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 text-white text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center font-black px-0.5" style={{ background: "var(--red)" }}>
                        {notifCount > 9 ? "9+" : notifCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-bold text-[var(--text-main)] dark:text-gray-200 hover:text-[var(--red)] transition">
                      <span className="w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-black text-white" style={{ background: "var(--red)", borderRadius: "var(--radius-sm)" }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <span className="max-w-[72px] truncate hidden xl:inline">{user.name}</span>
                      <span className={`text-[10px] transition-transform ${userMenuOpen ? "rotate-180" : ""}`}>▾</span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] overflow-hidden shadow-lg animate-fade-in z-50">
                        <div className="p-3 border-b border-[var(--border)] dark:border-[#333]">
                          <p className="font-bold text-sm dark:text-gray-100">{user.name}</p>
                          <p className="text-xs text-[var(--text-soft)] truncate">{user.email}</p>
                          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-black ${user.role === "admin" ? "tag-red" : user.role === "editor" ? "tag-yellow" : "tag-green"}`} style={{ fontSize: "10px" }}>
                            {user.role}
                          </span>
                        </div>
                        <div className="py-1">
                          {[
                            { href: "/profile", label: "個人檔案" },
                            { href: "/notifications", label: "通知", badge: notifCount },
                          ].map(l => (
                            <Link key={l.href} href={l.href} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#222] transition">
                              {l.label}
                              {l.badge ? <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-black" style={{ background: "rgba(153,27,27,0.1)", color: "var(--red)" }}>{l.badge}</span> : null}
                            </Link>
                          ))}
                          {isAdmin && (
                            <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#222] transition" style={{ color: "var(--red)" }}>
                              管理後台
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-[var(--border)] dark:border-[#333] py-1">
                          <button onClick={() => { logout(); setUserMenuOpen(false); window.location.href = "/"; }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-soft)] hover:text-[var(--red)] transition w-full text-left">
                            登出
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm font-bold text-[var(--text-soft)] hover:text-[var(--red)] transition px-2 py-1">登入</Link>
                  <Link href="/register" className="btn-brand text-sm !min-h-[34px] !px-4" style={{ borderRadius: "var(--radius-sm)" }}>註冊</Link>
                </div>
              )}
            </div>

            {/* Mobile right */}
            <div className="lg:hidden flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-[var(--text-soft)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>
              <button onClick={toggle} className="p-2 text-[var(--text-soft)]">{dark ? "☀️" : "🌙"}</button>
              {user && (
                <Link href="/notifications" className="p-2 relative text-[var(--text-soft)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                  {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black" style={{ background: "var(--red)" }}>{notifCount > 9 ? "9+" : notifCount}</span>}
                </Link>
              )}
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-[var(--text-main)] dark:text-gray-200">
                <span className="text-xl font-black">{menuOpen ? "×" : "≡"}</span>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <div className="lg:hidden pb-4 border-t border-[var(--border)] dark:border-[#333] mt-1 pt-3 animate-fade-in space-y-0.5">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-bold transition rounded-[var(--radius-sm)] ${
                    isActive(n.href)
                      ? "bg-[rgba(153,27,27,0.06)] text-[var(--red)] border-l-4 border-[var(--red)]"
                      : "text-[var(--text-main)] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222]"
                  }`}>
                  {n.label}
                </Link>
              ))}
              <div className="border-t border-[var(--border)] dark:border-[#333] mt-3 pt-3 space-y-0.5">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 flex items-center justify-center text-[10px] font-black text-white rounded-sm" style={{ background: "var(--red)" }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <span className="font-bold dark:text-gray-100">{user.name}</span>
                      <span className="tag-red ml-1" style={{ fontSize: "10px" }}>{user.role}</span>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#222] rounded-[var(--radius-sm)] transition">個人檔案</Link>
                    {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#222] rounded-[var(--radius-sm)] transition" style={{ color: "var(--red)" }}>管理後台</Link>}
                    <button onClick={() => { logout(); setMenuOpen(false); window.location.href = "/"; }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-soft)] hover:text-[var(--red)] transition w-full text-left rounded-[var(--radius-sm)]">
                      登出
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-4">
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center btn-glass !min-h-[38px] text-sm">登入</Link>
                    <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center btn-brand !min-h-[38px] text-sm">註冊</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-start justify-center pt-[18vh] px-4 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <div className="bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] w-full max-w-lg overflow-hidden shadow-xl" style={{ borderRadius: "var(--radius-md)" }}>
            <form onSubmit={handleSearch} className="flex items-center gap-3 p-4 border-b border-[var(--border)] dark:border-[#333]">
              <svg className="w-5 h-5 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input ref={searchRef} type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="搜尋文章、部落、詞彙..."
                className="flex-1 bg-transparent outline-none text-base placeholder:text-[var(--text-light)] dark:text-gray-100" />
              <kbd className="hidden sm:inline text-[10px] border border-[var(--border)] dark:border-[#444] text-[var(--text-light)] px-1.5 py-0.5 rounded font-mono">ESC</kbd>
            </form>
            <div className="p-4 space-y-0.5">
              <p className="text-[11px] text-[var(--text-light)] mb-2 font-bold uppercase tracking-wider">快速前往</p>
              {[
                { href: "/tribes", label: "部落巡禮" },
                { href: "/articles", label: "文化誌" },
                { href: "/language", label: "族語學習" },
                { href: "/language/quiz", label: "族語測驗" },
                { href: "/events", label: "活動祭典" },
                { href: "/cultural-sites", label: "文化景點" },
              ].map(q => (
                <Link key={q.href} href={q.href} onClick={() => setSearchOpen(false)}
                  className="flex items-center px-3 py-2 rounded-[var(--radius-sm)] hover:bg-gray-50 dark:hover:bg-[#222] text-sm font-medium transition">
                  {q.label} <span className="ml-auto text-[var(--text-light)]">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
