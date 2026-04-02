"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

const TYPES = ["photo", "video", "audio"];

export default function AdminMedia() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", type: "photo", url: "", thumbnailUrl: "" });

  const load = () => { setLoading(true); api.get<any>("/api/media").then(d => { setItems(d.media || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const openEditor = (item?: any) => {
    if (item) { setEditItem(item); setForm({ title: item.title, description: item.description || "", type: item.type, url: item.url || "", thumbnailUrl: item.thumbnailUrl || "" }); }
    else { setEditItem(null); setForm({ title: "", description: "", type: "photo", url: "", thumbnailUrl: "" }); }
    setShowEditor(true);
  };

  const save = async () => {
    try {
      if (editItem) { await api.put(`/api/admin/media/${editItem.id}`, form); toast("媒體已更新", "success"); }
      else { await api.post("/api/admin/media", form); toast("媒體已建立", "success"); }
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除？")) return;
    try { await api.del(`/api/admin/media/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  const typeIcon = (t: string) => t === "video" ? "" : t === "audio" ? "" : "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold dark:text-gray-100">媒體管理</h1><p className="text-sm text-[var(--text-soft)]">{items.length} 個媒體</p></div>
        <button onClick={() => openEditor()} className="bg-[var(--red)] text-white px-4 py-2 rounded-lg hover:bg-[var(--red)] transition text-sm">+ 新增媒體</button>
      </div>
      {loading ? <div className="text-center py-10 text-[var(--text-light)]">載入中...</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(m => (
            <div key={m.id} className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-hidden">
              <div className="bg-gray-100 dark:bg-[#222] h-32 flex items-center justify-center text-4xl">{typeIcon(m.type)}</div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-medium dark:text-gray-200 text-sm">{m.title}</h3><p className="text-xs text-[var(--text-light)] mt-1">{m.type} · {new Date(m.createdAt).toLocaleDateString("zh-TW")}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditor(m)} className="text-[var(--red)] text-xs">編輯</button>
                    <button onClick={() => del(m.id)} className="text-red-500 text-xs">刪除</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editItem ? "編輯媒體" : "新增媒體"}>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">標題</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">說明</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">類型</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100">
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">URL</label><input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">縮圖 URL</label><input value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="bg-[var(--red)] text-white px-6 py-2 rounded-lg hover:bg-[var(--red)]">儲存</button>
            <button onClick={() => setShowEditor(false)} className="px-6 py-2 rounded-lg border dark:border-[#444] dark:text-[var(--text-light)]">取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
