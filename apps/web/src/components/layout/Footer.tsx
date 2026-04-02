"use client";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [showLang, setShowLang] = useState(false);

  return (
    <footer className="mt-auto">
      {/* CTA Banner — gradient brand */}
      <div className="cta-gradient mx-4 md:mx-8 lg:mx-auto lg:max-w-6xl mb-8" style={{ borderRadius: "var(--radius-xl)" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6">
          <div className="flex items-center gap-3 text-white">
            <span className="text-3xl animate-float">🌾</span>
            <div className="text-left">
              <p className="font-black text-lg">開始探索卑南族文化</p>
              <p className="text-sm text-white/80">學習族語、認識部落、參與文化活動</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/register" className="bg-white text-[var(--red)] px-5 py-2.5 rounded-2xl text-sm font-black hover:bg-amber-50 transition shadow-sm">免費加入</Link>
            <Link href="/language/quiz" className="border border-white/50 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-white/10 transition">🎯 族語測驗</Link>
          </div>
        </div>
      </div>

      {/* Main footer — glass style */}
      <div className="glass mx-4 md:mx-8 lg:mx-auto lg:max-w-6xl mb-6" style={{ borderRadius: "var(--radius-xl)" }}>
        <div className="px-8 py-10">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🌾</span>
                <span className="bg-gradient-to-r from-[var(--red)] via-[var(--yellow)] to-[var(--green)] bg-clip-text text-transparent">Pinuyumayan</span>
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-soft)] mb-4">
                卑南族文化入口網 — 保存與推廣卑南族語言、文化與傳統知識的數位平台。致力於以數位科技連結傳統智慧。
              </p>
              <div className="flex gap-3">
                {[
                  { href: "/community", icon: "💬", label: "社群" },
                  { href: "/tribes/map", icon: "🗺️", label: "地圖" },
                  { href: "/about", icon: "ℹ️", label: "關於" },
                ].map(s => (
                  <Link key={s.href} href={s.href}
                    className="w-9 h-9 rounded-xl bg-white/40 dark:bg-stone-700/40 hover:bg-[rgba(245,158,11,0.2)] flex items-center justify-center transition text-sm border border-white/30 dark:border-stone-600/30"
                    title={s.label}>
                    {s.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wider text-[var(--red)]">探索</h4>
              <div className="space-y-2 text-sm">
                {[
                  { href: "/tribes", icon: "🏘️", label: "部落巡禮" },
                  { href: "/tribes/map", icon: "🗺️", label: "部落地圖" },
                  { href: "/articles", icon: "📝", label: "文化誌" },
                  { href: "/events", icon: "🎉", label: "活動祭典" },
                  { href: "/cultural-sites", icon: "🏺", label: "文化景點" },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-2 text-[var(--text-soft)] hover:text-[var(--green)] transition py-0.5 font-medium">
                    <span>{l.icon}</span> {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Learn */}
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wider text-[var(--yellow)]">學習</h4>
              <div className="space-y-2 text-sm">
                {[
                  { href: "/language", icon: "📖", label: "族語詞彙" },
                  { href: "/language/quiz", icon: "🎯", label: "族語測驗" },
                  { href: "/media", icon: "🎬", label: "媒體庫" },
                  { href: "/community", icon: "💬", label: "討論區" },
                  { href: "/search", icon: "🔍", label: "搜尋" },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-2 text-[var(--text-soft)] hover:text-[var(--green)] transition py-0.5 font-medium">
                    <span>{l.icon}</span> {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wider text-[var(--green)]">帳號</h4>
              <div className="space-y-2 text-sm">
                {[
                  { href: "/login", icon: "🔑", label: "登入" },
                  { href: "/register", icon: "✨", label: "註冊" },
                  { href: "/profile", icon: "👤", label: "個人檔案" },
                  { href: "/about", icon: "ℹ️", label: "關於平台" },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-2 text-[var(--text-soft)] hover:text-[var(--green)] transition py-0.5 font-medium">
                    <span>{l.icon}</span> {l.label}
                  </Link>
                ))}
              </div>

              {/* Fun fact */}
              <div className="mt-4">
                <button onClick={() => setShowLang(!showLang)}
                  className="text-xs bg-white/30 dark:bg-stone-700/30 hover:bg-[rgba(245,158,11,0.15)] px-3 py-1.5 rounded-xl transition text-[var(--text-soft)] hover:text-[var(--yellow)] border border-white/20 dark:border-stone-600/20 font-bold">
                  {showLang ? "📖 隱藏族語" : "📖 每日一句"}
                </button>
                {showLang && (
                  <div className="mt-2 text-sm bg-white/30 dark:bg-stone-700/30 rounded-xl p-3 border border-white/20 dark:border-stone-600/20">
                    <p className="font-black" style={{ color: "var(--yellow)" }}>Mareka tu!</p>
                    <p className="text-[var(--text-soft)] text-xs mt-1">你好！（卑南語問候語）</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats ribbon */}
          <div className="border-t border-white/20 dark:border-stone-700/30 mt-8 pt-6">
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-xs text-[var(--text-soft)]">
              {[
                { label: "部落", value: "8", icon: "🏘️" },
                { label: "文章", value: "6+", icon: "📝" },
                { label: "詞彙", value: "15+", icon: "📖" },
                { label: "活動", value: "6+", icon: "🎉" },
                { label: "景點", value: "6+", icon: "🏺" },
              ].map(s => (
                <span key={s.label} className="flex items-center gap-1 font-bold">
                  {s.icon} <span style={{ color: "var(--yellow)" }}>{s.value}</span> {s.label}
                </span>
              ))}
            </div>

            <div className="text-center text-sm text-[var(--text-soft)] space-y-1">
              <p className="font-bold">&copy; {new Date().getFullYear()} Pinuyumayan 卑南族入口網</p>
              <p className="text-xs">Preserving Puyuma Culture for Future Generations</p>
              <p className="text-xs mt-2">
                Built with Next.js + NestJS + PostgreSQL ·
                <Link href="/about" className="hover:text-[var(--green)] transition ml-1 font-bold">了解更多 →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
