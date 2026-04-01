"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const categories = ["全部", "問候", "親屬", "自然", "數字", "食物", "動物", "文化", "日常", "身體"];

export default function LanguagePage() {
  const [words, setWords] = useState<any[]>([]);
  const [cat, setCat] = useState("全部");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = cat === "全部" ? "/api/language/vocabulary?limit=100" : `/api/language/vocabulary?limit=100&category=${cat}`;
    api.get<any>(url).then(d => { setWords(d.words || []); setLoading(false); }).catch(() => setLoading(false));
  }, [cat]);

  const speak = (text: string) => { if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(text); u.lang = "zh-TW"; speechSynthesis.speak(u); } };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-stone-800">📖 族語學習</h1>
        <p className="text-stone-500 mt-2 text-lg">學習卑南語，傳承部落智慧</p>
      </div>
      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${cat === c ? "bg-amber-700 text-white" : "bg-white text-stone-600 hover:bg-amber-50 border"}`}>{c}</button>
        ))}
      </div>
      {loading ? <div className="text-center py-20 text-stone-400">載入中...</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {words.map((w: any) => (
            <div key={w.id} className="bg-white rounded-xl shadow-sm p-5 border border-stone-100 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-bold text-amber-700">{w.puyumaWord}</p>
                  <p className="text-stone-800 font-medium mt-1">{w.chineseMeaning}</p>
                  {w.englishMeaning && <p className="text-stone-400 text-sm">{w.englishMeaning}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => speak(w.puyumaWord)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition" title="發音">🔊</button>
                </div>
              </div>
              {w.pronunciation && <p className="text-sm text-stone-400 mt-2">發音：{w.pronunciation}</p>}
              {w.exampleSentence && (
                <div className="mt-3 bg-stone-50 rounded-lg p-3 text-sm">
                  <p className="text-stone-700">{w.exampleSentence}</p>
                  {w.exampleChinese && <p className="text-stone-500 mt-1">{w.exampleChinese}</p>}
                </div>
              )}
              <span className="inline-block text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-full mt-3">{w.category}</span>
            </div>
          ))}
        </div>
      )}
      {!loading && words.length === 0 && <div className="text-center py-20 text-stone-400">此分類暫無詞彙</div>}
    </div>
  );
}
