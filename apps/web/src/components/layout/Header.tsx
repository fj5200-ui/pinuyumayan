"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getUser, logout } from "@/lib/api";

const NAV = [
  { href: "/", label: "首頁", icon: "🏠" },
  { href: "/tribes", label: "部落", icon: "🏘️" },
  { href: "/articles", label: "文化誌", icon: "📝" },
  { href: "/language", label: "族語", icon: "📖" },
  { href: "/events", label: "活動", icon: "🎉" },
  { href: "/media", label: "媒體", icon: "🎬" },
  { href: "/about", label: "關於", icon: "ℹ️" },
];

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setUser(getUser()); }, []);

  return (
    <header className="bg-gradient-to-r from-amber-800 via-amber-700 to-orange-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-wide">
            <span className="text-2xl">🌾</span>
            <span>Pinuyumayan</span>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === n.href ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}>
                <span className="mr-1">{n.icon}</span>{n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/search" className="p-2 rounded-lg hover:bg-white/10 transition">🔍</Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="text-sm bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20">{user.name}</Link>
                {user.role === "admin" && <Link href="/admin" className="text-xs bg-red-500/80 px-2 py-1 rounded">管理</Link>}
                <button onClick={() => { logout(); setUser(null); window.location.href = "/"; }} className="text-sm text-white/70 hover:text-white">登出</button>
              </div>
            ) : (
              <Link href="/login" className="bg-white/20 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-white/30">登入</Link>
            )}
          </div>
          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
            <span className="text-2xl">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-white/20 mt-2 pt-2">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm ${pathname === n.href ? "bg-white/20" : "hover:bg-white/10"}`}>
                {n.icon} {n.label}
              </Link>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2 flex gap-2 px-3">
              <Link href="/search" className="text-sm">🔍 搜尋</Link>
              {user ? (
                <>
                  <Link href="/profile" className="text-sm">{user.name}</Link>
                  <button onClick={() => { logout(); setUser(null); }} className="text-sm text-white/70">登出</button>
                </>
              ) : <Link href="/login" className="text-sm">登入</Link>}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
