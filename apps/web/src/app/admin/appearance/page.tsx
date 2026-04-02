"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";

/* ── Types ── */
interface HeroSlide {
  id: string; title: string; subtitle: string; description: string;
  buttonText: string; buttonLink: string; bgColor: string;
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
  { v: "var(--cream)", l: "奶油色" }, { v: "var(--bg-2)", l: "淺灰" },
  { v: "var(--bg-3)", l: "灰色" }, { v: "#1a1a1a", l: "深色" }, { v: "var(--red)", l: "紅色" },
];

const uid = () => "s" + Math.random().toString(36).slice(2, 8);

function Grip() {
  return (
    <svg className="w-4 h-4 text-[var(--text-light)] shrink-0 cursor-grab active:cursor-grabbing" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
      <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
      <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
    </svg>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${on ? "bg-[var(--red)]" : "bg-gray-300 dark:bg-gray-600"}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[18px]" : "translate-x-[3px]"}`}/>
    </button>
  );
}

function Field({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  const cls = "w-full px-3 py-2 text-sm border border-[var(--border)] dark:border-[#444] rounded-[var(--radius-sm)] bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)] transition";
  return (
    <div>
      <label className="text-[11px] font-bold text-[var(--text-light)] mb-1 block uppercase tracking-wider">{label}</label>
      {rows ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className={`${cls} resize-none`} /> : <input type="text" value={value} onChange={e => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

function Stitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return <div className="mb-4"><h3 className="font-bold text-sm dark:text-gray-100">{children}</h3>{sub && <p className="text-[11px] text-[var(--text-light)] mt-0.5">{sub}</p>}</div>;
}

export default function AppearancePage() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"layout"|"hero"|"header"|"footer">("layout");
  const [editSlide, setEditSlide] = useState<number|null>(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const dragItem = useRef<number|null>(null);
  const dragOver = useRef<number|null>(null);

  useEffect(() => {
    api.get<{settings:SiteSettings}>("/api/admin/site-settings")
      .then(r => r.settings && setS(r.settings)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const save = async () => {
    if(!s) return; setSaving(true); setSaved(false);
    try { await api.put("/api/admin/site-settings", s); setSaved(true); setTimeout(()=>setSaved(false),2500); }
    catch(e:any){ alert("儲存失敗: "+(e.message||"error")); } setSaving(false);
  };

  const handleDragStart=(i:number)=>{dragItem.current=i};
  const handleDragEnter=(i:number)=>{dragOver.current=i};
  const handleDragEnd=()=>{
    if(!s||dragItem.current===null||dragOver.current===null) return;
    const a=[...s.homeSections]; const d=a.splice(dragItem.current,1)[0]; a.splice(dragOver.current,0,d);
    setS({...s,homeSections:a}); dragItem.current=null; dragOver.current=null;
  };
  const moveSection=(i:number,dir:-1|1)=>{if(!s) return; const a=[...s.homeSections]; const t=i+dir; if(t<0||t>=a.length) return; [a[i],a[t]]=[a[t],a[i]]; setS({...s,homeSections:a});};
  const toggleSection=(i:number)=>{if(!s) return; const a=[...s.homeSections]; a[i]={...a[i],enabled:!a[i].enabled}; setS({...s,homeSections:a});};

  const updateSlide=(i:number,f:keyof HeroSlide,v:string)=>{if(!s) return; const sl=[...s.heroSlides]; sl[i]={...sl[i],[f]:v}; setS({...s,heroSlides:sl});};
  const addSlide=()=>{if(!s) return; setS({...s,heroSlides:[...s.heroSlides,{id:uid(),title:"新輪播",subtitle:"副標題",description:"說明文字",buttonText:"前往 →",buttonLink:"/",bgColor:"var(--cream)"}]}); setEditSlide(s.heroSlides.length);};
  const removeSlide=(i:number)=>{if(!s||s.heroSlides.length<=1) return; const sl=s.heroSlides.filter((_,j)=>j!==i); setS({...s,heroSlides:sl}); setEditSlide(null); if(previewIdx>=sl.length) setPreviewIdx(sl.length-1);};
  const moveSlide=(i:number,dir:-1|1)=>{if(!s) return; const sl=[...s.heroSlides]; const t=i+dir; if(t<0||t>=sl.length) return; [sl[i],sl[t]]=[sl[t],sl[i]]; setS({...s,heroSlides:sl}); if(editSlide===i) setEditSlide(t);};

  const updateNav=(i:number,f:keyof NavLink,v:string)=>{if(!s) return; const n=[...s.headerNav]; n[i]={...n[i],[f]:v}; setS({...s,headerNav:n});};
  const addNav=()=>{if(!s) return; setS({...s,headerNav:[...s.headerNav,{href:"/",label:"新項目"}]});};
  const removeNav=(i:number)=>{if(!s) return; setS({...s,headerNav:s.headerNav.filter((_,j)=>j!==i)});};
  const moveNav=(i:number,dir:-1|1)=>{if(!s) return; const n=[...s.headerNav]; const t=i+dir; if(t<0||t>=n.length) return; [n[i],n[t]]=[n[t],n[i]]; setS({...s,headerNav:n});};

  const updateFL=(g:"explore"|"learn"|"account",i:number,f:keyof NavLink,v:string)=>{if(!s) return; const lk={...s.footerLinks}; const a=[...lk[g]]; a[i]={...a[i],[f]:v}; lk[g]=a; setS({...s,footerLinks:lk});};
  const addFL=(g:"explore"|"learn"|"account")=>{if(!s) return; const lk={...s.footerLinks}; lk[g]=[...lk[g],{href:"/",label:"新連結"}]; setS({...s,footerLinks:lk});};
  const removeFL=(g:"explore"|"learn"|"account",i:number)=>{if(!s) return; const lk={...s.footerLinks}; lk[g]=lk[g].filter((_,j)=>j!==i); setS({...s,footerLinks:lk});};

  if(loading||!s) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-[var(--red)] border-t-transparent rounded-full"/></div>;

  const TABS=[
    {id:"layout" as const,label:"首頁排版",d:"M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"},
    {id:"hero" as const,label:"Hero 輪播",d:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"},
    {id:"header" as const,label:"頁首設定",d:"M4 6h16M4 12h16M4 18h7"},
    {id:"footer" as const,label:"頁尾設定",d:"M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"},
  ];
  const slide=s.heroSlides[previewIdx]||s.heroSlides[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-xl font-black dark:text-gray-100">外觀設定</h1><p className="text-xs text-[var(--text-soft)] mt-1">自訂首頁排版、Hero 輪播、頁首導覽、頁尾內容</p></div>
        <button onClick={save} disabled={saving} className={`btn-brand !text-sm !px-6 ${saving?"opacity-50 cursor-wait":""} ${saved?"!bg-[var(--green)]":""}`}>
          {saving?"儲存中...":saved?"已儲存":"儲存所有設定"}
        </button>
      </div>

      <div className="flex gap-1 border-b border-[var(--border)] dark:border-[#333] overflow-x-auto">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition border-b-2 -mb-px whitespace-nowrap ${tab===t.id?"border-[var(--red)] text-[var(--red)]":"border-transparent text-[var(--text-soft)] hover:text-[var(--text-main)]"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={t.d}/></svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Layout ═══ */}
      {tab==="layout" && (
        <div className="max-w-2xl space-y-5">
          <Stitle sub="拖拉調整區塊順序，切換開關控制顯示/隱藏">首頁區塊排版</Stitle>
          <div className="space-y-1.5">
            {s.homeSections.map((sec,i)=>(
              <div key={sec.id} draggable onDragStart={()=>handleDragStart(i)} onDragEnter={()=>handleDragEnter(i)} onDragEnd={handleDragEnd} onDragOver={e=>e.preventDefault()}
                className={`flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1a1a1a] border rounded-[var(--radius-sm)] transition group ${sec.enabled?"border-[var(--border)] dark:border-[#333]":"border-dashed border-gray-300 dark:border-gray-600 opacity-60"} hover:shadow-[var(--shadow-sm)] cursor-grab active:cursor-grabbing`}>
                <Grip/>
                <span className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-black shrink-0 ${sec.enabled?"bg-[rgba(153,27,27,0.08)] text-[var(--red)]":"bg-gray-100 dark:bg-gray-700 text-gray-400"}`}>{i+1}</span>
                <span className={`flex-1 text-sm font-bold ${sec.enabled?"dark:text-gray-100":"text-gray-400 line-through"}`}>{sec.label}</span>
                <button onClick={()=>moveSection(i,-1)} className="p-1 text-[var(--text-light)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition" title="上移">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button onClick={()=>moveSection(i,1)} className="p-1 text-[var(--text-light)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition" title="下移">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <Toggle on={sec.enabled} onChange={()=>toggleSection(i)}/>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-light)]">提示：拖拉區塊可調整首頁顯示順序。關閉的區塊不會在首頁顯示。儲存後前台即時生效。</p>
        </div>
      )}

      {/* ═══ Hero ═══ */}
      {tab==="hero" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <Stitle sub="即時預覽目前選取的輪播">預覽</Stitle>
            <div className="border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-sm)]">
              <div className="p-8 transition-colors" style={{background:slide?.bgColor||"var(--cream)",minHeight:220}}>
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{color:"var(--red)"}}>{slide?.subtitle}</p>
                <h2 className="text-2xl font-black leading-tight mb-3 dark:text-gray-100">{slide?.title}</h2>
                <p className="text-sm mb-4" style={{color:"var(--text-soft)"}}>{slide?.description}</p>
                <span className="inline-block px-4 py-2 text-xs font-bold text-white rounded-[var(--radius-sm)]" style={{background:"var(--red)"}}>{slide?.buttonText}</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-[#222] border-t border-[var(--border)] dark:border-[#333]">
                {s.heroSlides.map((_,i)=>(
                  <button key={i} onClick={()=>setPreviewIdx(i)} className={`w-2.5 h-2.5 rounded-full transition ${i===previewIdx?"scale-125":"bg-gray-300 dark:bg-gray-600"}`} style={i===previewIdx?{background:"var(--red)"}:undefined}/>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-4">
            <div className="flex items-center justify-between"><Stitle sub={`共 ${s.heroSlides.length} 張`}>輪播管理</Stitle>
              <button onClick={addSlide} className="text-xs font-bold px-3 py-1.5 border border-[var(--border)] dark:border-[#444] rounded-[var(--radius-sm)] hover:border-[var(--red)] hover:text-[var(--red)] transition">+ 新增</button>
            </div>
            {s.heroSlides.map((sl,i)=>(
              <div key={sl.id||i} className={`border rounded-[var(--radius-md)] transition ${editSlide===i?"border-[var(--red)] shadow-sm":"border-[var(--border)] dark:border-[#333]"}`}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={()=>{setEditSlide(editSlide===i?null:i);setPreviewIdx(i);}}>
                  <div className="w-4 h-4 rounded-sm shrink-0 border border-gray-200 dark:border-gray-600" style={{background:sl.bgColor}}/>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate dark:text-gray-100">{sl.title}</p><p className="text-[11px] text-[var(--text-light)] truncate">{sl.subtitle}</p></div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={e=>{e.stopPropagation();moveSlide(i,-1);}} className="p-1 text-[var(--text-light)] hover:text-[var(--text-main)]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg></button>
                    <button onClick={e=>{e.stopPropagation();moveSlide(i,1);}} className="p-1 text-[var(--text-light)] hover:text-[var(--text-main)]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></button>
                    <button onClick={e=>{e.stopPropagation();removeSlide(i);}} className="p-1 text-[var(--text-light)] hover:text-red-500"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    <svg className={`w-4 h-4 ml-1 transition-transform text-[var(--text-light)] ${editSlide===i?"rotate-90":""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
                {editSlide===i && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] dark:border-[#333] pt-3">
                    <div className="grid grid-cols-2 gap-3"><Field label="標題" value={sl.title} onChange={v=>updateSlide(i,"title",v)}/><Field label="副標題" value={sl.subtitle} onChange={v=>updateSlide(i,"subtitle",v)}/></div>
                    <Field label="說明文字" value={sl.description} onChange={v=>updateSlide(i,"description",v)} rows={2}/>
                    <div className="grid grid-cols-2 gap-3"><Field label="按鈕文字" value={sl.buttonText} onChange={v=>updateSlide(i,"buttonText",v)}/><Field label="按鈕連結" value={sl.buttonLink} onChange={v=>updateSlide(i,"buttonLink",v)}/></div>
                    <div><label className="text-[11px] font-bold text-[var(--text-light)] mb-1.5 block uppercase tracking-wider">背景色</label>
                      <div className="flex gap-2 flex-wrap">{BG_OPTS.map(bg=>(
                        <button key={bg.v} onClick={()=>updateSlide(i,"bgColor",bg.v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-[var(--radius-sm)] transition ${sl.bgColor===bg.v?"border-[var(--red)] text-[var(--red)]":"border-[var(--border)] dark:border-[#444] text-[var(--text-soft)]"}`}>
                          <span className="w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-600" style={{background:bg.v}}/>{bg.l}
                        </button>
                      ))}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Header ═══ */}
      {tab==="header" && (
        <div className="max-w-2xl space-y-6">
          <div className="card-solid space-y-4">
            <Stitle sub="顯示在網站左上角">品牌名稱</Stitle>
            <Field label="Header 品牌名" value={s.headerBrand} onChange={v=>setS({...s,headerBrand:v})}/>
            <div className="border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-sm)] overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-[#1a1a1a]">
                <span className="font-black text-base tracking-wider dark:text-gray-100">{s.headerBrand||"Pinuyumayan"}</span>
                <div className="flex gap-3 text-xs text-[var(--text-soft)]">{s.headerNav.slice(0,5).map(n=><span key={n.href}>{n.label}</span>)}</div>
              </div>
            </div>
          </div>
          <div className="card-solid space-y-4">
            <div className="flex items-center justify-between"><Stitle sub="管理頂部導覽列的連結項目">導覽連結</Stitle>
              <button onClick={addNav} className="text-xs font-bold px-3 py-1.5 border border-[var(--border)] dark:border-[#444] rounded-[var(--radius-sm)] hover:border-[var(--red)] hover:text-[var(--red)] transition">+ 新增</button>
            </div>
            <div className="space-y-2">{s.headerNav.map((n,i)=>(
              <div key={i} className="flex items-center gap-2">
                <span className="text-[11px] font-black text-[var(--text-light)] w-5 text-center shrink-0">{i+1}</span>
                <input type="text" value={n.label} onChange={e=>updateNav(i,"label",e.target.value)} className="flex-1 px-2.5 py-1.5 text-sm border border-[var(--border)] dark:border-[#444] rounded-[var(--radius-sm)] bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)]" placeholder="顯示名稱"/>
                <input type="text" value={n.href} onChange={e=>updateNav(i,"href",e.target.value)} className="w-32 px-2.5 py-1.5 text-sm border border-[var(--border)] dark:border-[#444] rounded-[var(--radius-sm)] bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)] font-mono text-[var(--text-soft)]" placeholder="/path"/>
                <button onClick={()=>moveNav(i,-1)} className="p-1 text-[var(--text-light)] hover:text-[var(--text-main)]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg></button>
                <button onClick={()=>moveNav(i,1)} className="p-1 text-[var(--text-light)] hover:text-[var(--text-main)]"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></button>
                <button onClick={()=>removeNav(i)} className="p-1 text-[var(--text-light)] hover:text-red-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
            ))}</div>
          </div>
        </div>
      )}

      {/* ═══ Footer ═══ */}
      {tab==="footer" && (
        <div className="max-w-3xl space-y-6">
          <div className="card-solid space-y-4">
            <Stitle sub="頁尾品牌名稱與說明文案">品牌資訊</Stitle>
            <Field label="品牌名稱" value={s.footerBrand} onChange={v=>setS({...s,footerBrand:v})}/>
            <Field label="品牌描述" value={s.footerDescription} onChange={v=>setS({...s,footerDescription:v})} rows={3}/>
          </div>
          <div className="card-solid space-y-4">
            <Stitle sub="頁尾上方的行動呼籲橫幅">CTA 橫幅</Stitle>
            <div className="grid md:grid-cols-2 gap-3"><Field label="標題" value={s.footerCtaTitle} onChange={v=>setS({...s,footerCtaTitle:v})}/><Field label="副標題" value={s.footerCtaSubtitle} onChange={v=>setS({...s,footerCtaSubtitle:v})}/></div>
            <div className="grid md:grid-cols-2 gap-3"><Field label="按鈕文字" value={s.footerCtaButtonText} onChange={v=>setS({...s,footerCtaButtonText:v})}/><Field label="按鈕連結" value={s.footerCtaButtonLink} onChange={v=>setS({...s,footerCtaButtonLink:v})}/></div>
            <div className="border border-[var(--border)] dark:border-[#333] rounded-[var(--radius-sm)] overflow-hidden">
              <div className="px-6 py-4 text-white flex items-center justify-between gap-4" style={{background:"var(--black)"}}>
                <div className="flex items-center gap-3"><div className="w-6 h-1 rounded-full" style={{background:"var(--yellow)"}}/><div><p className="font-black text-sm">{s.footerCtaTitle}</p><p className="text-[11px] text-white/70">{s.footerCtaSubtitle}</p></div></div>
                <span className="text-xs font-bold px-3 py-1.5 rounded text-white" style={{background:"var(--red)"}}>{s.footerCtaButtonText}</span>
              </div>
            </div>
          </div>
          <div className="card-solid space-y-6">
            <Stitle sub="管理頁尾三欄的連結項目">頁尾連結</Stitle>
            <div className="grid md:grid-cols-3 gap-6">
              {(["explore","learn","account"] as const).map(g=>(
                <div key={g}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider" style={{color:g==="explore"?"var(--red)":g==="learn"?"var(--yellow)":"var(--green)"}}>{g==="explore"?"探索":g==="learn"?"學習":"帳號"}</h4>
                    <button onClick={()=>addFL(g)} className="text-[10px] font-bold text-[var(--text-light)] hover:text-[var(--red)] transition">+ 新增</button>
                  </div>
                  <div className="space-y-1.5">{(s.footerLinks?.[g]||[]).map((lk,i)=>(
                    <div key={i} className="flex items-center gap-1.5">
                      <input type="text" value={lk.label} onChange={e=>updateFL(g,i,"label",e.target.value)} className="flex-1 px-2 py-1 text-xs border border-[var(--border)] dark:border-[#444] rounded bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)]" placeholder="名稱"/>
                      <input type="text" value={lk.href} onChange={e=>updateFL(g,i,"href",e.target.value)} className="w-20 px-2 py-1 text-xs border border-[var(--border)] dark:border-[#444] rounded bg-white dark:bg-[#222] dark:text-gray-100 outline-none focus:border-[var(--red)] font-mono text-[var(--text-soft)]" placeholder="/path"/>
                      <button onClick={()=>removeFL(g,i)} className="p-0.5 text-[var(--text-light)] hover:text-red-500 shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                    </div>
                  ))}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
