"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const categories = ["全部", "問候", "親屬", "自然", "數字", "食物", "動物", "文化", "日常", "身體"];

const DIALOGUES = [
  { scene: "打招呼", lines: [{ speaker: "A", puyuma: "Marekumare!", chinese: "你好！" }, { speaker: "B", puyuma: "Marekumare! Manay kaw?", chinese: "你好！你怎麼樣？" }, { speaker: "A", puyuma: "Marasikal aku.", chinese: "我很好。" }] },
  { scene: "道謝", lines: [{ speaker: "A", puyuma: "Uninan su.", chinese: "謝謝你。" }, { speaker: "B", puyuma: "Adi masikal.", chinese: "不客氣。" }] },
  { scene: "告別", lines: [{ speaker: "A", puyuma: "Mulalu aku.", chinese: "我要回去了。" }, { speaker: "B", puyuma: "Marasikal ki mulalu.", chinese: "一路順風。" }] },
];

export default function LanguagePage() {
  const [words, setWords] = useState<any[]>([]);
  const [cat, setCat] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"vocab" | "dialogue" | "progress">("vocab");
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    const url = cat === "全部" ? "/api/language/vocabulary?limit=100" : `/api/language/vocabulary?limit=100&category=${cat}`;
    api.get<any>(url).then(d => { setWords(d.words || []); setLoading(false); }).catch(() => setLoading(false));
  }, [cat]);

  useEffect(() => {
    const saved = localStorage.getItem("pinuyumayan_learned");
    if (saved) setLearnedIds(new Set(JSON.parse(saved)));
  }, []);

  const toggleLearned = (id: number) => {
    setLearnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("pinuyumayan_learned", JSON.stringify([...next]));
      return next;
    });
  };

  const speak = (text: string) => { if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(text); u.lang = "zh-TW"; speechSynthesis.speak(u); } };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">📖 族語學習</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">學習卑南語，傳承部落智慧</p>
        </div>
        <Link href="/language/quiz" className="bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-amber-800 transition">🎯 開始測驗</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([["vocab", "📖 詞彙庫"], ["dialogue", "💬 對話練習"], ["progress", `📊 學習進度 (${learnedIds.size})`]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t as any)} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === t ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "vocab" && (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${cat === c ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-700 border dark:border-stone-700"}`}>{c}</button>
            ))}
          </div>
          {loading ? <div className="text-center py-20 text-stone-400">載入中...</div> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((w: any) => (
                <div key={w.id} className={`bg-white dark:bg-stone-800 rounded-xl shadow-sm p-5 border transition hover:shadow-md ${learnedIds.has(w.id) ? "border-green-300 dark:border-green-700" : "border-stone-100 dark:border-stone-700"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{w.puyumaWord}</p>
                      <p className="text-stone-800 dark:text-stone-200 font-medium mt-1">{w.chineseMeaning}</p>
                      {w.englishMeaning && <p className="text-stone-400 text-sm">{w.englishMeaning}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => speak(w.puyumaWord)} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 text-amber-700 dark:text-amber-400 transition" title="發音">🔊</button>
                      <button onClick={() => toggleLearned(w.id)} className={`p-2 rounded-lg transition ${learnedIds.has(w.id) ? "bg-green-100 dark:bg-green-900/30 text-green-700" : "bg-stone-50 dark:bg-stone-700 text-stone-400 hover:bg-stone-100"}`} title={learnedIds.has(w.id) ? "已學會" : "標記學會"}>
                        {learnedIds.has(w.id) ? "✅" : "⬜"}
                      </button>
                    </div>
                  </div>
                  {w.pronunciation && <p className="text-sm text-stone-400 mt-2">發音：{w.pronunciation}</p>}
                  {w.exampleSentence && (
                    <div className="mt-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3 text-sm">
                      <p className="text-stone-700 dark:text-stone-300">{w.exampleSentence}</p>
                      {w.exampleChinese && <p className="text-stone-500 dark:text-stone-400 mt-1">{w.exampleChinese}</p>}
                    </div>
                  )}
                  {w.audioUrl && (
                    <audio controls className="w-full mt-2 h-8" src={w.audioUrl}><track kind="captions" /></audio>
                  )}
                  <span className="inline-block text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-full mt-3">{w.category}</span>
                </div>
              ))}
            </div>
          )}
          {!loading && words.length === 0 && <div className="text-center py-20 text-stone-400">此分類暫無詞彙</div>}
        </>
      )}

      {tab === "dialogue" && (
        <div className="space-y-6">
          {DIALOGUES.map((d, i) => (
            <div key={i} className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6">
              <h3 className="font-bold text-lg dark:text-stone-100 mb-4">💬 {d.scene}</h3>
              <div className="space-y-3">
                {d.lines.map((l, j) => (
                  <div key={j} className={`flex ${l.speaker === "B" ? "justify-end" : ""}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl ${l.speaker === "A" ? "bg-amber-50 dark:bg-amber-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
                      <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">{l.puyuma}</p>
                      <p className="text-stone-600 dark:text-stone-400 text-xs mt-1">{l.chinese}</p>
                      <button onClick={() => speak(l.puyuma)} className="text-xs text-amber-600 dark:text-amber-400 mt-1 hover:underline">🔊 聽</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "progress" && (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-8">
          <div className="text-center mb-8">
            <p className="text-6xl mb-4">📊</p>
            <h2 className="text-3xl font-bold dark:text-stone-100">{learnedIds.size} <span className="text-stone-400 text-lg">/ {words.length || "?"}</span></h2>
            <p className="text-stone-500 dark:text-stone-400 mt-1">已掌握詞彙</p>
            <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-4 mt-4 max-w-md mx-auto">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-4 rounded-full transition-all" style={{ width: `${words.length ? (learnedIds.size / words.length) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {categories.filter(c => c !== "全部").map(c => {
              const catWords = words.filter(w => w.category === c);
              const catLearned = catWords.filter(w => learnedIds.has(w.id)).length;
              return (
                <div key={c} className="text-center p-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
                  <p className="font-bold text-lg dark:text-stone-200">{catLearned}/{catWords.length}</p>
                  <p className="text-xs text-stone-400">{c}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/language/quiz" className="bg-amber-700 text-white px-8 py-3 rounded-xl font-medium hover:bg-amber-800 transition inline-block">🎯 開始測驗</Link>
          </div>
        </div>
      )}
    </div>
  );
}
