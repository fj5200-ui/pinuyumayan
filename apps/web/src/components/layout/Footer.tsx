"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-800 dark:bg-stone-950 text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">🌾 Pinuyumayan</h3>
            <p className="text-sm leading-relaxed">卑南族文化入口網 — 保存與推廣卑南族語言、文化與傳統知識的數位平台。</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">探索</h4>
            <div className="space-y-2 text-sm">
              <Link href="/tribes" className="block hover:text-amber-400 transition">🏘️ 部落巡禮</Link>
              <Link href="/tribes/map" className="block hover:text-amber-400 transition">🗺️ 部落地圖</Link>
              <Link href="/articles" className="block hover:text-amber-400 transition">📝 文化誌</Link>
              <Link href="/events" className="block hover:text-amber-400 transition">🎉 活動祭典</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">學習</h4>
            <div className="space-y-2 text-sm">
              <Link href="/language" className="block hover:text-amber-400 transition">📖 族語詞彙</Link>
              <Link href="/language/quiz" className="block hover:text-amber-400 transition">🎯 族語測驗</Link>
              <Link href="/media" className="block hover:text-amber-400 transition">🎬 媒體庫</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">帳號</h4>
            <div className="space-y-2 text-sm">
              <Link href="/login" className="block hover:text-amber-400 transition">登入</Link>
              <Link href="/register" className="block hover:text-amber-400 transition">註冊</Link>
              <Link href="/about" className="block hover:text-amber-400 transition">關於平台</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-700 mt-8 pt-6 text-center text-sm text-stone-500">
          <p>&copy; {new Date().getFullYear()} Pinuyumayan 卑南族入口網. All rights reserved.</p>
          <p className="mt-1">Preserving Puyuma Culture for Future Generations</p>
        </div>
      </div>
    </footer>
  );
}
