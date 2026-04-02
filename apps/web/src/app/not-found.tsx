import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 animate-bounce">🏔️</div>
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-3">
          迷路了
        </h1>
        <p className="text-lg text-stone-500 dark:text-stone-400 mb-2">
          找不到您要的頁面
        </p>
        <p className="text-sm text-stone-400 dark:text-stone-500 mb-8">
          這片山林裡沒有這條路，但還有很多值得探索的地方
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="px-6 py-3 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition shadow-sm">
            🏠 回到首頁
          </Link>
          <Link href="/tribes"
            className="px-6 py-3 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl font-medium border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition">
            🏕️ 探索部落
          </Link>
          <Link href="/articles"
            className="px-6 py-3 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl font-medium border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition">
            📚 閱讀文化誌
          </Link>
        </div>
        <p className="mt-10 text-xs text-stone-300 dark:text-stone-600">
          Pinuyumayan — 卑南族文化入口網
        </p>
      </div>
    </div>
  );
}
