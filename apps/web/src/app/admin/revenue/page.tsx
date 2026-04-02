"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

const REVENUE_TYPES = ["donation", "grant", "sponsorship", "ad", "merchandise", "other"];
const TYPE_LABELS: Record<string, string> = { donation: "捐款", grant: "補助", sponsorship: "贊助", ad: "廣告", merchandise: "商品", other: "其他" };
const TYPE_ICONS: Record<string, string> = { donation: "❤️", grant: "🏛️", sponsorship: "🤝", ad: "📢", merchandise: "🛍️", other: "💰" };
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  completed: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300" },
  pending: { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-300" },
  cancelled: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-300" },
};

export default function AdminRevenue() {
  const { toast } = useToast();
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [filterType, setFilterType] = useState("");
  const [form, setForm] = useState({
    type: "donation", amount: "", currency: "TWD", description: "", donorName: "", donorEmail: "", status: "completed"
  });

  const load = () => {
    setLoading(true);
    api.get<any>("/api/admin/revenue").then(d => {
      setRecords(d.records || []);
      setSummary(d.summary || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const openEditor = (item?: any) => {
    if (item) {
      setEditItem(item);
      setForm({
        type: item.type || "donation", amount: item.amount?.toString() || "", currency: item.currency || "TWD",
        description: item.description || "", donorName: item.donorName || "", donorEmail: item.donorEmail || "",
        status: item.status || "completed"
      });
    } else {
      setEditItem(null);
      setForm({ type: "donation", amount: "", currency: "TWD", description: "", donorName: "", donorEmail: "", status: "completed" });
    }
    setShowEditor(true);
  };

  const save = async () => {
    try {
      const body = { ...form, amount: parseFloat(form.amount) || 0 };
      if (editItem) { await api.put?.(`/api/admin/revenue/${editItem.id}`, body); }
      else { await api.post("/api/admin/revenue", body); }
      toast("收入記錄已儲存", "success");
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除此記錄？")) return;
    try { await api.del(`/api/admin/revenue/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  const filtered = records.filter(r => !filterType || r.type === filterType);
  const totalAmount = filtered.reduce((s, r) => s + (r.status !== "cancelled" ? (r.amount || 0) : 0), 0);
  const formatMoney = (n: number) => new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div><h1 className="text-2xl font-bold dark:text-gray-100">💰 收入管理</h1><p className="text-sm text-[var(--text-soft)]">{records.length} 筆記錄</p></div>
        <button onClick={() => openEditor()} className="bg-[var(--red)] text-white px-4 py-2 rounded-lg hover:bg-[var(--red)] transition text-sm">+ 新增記錄</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4">
          <p className="text-xs text-[var(--text-light)] mb-1">總收入</p>
          <p className="text-xl font-black text-green-600">{formatMoney(summary.totalRevenue || totalAmount)}</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4">
          <p className="text-xs text-[var(--text-light)] mb-1">已完成</p>
          <p className="text-xl font-black text-blue-600">{records.filter(r => r.status === "completed").length}</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4">
          <p className="text-xs text-[var(--text-light)] mb-1">待處理</p>
          <p className="text-xl font-black text-yellow-600">{records.filter(r => r.status === "pending").length}</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4">
          <p className="text-xs text-[var(--text-light)] mb-1">本月收入</p>
          <p className="text-xl font-black text-purple-600">{formatMoney(summary.monthlyRevenue || 0)}</p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilterType("")} className={`text-xs px-3 py-1.5 rounded-full border transition ${!filterType ? "bg-[rgba(153,27,27,0.06)] border-amber-300 text-[var(--red)] dark:bg-[#222]/30 dark:border-amber-700 dark:text-[var(--yellow)]" : "dark:border-[#444] dark:text-[var(--text-light)] hover:bg-gray-100 dark:hover:bg-[#333]"}`}>
          全部 ({records.length})
        </button>
        {REVENUE_TYPES.map(t => {
          const count = records.filter(r => r.type === t).length;
          if (!count) return null;
          return <button key={t} onClick={() => setFilterType(t)} className={`text-xs px-3 py-1.5 rounded-full border transition ${filterType === t ? "bg-[rgba(153,27,27,0.06)] border-amber-300 text-[var(--red)] dark:bg-[#222]/30 dark:border-amber-700 dark:text-[var(--yellow)]" : "dark:border-[#444] dark:text-[var(--text-light)] hover:bg-gray-100 dark:hover:bg-[#333]"}`}>
            {TYPE_ICONS[t]} {TYPE_LABELS[t]} ({count})
          </button>;
        })}
      </div>

      {loading ? <div className="text-center py-10 text-[var(--text-light)]">載入中...</div> : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-light)]">
          <p className="text-4xl mb-2">💰</p>
          <p className="font-bold">尚無收入記錄</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--cream)] dark:bg-stone-750 border-b dark:border-[#333]">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[var(--text-soft)]">描述</th>
                <th className="text-left px-4 py-3 font-bold text-[var(--text-soft)]">類型</th>
                <th className="text-right px-4 py-3 font-bold text-[var(--text-soft)]">金額</th>
                <th className="text-center px-4 py-3 font-bold text-[var(--text-soft)]">狀態</th>
                <th className="text-left px-4 py-3 font-bold text-[var(--text-soft)] hidden md:table-cell">來源</th>
                <th className="text-left px-4 py-3 font-bold text-[var(--text-soft)] hidden lg:table-cell">日期</th>
                <th className="text-right px-4 py-3 font-bold text-[var(--text-soft)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const st = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                return (
                  <tr key={r.id} className="border-b dark:border-[#333] hover:bg-[var(--cream)] dark:hover:bg-stone-750 transition">
                    <td className="px-4 py-3">
                      <p className="font-bold dark:text-gray-100">{r.description || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-[#222] rounded-lg">{TYPE_ICONS[r.type]} {TYPE_LABELS[r.type] || r.type}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">
                      {formatMoney(r.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${st.bg} ${st.text}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-[var(--text-light)]">
                      {r.donorName || "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[var(--text-light)]">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("zh-TW") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => del(r.id)} className="text-red-500 text-xs hover:underline">刪除</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[var(--cream)] dark:bg-stone-750 font-bold">
                <td className="px-4 py-3 dark:text-gray-200">合計</td>
                <td></td>
                <td className="px-4 py-3 text-right text-green-600">{formatMoney(totalAmount)}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <Modal open={showEditor} onClose={() => setShowEditor(false)} title="新增收入記錄">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">類型</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100">
                {REVENUE_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {TYPE_LABELS[t]}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">金額 (TWD) *</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" placeholder="10000" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">描述</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" placeholder="說明..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">來源名稱</label>
              <input value={form.donorName} onChange={e => setForm({ ...form, donorName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">來源 Email</label>
              <input value={form.donorEmail} onChange={e => setForm({ ...form, donorEmail: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">狀態</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100">
              <option value="completed">已完成</option><option value="pending">待處理</option><option value="cancelled">已取消</option>
            </select></div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="bg-[var(--red)] text-white px-6 py-2 rounded-lg hover:bg-[var(--red)]">儲存</button>
            <button onClick={() => setShowEditor(false)} className="px-6 py-2 rounded-lg border dark:border-[#444] dark:text-[var(--text-light)]">取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
