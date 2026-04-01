import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">🌾 Pinuyumayan</h3>
            <p className="text-sm leading-relaxed">卑南族文化入口網，致力於保存與推廣卑南族語言、文化與傳統知識。</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">探索</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/tribes" className="hover:text-amber-400 transition">部落介紹</Link>
              <Link href="/articles" className="hover:text-amber-400 transition">文化誌</Link>
              <Link href="/language" className="hover:text-amber-400 transition">族語學習</Link>
              <Link href="/events" className="hover:text-amber-400 transition">活動祭典</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">資源</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/media" className="hover:text-amber-400 transition">媒體庫</Link>
              <Link href="/search" className="hover:text-amber-400 transition">全站搜尋</Link>
              <Link href="/about" className="hover:text-amber-400 transition">關於我們</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">聯繫</h4>
            <p className="text-sm">保存卑南族文化是我們共同的使命</p>
            <p className="text-sm mt-2 text-amber-400">pinuyumayan@example.com</p>
          </div>
        </div>
        <div className="border-t border-stone-700 mt-8 pt-6 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Pinuyumayan 卑南族入口網. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
