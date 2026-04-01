export const metadata = { title: "關於我們 — Pinuyumayan", description: "認識 Pinuyumayan 卑南族入口網的使命與願景" };

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-8">ℹ️ 關於我們</h1>
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-8 border border-stone-100 dark:border-stone-700 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-400 mb-3">🌾 Pinuyumayan 的使命</h2>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">Pinuyumayan（卑南族入口網）致力於保存、推廣與傳承卑南族（Puyuma）豐富的文化遺產。我們相信，透過數位科技的力量，可以讓更多人認識、學習並珍惜這份寶貴的原住民文化。</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-400 mb-3">🎯 我們的願景</h2>
          <ul className="space-y-3 text-stone-600 dark:text-stone-300">
            <li className="flex gap-2"><span>📖</span><span><strong>族語保存</strong>：系統化記錄卑南語詞彙，搭配發音與例句，讓學習變得輕鬆有趣</span></li>
            <li className="flex gap-2"><span>🏘️</span><span><strong>部落紀錄</strong>：詳細介紹卑南族八社的歷史、地理位置與文化特色</span></li>
            <li className="flex gap-2"><span>📝</span><span><strong>文化書寫</strong>：深入報導祭儀、工藝、音樂、信仰等文化面向</span></li>
            <li className="flex gap-2"><span>🎉</span><span><strong>活動推廣</strong>：整理祭典、工作坊與展覽等文化活動資訊</span></li>
            <li className="flex gap-2"><span>🎬</span><span><strong>媒體典藏</strong>：收集並保存珍貴的影像與聲音紀錄</span></li>
            <li className="flex gap-2"><span>🎯</span><span><strong>互動學習</strong>：提供族語測驗與每日一詞功能，讓學習更有趣味</span></li>
            <li className="flex gap-2"><span>🗺️</span><span><strong>地理探索</strong>：透過互動地圖，了解卑南八社的地理分佈</span></li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-400 mb-3">🛠️ 技術架構</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "前端", desc: "Next.js 16 + TypeScript + Tailwind CSS 4" },
              { label: "後端", desc: "NestJS 10 + TypeScript + Drizzle ORM" },
              { label: "資料庫", desc: "PostgreSQL 17 (Supabase)" },
              { label: "部署", desc: "Vercel (前端) + Render (API)" },
            ].map(t => (
              <div key={t.label} className="bg-stone-50 dark:bg-stone-700 rounded-xl p-4">
                <p className="font-bold text-stone-700 dark:text-stone-200">{t.label}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-400 mb-3">✨ 主要功能</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              "🏘️ 卑南八社介紹", "🗺️ 互動部落地圖", "📝 文化誌文章",
              "📖 族語詞彙庫", "🎯 族語測驗", "📅 每日一詞",
              "🎉 活動祭典", "🎬 多媒體庫", "🔍 全站搜尋",
              "🌙 暗色模式", "👤 會員系統", "⚙️ CMS管理後台",
              "💬 社群討論", "📊 學習進度", "📋 操作日誌",
            ].map(f => (
              <div key={f} className="bg-stone-50 dark:bg-stone-700 rounded-lg px-3 py-2 text-sm text-stone-600 dark:text-stone-300">{f}</div>
            ))}
          </div>
        </section>
        <section className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">💬 聯繫我們</h2>
          <p className="text-stone-600 dark:text-stone-300">如果您有任何建議或合作意向，歡迎與我們聯繫：</p>
          <p className="text-amber-700 dark:text-amber-400 font-medium mt-2">pinuyumayan@example.com</p>
        </section>
      </div>
    </div>
  );
}
