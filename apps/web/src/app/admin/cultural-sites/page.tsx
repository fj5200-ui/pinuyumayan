"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

const TYPES = ["temple", "monument", "gathering", "nature", "heritage", "other"];
const TYPE_LABELS: Record<string, string> = { temple: "祭祀場所", monument: "紀念碑", gathering: "集會所", nature: "自然景觀", heritage: "遺址", other: "其他" };
const TYPE_ICONS: Record<string, string> = { temple: "⛩️", monument: "🗿", gathering: "🏛️", nature: "🌿", heritage: "🏺", other: "📍" };

export default function AdminCulturalSites() {
  const { toast } = useToast();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", type: "heritage", description: "", tribeId: "", latitude: "", longitude: "", address: "", tags: ""
  });

  const load = () => {
    setLoading(true);
    api.get<any>("/api/cultural-sites").then(d => { setSites(d.sites || d || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const openEditor = (item?: any) => {
    if (item) {
      setEditItem(item);
      setForm({
        name: item.name || "", type: item.type || "heritage", description: item.description || "",
        tribeId: item.tribeId?.toString() || "", latitude: item.latitude?.toString() || "",
        longitude: item.longitude?.toString() || "", address: item.address || "",
        tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || "")
      });
    } else {
      setEditItem(null);
      setForm({ name: "", type: "heritage", description: "", tribeId: "", latitude: "", longitude: "", address: "", tags: "" });
    }
    setShowEditor(true);
  };

  const save = async () => {
    try {
      const body = {
        ...form,
        tribeId: form.tribeId ? parseInt(form.tribeId) : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : []
      };
      if (editItem) { await api.put(`/api/admin/cultural-sites/${editItem.id}`, body); toast("景點已更新", "success"); }
      else { await api.post("/api/admin/cultural-sites", body); toast("景點已建立", "success"); }
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除此景點？")) return;
    try { await api.del(`/api/admin/cultural-sites/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  const filtered = sites.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div><h1 className="text-2xl font-bold dark:text-stone-100">🏺 文化景點管理</h1><p className="text-sm text-stone-500">{sites.length} 個景點</p></div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋景點..." className="px-3 py-2 border rounded-lg text-sm dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 w-48" />
          <button onClick={() => openEditor()} className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition text-sm whitespace-nowrap">+ 新增景點</button>
        </div>
      </div>

      {/* Type stats */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TYPES.map(t => {
          const count = sites.filter(s => s.type === t).length;
          if (!count) return null;
          return <span key={t} className="text-xs px-3 py-1 bg-white dark:bg-stone-800 border dark:border-stone-700 rounded-full">
            {TYPE_ICONS[t]} {TYPE_LABELS[t]} <span className="font-bold text-amber-600">{count}</span>
          </span>;
        })}
      </div>

      {loading ? <div className="text-center py-10 text-stone-400">載入中...</div> : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-2">🏺</p>
          <p className="font-bold">尚無景點資料</p>
          <p className="text-sm mt-1">點擊「新增景點」開始建立</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-750 border-b dark:border-stone-700">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-stone-500">景點</th>
                <th className="text-left px-4 py-3 font-bold text-stone-500">類型</th>
                <th className="text-left px-4 py-3 font-bold text-stone-500 hidden md:table-cell">座標</th>
                <th className="text-left px-4 py-3 font-bold text-stone-500 hidden lg:table-cell">標籤</th>
                <th className="text-right px-4 py-3 font-bold text-stone-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold dark:text-stone-100">{s.name}</p>
                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{s.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg">
                      {TYPE_ICONS[s.type] || "📍"} {TYPE_LABELS[s.type] || s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-stone-400">
                    {s.latitude && s.longitude ? `${Number(s.latitude).toFixed(4)}, ${Number(s.longitude).toFixed(4)}` : "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {(Array.isArray(s.tags) ? s.tags : []).slice(0, 3).map((t: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-700 rounded-full text-stone-500">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditor(s)} className="text-amber-700 text-xs hover:underline mr-3">編輯</button>
                    <button onClick={() => del(s.id)} className="text-red-500 text-xs hover:underline">刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editItem ? "編輯景點" : "新增景點"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">名稱 *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" placeholder="景點名稱" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">類型</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100">
                {TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {TYPE_LABELS[t]}</option>)}
              </select></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">描述</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" placeholder="景點說明..." /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">地址</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" placeholder="台東縣..." /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">緯度</label>
              <input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" placeholder="22.75" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">經度</label>
              <input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" placeholder="121.15" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">部落 ID</label>
              <input value={form.tribeId} onChange={e => setForm({ ...form, tribeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" placeholder="1" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">標籤（逗號分隔）</label>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" placeholder="祭祀, 歷史, 自然" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800">儲存</button>
            <button onClick={() => setShowEditor(false)} className="px-6 py-2 rounded-lg border dark:border-stone-600 dark:text-stone-300">取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
