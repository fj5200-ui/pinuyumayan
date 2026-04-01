"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

export default function AdminTribes() {
  const { toast } = useToast();
  const [tribes, setTribes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", traditionalName: "", region: "", description: "", history: "", latitude: "", longitude: "", population: "" });

  const load = () => { setLoading(true); api.get<any>("/api/tribes").then(d => { setTribes(d.tribes || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const openEditor = (item?: any) => {
    if (item) {
      setEditItem(item);
      setForm({ name: item.name, traditionalName: item.traditionalName || "", region: item.region || "", description: item.description || "", history: item.history || "", latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "", population: item.population?.toString() || "" });
    } else {
      setEditItem(null);
      setForm({ name: "", traditionalName: "", region: "", description: "", history: "", latitude: "", longitude: "", population: "" });
    }
    setShowEditor(true);
  };

  const save = async () => {
    try {
      const body = { ...form, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null, population: form.population ? parseInt(form.population) : null };
      if (editItem) { await api.put(`/api/admin/tribes/${editItem.id}`, body); toast("部落已更新", "success"); }
      else { await api.post("/api/admin/tribes", body); toast("部落已建立", "success"); }
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除？")) return;
    try { await api.del(`/api/admin/tribes/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold dark:text-stone-100">🏘️ 部落管理</h1><p className="text-sm text-stone-500">{tribes.length} 個部落</p></div>
        <button onClick={() => openEditor()} className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition text-sm">+ 新增部落</button>
      </div>
      {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tribes.map(t => (
            <div key={t.id} className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-bold dark:text-stone-100">{t.name}</h3>{t.traditionalName && <p className="text-sm text-amber-600 dark:text-amber-400">{t.traditionalName}</p>}</div>
                <div className="flex gap-2">
                  <button onClick={() => openEditor(t)} className="text-amber-700 text-xs hover:underline">編輯</button>
                  <button onClick={() => del(t.id)} className="text-red-500 text-xs hover:underline">刪除</button>
                </div>
              </div>
              {t.region && <p className="text-xs text-stone-400 mb-1">📍 {t.region}</p>}
              {t.population && <p className="text-xs text-stone-400 mb-2">👥 {t.population?.toLocaleString()}</p>}
              <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">{t.description}</p>
            </div>
          ))}
        </div>
      )}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editItem ? "編輯部落" : "新增部落"}>
        <div className="space-y-3">
          {[{ k: "name", l: "名稱" }, { k: "traditionalName", l: "傳統名稱" }, { k: "region", l: "地區" }].map(f => (
            <div key={f.k}><label className="block text-sm font-medium mb-1 dark:text-stone-300">{f.l}</label>
              <input value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
          ))}
          <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">簡介</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">歷史</label>
            <textarea value={form.history} onChange={e => setForm({ ...form, history: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">緯度</label><input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">經度</label><input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">人口</label><input value={form.population} onChange={e => setForm({ ...form, population: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800">儲存</button>
            <button onClick={() => setShowEditor(false)} className="px-6 py-2 rounded-lg border dark:border-stone-600 dark:text-stone-300">取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
