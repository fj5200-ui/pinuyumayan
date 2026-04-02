"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const categories = ["全部", "問候", "親屬", "自然", "數字", "食物", "動物", "文化", "日常", "身體"];

const DIALOGUES = [
  { scene: "打招呼", emoji: "👋", lines: [{ speaker: "A", puyuma: "Marekumare!", chinese: "你好！" }, { speaker: "B", puyuma: "Marekumare! Manay kaw?", chinese: "你好！你怎麼樣？" }, { speaker: "A", puyuma: "Marasikal aku.", chinese: "我很好。" }] },
  { scene: "道謝", emoji: "🙏", lines: [{ speaker: "A", puyuma: "Uninan su.", chinese: "謝謝你。" }, { speaker: "B", puyuma: "Adi masikal.", chinese: "不客氣。" }] },
  { scene: "告別", emoji: "👋", lines: [{ speaker: "A", puyuma: "Mulalu aku.", chinese: "我要回去了。" }, { speaker: "B", puyuma: "Marasikal ki mulalu.", chinese: "一路順風。" }] },
  { scene: "自我介紹", emoji: "🤝", lines: [{ speaker: "A", puyuma: "Puyuma aku.", chinese: "我是卑南族人。" }, { speaker: "B", puyuma: "Kema ngangan nu?", chinese: "你叫什麼名字？" }, { speaker: "A", puyuma: "Temaramaw ku ngangan.", chinese: "我的名字是 Temaramaw。" }] },
  { scene: "買東西", emoji: "🛒", lines: [{ speaker: "A", puyuma: "Pima ku?", chinese: "這個多少錢？" }, { speaker: "B", puyuma: "Lima a puluq.", chinese: "五十元。" }] },
];

const CAT_ICONS: Record<string, string> = {
  "問候": "👋", "親屬": "👨‍👩‍👧‍👦", "自然": "🌿", "數字": "🔢",
  "食物": "🍚", "動物": "🐕", "文化": "🎭", "日常": "☀️", "身體": "🫀",
};

export default function LanguagePage() {
  const [words, setWords] = useState<any[]>([]);
  const [cat, setCat] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"vocab" | "flashcard" | "dialogue" | "progress">("vocab");
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set());
  const [daily, setDaily] = useState<any>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  // Hero animation
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeroVisible(true); }, { threshold: 0.2 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = cat === "全部" ? "/api/language/vocabulary?limit=100" : `/api/language/vocabulary?limit=100&category=${cat}`;
    api.get<any>(url).then(d => { setWords(d.words || []); setLoading(false); }).catch(() => setLoading(false));
  }, [cat]);

  useEffect(() => {
    const saved = localStorage.getItem("pinuyumayan_learned");
    if (saved) setLearnedIds(new Set(JSON.parse(saved)));
    api.get<any>("/api/language/daily").then(d => setDaily(d.word || d)).catch(() => {});
  }, []);

  const toggleLearned = (id: number) => {
    setLearnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("pinuyumayan_learned", JSON.stringify([...next]));
      return next;
    });
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = "zh-TW"; u.rate = 0.85;
      speechSynthesis.speak(u);
    }
  };

  const catStats = useMemo(() => {
    return categories.filter(c => c !== "全部").map(c => {
      const total = words.filter(w => w.category === c).length;
      const learned = words.filter(w => w.category === c && learnedIds.has(w.id)).length;
      return { name: c, total, learned, pct: total > 0 ? Math.round((learned / total) * 100) : 0 };
    });
  }, [words, learnedIds]);

  const tabs = [
    { key: "vocab", label: "📖 詞彙庫", count: words.length },
    { key: "flashcard", label: "🃏 閃卡模式", count: null },
    { key: "dialogue", label: "💬 對話練習", count: DIALOGUES.length },
    { key: "progress", label: `📊 學習進度`, count: learnedIds.size },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div ref={heroRef} className="relative bg-gradient-to-br from-amber-800 via-stone-800 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-8 text-8xl">📖</div>
          <div className="absolute bottom-8 right-8 text-7xl">🗣️</div>
        </div>
        <div className={`max-w-7xl mx-auto px-4 py-16 md:py-20 relative z-10 transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">📖 族語學習中心</h1>
              <p className="text-green-200 text-lg max-w-lg">學習卑南語（Puyuma），傳承部落千年智慧。從詞彙到對話，循序漸進掌握族語之美</p>
              <div className="flex gap-3 mt-6">
                <Link href="/language/quiz" className="bg-white text-amber-800 px-6 py-2.5 rounded-xl font-bold hover:bg-amber-50 transition text-sm">🎯 開始測驗</Link>
                <button onClick={() => setTab("flashcard")} className="bg-white/15 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl font-medium hover:bg-white/25 transition text-sm border border-white/20">🃏 閃卡模式</button>
              </div>
            </div>
            {/* Daily word card */}
            {daily && (
              <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 min-w-[260px] transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                <p className="text-xs text-amber-300 font-medium mb-2">🌅 今日一詞</p>
                <p className="text-3xl font-bold mb-1">{daily.puyumaWord}</p>
                <p className="text-lg text-amber-100">{daily.chineseMeaning}</p>
                {daily.pronunciation && <p className="text-sm text-white/60 mt-1">/{daily.pronunciation}/</p>}
                <button onClick={() => speak(daily.puyumaWord || daily.chineseMeaning)}
                  className="mt-3 flex items-center gap-2 text-sm text-amber-200 hover:text-white transition">
                  <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🔊</span> 聆聽發音
                </button>
              </div>
            )}
          </div>
          {/* Quick stats */}
          <div className={`flex gap-6 mt-8 transition-all duration-700 delay-500 ${heroVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="text-center"><p className="text-2xl font-bold">{words.length}</p><p className="text-xs text-amber-300">總詞彙</p></div>
            <div className="text-center"><p className="text-2xl font-bold">{learnedIds.size}</p><p className="text-xs text-green-300">已學會</p></div>
            <div className="text-center"><p className="text-2xl font-bold">{words.length > 0 ? Math.round((learnedIds.size / words.length) * 100) : 0}%</p><p className="text-xs text-amber-300">完成率</p></div>
            <div className="text-center"><p className="text-2xl font-bold">{DIALOGUES.length}</p><p className="text-xs text-green-300">對話場景</p></div>
          </div>
        </div>
        <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,40 C360,0 720,60 1080,20 C1260,5 1380,35 1440,30 L1440,60 L0,60 Z" className="fill-stone-50 dark:fill-stone-900" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 bg-stone-50 dark:bg-stone-900 min-h-screen">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${tab === t.key ? "bg-amber-700 text-white shadow-sm" : "bg-white dark:bg-stone-800 border dark:border-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
              {t.label}
              {t.count !== null && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-stone-100 dark:bg-stone-700"}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* ========== VOCAB TAB ========== */}
        {tab === "vocab" && (
          <>
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${cat === c ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-700 border dark:border-stone-700"}`}>
                  {c !== "全部" && <span>{CAT_ICONS[c] || "📌"}</span>} {c}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-stone-800 rounded-xl p-5 border dark:border-stone-700 animate-pulse">
                    <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-1/2 mb-3" />
                    <div className="h-4 bg-stone-100 dark:bg-stone-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-stone-100 dark:bg-stone-700 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {words.map((w: any) => (
                  <div key={w.id} className={`bg-white dark:bg-stone-800 rounded-xl shadow-sm p-5 border transition-all hover:shadow-md hover:-translate-y-0.5 ${learnedIds.has(w.id) ? "border-green-300 dark:border-green-700 ring-1 ring-green-200 dark:ring-green-800" : "border-stone-100 dark:border-stone-700"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{w.puyumaWord}</p>
                        <p className="text-stone-800 dark:text-stone-200 font-medium mt-1">{w.chineseMeaning}</p>
                        {w.englishMeaning && <p className="text-stone-400 text-sm">{w.englishMeaning}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0 ml-2">
                        <button onClick={() => speak(w.puyumaWord)}
                          className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 text-amber-700 dark:text-amber-400 transition flex items-center justify-center" title="發音">
                          🔊
                        </button>
                        <button onClick={() => toggleLearned(w.id)}
                          className={`w-9 h-9 rounded-lg transition flex items-center justify-center ${learnedIds.has(w.id) ? "bg-green-100 dark:bg-green-900/30 text-green-700" : "bg-stone-50 dark:bg-stone-700 text-stone-400 hover:bg-stone-100"}`} title={learnedIds.has(w.id) ? "已學會" : "標記學會"}>
                          {learnedIds.has(w.id) ? "✅" : "⬜"}
                        </button>
                      </div>
                    </div>
                    {w.pronunciation && <p className="text-sm text-stone-400 mt-2 italic">/{w.pronunciation}/</p>}
                    {w.exampleSentence && (
                      <div className="mt-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3 text-sm border-l-3 border-amber-400">
                        <p className="text-stone-700 dark:text-stone-300">{w.exampleSentence}</p>
                        {w.exampleChinese && <p className="text-stone-500 dark:text-stone-400 mt-1">{w.exampleChinese}</p>}
                      </div>
                    )}
                    {w.audioUrl && <audio controls className="w-full mt-2 h-8" src={w.audioUrl}><track kind="captions" /></audio>}
                    <span className="inline-flex items-center gap-1 text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-full mt-3">
                      {CAT_ICONS[w.category] || "📌"} {w.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!loading && words.length === 0 && <div className="text-center py-20 text-stone-400">此分類暫無詞彙</div>}
          </>
        )}

        {/* ========== FLASHCARD TAB ========== */}
        {tab === "flashcard" && <FlashcardMode words={words} loading={loading} learnedIds={learnedIds} toggleLearned={toggleLearned} speak={speak} />}

        {/* ========== DIALOGUE TAB ========== */}
        {tab === "dialogue" && (
          <div className="space-y-6">
            {DIALOGUES.map((d, i) => (
              <div key={i} className="bg-white dark:bg-stone-800 rounded-2xl border dark:border-stone-700 overflow-hidden hover:shadow-md transition">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-800 p-4 border-b dark:border-stone-700 flex items-center gap-3">
                  <span className="text-2xl">{d.emoji}</span>
                  <div>
                    <h3 className="font-bold dark:text-stone-100">💬 {d.scene}</h3>
                    <p className="text-xs text-stone-400">{d.lines.length} 句對話</p>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {d.lines.map((l, j) => (
                    <div key={j} className={`flex ${l.speaker === "B" ? "justify-end" : ""}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl relative ${l.speaker === "A" ? "bg-amber-50 dark:bg-amber-900/20 rounded-tl-sm" : "bg-blue-50 dark:bg-blue-900/20 rounded-tr-sm"}`}>
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <p className="font-bold text-amber-800 dark:text-amber-300 text-base">{l.puyuma}</p>
                          <button onClick={() => speak(l.puyuma)}
                            className="w-7 h-7 rounded-full bg-white/60 dark:bg-stone-700 flex items-center justify-center text-xs hover:bg-white transition shrink-0" title="聆聽">
                            🔊
                          </button>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 text-sm">{l.chinese}</p>
                        <span className={`absolute ${l.speaker === "A" ? "-left-2" : "-right-2"} top-3 text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold ${l.speaker === "A" ? "bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-200" : "bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200"}`}>
                          {l.speaker}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== PROGRESS TAB ========== */}
        {tab === "progress" && <ProgressTab learnedIds={learnedIds} words={words} categories={categories} catStats={catStats} />}
      </div>
    </div>
  );
}

/* ============ FLASHCARD MODE ============ */
function FlashcardMode({ words, loading, learnedIds, toggleLearned, speak }: {
  words: any[]; loading: boolean; learnedIds: Set<number>;
  toggleLearned: (id: number) => void; speak: (text: string) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"all" | "unlearned">("all");

  const deck = useMemo(() => {
    return mode === "unlearned" ? words.filter(w => !learnedIds.has(w.id)) : words;
  }, [words, learnedIds, mode]);

  const current = deck[idx];

  const next = () => { setFlipped(false); setIdx(i => (i + 1) % (deck.length || 1)); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + (deck.length || 1)) % (deck.length || 1)); };
  const shuffle = () => { setFlipped(false); setIdx(Math.floor(Math.random() * deck.length)); };

  if (loading) return <div className="text-center py-20 text-stone-400">載入中...</div>;
  if (deck.length === 0) return (
    <div className="text-center py-20 bg-white dark:bg-stone-800 rounded-2xl border dark:border-stone-700">
      <p className="text-5xl mb-4">🎉</p>
      <p className="text-xl font-bold dark:text-stone-100">全部學會了！</p>
      <p className="text-stone-400 mt-2">你已經掌握所有詞彙，太棒了！</p>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button onClick={() => setMode("all")} className={`px-3 py-1.5 rounded-lg text-sm transition ${mode === "all" ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 dark:text-stone-400"}`}>全部 ({words.length})</button>
          <button onClick={() => { setMode("unlearned"); setIdx(0); }} className={`px-3 py-1.5 rounded-lg text-sm transition ${mode === "unlearned" ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 dark:text-stone-400"}`}>未學 ({words.filter(w => !learnedIds.has(w.id)).length})</button>
        </div>
        <span className="text-sm text-stone-500 dark:text-stone-400 font-medium">{idx + 1} / {deck.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-1.5 mb-6">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${((idx + 1) / deck.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div onClick={() => setFlipped(!flipped)} className="cursor-pointer" style={{ perspective: "1000px" }}>
        <div className={`relative transition-all duration-500 ${flipped ? "[transform:rotateY(180deg)]" : ""}`} style={{ transformStyle: "preserve-3d", minHeight: "320px" }}>
          {/* Front */}
          <div className="absolute inset-0 bg-white dark:bg-stone-800 rounded-2xl shadow-lg border dark:border-stone-700 p-8 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: "hidden" }}>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full mb-4">{CAT_ICONS[current?.category] || "📌"} {current?.category}</span>
            <p className="text-4xl font-bold text-amber-700 dark:text-amber-400 mb-2">{current?.puyumaWord}</p>
            {current?.pronunciation && <p className="text-stone-400 italic">/{current.pronunciation}/</p>}
            <p className="text-sm text-stone-400 mt-6">👆 點擊翻轉查看釋義</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-800 rounded-2xl shadow-lg border dark:border-stone-700 p-8 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)]" style={{ backfaceVisibility: "hidden" }}>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-1">{current?.puyumaWord}</p>
            <p className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">{current?.chineseMeaning}</p>
            {current?.englishMeaning && <p className="text-stone-500 dark:text-stone-400">{current.englishMeaning}</p>}
            {current?.exampleSentence && (
              <div className="mt-4 bg-white/60 dark:bg-stone-700/50 rounded-xl p-3 text-sm max-w-xs">
                <p className="text-stone-700 dark:text-stone-300">{current.exampleSentence}</p>
                {current.exampleChinese && <p className="text-stone-400 mt-1">{current.exampleChinese}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <button onClick={prev} className="w-12 h-12 rounded-xl bg-white dark:bg-stone-800 border dark:border-stone-700 flex items-center justify-center text-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition" title="上一張">⬅️</button>
        <div className="flex gap-2">
          <button onClick={() => speak(current?.puyumaWord)} className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 transition">🔊 發音</button>
          <button onClick={() => current && toggleLearned(current.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${current && learnedIds.has(current.id) ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-green-50"}`}>
            {current && learnedIds.has(current.id) ? "✅ 已學會" : "⬜ 標記學會"}
          </button>
          <button onClick={shuffle} className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-600 transition">🔀</button>
        </div>
        <button onClick={next} className="w-12 h-12 rounded-xl bg-white dark:bg-stone-800 border dark:border-stone-700 flex items-center justify-center text-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition" title="下一張">➡️</button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-stone-400 mt-4">💡 點擊卡片翻轉 · 使用按鈕切換上下張</p>
    </div>
  );
}

/* ============ PROGRESS TAB ============ */
function ProgressTab({ learnedIds, words, categories, catStats }: {
  learnedIds: Set<number>; words: any[]; categories: string[];
  catStats: { name: string; total: number; learned: number; pct: number }[];
}) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (user) api.get<any>("/api/learning/progress").then(d => setProgress(d)).catch(() => {});
    api.get<any>("/api/learning/leaderboard").then(d => setLeaderboard(d.leaderboard || [])).catch(() => {});
  }, [user]);

  const overallPct = words.length > 0 ? Math.round((learnedIds.size / words.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress overview */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border dark:border-stone-700 p-8">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          {/* Circle progress */}
          <div className="relative w-40 h-40 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-stone-200 dark:text-stone-700" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${overallPct * 2.64} ${264 - overallPct * 2.64}`} className="transition-all duration-1000" />
              <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#f97316" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold dark:text-stone-100">{overallPct}%</p>
              <p className="text-xs text-stone-500">完成率</p>
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold dark:text-stone-100 mb-2">學習進度總覽</h2>
            <p className="text-stone-500 dark:text-stone-400">已掌握 <span className="text-amber-700 dark:text-amber-400 font-bold text-lg">{learnedIds.size}</span> / {words.length || "?"} 個詞彙</p>
            <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-3 mt-3">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-700" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>

        {/* Server-side stats */}
        {progress && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: "🎯", value: progress.totalQuizzes, label: "總測驗次數", bg: "bg-amber-50 dark:bg-amber-900/20", color: "text-amber-700 dark:text-amber-400" },
              { icon: "✅", value: `${progress.accuracy}%`, label: "正確率", bg: "bg-green-50 dark:bg-green-900/20", color: "text-green-700 dark:text-green-400" },
              { icon: "🔥", value: `${progress.streak}`, label: "連續學習天數", bg: "bg-orange-50 dark:bg-orange-900/20", color: "text-orange-700 dark:text-orange-400" },
              { icon: "📝", value: progress.todayQuizzes, label: "今日測驗", bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-700 dark:text-blue-400" },
            ].map((s, i) => (
              <div key={i} className={`text-center p-4 ${s.bg} rounded-xl`}>
                <p className="text-lg mb-1">{s.icon}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-stone-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Category breakdown with bars */}
        <div className="mb-8">
          <h3 className="font-bold dark:text-stone-100 mb-4 text-lg">📂 分類進度</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {catStats.map(cs => (
              <div key={cs.name} className="flex items-center gap-3 bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3">
                <span className="text-lg">{CAT_ICONS[cs.name] || "📌"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium dark:text-stone-200">{cs.name}</span>
                    <span className="text-xs text-stone-400">{cs.learned}/{cs.total}</span>
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-stone-600 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${cs.pct === 100 ? "bg-green-500" : cs.pct > 50 ? "bg-amber-500" : "bg-stone-400"}`}
                      style={{ width: `${cs.pct}%` }} />
                  </div>
                </div>
                {cs.pct === 100 && <span className="text-xs">🎉</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        {progress?.allBadges && (
          <div className="mb-8">
            <h3 className="font-bold dark:text-stone-100 mb-4 text-lg">🏅 成就徽章</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {progress.allBadges.map((b: any) => (
                <div key={b.id} className={`text-center p-4 rounded-xl border transition ${b.earned ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 shadow-sm" : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-40 grayscale"}`}>
                  <p className="text-3xl mb-1">{b.icon}</p>
                  <p className="text-sm font-bold dark:text-stone-200">{b.name}</p>
                  <p className="text-xs text-stone-400">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly chart */}
        {progress?.weeklyData && (
          <div className="mb-8">
            <h3 className="font-bold dark:text-stone-100 mb-4 text-lg">📅 本週學習紀錄</h3>
            <div className="flex items-end gap-2 h-32 bg-stone-50 dark:bg-stone-700/30 rounded-xl p-4">
              {progress.weeklyData.map((d: any) => (
                <div key={d.day} className="flex-1 text-center flex flex-col items-center justify-end h-full">
                  <div className="w-full max-w-[32px] bg-stone-200 dark:bg-stone-600 rounded-t-lg relative overflow-hidden flex-1">
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-amber-400 transition-all rounded-t-lg"
                      style={{ height: `${d.total > 0 ? Math.max(12, (d.total / 10) * 100) : 0}%` }} />
                  </div>
                  <p className="text-xs text-stone-500 mt-2">{d.day}</p>
                  <p className="text-xs font-bold dark:text-stone-300">{d.total}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/language/quiz" className="bg-amber-700 text-white px-8 py-3 rounded-xl font-medium hover:bg-amber-800 transition inline-block shadow-sm">🎯 開始測驗</Link>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border dark:border-stone-700 overflow-hidden">
          <div className="p-6 border-b dark:border-stone-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-800">
            <h3 className="font-bold dark:text-stone-100 text-lg">🏆 學習排行榜</h3>
          </div>
          <div className="p-4 space-y-2">
            {leaderboard.map((entry, i) => (
              <div key={entry.userId} className={`flex items-center gap-4 p-3 rounded-xl transition ${i < 3 ? "bg-amber-50/50 dark:bg-amber-900/10" : "bg-stone-50 dark:bg-stone-700/50"}`}>
                <span className="text-xl font-bold w-8 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}</span>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 rounded-full flex items-center justify-center text-sm font-bold">
                  {entry.userName?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium dark:text-stone-200 truncate">{entry.userName || `用戶 #${entry.userId}`}</p>
                  <p className="text-xs text-stone-400">{entry.learned} 詞彙 · {entry.quizzes} 次測驗</p>
                </div>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{entry.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-8 text-center">
          <p className="text-4xl mb-3">🔒</p>
          <p className="dark:text-stone-200 text-lg font-medium mb-2">登入後同步你的學習進度</p>
          <p className="text-stone-500 text-sm mb-4">獲得成就徽章、參加排行榜、跨裝置學習</p>
          <Link href="/login" className="inline-block bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-amber-800 transition">立即登入 →</Link>
        </div>
      )}
    </div>
  );
}
