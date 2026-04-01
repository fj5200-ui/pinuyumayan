"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Word { id: number; puyumaWord: string; chineseMeaning: string; englishMeaning?: string; pronunciation?: string; category: string; }

export default function QuizPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [current, setCurrent] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<"puyuma-to-chinese" | "chinese-to-puyuma">("puyuma-to-chinese");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/api/language/vocabulary?limit=100").then(d => {
      const w = (d.vocabulary || d.words || []).filter((v: Word) => v.chineseMeaning);
      setWords(shuffleArray(w));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

  const generateOptions = useCallback((idx: number) => {
    if (words.length < 4) return;
    const correct = mode === "puyuma-to-chinese" ? words[idx].chineseMeaning : words[idx].puyumaWord;
    const pool = words.filter((_, i) => i !== idx).map(w => mode === "puyuma-to-chinese" ? w.chineseMeaning : w.puyumaWord);
    const wrong = shuffleArray(pool).slice(0, 3);
    setOptions(shuffleArray([correct, ...wrong]));
    setSelected(null);
  }, [words, mode]);

  useEffect(() => { if (words.length >= 4) generateOptions(current); }, [current, words, generateOptions]);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    setTotal(t => t + 1);
    const correct = mode === "puyuma-to-chinese" ? words[current].chineseMeaning : words[current].puyumaWord;
    if (opt === correct) {
      setScore(s => s + 1);
      setStreak(s => { const n = s + 1; if (n > bestStreak) setBestStreak(n); return n; });
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      if (current + 1 >= Math.min(words.length, 15)) { setFinished(true); return; }
      setCurrent(c => c + 1);
    }, 1200);
  };

  const restart = () => {
    setWords(shuffleArray(words));
    setCurrent(0); setScore(0); setTotal(0); setStreak(0); setSelected(null); setFinished(false);
  };

  if (loading) return <div className="text-center py-20 text-stone-400">載入題庫中...</div>;
  if (words.length < 4) return <div className="text-center py-20"><p className="text-stone-500">詞彙不足，無法開始測驗</p><Link href="/language" className="text-amber-700 mt-4 block">← 返回族語學習</Link></div>;

  const q = words[current];
  const correctAnswer = mode === "puyuma-to-chinese" ? q?.chineseMeaning : q?.puyumaWord;
  const questionRounds = Math.min(words.length, 15);

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-10 border dark:border-stone-700">
          <div className="text-6xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "💪"}</div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">測驗完成！</h1>
          <p className="text-5xl font-bold text-amber-700 dark:text-amber-400 my-6">{score}/{total}</p>
          <p className="text-stone-500 dark:text-stone-400 text-lg">正確率 {pct}%</p>
          <p className="text-stone-400 text-sm mt-2">最佳連續答對: {bestStreak} 題</p>
          <div className="flex gap-3 justify-center mt-8">
            <button onClick={restart} className="px-6 py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 transition">再來一次</button>
            <Link href="/language" className="px-6 py-3 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl font-semibold hover:bg-stone-300 dark:hover:bg-stone-600 transition">返回詞彙</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">🎯 族語測驗</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">測試你的卑南語能力</p>
        </div>
        <Link href="/language" className="text-amber-700 dark:text-amber-400 text-sm hover:underline">← 返回</Link>
      </div>
      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => { setMode("puyuma-to-chinese"); restart(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "puyuma-to-chinese" ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700"}`}>卑南語 → 中文</button>
        <button onClick={() => { setMode("chinese-to-puyuma"); restart(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "chinese-to-puyuma" ? "bg-amber-700 text-white" : "bg-white dark:bg-stone-800 border dark:border-stone-700"}`}>中文 → 卑南語</button>
      </div>
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400 mb-4">
        <span>第 {current + 1}/{questionRounds} 題</span>
        <span>得分: {score} | 連續: {streak}🔥</span>
      </div>
      <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 mb-6">
        <div className="bg-amber-600 h-2 rounded-full transition-all" style={{ width: `${((current + 1) / questionRounds) * 100}%` }} />
      </div>
      {/* Question */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-8 border dark:border-stone-700 text-center mb-6">
        <p className="text-stone-400 dark:text-stone-500 text-sm mb-2">{mode === "puyuma-to-chinese" ? "這個卑南語是什麼意思？" : "以下中文的卑南語怎麼說？"}</p>
        <p className="text-4xl font-bold text-amber-700 dark:text-amber-400 mb-2">{mode === "puyuma-to-chinese" ? q.puyumaWord : q.chineseMeaning}</p>
        {q.pronunciation && mode === "puyuma-to-chinese" && <p className="text-stone-400 text-sm">{q.pronunciation}</p>}
      </div>
      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const isCorrect = opt === correctAnswer;
          const isSelected = selected === opt;
          let cls = "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20";
          if (selected) {
            if (isCorrect) cls = "bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300";
            else if (isSelected && !isCorrect) cls = "bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300";
            else cls = "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-50";
          }
          return (
            <button key={i} onClick={() => handleSelect(opt)} disabled={!!selected}
              className={`p-4 rounded-xl border-2 font-medium text-lg transition ${cls}`}>
              {opt}
              {selected && isCorrect && " ✅"}
              {selected && isSelected && !isCorrect && " ❌"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
