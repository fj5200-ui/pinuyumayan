"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

const TYPES = ["祭典", "活動", "工作坊", "展覽", "其他"];

export default function AdminEvents() {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", type: "活動", location: "", startDate: "", endDate: "" });

  const load = () => { setLoading(true); api.get<any>("/api/events").then(d => { setEvents(d.events || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const openEditor = (item?: any) => {
    if (item) { setEditItem(item); setForm({ title: item.title, description: item.description || "", type: item.type, location: item.location || "", startDate: item.startDate || "", endDate: item.endDate || "" }); }
    else { setEditItem(null); setForm({ title: "", description: "", type: "活動", location: "", startDate: "", endDate: "" }); }
    setShowEditor(true);
  };

  const save = async () => {
    try {
      if (editItem) { await api.put(`/api/admin/events/${editItem.id}`, form); toast("活動已更新", "success"); }
      else { await api.post("/api/admin/events", form); toast("活動已建立", "success"); }
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除？")) return;
    try { await api.del(`/api/admin/events/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold dark:text-stone-100">🎉 活動管理</h1><p className="text-sm text-stone-500">{events.length} 個活動</p></div>
        <button onClick={() => openEditor()} className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition text-sm">+ 新增活動</button>
      </div>
      {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b dark:border-stone-700 text-left">
              <th className="p-3 text-stone-500">活動</th><th className="p-3 text-stone-500">類型</th><th className="p-3 text-stone-500">地點</th><th className="p-3 text-stone-500">日期</th><th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y dark:divide-stone-700">
              {events.map(e => (
                <tr key={e.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <td className="p-3 font-medium dark:text-stone-200">{e.title}</td>
                  <td className="p-3"><span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded text-xs">{e.type}</span></td>
                  <td className="p-3 text-stone-500 text-xs">{e.location || "-"}</td>
                  <td className="p-3 text-stone-400 text-xs">{e.startDate}{e.endDate ? ` ~ ${e.endDate}` : ""}</td>
                  <td className="p-3"><div className="flex gap-2">
                    <button onClick={() => openEditor(e)} className="text-amber-700 text-xs hover:underline">編輯</button>
                    <button onClick={() => del(e.id)} className="text-red-500 text-xs hover:underline">刪除</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editItem ? "編輯活動" : "新增活動"}>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">標題</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">說明</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">類型</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">地點</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">開始日期</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">結束日期</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
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
