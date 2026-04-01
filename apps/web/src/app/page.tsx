"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [data, setData] = useState<any>({ tribes: [], articles: [], events: [], vocab: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/api/tribes").catch(() => ({ tribes: [] })),
      api.get<any>("/api/articles").catch(() => ({ articles: [] })),
      api.get<any>("/api/events").catch(() => ({ events: [] })),
      api.get<any>("/api/language/vocabulary?limit=5").catch(() => ({ words: [] })),
    ]).then(([t, a, e, v]) => {
      setData({ tribes: (t.tribes || []).slice(0, 4), articles: (a.articles || []).slice(0, 3), events: (e.events || []).slice(0, 3), vocab: (v.words || []).slice(0, 5) });
      setLoading(false);
    });
  }, []);

  const { tribes, articles, events, vocab } = data;
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-800 via-amber-700 to-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl">
            <p className="text-amber-200 text-lg mb-2 tracking-wider">Puyuma Cultural Portal</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Pinuyumayan<br /><span className="text-amber-200">卑南族入口網</span></h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">探索卑南族豐富的文化遺產 — 從部落歷史、傳統祭儀，到族語學習與文化藝術，一起守護這份珍貴的文化寶藏。</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/tribes" className="bg-white text-amber-800 px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 transition shadow-lg">探索部落</Link>
              <Link href="/language" className="border-2 border-white/50 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition">學習族語</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ n: "8", l: "卑南八社" }, { n: "15+", l: "族語詞彙" }, { n: "6+", l: "文化文章" }, { n: "6+", l: "活動祭典" }].map(s => (
            <div key={s.l}><p className="text-3xl font-bold text-amber-700">{s.n}</p><p className="text-stone-500 text-sm">{s.l}</p></div>
          ))}
        </div>
      </section>

      {loading ? <div className="text-center py-20 text-stone-400 text-lg">載入資料中...</div> : (
        <>
          {/* Tribes */}
          <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <div><h2 className="text-3xl font-bold text-stone-800">🏘️ 卑南八社</h2><p className="text-stone-500 mt-1">認識卑南族各部落的歷史與文化</p></div>
              <Link href="/tribes" className="text-amber-700 hover:text-amber-800 font-medium">查看全部 →</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tribes.map((t: any) => (
                <Link key={t.id} href={`/tribes/${t.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-stone-100 hover:-translate-y-1">
                  <div className="text-4xl mb-3">🏔️</div>
                  <h3 className="font-bold text-lg text-stone-800">{t.name}</h3>
                  {t.traditionalName && <p className="text-amber-600 text-sm mb-2">{t.traditionalName}</p>}
                  <p className="text-stone-500 text-sm line-clamp-2">{t.description}</p>
                  {t.population && <p className="text-xs text-stone-400 mt-3">人口約 {t.population?.toLocaleString()} 人</p>}
                </Link>
              ))}
            </div>
          </section>

          {/* Articles */}
          <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-3xl font-bold text-stone-800">📝 文化誌</h2><p className="text-stone-500 mt-1">深入了解卑南族文化的各個面向</p></div>
                <Link href="/articles" className="text-amber-700 hover:text-amber-800 font-medium">查看全部 →</Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {articles.map((a: any) => (
                  <Link key={a.id} href={`/articles/${a.slug}`} className="bg-stone-50 rounded-xl hover:shadow-md transition-all overflow-hidden group">
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 h-40 flex items-center justify-center text-5xl">📜</div>
                    <div className="p-5">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">{a.category}</span>
                      <h3 className="font-bold text-lg mt-2 group-hover:text-amber-700 transition line-clamp-2">{a.title}</h3>
                      <p className="text-stone-500 text-sm mt-2 line-clamp-2">{a.excerpt}</p>
                      <div className="text-xs text-stone-400 mt-3 flex items-center gap-3"><span>👤 {a.authorName || "佚名"}</span><span>👁️ {a.views}</span></div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Vocab */}
          <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <div><h2 className="text-3xl font-bold text-stone-800">📖 族語學習</h2><p className="text-stone-500 mt-1">一起來學卑南語</p></div>
              <Link href="/language" className="text-amber-700 hover:text-amber-800 font-medium">更多詞彙 →</Link>
            </div>
            <div className="grid md:grid-cols-5 gap-4">
              {vocab.map((v: any) => (
                <div key={v.id} className="bg-white rounded-xl shadow-sm p-5 border border-stone-100 text-center hover:shadow-md transition">
                  <p className="text-2xl font-bold text-amber-700 mb-1">{v.puyumaWord}</p>
                  <p className="text-stone-800 font-medium">{v.chineseMeaning}</p>
                  <p className="text-stone-400 text-sm">{v.englishMeaning}</p>
                  <p className="text-xs text-stone-400 mt-2 bg-stone-50 rounded-full px-2 py-1">{v.category}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Events */}
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-3xl font-bold text-stone-800">🎉 活動祭典</h2><p className="text-stone-500 mt-1">即將舉行的文化活動</p></div>
                <Link href="/events" className="text-amber-700 hover:text-amber-800 font-medium">查看全部 →</Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {events.map((e: any) => (
                  <div key={e.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">{e.type}</span>
                    <h3 className="font-bold text-lg mt-2">{e.title}</h3>
                    <p className="text-stone-500 text-sm mt-2 line-clamp-2">{e.description}</p>
                    <div className="text-sm text-stone-400 mt-3 flex items-center gap-2"><span>📅 {e.startDate}</span>{e.location && <span>📍 {e.location}</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
