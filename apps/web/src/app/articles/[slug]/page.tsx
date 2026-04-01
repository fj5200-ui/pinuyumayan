import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getArticle(slug: string) {
  try { const r = await fetch(`${API}/api/articles/${slug}`, { next: { revalidate: 60 } }); return r.ok ? r.json() : null; } catch { return null; }
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArticle(slug);
  if (!data) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold">找不到此文章</h1><Link href="/articles" className="text-amber-700 mt-4 inline-block">← 返回文章列表</Link></div>;
  const article = data.article || data;
  const tags = (() => { try { return JSON.parse(article.tags || "[]"); } catch { return []; } })();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/articles" className="text-amber-700 hover:text-amber-800 text-sm mb-6 inline-block">← 返回文化誌</Link>
      <article className="bg-white rounded-2xl shadow-sm p-8 border border-stone-100">
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">{article.category}</span>
        <h1 className="text-3xl font-bold text-stone-800 mt-3 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-stone-400 mb-6 pb-6 border-b">
          <span>👤 {article.authorName || "佚名"}</span>
          <span>👁️ {article.views} 次瀏覽</span>
          <span>📅 {new Date(article.createdAt).toLocaleDateString("zh-TW")}</span>
        </div>
        {article.excerpt && <p className="text-lg text-stone-600 italic mb-6 bg-amber-50 p-4 rounded-xl">{article.excerpt}</p>}
        <div className="prose prose-stone max-w-none leading-relaxed whitespace-pre-line">{article.content}</div>
        {tags.length > 0 && (
          <div className="mt-8 pt-6 border-t flex flex-wrap gap-2">
            {tags.map((tag: string) => <span key={tag} className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-sm">#{tag}</span>)}
          </div>
        )}
      </article>
    </div>
  );
}
