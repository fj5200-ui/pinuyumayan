"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

const MENU = [
  { href: "/admin", label: "總覽", icon: "📊" },
  { href: "/admin/articles", label: "文章管理", icon: "📝" },
  { href: "/admin/tribes", label: "部落管理", icon: "🏘️" },
  { href: "/admin/vocabulary", label: "族語管理", icon: "📖" },
  { href: "/admin/events", label: "活動管理", icon: "🎉" },
  { href: "/admin/media", label: "媒體管理", icon: "🎬" },
  { href: "/admin/users", label: "會員管理", icon: "👥" },
  { href: "/admin/comments", label: "留言管理", icon: "💬" },
  { href: "/admin/audit-logs", label: "操作日誌", icon: "📋" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" /></div>;
  if (!user || !isAdmin) { router.push("/login"); return null; }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Mobile sidebar toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden fixed bottom-4 right-4 z-50 bg-amber-700 text-white p-3 rounded-full shadow-lg">
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:sticky top-16 left-0 z-40 w-64 bg-white dark:bg-stone-900 border-r dark:border-stone-700 h-[calc(100vh-64px)] overflow-y-auto transition-transform`}>
        <div className="p-4 border-b dark:border-stone-700">
          <h2 className="font-bold text-lg text-stone-800 dark:text-stone-100">⚙️ 管理後台</h2>
          <p className="text-xs text-stone-400 mt-1">{user.name} ({user.role})</p>
        </div>
        <nav className="p-2">
          {MENU.map(m => (
            <Link key={m.href} href={m.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition mb-1 ${
                (m.href === "/admin" ? pathname === "/admin" : pathname.startsWith(m.href))
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}>
              <span>{m.icon}</span>{m.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t dark:border-stone-700 mt-auto">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-500 hover:text-amber-700 transition">
            ← 回到前台
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Content */}
      <main className="flex-1 min-w-0 bg-stone-50 dark:bg-stone-900">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
