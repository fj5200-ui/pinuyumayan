"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

const CATEGORIES = ["問候", "親屬", "自然", "數字", "食物", "動物", "文化", "日常", "身體"];

export default function AdminVocabulary() {
  const { toast } = useToast();
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ puyumaWord: "", chineseMeaning: "", englishMeaning: "", pronunciation: "", exampleSentence: "", exampleChinese: "", category: "日常", audioUrl: "" });

  const load = () => { setLoading(true); api.get<any>("/api/language/vocabulary?limit=999").then(d => { setWords(d.words || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const openEditor = (item?: any) => {
    if (item) { setEditItem(item); setForm({ puyumaWord: item.puyumaWord, chineseMeaning: item.chineseMeaning, englishMeaning: item.englishMeaning || "", pronunciation: item.pronunciation || "", exampleSentence: item.exampleSentence || "", exampleChinese: item.exampleChinese || "", category: item.category, audioUrl: item.audioUrl || "" }); }
    else { setEditItem(null); setForm({ puyumaWord: "", chineseMeaning: "", englishMeaning: "", pronunciation: "", exampleSentence: "", exampleChinese: "", category: "日常", audioUrl: "" }); }
    setShowEditor(true);
  };

  const save = async () => {
    try {
      if (editItem) { await api.put(`/api/admin/vocabulary/${editItem.id}`, form); toast("詞彙已更新", "success"); }
      else { await api.post("/api/admin/vocabulary", form); toast("詞彙已建立", "success"); }
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除？")) return;
    try { await api.del(`/api/admin/vocabulary/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold dark:text-gray-100">族語詞彙管理</h1><p className="text-sm text-[var(--text-soft)]">{words.length} 個詞彙</p></div>
        <button onClick={() => openEditor()} className="bg-[var(--red)] text-white px-4 py-2 rounded-lg hover:bg-[var(--red)] transition text-sm">+ 新增詞彙</button>
      </div>
      {loading ? <div className="text-center py-10 text-[var(--text-light)]">載入中...</div> : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b dark:border-[#333] text-left">
              <th className="p-3 text-[var(--text-soft)]">族語</th><th className="p-3 text-[var(--text-soft)]">中文</th><th className="p-3 text-[var(--text-soft)]">英文</th><th className="p-3 text-[var(--text-soft)]">分類</th><th className="p-3 text-[var(--text-soft)]">發音</th><th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y dark:divide-[#333]">
              {words.map(w => (
                <tr key={w.id} className="hover:bg-[var(--cream)] dark:hover:bg-[#333]/50">
                  <td className="p-3 font-bold text-[var(--red)] dark:text-[var(--yellow)]">{w.puyumaWord}</td>
                  <td className="p-3 dark:text-gray-200">{w.chineseMeaning}</td>
                  <td className="p-3 text-[var(--text-soft)]">{w.englishMeaning}</td>
                  <td className="p-3"><span className="bg-gray-100 dark:bg-[#222] px-2 py-1 rounded text-xs">{w.category}</span></td>
                  <td className="p-3 text-[var(--text-light)] text-xs">{w.pronunciation}</td>
                  <td className="p-3"><div className="flex gap-2">
                    <button onClick={() => openEditor(w)} className="text-[var(--red)] text-xs hover:underline">編輯</button>
                    <button onClick={() => del(w.id)} className="text-red-500 text-xs hover:underline">刪除</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editItem ? "編輯詞彙" : "新增詞彙"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">族語</label><input value={form.puyumaWord} onChange={e => setForm({ ...form, puyumaWord: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">中文</label><input value={form.chineseMeaning} onChange={e => setForm({ ...form, chineseMeaning: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">英文</label><input value={form.englishMeaning} onChange={e => setForm({ ...form, englishMeaning: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">發音</label><input value={form.pronunciation} onChange={e => setForm({ ...form, pronunciation: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">分類</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">例句 (族語)</label><input value={form.exampleSentence} onChange={e => setForm({ ...form, exampleSentence: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">例句 (中文)</label><input value={form.exampleChinese} onChange={e => setForm({ ...form, exampleChinese: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">音檔 URL</label><input value={form.audioUrl} onChange={e => setForm({ ...form, audioUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" placeholder="https://..." /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="bg-[var(--red)] text-white px-6 py-2 rounded-lg hover:bg-[var(--red)]">儲存</button>
            <button onClick={() => setShowEditor(false)} className="px-6 py-2 rounded-lg border dark:border-[#444] dark:text-[var(--text-light)]">取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
