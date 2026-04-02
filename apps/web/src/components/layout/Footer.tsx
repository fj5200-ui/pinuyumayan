"use client";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [showLang, setShowLang] = useState(false);

  return (
    <footer className="bg-stone-800 dark:bg-stone-950 text-stone-300 mt-auto">
      {/* Quick CTA banner */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-600 dark:from-amber-800 dark:to-orange-700">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <span className="text-3xl">🌾</span>
            <div>
              <p className="font-bold">開始探索卑南族文化</p>
              <p className="text-sm text-white/80">學習族語、認識部落、參與文化活動</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/register" className="bg-white text-amber-800 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-amber-50 transition shadow-sm">免費加入</Link>
            <Link href="/language/quiz" className="border border-white/50 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition">🎯 族語測驗</Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-2xl">🌾</span> Pinuyumayan
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              卑南族文化入口網 — 保存與推廣卑南族語言、文化與傳統知識的數位平台。
              致力於以數位科技連結傳統智慧，讓文化在時代中永續傳承。
            </p>
            {/* Social-like links */}
            <div className="flex gap-3">
              {[
                { href: "/community", icon: "💬", label: "社群" },
                { href: "/tribes/map", icon: "🗺️", label: "地圖" },
                { href: "/about", icon: "ℹ️", label: "關於" },
              ].map(s => (
                <Link key={s.href} href={s.href}
                  className="w-9 h-9 rounded-lg bg-stone-700 dark:bg-stone-800 hover:bg-amber-700 dark:hover:bg-amber-800 flex items-center justify-center transition text-sm"
                  title={s.label}>
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">探索</h4>
            <div className="space-y-2 text-sm">
              {[
                { href: "/tribes", icon: "🏘️", label: "部落巡禮" },
                { href: "/tribes/map", icon: "🗺️", label: "部落地圖" },
                { href: "/articles", icon: "📝", label: "文化誌" },
                { href: "/events", icon: "🎉", label: "活動祭典" },
                { href: "/cultural-sites", icon: "🏺", label: "文化景點" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="flex items-center gap-2 hover:text-amber-400 transition py-0.5">
                  <span>{l.icon}</span> {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">學習</h4>
            <div className="space-y-2 text-sm">
              {[
                { href: "/language", icon: "📖", label: "族語詞彙" },
                { href: "/language/quiz", icon: "🎯", label: "族語測驗" },
                { href: "/media", icon: "🎬", label: "媒體庫" },
                { href: "/community", icon: "💬", label: "討論區" },
                { href: "/search", icon: "🔍", label: "搜尋" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="flex items-center gap-2 hover:text-amber-400 transition py-0.5">
                  <span>{l.icon}</span> {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account & Info */}
          <div>
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">帳號</h4>
            <div className="space-y-2 text-sm">
              {[
                { href: "/login", icon: "🔑", label: "登入" },
                { href: "/register", icon: "✨", label: "註冊" },
                { href: "/profile", icon: "👤", label: "個人檔案" },
                { href: "/about", icon: "ℹ️", label: "關於平台" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="flex items-center gap-2 hover:text-amber-400 transition py-0.5">
                  <span>{l.icon}</span> {l.label}
                </Link>
              ))}
            </div>

            {/* Fun fact toggle */}
            <div className="mt-4">
              <button onClick={() => setShowLang(!showLang)}
                className="text-xs bg-stone-700 dark:bg-stone-800 hover:bg-amber-700/50 px-3 py-1.5 rounded-lg transition text-stone-400 hover:text-amber-300">
                {showLang ? "📖 隱藏族語" : "📖 每日一句"}
              </button>
              {showLang && (
                <div className="mt-2 text-sm bg-stone-700/50 dark:bg-stone-800/50 rounded-lg p-3 border border-stone-600">
                  <p className="text-amber-400 font-bold">Mareka tu!</p>
                  <p className="text-stone-400 text-xs mt-1">你好！（卑南語問候語）</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats ribbon */}
        <div className="border-t border-stone-700 mt-8 pt-6">
          <div className="flex flex-wrap justify-center gap-6 mb-6 text-xs text-stone-500">
            {[
              { label: "部落", value: "8", icon: "🏘️" },
              { label: "文章", value: "6+", icon: "📝" },
              { label: "詞彙", value: "15+", icon: "📖" },
              { label: "活動", value: "6+", icon: "🎉" },
              { label: "景點", value: "6+", icon: "🏺" },
            ].map(s => (
              <span key={s.label} className="flex items-center gap-1">
                {s.icon} <span className="text-stone-400 font-medium">{s.value}</span> {s.label}
              </span>
            ))}
          </div>

          <div className="text-center text-sm text-stone-500 space-y-1">
            <p>&copy; {new Date().getFullYear()} Pinuyumayan 卑南族入口網. All rights reserved.</p>
            <p className="text-xs text-stone-600">Preserving Puyuma Culture for Future Generations</p>
            <p className="text-xs text-stone-600 mt-2">
              Built with Next.js + NestJS + PostgreSQL · 
              <Link href="/about" className="hover:text-amber-400 transition ml-1">了解更多 →</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
