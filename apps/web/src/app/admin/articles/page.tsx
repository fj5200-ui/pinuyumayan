"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

const CATEGORIES = ["文化", "部落", "歷史", "音樂", "工藝", "信仰", "語言", "教育"];

// Simple Markdown renderer
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-3" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-700 underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-amber-300 pl-4 italic text-stone-500 my-2">$1</blockquote>')
    .replace(/`([^`]+)`/g, '<code class="bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n\n/g, '</p><p class="my-2">')
    .replace(/\n/g, '<br/>');
}

// Toolbar for quick Markdown insert
function EditorToolbar({ onInsert }: { onInsert: (before: string, after: string) => void }) {
  const tools = [
    { label: "B", title: "粗體", before: "**", after: "**" },
    { label: "I", title: "斜體", before: "*", after: "*" },
    { label: "H2", title: "標題", before: "## ", after: "" },
    { label: "H3", title: "小標題", before: "### ", after: "" },
    { label: "🔗", title: "連結", before: "[", after: "](https://)" },
    { label: "🖼️", title: "圖片", before: "![描述](", after: ")" },
    { label: "•", title: "列表", before: "- ", after: "" },
    { label: ">", title: "引用", before: "> ", after: "" },
    { label: "<>", title: "程式碼", before: "`", after: "`" },
  ];
  return (
    <div className="flex gap-1 flex-wrap mb-1">
      {tools.map(t => (
        <button key={t.label} onClick={() => onInsert(t.before, t.after)} title={t.title} type="button"
          className="px-2.5 py-1 bg-stone-100 dark:bg-stone-700 rounded text-xs font-mono hover:bg-stone-200 dark:hover:bg-stone-600 transition dark:text-stone-300">
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminArticles() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", excerpt: "", category: "文化", tags: "", published: true, imageUrl: "" });
  const [previewMode, setPreviewMode] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const load = () => { setLoading(true); api.get<any>("/api/articles?limit=100").then(d => { setArticles(d.articles || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  useEffect(() => {
    setWordCount(form.content.replace(/\s/g, "").length);
  }, [form.content]);

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || `article-${Date.now()}`;

  const openEditor = (item?: any) => {
    if (item) {
      setEditItem(item);
      const tags = (() => { try { return JSON.parse(item.tags || "[]"); } catch { return []; } })();
      setForm({ title: item.title, slug: item.slug, content: item.content, excerpt: item.excerpt || "", category: item.category, tags: tags.join(", "), published: item.published, imageUrl: item.imageUrl || "" });
    } else {
      setEditItem(null);
      setForm({ title: "", slug: "", content: "", excerpt: "", category: "文化", tags: "", published: true, imageUrl: "" });
    }
    setPreviewMode(false);
    setShowEditor(true);
  };

  const handleInsert = useCallback((before: string, after: string) => {
    const textarea = document.querySelector<HTMLTextAreaElement>("#article-editor");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.substring(start, end);
    const newContent = form.content.substring(0, start) + before + (selected || "文字") + after + form.content.substring(end);
    setForm(f => ({ ...f, content: newContent }));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + before.length, start + before.length + (selected || "文字").length); }, 50);
  }, [form.content]);

  const save = async () => {
    try {
      const tags = JSON.stringify(form.tags.split(",").map(t => t.trim()).filter(Boolean));
      const slug = form.slug || autoSlug(form.title);
      const body = { ...form, slug, tags };
      if (editItem) { await api.put(`/api/articles/${editItem.id}`, body); toast("文章已更新", "success"); }
      else { await api.post("/api/articles", body); toast("文章已建立", "success"); }
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除？")) return;
    try { await api.del(`/api/articles/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  const filtered = articles
    .filter(a => !filterCat || a.category === filterCat)
    .filter(a => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-stone-100">📝 文章管理</h1>
          <p className="text-sm text-stone-500">{articles.length} 篇文章</p>
        </div>
        <button onClick={() => openEditor()} className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition text-sm">+ 新增文章</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜尋標題..."
          className="px-3 py-2 border rounded-lg text-sm dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200 w-48" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200">
          <option value="">全部分類</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-sm text-stone-400 self-center ml-auto">顯示 {filtered.length} / {articles.length}</span>
      </div>

      {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b dark:border-stone-700 text-left">
              <th className="p-3 text-stone-500">標題</th><th className="p-3 text-stone-500">分類</th><th className="p-3 text-stone-500">瀏覽</th><th className="p-3 text-stone-500">狀態</th><th className="p-3 text-stone-500">字數</th><th className="p-3 text-stone-500">日期</th><th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y dark:divide-stone-700">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <td className="p-3 font-medium dark:text-stone-200 max-w-xs truncate">{a.title}</td>
                  <td className="p-3"><span className="bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded text-xs">{a.category}</span></td>
                  <td className="p-3 text-stone-500">👁️ {a.views}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${a.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-stone-100 text-stone-500"}`}>{a.published ? "已發布" : "草稿"}</span></td>
                  <td className="p-3 text-stone-400 text-xs">{(a.content || "").replace(/\s/g, "").length}</td>
                  <td className="p-3 text-stone-400 text-xs">{new Date(a.createdAt).toLocaleDateString("zh-TW")}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEditor(a)} className="text-amber-700 hover:text-amber-800 text-xs">編輯</button>
                      <button onClick={() => del(a.id)} className="text-red-500 hover:text-red-700 text-xs">刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editItem ? "編輯文章" : "新增文章"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">標題</label>
              <input value={form.title} onChange={e => { setForm({ ...form, title: e.target.value, slug: form.slug || autoSlug(e.target.value) }); }} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">摘要</label>
            <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">封面圖片 URL</label>
            <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 text-sm" /></div>

          {/* Content editor with tabs */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium dark:text-stone-300">內容 (支援 Markdown)</label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400">{wordCount} 字</span>
                <div className="flex gap-1">
                  <button onClick={() => setPreviewMode(false)} type="button"
                    className={`px-3 py-1 rounded text-xs ${!previewMode ? "bg-amber-700 text-white" : "bg-stone-100 dark:bg-stone-700 dark:text-stone-300"}`}>編輯</button>
                  <button onClick={() => setPreviewMode(true)} type="button"
                    className={`px-3 py-1 rounded text-xs ${previewMode ? "bg-amber-700 text-white" : "bg-stone-100 dark:bg-stone-700 dark:text-stone-300"}`}>預覽</button>
                </div>
              </div>
            </div>
            {!previewMode ? (
              <>
                <EditorToolbar onInsert={handleInsert} />
                <textarea id="article-editor" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={12}
                  className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 font-mono text-sm leading-relaxed"
                  placeholder="使用 Markdown 格式撰寫文章內容..." />
              </>
            ) : (
              <div className="w-full min-h-[280px] px-4 py-3 border rounded-lg dark:border-stone-600 bg-white dark:bg-stone-700 prose prose-stone dark:prose-invert max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: `<p class="my-2">${renderMarkdown(form.content || "（空白）")}</p>` }} />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">分類</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">標籤 (逗號分隔)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm dark:text-stone-300 py-2">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="rounded" /> 發布
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition">儲存</button>
            <button onClick={() => setShowEditor(false)} className="px-6 py-2 rounded-lg border dark:border-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition">取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
