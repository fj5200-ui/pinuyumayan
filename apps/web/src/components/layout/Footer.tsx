"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface NavLink { href: string; label: string; }

const DEFAULTS = {
  brand: "Pinuyumayan",
  description: "卑南族文化入口網 — 保存與推廣卑南族語言、文化與傳統知識的數位平台。致力於以數位科技連結傳統智慧。",
  ctaTitle: "開始探索卑南族文化",
  ctaSub: "學習族語、認識部落、參與文化活動",
  ctaBtn: "免費加入",
  ctaLink: "/register",
  explore: [
    { href: "/tribes", label: "部落巡禮" }, { href: "/tribes/map", label: "部落地圖" },
    { href: "/articles", label: "文化誌" }, { href: "/events", label: "活動祭典" },
    { href: "/cultural-sites", label: "文化景點" },
  ] as NavLink[],
  learn: [
    { href: "/language", label: "族語詞彙" }, { href: "/language/quiz", label: "族語測驗" },
    { href: "/media", label: "媒體庫" }, { href: "/community", label: "討論區" },
    { href: "/search", label: "搜尋" },
  ] as NavLink[],
  account: [
    { href: "/login", label: "登入" }, { href: "/register", label: "註冊" },
    { href: "/profile", label: "個人檔案" }, { href: "/about", label: "關於平台" },
  ] as NavLink[],
};

export default function Footer() {
  const [showLang, setShowLang] = useState(false);
  const [brand, setBrand] = useState(DEFAULTS.brand);
  const [desc, setDesc] = useState(DEFAULTS.description);
  const [ctaTitle, setCtaTitle] = useState(DEFAULTS.ctaTitle);
  const [ctaSub, setCtaSub] = useState(DEFAULTS.ctaSub);
  const [ctaBtn, setCtaBtn] = useState(DEFAULTS.ctaBtn);
  const [ctaLink, setCtaLink] = useState(DEFAULTS.ctaLink);
  const [explore, setExplore] = useState(DEFAULTS.explore);
  const [learn, setLearn] = useState(DEFAULTS.learn);
  const [account, setAccount] = useState(DEFAULTS.account);

  useEffect(() => {
    api.get<any>("/api/admin/site-settings").then(r => {
      const ss = r?.settings;
      if (!ss) return;
      if (ss.footerBrand) setBrand(ss.footerBrand);
      if (ss.footerDescription) setDesc(ss.footerDescription);
      if (ss.footerCtaTitle) setCtaTitle(ss.footerCtaTitle);
      if (ss.footerCtaSubtitle) setCtaSub(ss.footerCtaSubtitle);
      if (ss.footerCtaButtonText) setCtaBtn(ss.footerCtaButtonText);
      if (ss.footerCtaButtonLink) setCtaLink(ss.footerCtaButtonLink);
      if (ss.footerLinks?.explore?.length) setExplore(ss.footerLinks.explore);
      if (ss.footerLinks?.learn?.length) setLearn(ss.footerLinks.learn);
      if (ss.footerLinks?.account?.length) setAccount(ss.footerLinks.account);
    }).catch(() => {});
  }, []);

  return (
    <footer className="mt-auto">
      {/* CTA Banner */}
      <div className="banner-dark mx-4 md:mx-8 lg:mx-auto lg:max-w-[1180px] mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 rounded-full" style={{ background: "var(--yellow)" }} />
            <div className="text-left">
              <p className="font-black text-lg">{ctaTitle}</p>
              <p className="text-sm text-white/70">{ctaSub}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={ctaLink} className="btn-brand text-sm !px-5 !py-2.5">{ctaBtn}</Link>
            <Link href="/language/quiz" className="btn-glass text-sm !px-5 !py-2.5 !border-white/50 !text-white hover:!bg-white/10">族語測驗</Link>
          </div>
        </div>
      </div>

      {/* Color bar */}
      <div className="color-bar" />

      {/* Main footer */}
      <div className="bg-white dark:bg-[#1a1a1a] border-t border-[var(--border)] dark:border-[#333]">
        <div className="w-[min(1180px,92%)] mx-auto px-0 py-10">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                <span className="w-6 h-1 rounded-full inline-block" style={{ background: "var(--red)" }} />
                <span style={{ color: "var(--black)" }} className="dark:text-gray-100 tracking-wider">{brand}</span>
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-soft)] mb-4">{desc}</p>
              <div className="flex gap-2">
                {[
                  { href: "/community", label: "社群" },
                  { href: "/tribes/map", label: "地圖" },
                  { href: "/about", label: "關於" },
                ].map(s => (
                  <Link key={s.href} href={s.href}
                    className="px-3 py-1.5 text-xs font-bold border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-sm)] hover:border-[var(--red)] hover:text-[var(--red)] transition bg-white dark:bg-[#222] text-[var(--text-soft)]"
                    title={s.label}>{s.label}</Link>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wider" style={{ color: "var(--red)" }}>探索</h4>
              <div className="space-y-2 text-sm">
                {explore.map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-1 text-[var(--text-soft)] hover:text-[var(--red)] transition py-0.5 font-medium">
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--red)" }} /> {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Learn */}
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wider" style={{ color: "var(--yellow)" }}>學習</h4>
              <div className="space-y-2 text-sm">
                {learn.map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-1 text-[var(--text-soft)] hover:text-[var(--red)] transition py-0.5 font-medium">
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--yellow)" }} /> {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wider" style={{ color: "var(--green)" }}>帳號</h4>
              <div className="space-y-2 text-sm">
                {account.map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-1 text-[var(--text-soft)] hover:text-[var(--red)] transition py-0.5 font-medium">
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--green)" }} /> {l.label}
                  </Link>
                ))}
              </div>

              {/* Daily phrase */}
              <div className="mt-4">
                <button onClick={() => setShowLang(!showLang)}
                  className="text-xs border border-[var(--border)] dark:border-[#333] hover:border-[var(--yellow)] px-3 py-1.5 rounded-[var(--radius-sm)] transition text-[var(--text-soft)] hover:text-[var(--yellow)] bg-white dark:bg-[#222] font-bold">
                  {showLang ? "隱藏族語" : "每日一句"}
                </button>
                {showLang && (
                  <div className="mt-2 text-sm bg-white dark:bg-[#222] border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-sm)] p-3 animate-fade-in">
                    <p className="font-black" style={{ color: "var(--yellow)" }}>Mareka tu!</p>
                    <p className="text-[var(--text-soft)] text-xs mt-1">你好！（卑南語問候語）</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats ribbon */}
          <div className="border-t border-[var(--border)] dark:border-[#333] mt-8 pt-6">
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-xs text-[var(--text-soft)]">
              {[
                { label: "部落", value: "8" }, { label: "文章", value: "6+" },
                { label: "詞彙", value: "15+" }, { label: "活動", value: "6+" },
                { label: "景點", value: "6+" },
              ].map(s => (
                <span key={s.label} className="flex items-center gap-1 font-bold">
                  <span style={{ color: "var(--red)" }}>{s.value}</span> {s.label}
                </span>
              ))}
            </div>

            <div className="text-center text-sm text-[var(--text-soft)] space-y-1">
              <p className="font-bold">&copy; {new Date().getFullYear()} {brand} 卑南族入口網</p>
              <p className="text-xs">Preserving Puyuma Culture for Future Generations</p>
              <p className="text-xs mt-2">
                Built with Next.js + NestJS + PostgreSQL ·
                <Link href="/about" className="hover:text-[var(--red)] transition ml-1 font-bold">了解更多 →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
