"use client";
import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

// Extract headings from markdown-like content for TOC
function extractHeadings(content: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const text = match[2].trim();
      headings.push({
        level: match[1].length,
        text,
        id: text.replace(/[^\w\u4e00-\u9fff]+/g, '-').toLowerCase(),
      });
    }
  }
  return headings;
}

// Simple markdown to HTML
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, (_, t) => `<h3 id="${t.trim().replace(/[^\w\u4e00-\u9fff]+/g, '-').toLowerCase()}" class="text-lg font-bold mt-6 mb-2 scroll-mt-20">${t}</h3>`)
    .replace(/^## (.+)$/gm, (_, t) => `<h2 id="${t.trim().replace(/[^\w\u4e00-\u9fff]+/g, '-').toLowerCase()}" class="text-xl font-bold mt-8 mb-3 scroll-mt-20">${t}</h2>`)
    .replace(/^# (.+)$/gm, (_, t) => `<h1 id="${t.trim().replace(/[^\w\u4e00-\u9fff]+/g, '-').toLowerCase()}" class="text-2xl font-bold mt-10 mb-4 scroll-mt-20">${t}</h1>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl max-w-full my-4 shadow-sm" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-700 dark:text-amber-400 underline hover:text-amber-800">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 my-1">\u2022 $1</li>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-amber-300 dark:border-amber-600 pl-4 italic text-stone-500 dark:text-stone-400 my-3 py-1 bg-amber-50/50 dark:bg-amber-900/10 rounded-r-lg">$1</blockquote>')
    .replace(/`([^`]+)`/g, '<code class="bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\n\n/g, '</p><p class="my-3 leading-relaxed">')
    .replace(/\n/g, '<br/>');
}

export default function ArticleDetail() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [navigation, setNavigation] = useState<{ prev: any; next: any }>({ prev: null, next: null });
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [activeHeading, setActiveHeading] = useState("");
  const articleRef = useRef<HTMLElement>(null);

  const headings = useMemo(() => article?.content ? extractHeadings(article.content) : [], [article?.content]);
  const renderedContent = useMemo(() => article?.content ? renderMarkdown(article.content) : '', [article?.content]);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const el = articleRef.current;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight;
      const visible = window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      setProgress(Math.min(100, (scrolled / (total - visible)) * 100));

      // Track active heading
      if (headings.length > 0) {
        let current = headings[0]?.id || "";
        for (const h of headings) {
          const hEl = document.getElementById(h.id);
          if (hEl && hEl.getBoundingClientRect().top <= 100) current = h.id;
        }
        setActiveHeading(current);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article, headings]);

  useEffect(() => {
    if (!params.slug) return;
    setLoading(true);
    api.get<any>(`/api/articles/${params.slug}`).then(d => {
      const a = d.article || d;
      setArticle(a);
      setLoading(false);
      if (a?.id) {
        api.get<any>(`/api/comments/article/${a.id}`).then(cd => setComments(cd.comments || [])).catch(() => {});
        api.get<any>(`/api/articles/meta/related/${a.id}`).then(rd => setRelated(rd.articles || rd.related || [])).catch(() => {});
        api.get<any>(`/api/articles/meta/navigation/${a.id}`).then(nd => setNavigation({ prev: nd.prev, next: nd.next })).catch(() => {});
        if (a.authorId) {
          api.get<any>(`/api/articles/meta/author/${a.authorId}`).then(ad => setAuthorProfile(ad)).catch(() => {});
        }
      }
    }).catch(() => setLoading(false));
  }, [params.slug]);

  useEffect(() => {
    if (!article || !user) return;
    api.get<any>(`/api/bookmarks/check/${article.id}`).then(d => setBookmarked(d.bookmarked)).catch(() => {});
  }, [article, user]);

  const submitComment = async () => {
    if (!newComment.trim() || !user) { toast("請先登入", "error"); return; }
    try {
      await api.post(`/api/comments/article/${article.id}`, { content: newComment });
      setNewComment("");
      const d = await api.get<any>(`/api/comments/article/${article.id}`);
      setComments(d.comments || []);
      toast("留言成功", "success");
    } catch { toast("留言失敗", "error"); }
  };

  const toggleLike = async () => {
    if (!user) { toast("請先登入", "error"); return; }
    try {
      await api.post(`/api/comments/article/${article.id}/like`, {});
      setLiked(!liked); setLikeCount(c => liked ? c - 1 : c + 1);
    } catch { toast("操作失敗", "error"); }
  };

  const toggleBookmark = async () => {
    if (!user) { toast("請先登入", "error"); return; }
    try {
      await api.post(`/api/bookmarks/${article.id}`, {});
      setBookmarked(!bookmarked);
      toast(bookmarked ? "已取消收藏" : "已加入收藏", "success");
    } catch { toast("操作失敗", "error"); }
  };

  const share = (platform: string) => {
    const url = window.location.href;
    const urls: Record<string, string> = {
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
      fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      copy: url,
    };
    if (platform === "copy") { navigator.clipboard.writeText(url); toast("已複製連結", "success"); return; }
    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowToc(false);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-20 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="h-64 bg-stone-200 dark:bg-stone-700 rounded-2xl" />
        <div className="h-8 w-3/4 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="h-4 w-1/2 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="space-y-2 mt-8">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-stone-200 dark:bg-stone-700 rounded" style={{ width: `${85 - i * 5}%` }} />)}
        </div>
      </div>
    </div>
  );

  if (!article) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">📭</div>
      <h1 className="text-2xl font-bold dark:text-stone-100">找不到此文章</h1>
      <p className="text-stone-400 mt-2 mb-6">文章可能已被移除或尚未發佈</p>
      <Link href="/articles" className="inline-block px-6 py-3 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition">&larr; 返回文章列表</Link>
    </div>
  );

  const tags = (() => { try { return JSON.parse(article.tags || "[]"); } catch { return []; } })();
  const wordCount = (article.content || '').replace(/\s/g, '').length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 500));

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-stone-200 dark:bg-stone-700">
        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Estimated reading time pill (appears when scrolling) */}
      {progress > 5 && progress < 95 && (
        <div className="fixed top-3 right-4 z-[60] bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400 transition-opacity">
          {Math.max(1, Math.ceil(readingTime * (1 - progress / 100)))} 分鐘可讀完
        </div>
      )}

      {/* TOC floating button (mobile) */}
      {headings.length > 2 && (
        <button onClick={() => setShowToc(!showToc)}
          className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-amber-700 text-white rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-amber-800 transition">
          {showToc ? '\u2715' : '\u2630'}
        </button>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500 mb-6">
          <Link href="/" className="hover:text-amber-700 dark:hover:text-amber-400 transition">首頁</Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-amber-700 dark:hover:text-amber-400 transition">文化誌</Link>
          <span>/</span>
          <span className="text-stone-600 dark:text-stone-300 truncate max-w-[200px]">{article.title}</span>
        </nav>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <article ref={articleRef} className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-8 border border-stone-100 dark:border-stone-700">
              {/* Cover image */}
              {article.coverImage && (
                <div className="mb-6 -mx-8 -mt-8 rounded-t-2xl overflow-hidden">
                  <img src={article.coverImage} alt={article.title} className="w-full h-48 md:h-72 object-cover" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full font-medium">{article.category}</span>
                <span className="text-xs text-stone-400">{wordCount.toLocaleString()} 字</span>
                <span className="text-xs text-stone-400">&middot; 約 {readingTime} 分鐘閱讀</span>
                <span className="text-xs text-stone-400">&middot; 👁️ {article.views} 次瀏覽</span>
              </div>
              <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-3 mb-4 leading-tight">{article.title}</h1>

              {/* Author card (enhanced) */}
              <div className="flex items-center gap-4 text-sm text-stone-400 dark:text-stone-500 mb-6 pb-6 border-b dark:border-stone-700">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-800 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
                    {authorProfile?.avatarUrl ? (
                      <img src={authorProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (article.authorName || '?')[0]}
                  </div>
                  <div>
                    <span className="block text-stone-700 dark:text-stone-200 font-medium">{article.authorName || "佚名"}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span>{new Date(article.createdAt).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}</span>
                      {authorProfile && (
                        <>
                          <span>&middot;</span>
                          <span>{authorProfile.articleCount} 篇文章</span>
                          <span>&middot;</span>
                          <span>共 {authorProfile.totalViews?.toLocaleString()} 次閱覽</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              {article.excerpt && (
                <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                  <p className="text-stone-600 dark:text-stone-300 italic leading-relaxed">{article.excerpt}</p>
                </div>
              )}

              {/* Article content (rendered markdown) */}
              <div className="prose prose-stone dark:prose-invert max-w-none leading-relaxed text-[15px]"
                dangerouslySetInnerHTML={{ __html: `<p class="my-3 leading-relaxed">${renderedContent}</p>` }} />

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-8 pt-6 border-t dark:border-stone-700 flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                      className="bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-full text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 pt-6 border-t dark:border-stone-700 flex flex-wrap items-center gap-3">
                <button onClick={toggleLike} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition text-sm ${liked ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600" : "border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
                  {liked ? "❤️" : "🤍"} {likeCount > 0 && likeCount}
                </button>
                <button onClick={toggleBookmark} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition text-sm ${bookmarked ? "bg-amber-50 dark:bg-amber-900/30 border-amber-200 text-amber-700" : "border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"}`}>
                  {bookmarked ? "🔖 已收藏" : "📑 收藏"}
                </button>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-stone-400 mr-2">分享：</span>
                  <button onClick={() => share("line")} className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition" title="LINE">💚</button>
                  <button onClick={() => share("fb")} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition" title="Facebook">💙</button>
                  <button onClick={() => share("copy")} className="p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition" title="複製連結">🔗</button>
                </div>
              </div>
            </article>

            {/* Prev/Next Article Navigation */}
            {(navigation.prev || navigation.next) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {navigation.prev ? (
                  <Link href={`/articles/${navigation.prev.slug}`}
                    className="group p-5 bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 transition hover:shadow-sm">
                    <span className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1 mb-2">
                      ← 上一篇
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition line-clamp-2">{navigation.prev.title}</span>
                    <span className="text-xs text-stone-400 mt-1 block">{navigation.prev.category}</span>
                  </Link>
                ) : <div />}
                {navigation.next ? (
                  <Link href={`/articles/${navigation.next.slug}`}
                    className="group p-5 bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 transition text-right hover:shadow-sm">
                    <span className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1 justify-end mb-2">
                      下一篇 →
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition line-clamp-2">{navigation.next.title}</span>
                    <span className="text-xs text-stone-400 mt-1 block">{navigation.next.category}</span>
                  </Link>
                ) : <div />}
              </div>
            )}

            {/* Author bio card (if available) */}
            {authorProfile && authorProfile.bio && (
              <div className="mt-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-6 border dark:border-stone-700">
                <h2 className="text-lg font-bold mb-3 dark:text-stone-100">✍️ 關於作者</h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-800 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm flex-shrink-0 overflow-hidden">
                    {authorProfile.avatarUrl ? (
                      <img src={authorProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (authorProfile.name || '?')[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800 dark:text-stone-100">{authorProfile.name}</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{authorProfile.bio}</p>
                    <div className="flex gap-4 mt-3 text-xs text-stone-400">
                      <span>📝 {authorProfile.articleCount} 篇文章</span>
                      <span>👁️ {authorProfile.totalViews?.toLocaleString()} 次總閱覽</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Related Articles */}
            {related.length > 0 && (
              <div className="mt-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-6 border dark:border-stone-700">
                <h2 className="text-xl font-bold mb-4 dark:text-stone-100">📚 相關文章</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {related.slice(0, 3).map((r: any) => (
                    <Link key={r.id} href={`/articles/${r.slug}`} className="group p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition">
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 px-2 py-0.5 rounded-full">{r.category}</span>
                      <h3 className="font-medium mt-2 dark:text-stone-200 line-clamp-2 text-sm group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">{r.title}</h3>
                      {r.excerpt && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{r.excerpt}</p>}
                      <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
                        <span>👁️ {r.views || 0}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="mt-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-6 border dark:border-stone-700">
              <h2 className="text-xl font-bold mb-4 dark:text-stone-100">💬 留言 ({comments.length})</h2>
              {user ? (
                <div className="flex gap-3 mb-6">
                  <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && submitComment()}
                    placeholder="分享你的想法..." className="flex-1 px-4 py-2.5 rounded-xl border dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 focus:border-amber-500 outline-none transition" />
                  <button onClick={submitComment} className="px-5 py-2.5 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition">送出</button>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-700 rounded-xl text-center"><Link href="/login" className="text-amber-700 dark:text-amber-400 font-medium">登入後即可留言</Link></div>
              )}
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.id} className="p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-sm">👤</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">{c.authorName || c.userName || "匿名"}</span>
                      <span className="text-xs text-stone-400">{new Date(c.createdAt).toLocaleDateString("zh-TW")}</span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 pl-10">{c.content}</p>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-center text-stone-400 py-4">還沒有留言，來當第一個吧！</p>}
              </div>
            </div>
          </div>

          {/* Sidebar TOC (desktop) */}
          {headings.length > 2 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-4 border dark:border-stone-700">
                  <h3 className="text-sm font-bold mb-3 dark:text-stone-200">📖 文章目錄</h3>
                  <nav className="space-y-1.5">
                    {headings.map((h, i) => (
                      <button key={i} onClick={() => scrollToHeading(h.id)}
                        className={`block text-left w-full text-xs hover:text-amber-700 dark:hover:text-amber-400 transition truncate ${
                          activeHeading === h.id ? "text-amber-700 dark:text-amber-400 font-semibold" : ""
                        } ${h.level === 1 ? "font-medium text-stone-700 dark:text-stone-200" : h.level === 2 ? "pl-3 text-stone-500 dark:text-stone-400" : "pl-6 text-stone-400 dark:text-stone-500"}`}>
                        {h.text}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Article stats mini card */}
                <div className="mt-4 bg-white dark:bg-stone-800 rounded-xl shadow-sm p-4 border dark:border-stone-700">
                  <h3 className="text-sm font-bold mb-2 dark:text-stone-200">📊 文章資訊</h3>
                  <div className="space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex justify-between"><span>字數</span><span className="font-medium text-stone-700 dark:text-stone-200">{wordCount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>閱讀時間</span><span className="font-medium text-stone-700 dark:text-stone-200">~{readingTime} 分鐘</span></div>
                    <div className="flex justify-between"><span>瀏覽次數</span><span className="font-medium text-stone-700 dark:text-stone-200">{article.views}</span></div>
                    <div className="flex justify-between"><span>留言數</span><span className="font-medium text-stone-700 dark:text-stone-200">{comments.length}</span></div>
                    <div className="flex justify-between"><span>發佈日期</span><span className="font-medium text-stone-700 dark:text-stone-200">{new Date(article.createdAt).toLocaleDateString("zh-TW")}</span></div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="mt-4 bg-white dark:bg-stone-800 rounded-xl shadow-sm p-4 border dark:border-stone-700 space-y-2">
                  <button onClick={toggleBookmark}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition ${bookmarked ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700" : "hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400"}`}>
                    {bookmarked ? "🔖 已收藏" : "📑 加入收藏"}
                  </button>
                  <button onClick={() => share("copy")}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 transition">
                    🔗 複製連結
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile TOC overlay */}
      {showToc && headings.length > 2 && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowToc(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-stone-800 rounded-t-2xl p-6 max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 dark:text-stone-100">📖 文章目錄</h3>
            <nav className="space-y-2">
              {headings.map((h, i) => (
                <button key={i} onClick={() => scrollToHeading(h.id)}
                  className={`block text-left w-full text-sm hover:text-amber-700 dark:hover:text-amber-400 transition ${
                    activeHeading === h.id ? "text-amber-700 dark:text-amber-400 font-semibold" : ""
                  } ${h.level === 1 ? "font-medium text-stone-700 dark:text-stone-200" : h.level === 2 ? "pl-4 text-stone-500 dark:text-stone-400" : "pl-8 text-stone-400"}`}>
                  {h.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
