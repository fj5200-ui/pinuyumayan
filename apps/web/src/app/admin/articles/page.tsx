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
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[var(--red)] underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">\u2022 $1</li>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-amber-300 pl-4 italic text-[var(--text-soft)] my-2">$1</blockquote>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-[#222] px-1.5 py-0.5 rounded text-sm">$1</code>')
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
    { label: "\ud83d\udd17", title: "連結", before: "[", after: "](https://)" },
    { label: "\ud83d\uddbc\ufe0f", title: "圖片", before: "![描述](", after: ")" },
    { label: "\u2022", title: "列表", before: "- ", after: "" },
    { label: ">", title: "引用", before: "> ", after: "" },
    { label: "<>", title: "程式碼", before: "`", after: "`" },
  ];
  return (
    <div className="flex gap-1 flex-wrap mb-1">
      {tools.map(t => (
        <button key={t.label} onClick={() => onInsert(t.before, t.after)} title={t.title} type="button"
          className="px-2.5 py-1 bg-gray-100 dark:bg-[#222] rounded text-xs font-mono hover:bg-gray-200 dark:hover:bg-[#444] transition dark:text-[var(--text-light)]">
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Version History Panel
function VersionHistory({ articleId, onRestore, onClose }: { articleId: number; onRestore: () => void; onClose: () => void }) {
  const { toast } = useToast();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewVersion, setViewVersion] = useState<any>(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    api.get<any>(`/api/workflows/articles/${articleId}/versions`)
      .then(d => { setVersions(d.versions || []); setLoading(false); })
      .catch(() => { setVersions([]); setLoading(false); });
  }, [articleId]);

  const restore = async (versionId: number) => {
    if (!confirm("確定要還原至此版本？目前的內容將被保存為新版本。")) return;
    try {
      await api.post(`/api/workflows/versions/${versionId}/restore`, {});
      toast("已還原至指定版本", "success");
      onRestore();
    } catch { toast("還原失敗", "error"); }
  };

  const viewDetail = async (versionId: number) => {
    try {
      const d = await api.get<any>(`/api/workflows/versions/${versionId}`);
      setViewVersion(d.version);
    } catch { toast("無法載入版本", "error"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg dark:text-gray-100">\ud83d\udcc3 版本歷史</h3>
        <button onClick={onClose} className="text-[var(--text-light)] hover:text-[var(--text-soft)] text-sm">關閉</button>
      </div>

      {loading ? <p className="text-center py-6 text-[var(--text-light)]">載入中...</p> : versions.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-light)]">
          <p className="text-3xl mb-2">\ud83d\udcad</p>
          <p>尚無版本記錄</p>
          <p className="text-xs mt-1">編輯文章後將自動保存版本</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {versions.map((v, i) => (
            <div key={v.id} className={`p-3 rounded-lg border transition ${viewVersion?.id === v.id ? "border-[var(--red)] bg-white dark:bg-[#222]/20" : "border-[var(--border)] dark:border-[#444] hover:border-gray-300 dark:hover:border-stone-500"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono bg-gray-100 dark:bg-[#222] px-2 py-0.5 rounded dark:text-[var(--text-light)]">v{v.version}</span>
                  <span className="ml-2 text-sm dark:text-gray-200">{v.title}</span>
                  {i === 0 && <span className="ml-2 text-xs bg-[rgba(153,27,27,0.06)] text-[var(--red)] dark:bg-[#222]/30 dark:text-[var(--yellow)] px-2 py-0.5 rounded-full">最新</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => viewDetail(v.id)} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">查看</button>
                  <button onClick={() => restore(v.id)} className="text-xs text-[var(--red)] hover:text-[var(--red)] dark:text-[var(--yellow)]">還原</button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-light)]">
                <span>\ud83d\udc64 {v.editedByName}</span>
                <span>\ud83d\udcc5 {new Date(v.createdAt).toLocaleString("zh-TW")}</span>
                {v.changeNote && <span className="italic">\ud83d\udcdd {v.changeNote}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Version detail view */}
      {viewVersion && (
        <div className="mt-4 border-t dark:border-[#444] pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium dark:text-gray-200">v{viewVersion.version} 內容預覽</h4>
            <button onClick={() => setViewVersion(null)} className="text-xs text-[var(--text-light)] hover:text-[var(--text-soft)]">收起</button>
          </div>
          <div className="bg-[var(--cream)] dark:bg-[#1a1a1a] rounded-lg p-4 max-h-60 overflow-y-auto">
            <p className="text-sm font-bold mb-2 dark:text-gray-200">{viewVersion.title}</p>
            {viewVersion.excerpt && <p className="text-sm text-[var(--text-soft)] mb-3 italic">{viewVersion.excerpt}</p>}
            <div className="prose prose-stone dark:prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: `<p class="my-2">${renderMarkdown(viewVersion.content || "")}</p>` }} />
          </div>
        </div>
      )}
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

  // Batch operation states
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  // Version history states
  const [showVersions, setShowVersions] = useState(false);
  const [versionArticleId, setVersionArticleId] = useState<number | null>(null);

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
      if (editItem) { await api.put(`/api/articles/${editItem.id}`, body); toast("文章已更新（版本已自動保存）", "success"); }
      else { await api.post("/api/articles", body); toast("文章已建立", "success"); }
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除？")) return;
    try { await api.del(`/api/articles/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  // ---- Batch Operations ----
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(a => a.id)));
    }
  };

  const batchPublish = async (published: boolean) => {
    if (selectedIds.size === 0) return toast("請先選取文章", "error");
    if (!confirm(`確定${published ? "發布" : "取消發布"} ${selectedIds.size} 篇文章？`)) return;
    setBatchLoading(true);
    try {
      await api.post("/api/articles/batch/publish", { ids: Array.from(selectedIds), published });
      toast(`${selectedIds.size} 篇文章已${published ? "發布" : "設為草稿"}`, "success");
      setSelectedIds(new Set());
      load();
    } catch { toast("批次操作失敗", "error"); }
    setBatchLoading(false);
  };

  const batchDelete = async () => {
    if (selectedIds.size === 0) return toast("請先選取文章", "error");
    if (!confirm(`\u26a0\ufe0f 確定刪除 ${selectedIds.size} 篇文章？此操作無法復原！`)) return;
    setBatchLoading(true);
    try {
      await api.post("/api/articles/batch/delete", { ids: Array.from(selectedIds) });
      toast(`${selectedIds.size} 篇文章已刪除`, "success");
      setSelectedIds(new Set());
      load();
    } catch { toast("批次刪除失敗", "error"); }
    setBatchLoading(false);
  };

  // ---- Version History ----
  const openVersionHistory = (articleId: number) => {
    setVersionArticleId(articleId);
    setShowVersions(true);
  };

  const filtered = articles
    .filter(a => !filterCat || a.category === filterCat)
    .filter(a => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">\ud83d\udcdd 文章管理</h1>
          <p className="text-sm text-[var(--text-soft)]">{articles.length} 篇文章 {selectedIds.size > 0 && <span className="text-[var(--yellow)]">| 已選取 {selectedIds.size} 篇</span>}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setBatchMode(!batchMode); setSelectedIds(new Set()); }}
            className={`px-3 py-2 rounded-lg text-sm transition ${batchMode ? "bg-[#444] text-white" : "bg-gray-100 dark:bg-[#222] dark:text-[var(--text-light)] hover:bg-gray-200"}`}>
            {batchMode ? "\u2716 取消批次" : "\u2610 批次操作"}
          </button>
          <button onClick={() => openEditor()} className="bg-[var(--red)] text-white px-4 py-2 rounded-lg hover:bg-[var(--red)] transition text-sm">+ 新增文章</button>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {batchMode && selectedIds.size > 0 && (
        <div className="bg-white dark:bg-[#222]/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-[var(--red)] dark:text-white/80">已選取 {selectedIds.size} 篇文章</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => batchPublish(true)} disabled={batchLoading}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 disabled:opacity-50 transition">
              \u2714 批次發布
            </button>
            <button onClick={() => batchPublish(false)} disabled={batchLoading}
              className="bg-[var(--cream)]0 text-white px-3 py-1.5 rounded text-xs hover:bg-[#444] disabled:opacity-50 transition">
              \u23f8 設為草稿
            </button>
            <button onClick={batchDelete} disabled={batchLoading}
              className="bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700 disabled:opacity-50 transition">
              \ud83d\uddd1 批次刪除
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜尋標題..."
          className="px-3 py-2 border rounded-lg text-sm dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-200 w-48" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-200">
          <option value="">全部分類</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-sm text-[var(--text-light)] self-center ml-auto">顯示 {filtered.length} / {articles.length}</span>
      </div>

      {loading ? <div className="text-center py-10 text-[var(--text-light)]">載入中...</div> : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b dark:border-[#333] text-left">
              {batchMode && (
                <th className="p-3 w-10">
                  <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll}
                    className="rounded border-gray-300 dark:border-[#444]" />
                </th>
              )}
              <th className="p-3 text-[var(--text-soft)]">標題</th><th className="p-3 text-[var(--text-soft)]">分類</th><th className="p-3 text-[var(--text-soft)]">瀏覽</th><th className="p-3 text-[var(--text-soft)]">狀態</th><th className="p-3 text-[var(--text-soft)]">字數</th><th className="p-3 text-[var(--text-soft)]">日期</th><th className="p-3 text-[var(--text-soft)]">操作</th>
            </tr></thead>
            <tbody className="divide-y dark:divide-[#333]">
              {filtered.map(a => (
                <tr key={a.id} className={`hover:bg-[var(--cream)] dark:hover:bg-[#333]/50 ${selectedIds.has(a.id) ? "bg-white/50 dark:bg-[#222]/10" : ""}`}>
                  {batchMode && (
                    <td className="p-3">
                      <input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)}
                        className="rounded border-gray-300 dark:border-[#444]" />
                    </td>
                  )}
                  <td className="p-3 font-medium dark:text-gray-200 max-w-xs truncate">{a.title}</td>
                  <td className="p-3"><span className="bg-gray-100 dark:bg-[#222] px-2 py-1 rounded text-xs">{a.category}</span></td>
                  <td className="p-3 text-[var(--text-soft)]">\ud83d\udc41\ufe0f {a.views}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${a.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-[var(--text-soft)]"}`}>{a.published ? "已發布" : "草稿"}</span></td>
                  <td className="p-3 text-[var(--text-light)] text-xs">{(a.content || "").replace(/\s/g, "").length}</td>
                  <td className="p-3 text-[var(--text-light)] text-xs">{new Date(a.createdAt).toLocaleDateString("zh-TW")}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEditor(a)} className="text-[var(--red)] hover:text-[var(--red)] text-xs">編輯</button>
                      <button onClick={() => openVersionHistory(a.id)} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs">版本</button>
                      <button onClick={() => del(a.id)} className="text-red-500 hover:text-red-700 text-xs">刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-[var(--text-light)]">
              {searchTerm || filterCat ? "找不到符合條件的文章" : "尚無文章"}
            </div>
          )}
        </div>
      )}

      {/* Article Editor Modal */}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editItem ? "編輯文章" : "新增文章"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">標題</label>
              <input value={form.title} onChange={e => { setForm({ ...form, title: e.target.value, slug: form.slug || autoSlug(e.target.value) }); }} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">摘要</label>
            <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">封面圖片 URL</label>
            <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100 text-sm" /></div>

          {/* Content editor with tabs */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium dark:text-[var(--text-light)]">內容 (支援 Markdown)</label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-light)]">{wordCount} 字</span>
                <div className="flex gap-1">
                  <button onClick={() => setPreviewMode(false)} type="button"
                    className={`px-3 py-1 rounded text-xs ${!previewMode ? "bg-[var(--red)] text-white" : "bg-gray-100 dark:bg-[#222] dark:text-[var(--text-light)]"}`}>編輯</button>
                  <button onClick={() => setPreviewMode(true)} type="button"
                    className={`px-3 py-1 rounded text-xs ${previewMode ? "bg-[var(--red)] text-white" : "bg-gray-100 dark:bg-[#222] dark:text-[var(--text-light)]"}`}>預覽</button>
                </div>
              </div>
            </div>
            {!previewMode ? (
              <>
                <EditorToolbar onInsert={handleInsert} />
                <textarea id="article-editor" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={12}
                  className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100 font-mono text-sm leading-relaxed"
                  placeholder="使用 Markdown 格式撰寫文章內容..." />
              </>
            ) : (
              <div className="w-full min-h-[280px] px-4 py-3 border rounded-lg dark:border-[#444] bg-white dark:bg-[#222] prose prose-stone dark:prose-invert max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: `<p class="my-2">${renderMarkdown(form.content || "（空白）")}</p>` }} />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">分類</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">標籤 (逗號分隔)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm dark:text-[var(--text-light)] py-2">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="rounded" /> 發布
              </label>
            </div>
          </div>

          {/* Version history link in editor */}
          {editItem && (
            <div className="flex items-center gap-2 pt-1 border-t dark:border-[#444]">
              <button onClick={() => { setShowEditor(false); openVersionHistory(editItem.id); }} type="button"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
                \ud83d\udcc3 查看版本歷史
              </button>
              <span className="text-xs text-[var(--text-light)]">（儲存時將自動保存版本）</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={save} className="bg-[var(--red)] text-white px-6 py-2 rounded-lg hover:bg-[var(--red)] transition">儲存</button>
            <button onClick={() => setShowEditor(false)} className="px-6 py-2 rounded-lg border dark:border-[#444] dark:text-[var(--text-light)] hover:bg-[var(--cream)] dark:hover:bg-[#333] transition">取消</button>
          </div>
        </div>
      </Modal>

      {/* Version History Modal */}
      <Modal open={showVersions} onClose={() => setShowVersions(false)} title="文章版本歷史">
        {versionArticleId && (
          <VersionHistory
            articleId={versionArticleId}
            onRestore={() => { setShowVersions(false); load(); }}
            onClose={() => setShowVersions(false)}
          />
        )}
      </Modal>
    </div>
  );
}
