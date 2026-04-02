"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const MILESTONES = [
  { ver: "v1.0", date: "Phase 1", desc: "核心功能 — 18 頁面、12 API 模組、11 資料表", icon: "🌱" },
  { ver: "v2.0", date: "Phase 2-3", desc: "密碼管理 + CMS + 操作日誌 + Dashboard", icon: "🌿" },
  { ver: "v3.0", date: "Phase 4", desc: "Feature Flags + AI 工具 + 監控 + 設定 + 討論 + 搜尋升級", icon: "🌳" },
  { ver: "v4.0", date: "Phase 5", desc: "文化景點 + 活動報名 + 審核管理 + 資料匯出 + 學習進度", icon: "🏔️" },
  { ver: "v4.4", date: "Phase 6", desc: "首頁/Profile/Dashboard/編輯器升級 + Rate Limiting + JWT Refresh + SEO", icon: "⛰️" },
  { ver: "v4.5", date: "Phase 7", desc: "DB 遷移 (6 新表) + 文章版本歷史 + 批次操作 + Workflows", icon: "🗻" },
  { ver: "v4.6", date: "Phase 8", desc: "DB 遷移完成 (5 新表) + 文章 v2 + Sitemap + robots.txt + 404", icon: "🏛️" },
  { ver: "v4.7", date: "Phase 9", desc: "首頁/活動/社群/部落/Dashboard/Header/Footer 全面 UX 升級", icon: "🌾" },
  { ver: "v4.8", date: "Phase 10", desc: "關於/媒體/景點/族語/搜尋 深度互動升級", icon: "🎯" },
];

const TECH_STACK = [
  { cat: "前端", items: [
    { name: "Next.js 16", desc: "React 框架 (App Router)", color: "bg-black text-white" },
    { name: "TypeScript", desc: "型別安全", color: "bg-blue-600 text-white" },
    { name: "Tailwind CSS 4", desc: "原子化樣式", color: "bg-cyan-500 text-white" },
  ]},
  { cat: "後端", items: [
    { name: "NestJS 10", desc: "企業級 Node.js 框架", color: "bg-red-600 text-white" },
    { name: "Drizzle ORM", desc: "型別安全 ORM", color: "bg-green-600 text-white" },
    { name: "JWT", desc: "認證與授權", color: "bg-purple-600 text-white" },
  ]},
  { cat: "基礎設施", items: [
    { name: "PostgreSQL 17", desc: "Supabase 雲端資料庫", color: "bg-blue-800 text-white" },
    { name: "Vercel", desc: "前端部署", color: "bg-stone-800 text-white" },
    { name: "Render", desc: "API 部署", color: "bg-emerald-600 text-white" },
  ]},
];

const FEATURES = [
  { icon: "🏘️", name: "卑南八社", desc: "完整部落資料庫與互動地圖" },
  { icon: "📝", name: "文化誌", desc: "Markdown 文章系統、版本歷史、批次管理" },
  { icon: "📖", name: "族語學習", desc: "詞彙庫、每日一詞、族語測驗、進度追蹤" },
  { icon: "🎉", name: "活動祭典", desc: "線上報名、倒計時、報名人數顯示" },
  { icon: "🏺", name: "文化景點", desc: "GIS 定位、類型篩選、互動地圖" },
  { icon: "🎬", name: "媒體庫", desc: "照片/影片/音檔管理與播放" },
  { icon: "💬", name: "社群討論", desc: "多板塊系統、回覆、按讚" },
  { icon: "🔍", name: "全站搜尋", desc: "即時建議、類型篩選、關鍵字高亮" },
  { icon: "🌙", name: "暗色模式", desc: "全站暗色主題支援" },
  { icon: "⚙️", name: "管理後台", desc: "15 頁管理界面、審核、匯出、日誌" },
  { icon: "📊", name: "學習系統", desc: "排行榜、成就徽章、週報圖表" },
  { icon: "🗺️", name: "SEO 最佳化", desc: "Sitemap、robots.txt、Open Graph" },
];

export default function AboutPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get<any>("/api/admin/stats").catch(() => null).then(s => setStats(s));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-800 via-amber-700 to-orange-600 dark:from-stone-900 dark:via-amber-900/60 dark:to-stone-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z' fill='%23ffffff' fill-opacity='.15'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="text-amber-200 text-lg mb-4 tracking-wider">About Pinuyumayan</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">🌾 關於我們</h1>
          <p className="text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            Pinuyumayan（卑南族入口網）致力於以數位科技保存、推廣與傳承卑南族豐富的文化遺產
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Mission */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">🎯 使命與願景</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
              我們相信，每一個語言、每一段歷史、每一首古調，都值得被記錄與傳承。
              Pinuyumayan 以現代數位技術為橋樑，連結傳統智慧與當代社會，
              讓卑南族的文化在時代的洪流中永續發展。
            </p>
            <div className="space-y-3">
              {[
                { icon: "📖", label: "族語保存", desc: "系統化記錄卑南語詞彙、發音與例句" },
                { icon: "🏘️", label: "部落紀錄", desc: "詳細介紹卑南族八社的歷史與文化特色" },
                { icon: "📝", label: "文化書寫", desc: "深入報導祭儀、工藝、音樂、信仰等面向" },
                { icon: "🎉", label: "活動推廣", desc: "整理祭典、工作坊與展覽等文化活動資訊" },
                { icon: "🎯", label: "互動學習", desc: "族語測驗、每日一詞、學習進度與排行榜" },
              ].map(v => (
                <div key={v.label} className="flex gap-3 items-start group">
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{v.icon}</span>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">{v.label}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800">
            <p className="text-center text-6xl mb-6">🌾</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: stats?.tribes || 8, l: "卑南八社", icon: "🏘️" },
                { n: stats?.vocabulary || 15, l: "族語詞彙", icon: "📖", suffix: "+" },
                { n: stats?.articles || 6, l: "文化文章", icon: "📝", suffix: "+" },
                { n: stats?.events || 6, l: "活動祭典", icon: "🎉", suffix: "+" },
              ].map(s => (
                <div key={s.l} className="text-center p-4 bg-white/80 dark:bg-stone-800/80 rounded-xl">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{s.n}{(s as any).suffix || ""}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section>
          <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2 text-center">✨ 平台功能</h2>
          <p className="text-stone-500 dark:text-stone-400 text-center mb-8">涵蓋文化保存、語言學習、社群互動、內容管理的全方位平台</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.name} className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{f.icon}</span>
                  <h3 className="font-bold text-stone-800 dark:text-stone-100">{f.name}</h3>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section>
          <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2 text-center">🛠️ 技術架構</h2>
          <p className="text-stone-500 dark:text-stone-400 text-center mb-8">採用現代化全端技術堆疊打造</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TECH_STACK.map(group => (
              <div key={group.cat} className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
                <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4 text-lg">{group.cat}</h3>
                <div className="space-y-3">
                  {group.items.map(item => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className={`${item.color} text-xs font-bold px-2.5 py-1 rounded-lg shrink-0`}>{item.name}</span>
                      <span className="text-sm text-stone-500 dark:text-stone-400">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Numbers bar */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n: 37, l: "前端路由", icon: "🌐" },
              { n: 19, l: "API 模組", icon: "⚡" },
              { n: 22, l: "資料表", icon: "🗄️" },
              { n: 21, l: "API 通過", icon: "✅" },
            ].map(s => (
              <div key={s.l} className="text-center p-5 bg-stone-50 dark:bg-stone-800 rounded-xl border dark:border-stone-700">
                <p className="text-lg mb-1">{s.icon}</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{s.n}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2 text-center">📅 開發歷程</h2>
          <p className="text-stone-500 dark:text-stone-400 text-center mb-8">從零到一，從基礎功能到完整文化平台</p>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-200 dark:bg-amber-800 hidden md:block" />
            <div className="space-y-6">
              {MILESTONES.map((m, i) => (
                <div key={m.ver} className="flex gap-4 md:gap-6 items-start group">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform z-10 relative">
                    {m.icon}
                  </div>
                  <div className={`flex-1 bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-5 hover:shadow-md transition ${i === MILESTONES.length - 1 ? "ring-2 ring-amber-400 dark:ring-amber-600" : ""}`}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-amber-700 dark:text-amber-400">{m.ver}</span>
                      <span className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full">{m.date}</span>
                      {i === MILESTONES.length - 1 && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">目前版本</span>}
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-300">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800 text-center">
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-3">💬 聯繫我們</h2>
          <p className="text-stone-600 dark:text-stone-300 mb-4 max-w-lg mx-auto">
            如果您有任何建議、資料更正或合作意向，歡迎與我們聯繫。
            每一份回饋都是推動平台進步的動力。
          </p>
          <a href="mailto:pinuyumayan@example.com" className="inline-block bg-amber-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-800 transition">
            📧 pinuyumayan@example.com
          </a>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/" className="text-amber-700 dark:text-amber-400 hover:underline text-sm">🏠 首頁</Link>
            <Link href="/tribes" className="text-amber-700 dark:text-amber-400 hover:underline text-sm">🏘️ 部落</Link>
            <Link href="/language" className="text-amber-700 dark:text-amber-400 hover:underline text-sm">📖 族語</Link>
            <Link href="/community" className="text-amber-700 dark:text-amber-400 hover:underline text-sm">💬 社群</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
