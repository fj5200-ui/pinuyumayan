import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 animate-bounce">🏔️</div>
        <h1 className="text-4xl font-bold text-[var(--text-main)] dark:text-gray-100 mb-3">
          迷路了
        </h1>
        <p className="text-lg text-[var(--text-soft)] dark:text-[var(--text-light)] mb-2">
          找不到您要的頁面
        </p>
        <p className="text-sm text-[var(--text-light)] dark:text-[var(--text-soft)] mb-8">
          這片山林裡沒有這條路，但還有很多值得探索的地方
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="px-6 py-3 bg-[var(--red)] text-white rounded-[var(--radius-md)] font-medium hover:bg-[var(--red)] transition shadow-sm">
            🏠 回到首頁
          </Link>
          <Link href="/tribes"
            className="px-6 py-3 bg-white dark:bg-[#1a1a1a] text-[var(--text-main)] dark:text-gray-200 rounded-[var(--radius-md)] font-medium border border-[var(--border)] dark:border-[#333] hover:bg-[var(--cream)] dark:hover:bg-[#333] transition">
            🏕️ 探索部落
          </Link>
          <Link href="/articles"
            className="px-6 py-3 bg-white dark:bg-[#1a1a1a] text-[var(--text-main)] dark:text-gray-200 rounded-[var(--radius-md)] font-medium border border-[var(--border)] dark:border-[#333] hover:bg-[var(--cream)] dark:hover:bg-[#333] transition">
            📚 閱讀文化誌
          </Link>
        </div>
        <p className="mt-10 text-xs text-[var(--text-light)] dark:text-[var(--text-soft)]">
          Pinuyumayan — 卑南族文化入口網
        </p>
      </div>
    </div>
  );
}
