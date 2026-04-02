"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";

/* ── Types ── */
interface HeroSlide {
  id: string; title: string; subtitle: string; description: string;
  buttonText: string; buttonLink: string; bgColor: string; imageUrl?: string;
}
interface HomeSection { id: string; label: string; enabled: boolean; }
interface NavLink { href: string; label: string; }
interface SiteSettings {
  heroSlides: HeroSlide[];
  homeSections: HomeSection[];
  headerBrand: string;
  headerNav: NavLink[];
  footerBrand: string;
  footerDescription: string;
  footerCtaTitle: string;
  footerCtaSubtitle: string;
  footerCtaButtonText: string;
  footerCtaButtonLink: string;
  footerLinks: { explore: NavLink[]; learn: NavLink[]; account: NavLink[] };
}

const BG_OPTS = [
  { v: "var(--cream)", l: "奶油色", hex: "#faf8f5" },
  { v: "var(--bg-2)", l: "淺灰", hex: "#f1f3f5" },
  { v: "var(--bg-3)", l: "灰色", hex: "#e9ecef" },
  { v: "#1a1a1a", l: "深色", hex: "#1a1a1a" },
  { v: "var(--red)", l: "紅色", hex: "#991b1b" },
  { v: "#1e3a5f", l: "深藍", hex: "#1e3a5f" },
  { v: "#2d4a3e", l: "墨綠", hex: "#2d4a3e" },
];

const SECTION_ICONS: Record<string, string> = {
  hero: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  daily: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  stats: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  tribes: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  sites: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
  articles: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  vocab: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  events: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  cta: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
};

const uid = () => "s" + Math.random().toString(36).slice(2, 8);

/* ── Sub-components ── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${on ? "bg-[var(--red)]" : "bg-gray-300 dark:bg-gray-600"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
    </button>
  );
}

function Field({ label, value, onChange, rows, placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; mono?: boolean;
}) {
  const cls = `w-full px-3 py-2 text-sm border border-[var(--border)] dark:border-[#444] rounded-lg bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]/20 transition ${mono ? "font-mono text-[var(--text-soft)]" : ""}`;
  return (
    <div>
      <label className="text-[11px] font-bold text-[var(--text-light)] mb-1.5 block uppercase tracking-wider">{label}</label>
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className={`${cls} resize-none`} placeholder={placeholder} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} className={cls} placeholder={placeholder} />
      }
    </div>
  );
}

function SectionTitle({ children, sub, action }: { children: React.ReactNode; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h3 className="font-black text-base dark:text-gray-100">{children}</h3>
        {sub && <p className="text-xs text-[var(--text-light)] mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white dark:bg-[#1a1a1a] border border-[var(--border)] dark:border-[#333] rounded-xl p-5 ${className}`}>{children}</div>;
}

/* ── Main Component ── */
export default function AppearancePage() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"layout" | "hero" | "header" | "footer">("layout");
  const [editSlide, setEditSlide] = useState<number | null>(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverRef = useRef<number | null>(null);

  useEffect(() => {
    api.get<{ settings: SiteSettings }>("/api/admin/site-settings")
      .then(r => r.settings && setS(r.settings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!s) return;
    setSaving(true); setSaved(false);
    try {
      await api.put("/api/admin/site-settings", s);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      alert("儲存失敗: " + (e.message || "error"));
    }
    setSaving(false);
  };

  /* ── Drag handlers for sections ── */
  const handleDragStart = (i: number) => { dragItem.current = i; };
  const handleDragEnter = (i: number) => { dragOverRef.current = i; setDragOverIdx(i); };
  const handleDragEnd = () => {
    if (!s || dragItem.current === null || dragOverRef.current === null) return;
    const a = [...s.homeSections];
    const dragged = a.splice(dragItem.current, 1)[0];
    a.splice(dragOverRef.current, 0, dragged);
    setS({ ...s, homeSections: a });
    dragItem.current = null; dragOverRef.current = null; setDragOverIdx(null);
  };
  const handleDragLeave = () => { setDragOverIdx(null); };
  const moveSection = (i: number, dir: -1 | 1) => {
    if (!s) return;
    const a = [...s.homeSections]; const t = i + dir;
    if (t < 0 || t >= a.length) return;
    [a[i], a[t]] = [a[t], a[i]]; setS({ ...s, homeSections: a });
  };
  const toggleSection = (i: number) => {
    if (!s) return;
    const a = [...s.homeSections];
    a[i] = { ...a[i], enabled: !a[i].enabled };
    setS({ ...s, homeSections: a });
  };

  /* ── Hero slide helpers ── */
  const updateSlide = (i: number, f: keyof HeroSlide, v: string) => {
    if (!s) return;
    const sl = [...s.heroSlides]; sl[i] = { ...sl[i], [f]: v }; setS({ ...s, heroSlides: sl });
  };
  const addSlide = () => {
    if (!s) return;
    const ns: HeroSlide = { id: uid(), title: "新輪播", subtitle: "副標題", description: "說明文字", buttonText: "前往 →", buttonLink: "/", bgColor: "var(--cream)", imageUrl: "" };
    setS({ ...s, heroSlides: [...s.heroSlides, ns] });
    setEditSlide(s.heroSlides.length);
  };
  const removeSlide = (i: number) => {
    if (!s || s.heroSlides.length <= 1) return;
    const sl = s.heroSlides.filter((_, j) => j !== i);
    setS({ ...s, heroSlides: sl });
    setEditSlide(null);
    if (previewIdx >= sl.length) setPreviewIdx(sl.length - 1);
  };
  const moveSlide = (i: number, dir: -1 | 1) => {
    if (!s) return;
    const sl = [...s.heroSlides]; const t = i + dir;
    if (t < 0 || t >= sl.length) return;
    [sl[i], sl[t]] = [sl[t], sl[i]]; setS({ ...s, heroSlides: sl });
    if (editSlide === i) setEditSlide(t);
  };
  const duplicateSlide = (i: number) => {
    if (!s) return;
    const clone = { ...s.heroSlides[i], id: uid() };
    const sl = [...s.heroSlides]; sl.splice(i + 1, 0, clone);
    setS({ ...s, heroSlides: sl }); setEditSlide(i + 1);
  };

  /* ── Header nav helpers ── */
  const updateNav = (i: number, f: keyof NavLink, v: string) => {
    if (!s) return; const n = [...s.headerNav]; n[i] = { ...n[i], [f]: v }; setS({ ...s, headerNav: n });
  };
  const addNav = () => { if (!s) return; setS({ ...s, headerNav: [...s.headerNav, { href: "/", label: "新項目" }] }); };
  const removeNav = (i: number) => { if (!s) return; setS({ ...s, headerNav: s.headerNav.filter((_, j) => j !== i) }); };
  const moveNav = (i: number, dir: -1 | 1) => {
    if (!s) return; const n = [...s.headerNav]; const t = i + dir;
    if (t < 0 || t >= n.length) return; [n[i], n[t]] = [n[t], n[i]]; setS({ ...s, headerNav: n });
  };

  /* ── Footer link helpers ── */
  const updateFL = (g: "explore" | "learn" | "account", i: number, f: keyof NavLink, v: string) => {
    if (!s) return; const lk = { ...s.footerLinks }; const a = [...lk[g]]; a[i] = { ...a[i], [f]: v }; lk[g] = a; setS({ ...s, footerLinks: lk });
  };
  const addFL = (g: "explore" | "learn" | "account") => {
    if (!s) return; const lk = { ...s.footerLinks }; lk[g] = [...lk[g], { href: "/", label: "新連結" }]; setS({ ...s, footerLinks: lk });
  };
  const removeFL = (g: "explore" | "learn" | "account", i: number) => {
    if (!s) return; const lk = { ...s.footerLinks }; lk[g] = lk[g].filter((_, j) => j !== i); setS({ ...s, footerLinks: lk });
  };

  if (loading || !s) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-[var(--red)] border-t-transparent rounded-full" />
    </div>
  );

  const TABS = [
    { id: "layout" as const, label: "首頁排版", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", count: s.homeSections.filter(x => x.enabled).length + "/" + s.homeSections.length },
    { id: "hero" as const, label: "Hero 輪播", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", count: String(s.heroSlides.length) },
    { id: "header" as const, label: "頁首設定", icon: "M4 6h16M4 12h16M4 18h7", count: String(s.headerNav.length) },
    { id: "footer" as const, label: "頁尾設定", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", count: "" },
  ];

  const slide = s.heroSlides[previewIdx] || s.heroSlides[0];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black dark:text-gray-100">外觀設定</h1>
          <p className="text-xs text-[var(--text-soft)] mt-1">自訂首頁排版、Hero 輪播、頁首導覽、頁尾內容。儲存後前台即時生效。</p>
        </div>
        <button onClick={save} disabled={saving}
          className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white rounded-lg shadow-sm transition-all
            ${saving ? "opacity-50 cursor-wait" : "hover:shadow-md active:scale-[0.98]"}
            ${saved ? "bg-green-600" : "bg-[var(--red)]"}`}>
          {saving ? (
            <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> 儲存中...</>
          ) : saved ? (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> 已儲存</>
          ) : (
            "儲存所有設定"
          )}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[#222] p-1 rounded-lg">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all flex-1 justify-center
              ${tab === t.id
                ? "bg-white dark:bg-[#333] text-[var(--red)] shadow-sm"
                : "text-[var(--text-soft)] hover:text-[var(--text-main)]"}`}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={t.icon} />
            </svg>
            <span className="hidden sm:inline">{t.label}</span>
            {t.count && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === t.id ? "bg-[rgba(153,27,27,0.08)] text-[var(--red)]" : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ═══ Layout Tab ═══ */}
      {tab === "layout" && (
        <div className="max-w-2xl">
          <Card>
            <SectionTitle sub="拖拉調整區塊順序，切換開關控制顯示/隱藏。已啟用的區塊會按順序顯示在首頁。">
              首頁區塊排版
            </SectionTitle>
            <div className="space-y-2">
              {s.homeSections.map((sec, i) => {
                const iconPath = SECTION_ICONS[sec.id] || SECTION_ICONS.cta;
                return (
                  <div
                    key={sec.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragEnter={() => handleDragEnter(i)}
                    onDragEnd={handleDragEnd}
                    onDragLeave={handleDragLeave}
                    onDragOver={e => e.preventDefault()}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all group
                      ${dragOverIdx === i ? "ring-2 ring-[var(--red)] ring-offset-1 bg-[rgba(153,27,27,0.03)]" : ""}
                      ${sec.enabled
                        ? "bg-white dark:bg-[#222] border border-[var(--border)] dark:border-[#333] hover:shadow-md"
                        : "bg-gray-50 dark:bg-[#181818] border border-dashed border-gray-300 dark:border-gray-600 opacity-60"
                      }
                      cursor-grab active:cursor-grabbing active:shadow-lg active:scale-[1.01]`}
                  >
                    {/* Grip handle */}
                    <div className="flex flex-col gap-0.5 shrink-0 text-gray-300 dark:text-gray-600">
                      <div className="flex gap-0.5"><span className="w-1 h-1 rounded-full bg-current" /><span className="w-1 h-1 rounded-full bg-current" /></div>
                      <div className="flex gap-0.5"><span className="w-1 h-1 rounded-full bg-current" /><span className="w-1 h-1 rounded-full bg-current" /></div>
                      <div className="flex gap-0.5"><span className="w-1 h-1 rounded-full bg-current" /><span className="w-1 h-1 rounded-full bg-current" /></div>
                    </div>

                    {/* Section icon + number */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sec.enabled ? "bg-[rgba(153,27,27,0.06)]" : "bg-gray-100 dark:bg-gray-700"}`}>
                      <svg className={`w-4 h-4 ${sec.enabled ? "text-[var(--red)]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={iconPath} />
                      </svg>
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-bold ${sec.enabled ? "dark:text-gray-100" : "text-gray-400 line-through"}`}>{sec.label}</span>
                      <span className={`ml-2 text-[10px] font-black px-1.5 py-0.5 rounded ${sec.enabled ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}>
                        #{i + 1}
                      </span>
                    </div>

                    {/* Move buttons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0}
                        className="p-1.5 text-[var(--text-light)] hover:text-[var(--text-main)] disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="上移">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button type="button" onClick={() => moveSection(i, 1)} disabled={i === s.homeSections.length - 1}
                        className="p-1.5 text-[var(--text-light)] hover:text-[var(--text-main)] disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="下移">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>

                    {/* Toggle */}
                    <Toggle on={sec.enabled} onChange={() => toggleSection(i)} />
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-[var(--text-light)] mt-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              拖拉區塊調整順序，關閉的區塊不會在首頁顯示。儲存後前台即時生效。
            </p>
          </Card>
        </div>
      )}

      {/* ═══ Hero Tab ═══ */}
      {tab === "hero" && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Preview (left, wider) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="!p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] dark:border-[#333] bg-gray-50 dark:bg-[#222]">
                <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider">即時預覽</p>
              </div>
              <div className="transition-all duration-500" style={{
                background: slide?.imageUrl ? `url(${slide.imageUrl}) center/cover no-repeat` : slide?.bgColor || "var(--cream)",
                minHeight: 280,
              }}>
                <div className={`p-8 ${slide?.imageUrl ? "bg-black/40" : ""}`}>
                  <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: slide?.imageUrl ? "#fff" : "var(--red)" }}>{slide?.subtitle}</p>
                  <h2 className={`text-2xl font-black leading-tight mb-3 ${slide?.imageUrl ? "text-white" : "dark:text-gray-100"}`}>{slide?.title}</h2>
                  <p className={`text-sm mb-5 ${slide?.imageUrl ? "text-white/80" : ""}`} style={!slide?.imageUrl ? { color: "var(--text-soft)" } : undefined}>{slide?.description}</p>
                  <span className="inline-block px-4 py-2 text-xs font-bold text-white rounded-lg" style={{ background: "var(--red)" }}>{slide?.buttonText}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-[#222] border-t border-[var(--border)] dark:border-[#333]">
                {s.heroSlides.map((_, i) => (
                  <button key={i} onClick={() => setPreviewIdx(i)}
                    className={`h-2 rounded-full transition-all ${i === previewIdx ? "w-6 bg-[var(--red)]" : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"}`} />
                ))}
              </div>
            </Card>
          </div>

          {/* Slide list (right, wider) */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
            <SectionTitle sub={`共 ${s.heroSlides.length} 張輪播`}
              action={
                <button type="button" onClick={addSlide}
                  className="text-xs font-bold px-3.5 py-2 border border-[var(--border)] dark:border-[#444] rounded-lg hover:border-[var(--red)] hover:text-[var(--red)] transition bg-white dark:bg-[#222]">
                  + 新增輪播
                </button>
              }>
              輪播管理
            </SectionTitle>

            {s.heroSlides.map((sl, i) => (
              <Card key={sl.id || i} className={`!p-0 overflow-hidden transition-all ${editSlide === i ? "ring-2 ring-[var(--red)] ring-offset-1" : ""}`}>
                {/* Slide header */}
                <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#222] transition"
                  onClick={() => { setEditSlide(editSlide === i ? null : i); setPreviewIdx(i); }}>
                  {/* Color swatch */}
                  <div className="w-10 h-10 rounded-lg shrink-0 border border-gray-200 dark:border-gray-600 overflow-hidden"
                    style={sl.imageUrl ? { backgroundImage: `url(${sl.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: sl.bgColor }}>
                    {!sl.imageUrl && <div className="w-full h-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate dark:text-gray-100">{sl.title}</p>
                    <p className="text-[11px] text-[var(--text-light)] truncate">{sl.subtitle} · {sl.buttonLink}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={e => { e.stopPropagation(); moveSlide(i, -1); }} disabled={i === 0} className="p-1.5 text-[var(--text-light)] hover:text-[var(--text-main)] disabled:opacity-30 rounded transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button type="button" onClick={e => { e.stopPropagation(); moveSlide(i, 1); }} disabled={i === s.heroSlides.length - 1} className="p-1.5 text-[var(--text-light)] hover:text-[var(--text-main)] disabled:opacity-30 rounded transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button type="button" onClick={e => { e.stopPropagation(); duplicateSlide(i); }} className="p-1.5 text-[var(--text-light)] hover:text-blue-500 rounded transition" title="複製">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button type="button" onClick={e => { e.stopPropagation(); removeSlide(i); }} disabled={s.heroSlides.length <= 1} className="p-1.5 text-[var(--text-light)] hover:text-red-500 disabled:opacity-30 rounded transition" title="刪除">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <svg className={`w-4 h-4 ml-1 transition-transform text-[var(--text-light)] ${editSlide === i ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Slide editor */}
                {editSlide === i && (
                  <div className="px-5 pb-5 space-y-4 border-t border-[var(--border)] dark:border-[#333] pt-4 bg-gray-50/50 dark:bg-[#181818]">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="標題" value={sl.title} onChange={v => updateSlide(i, "title", v)} placeholder="輪播標題" />
                      <Field label="副標題" value={sl.subtitle} onChange={v => updateSlide(i, "subtitle", v)} placeholder="副標題文字" />
                    </div>
                    <Field label="說明文字" value={sl.description} onChange={v => updateSlide(i, "description", v)} rows={2} placeholder="輪播說明文字..." />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="按鈕文字" value={sl.buttonText} onChange={v => updateSlide(i, "buttonText", v)} placeholder="探索 →" />
                      <Field label="按鈕連結" value={sl.buttonLink} onChange={v => updateSlide(i, "buttonLink", v)} placeholder="/tribes" mono />
                    </div>
                    <Field label="背景圖片 URL（選填，會覆蓋背景色）" value={sl.imageUrl || ""} onChange={v => updateSlide(i, "imageUrl", v)} placeholder="https://example.com/hero.jpg" mono />
                    <div>
                      <label className="text-[11px] font-bold text-[var(--text-light)] mb-2 block uppercase tracking-wider">背景色</label>
                      <div className="flex gap-2 flex-wrap">
                        {BG_OPTS.map(bg => (
                          <button key={bg.v} type="button" onClick={() => updateSlide(i, "bgColor", bg.v)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border rounded-lg transition ${sl.bgColor === bg.v ? "border-[var(--red)] text-[var(--red)] bg-[rgba(153,27,27,0.03)]" : "border-[var(--border)] dark:border-[#444] text-[var(--text-soft)] hover:border-gray-400 bg-white dark:bg-[#222]"}`}>
                            <span className="w-4 h-4 rounded border border-gray-200 dark:border-gray-600" style={{ background: bg.hex }} />
                            {bg.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Header Tab ═══ */}
      {tab === "header" && (
        <div className="max-w-2xl space-y-6">
          <Card>
            <SectionTitle sub="顯示在網站左上角的品牌名稱">品牌名稱</SectionTitle>
            <Field label="Header 品牌名" value={s.headerBrand} onChange={v => setS({ ...s, headerBrand: v })} placeholder="Pinuyumayan" />
            <div className="border border-[var(--border)] dark:border-[#333] rounded-lg overflow-hidden mt-4">
              <div className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-[#222]">
                <span className="font-black text-base tracking-wider dark:text-gray-100">{s.headerBrand || "Pinuyumayan"}</span>
                <div className="flex gap-3 text-xs text-[var(--text-soft)]">{s.headerNav.slice(0, 5).map(n => <span key={n.href + n.label}>{n.label}</span>)}</div>
                <span className="ml-auto text-[10px] text-[var(--text-light)]">預覽</span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle sub="管理頂部導覽列的連結項目"
              action={
                <button type="button" onClick={addNav}
                  className="text-xs font-bold px-3.5 py-2 border border-[var(--border)] dark:border-[#444] rounded-lg hover:border-[var(--red)] hover:text-[var(--red)] transition bg-white dark:bg-[#222]">
                  + 新增導覽
                </button>
              }>
              導覽連結
            </SectionTitle>
            <div className="space-y-2">
              {s.headerNav.map((n, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <span className="text-[11px] font-black text-[var(--text-light)] w-5 text-center shrink-0">{i + 1}</span>
                  <input type="text" value={n.label} onChange={e => updateNav(i, "label", e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-[var(--border)] dark:border-[#444] rounded-lg bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]/20 transition" placeholder="顯示名稱" />
                  <input type="text" value={n.href} onChange={e => updateNav(i, "href", e.target.value)}
                    className="w-36 px-3 py-2 text-sm border border-[var(--border)] dark:border-[#444] rounded-lg bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]/20 font-mono text-[var(--text-soft)] transition" placeholder="/path" />
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button type="button" onClick={() => moveNav(i, -1)} className="p-1 text-[var(--text-light)] hover:text-[var(--text-main)] rounded transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button type="button" onClick={() => moveNav(i, 1)} className="p-1 text-[var(--text-light)] hover:text-[var(--text-main)] rounded transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  <button type="button" onClick={() => removeNav(i)} className="p-1 text-[var(--text-light)] hover:text-red-500 rounded transition shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ═══ Footer Tab ═══ */}
      {tab === "footer" && (
        <div className="max-w-3xl space-y-6">
          <Card>
            <SectionTitle sub="頁尾品牌名稱與說明文案">品牌資訊</SectionTitle>
            <div className="space-y-3">
              <Field label="品牌名稱" value={s.footerBrand} onChange={v => setS({ ...s, footerBrand: v })} placeholder="Pinuyumayan" />
              <Field label="品牌描述" value={s.footerDescription} onChange={v => setS({ ...s, footerDescription: v })} rows={3} placeholder="品牌描述..." />
            </div>
          </Card>

          <Card>
            <SectionTitle sub="頁尾上方的行動呼籲橫幅">CTA 橫幅</SectionTitle>
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="標題" value={s.footerCtaTitle} onChange={v => setS({ ...s, footerCtaTitle: v })} placeholder="開始探索..." />
                <Field label="副標題" value={s.footerCtaSubtitle} onChange={v => setS({ ...s, footerCtaSubtitle: v })} placeholder="副標題..." />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="按鈕文字" value={s.footerCtaButtonText} onChange={v => setS({ ...s, footerCtaButtonText: v })} placeholder="免費加入" />
                <Field label="按鈕連結" value={s.footerCtaButtonLink} onChange={v => setS({ ...s, footerCtaButtonLink: v })} placeholder="/register" mono />
              </div>
            </div>
            {/* CTA preview */}
            <div className="border border-[var(--border)] dark:border-[#333] rounded-lg overflow-hidden mt-4">
              <div className="px-6 py-4 text-white flex items-center justify-between gap-4" style={{ background: "var(--black)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-1 rounded-full" style={{ background: "var(--yellow)" }} />
                  <div>
                    <p className="font-black text-sm">{s.footerCtaTitle}</p>
                    <p className="text-[11px] text-white/70">{s.footerCtaSubtitle}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg text-white shrink-0" style={{ background: "var(--red)" }}>{s.footerCtaButtonText}</span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle sub="管理頁尾三欄的連結項目">頁尾連結</SectionTitle>
            <div className="grid md:grid-cols-3 gap-6">
              {(["explore", "learn", "account"] as const).map(g => {
                const colors = { explore: "var(--red)", learn: "var(--yellow)", account: "var(--green)" };
                const labels = { explore: "探索", learn: "學習", account: "帳號" };
                return (
                  <div key={g}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: colors[g] }}>{labels[g]}</h4>
                      <button type="button" onClick={() => addFL(g)} className="text-[10px] font-bold text-[var(--text-light)] hover:text-[var(--red)] transition">+ 新增</button>
                    </div>
                    <div className="space-y-2">
                      {(s.footerLinks?.[g] || []).map((lk, i) => (
                        <div key={i} className="flex items-center gap-1.5 group">
                          <input type="text" value={lk.label} onChange={e => updateFL(g, i, "label", e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs border border-[var(--border)] dark:border-[#444] rounded-lg bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)] transition" placeholder="名稱" />
                          <input type="text" value={lk.href} onChange={e => updateFL(g, i, "href", e.target.value)}
                            className="w-20 px-2.5 py-1.5 text-xs border border-[var(--border)] dark:border-[#444] rounded-lg bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)] font-mono text-[var(--text-soft)] transition" placeholder="/path" />
                          <button type="button" onClick={() => removeFL(g, i)} className="p-0.5 text-[var(--text-light)] hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
