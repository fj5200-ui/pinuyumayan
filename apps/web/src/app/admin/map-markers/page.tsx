"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

const MARKER_TYPES = ["tribe", "site", "event", "custom"];
const TYPE_LABELS: Record<string, string> = { tribe: "部落", site: "景點", event: "活動", custom: "自訂" };
const TYPE_ICONS: Record<string, string> = { tribe: "", site: "", event: "", custom: "" };

export default function AdminMapMarkers() {
  const { toast } = useToast();
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [filterType, setFilterType] = useState("");
  const [form, setForm] = useState({
    name: "", type: "site", description: "", latitude: "", longitude: "", icon: "", color: "#e74c3c", visible: true
  });

  const load = () => {
    setLoading(true);
    api.get<any>("/api/admin/map-markers").then(d => { setMarkers(d.markers || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const openEditor = (item?: any) => {
    if (item) {
      setEditItem(item);
      setForm({
        name: item.name || "", type: item.type || "site", description: item.description || "",
        latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "",
        icon: item.icon || "", color: item.color || "#e74c3c", visible: item.visible !== false
      });
    } else {
      setEditItem(null);
      setForm({ name: "", type: "site", description: "", latitude: "", longitude: "", icon: "", color: "#e74c3c", visible: true });
    }
    setShowEditor(true);
  };

  const save = async () => {
    try {
      const body = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      if (editItem) { await api.put(`/api/admin/map-markers/${editItem.id}`, body); toast("標記已更新", "success"); }
      else { await api.post("/api/admin/map-markers", body); toast("標記已建立", "success"); }
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除此地圖標記？")) return;
    try { await api.del(`/api/admin/map-markers/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  const filtered = markers.filter(m => !filterType || m.type === filterType);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div><h1 className="text-2xl font-bold dark:text-gray-100">地圖標記管理</h1><p className="text-sm text-[var(--text-soft)]">{markers.length} 個標記</p></div>
        <button onClick={() => openEditor()} className="bg-[var(--red)] text-white px-4 py-2 rounded-lg hover:bg-[var(--red)] transition text-sm">+ 新增標記</button>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilterType("")} className={`text-xs px-3 py-1.5 rounded-full border transition ${!filterType ? "bg-[rgba(153,27,27,0.06)] border-amber-300 text-[var(--red)] dark:bg-[#222]/30 dark:border-amber-700 dark:text-[var(--yellow)]" : "dark:border-[#444] dark:text-[var(--text-light)] hover:bg-gray-100 dark:hover:bg-[#333]"}`}>
          全部 ({markers.length})
        </button>
        {MARKER_TYPES.map(t => {
          const count = markers.filter(m => m.type === t).length;
          return <button key={t} onClick={() => setFilterType(t)} className={`text-xs px-3 py-1.5 rounded-full border transition ${filterType === t ? "bg-[rgba(153,27,27,0.06)] border-amber-300 text-[var(--red)] dark:bg-[#222]/30 dark:border-amber-700 dark:text-[var(--yellow)]" : "dark:border-[#444] dark:text-[var(--text-light)] hover:bg-gray-100 dark:hover:bg-[#333]"}`}>
            {TYPE_ICONS[t]} {TYPE_LABELS[t]} ({count})
          </button>;
        })}
      </div>

      {loading ? <div className="text-center py-10 text-[var(--text-light)]">載入中...</div> : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-light)]">
          <p className="text-4xl mb-2"></p>
          <p className="font-bold">尚無地圖標記</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--cream)] dark:bg-stone-750 border-b dark:border-[#333]">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[var(--text-soft)]">標記</th>
                <th className="text-left px-4 py-3 font-bold text-[var(--text-soft)]">類型</th>
                <th className="text-left px-4 py-3 font-bold text-[var(--text-soft)] hidden md:table-cell">座標</th>
                <th className="text-center px-4 py-3 font-bold text-[var(--text-soft)]">顯示</th>
                <th className="text-right px-4 py-3 font-bold text-[var(--text-soft)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b dark:border-[#333] hover:bg-[var(--cream)] dark:hover:bg-stone-750 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" style={{ filter: m.visible ? "none" : "grayscale(1) opacity(0.5)" }}>{m.icon}</span>
                      <div>
                        <p className="font-bold dark:text-gray-100">{m.name}</p>
                        <p className="text-xs text-[var(--text-light)] line-clamp-1">{m.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: m.color + "20", color: m.color }}>
                      {TYPE_LABELS[m.type] || m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-[var(--text-light)] font-mono">
                    {m.latitude?.toFixed(4)}, {m.longitude?.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${m.visible ? "bg-green-400" : "bg-gray-300"}`} title={m.visible ? "可見" : "隱藏"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditor(m)} className="text-[var(--red)] text-xs hover:underline mr-3">編輯</button>
                    <button onClick={() => del(m.id)} className="text-red-500 text-xs hover:underline">刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editItem ? "編輯標記" : "新增標記"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">名稱 *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">類型</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100">
                {MARKER_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {TYPE_LABELS[t]}</option>)}
              </select></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">描述</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">緯度</label>
              <input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" placeholder="22.75" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">經度</label>
              <input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" placeholder="121.15" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">圖示</label>
              <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100 text-center text-xl" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">顏色</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full h-10 border rounded-lg dark:border-[#444] cursor-pointer" /></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.visible} onChange={e => setForm({ ...form, visible: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm dark:text-[var(--text-light)]">可見</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="bg-[var(--red)] text-white px-6 py-2 rounded-lg hover:bg-[var(--red)]">儲存</button>
            <button onClick={() => setShowEditor(false)} className="px-6 py-2 rounded-lg border dark:border-[#444] dark:text-[var(--text-light)]">取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
