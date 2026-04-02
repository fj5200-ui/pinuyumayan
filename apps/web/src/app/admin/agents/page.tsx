"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";

const AGENT_TYPES = ["translation", "summary", "recommendation", "moderation", "analytics", "other"];
const TYPE_LABELS: Record<string, string> = { translation: "翻譯", summary: "摘要", recommendation: "推薦", moderation: "審核", analytics: "分析", other: "其他" };
const TYPE_ICONS: Record<string, string> = { translation: "🌐", summary: "📋", recommendation: "💡", moderation: "🛡️", analytics: "📊", other: "🤖" };
const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  inactive: "bg-gray-100 text-[var(--text-soft)] dark:bg-[#222] dark:text-[var(--text-light)]",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function AdminAgents() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", type: "translation", description: "", config: "{}", status: "active" });

  const load = () => {
    setLoading(true);
    api.get<any>("/api/admin/agents").then(d => { setAgents(d.agents || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const openEditor = (item?: any) => {
    if (item) {
      setEditItem(item);
      setForm({ name: item.name, type: item.type || "translation", description: item.description || "", config: item.config || "{}", status: item.status || "active" });
    } else {
      setEditItem(null);
      setForm({ name: "", type: "translation", description: "", config: "{}", status: "active" });
    }
    setShowEditor(true);
  };

  const save = async () => {
    try {
      if (editItem) { await api.put(`/api/admin/agents/${editItem.id}`, form); toast("Agent 已更新", "success"); }
      else { await api.post("/api/admin/agents", form); toast("Agent 已建立", "success"); }
      setShowEditor(false); load();
    } catch (e: any) { toast(e.message || "儲存失敗", "error"); }
  };

  const del = async (id: number) => {
    if (!confirm("確定刪除此 Agent？")) return;
    try { await api.del(`/api/admin/agents/${id}`); toast("已刪除", "success"); load(); } catch { toast("刪除失敗", "error"); }
  };

  const viewLogs = async (agent: any) => {
    try {
      const d = await api.get<any>(`/api/admin/agents/${agent.id}/logs`);
      setLogs(d.logs || []);
      setEditItem(agent);
      setShowLogs(true);
    } catch { toast("載入日誌失敗", "error"); }
  };

  const successRate = (a: any) => a.totalRuns > 0 ? ((a.successRuns / a.totalRuns) * 100).toFixed(1) : "—";

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div><h1 className="text-2xl font-bold dark:text-gray-100">🤖 AI Agent 管理</h1><p className="text-sm text-[var(--text-soft)]">{agents.length} 個 Agent</p></div>
        <button onClick={() => openEditor()} className="bg-[var(--red)] text-white px-4 py-2 rounded-lg hover:bg-[var(--red)] transition text-sm">+ 新增 Agent</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4 text-center">
          <p className="text-2xl font-black text-[var(--yellow)]">{agents.length}</p>
          <p className="text-xs text-[var(--text-light)]">Agent 總數</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4 text-center">
          <p className="text-2xl font-black text-green-600">{agents.filter(a => a.status === "active").length}</p>
          <p className="text-xs text-[var(--text-light)]">運行中</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{agents.reduce((s, a) => s + (a.totalRuns || 0), 0)}</p>
          <p className="text-xs text-[var(--text-light)]">總執行次數</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4 text-center">
          <p className="text-2xl font-black text-purple-600">{agents.length > 0 ? (agents.reduce((s, a) => s + (a.avgLatency || 0), 0) / agents.length).toFixed(0) : 0}ms</p>
          <p className="text-xs text-[var(--text-light)]">平均延遲</p>
        </div>
      </div>

      {loading ? <div className="text-center py-10 text-[var(--text-light)]">載入中...</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(a => (
            <div key={a.id} className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{TYPE_ICONS[a.type] || "🤖"}</span>
                  <div>
                    <h3 className="font-bold dark:text-gray-100">{a.name}</h3>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_STYLES[a.status] || STATUS_STYLES.inactive}`}>{a.status}</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-[#222] rounded-full text-[var(--text-soft)]">{TYPE_LABELS[a.type] || a.type}</span>
              </div>
              <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-light)] mb-3 line-clamp-2">{a.description}</p>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-[var(--cream)] dark:bg-stone-750 rounded-lg p-2">
                  <p className="text-sm font-bold dark:text-gray-200">{a.totalRuns || 0}</p>
                  <p className="text-xs text-[var(--text-light)]">執行</p>
                </div>
                <div className="bg-[var(--cream)] dark:bg-stone-750 rounded-lg p-2">
                  <p className="text-sm font-bold text-green-600">{successRate(a)}%</p>
                  <p className="text-xs text-[var(--text-light)]">成功率</p>
                </div>
                <div className="bg-[var(--cream)] dark:bg-stone-750 rounded-lg p-2">
                  <p className="text-sm font-bold dark:text-gray-200">{a.avgLatency || 0}ms</p>
                  <p className="text-xs text-[var(--text-light)]">延遲</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => viewLogs(a)} className="flex-1 text-xs text-center py-1.5 rounded-lg border dark:border-[#444] hover:bg-[var(--cream)] dark:hover:bg-stone-750 transition dark:text-[var(--text-light)]">📜 日誌</button>
                <button onClick={() => openEditor(a)} className="flex-1 text-xs text-center py-1.5 rounded-lg text-[var(--red)] border border-amber-200 dark:border-amber-800 hover:bg-white dark:hover:bg-[#222]/20 transition">✏️ 編輯</button>
                <button onClick={() => del(a.id)} className="text-xs px-3 py-1.5 rounded-lg text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editItem ? "編輯 Agent" : "新增 Agent"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">名稱 *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">類型</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100">
                {AGENT_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {TYPE_LABELS[t]}</option>)}
              </select></div>
          </div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">描述</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">狀態</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100">
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">Config (JSON)</label>
            <textarea value={form.config} onChange={e => setForm({ ...form, config: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg font-mono text-xs dark:border-[#444] dark:bg-[#222] dark:text-gray-100" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="bg-[var(--red)] text-white px-6 py-2 rounded-lg hover:bg-[var(--red)]">儲存</button>
            <button onClick={() => setShowEditor(false)} className="px-6 py-2 rounded-lg border dark:border-[#444] dark:text-[var(--text-light)]">取消</button>
          </div>
        </div>
      </Modal>

      {/* Logs Modal */}
      <Modal open={showLogs} onClose={() => setShowLogs(false)} title={`📜 ${editItem?.name} 執行日誌`}>
        {logs.length === 0 ? (
          <p className="text-center py-6 text-[var(--text-light)]">尚無執行日誌</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {logs.map((l: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[var(--cream)] dark:bg-stone-750 rounded-lg text-sm">
                <span className={l.success ? "text-green-500" : "text-red-500"}>{l.success ? "✅" : "❌"}</span>
                <div className="flex-1 min-w-0">
                  <p className="dark:text-gray-200">{l.message || l.action || "執行記錄"}</p>
                  <p className="text-xs text-[var(--text-light)] mt-0.5">{l.createdAt ? new Date(l.createdAt).toLocaleString("zh-TW") : ""} · {l.latency || 0}ms</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
