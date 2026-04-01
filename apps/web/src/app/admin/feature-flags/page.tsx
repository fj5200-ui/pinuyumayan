"use client";
import { useState } from "react";
import { useToast } from "@/lib/toast-context";

interface Flag { id: string; name: string; key: string; enabled: boolean; description: string; scope: string; updatedAt: string; }

const INITIAL_FLAGS: Flag[] = [
  { id: "1", name: "族語錄音功能", key: "feature_audio_record", enabled: true, description: "允許使用者錄製族語發音", scope: "all", updatedAt: "2026-03-30" },
  { id: "2", name: "AI 翻譯助手", key: "feature_ai_translate", enabled: false, description: "啟用 AI 翻譯卑南語⇄中文", scope: "admin", updatedAt: "2026-03-29" },
  { id: "3", name: "社群討論區", key: "feature_community", enabled: true, description: "開放社群討論板功能", scope: "all", updatedAt: "2026-03-28" },
  { id: "4", name: "進階地圖圖層", key: "feature_map_layers", enabled: false, description: "衛星、地形、歷史地圖切換", scope: "all", updatedAt: "2026-03-27" },
  { id: "5", name: "手寫辨識", key: "feature_handwriting", enabled: false, description: "族語手寫輸入辨識功能", scope: "beta", updatedAt: "2026-03-25" },
  { id: "6", name: "深色模式", key: "feature_dark_mode", enabled: true, description: "全站深色模式支援", scope: "all", updatedAt: "2026-03-20" },
  { id: "7", name: "文章版本歷史", key: "feature_article_versions", enabled: false, description: "文章編輯版本追蹤", scope: "editor", updatedAt: "2026-03-18" },
  { id: "8", name: "學習進度追蹤", key: "feature_learning_progress", enabled: true, description: "族語學習進度統計圖表", scope: "all", updatedAt: "2026-03-15" },
];

export default function FeatureFlagsPage() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<Flag[]>(INITIAL_FLAGS);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", key: "", description: "", scope: "all" });

  const toggle = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled, updatedAt: new Date().toISOString().split("T")[0] } : f));
    const flag = flags.find(f => f.id === id);
    toast(`${flag?.name} 已${flag?.enabled ? "停用" : "啟用"}`, flag?.enabled ? "info" : "success");
  };

  const addFlag = () => {
    if (!form.name || !form.key) { toast("請填寫名稱和 Key", "error"); return; }
    const newFlag: Flag = { id: Date.now().toString(), ...form, enabled: false, updatedAt: new Date().toISOString().split("T")[0] };
    setFlags(prev => [newFlag, ...prev]);
    setShowAdd(false);
    setForm({ name: "", key: "", description: "", scope: "all" });
    toast("功能開關已新增", "success");
  };

  const removeFlag = (id: string) => {
    if (!confirm("確定刪除此功能開關？")) return;
    setFlags(prev => prev.filter(f => f.id !== id));
    toast("已刪除", "success");
  };

  const filtered = flags.filter(f => f.name.includes(filter) || f.key.includes(filter));
  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-stone-100">🚩 Feature Flags</h1>
          <p className="text-sm text-stone-500 mt-1">{enabledCount}/{flags.length} 個功能已啟用</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition text-sm">+ 新增開關</button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-6 mb-6">
          <h3 className="font-bold dark:text-stone-100 mb-4">新增功能開關</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">名稱</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" placeholder="例：AI 翻譯助手" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">Key</label>
              <input value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 font-mono" placeholder="feature_xxx" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">描述</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-stone-300">範圍</label>
              <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100">
                <option value="all">所有用戶</option><option value="admin">僅管理員</option><option value="editor">編輯者+</option><option value="beta">Beta 測試</option>
              </select></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addFlag} className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800 text-sm">新增</button>
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 border rounded-lg dark:border-stone-600 dark:text-stone-300 text-sm">取消</button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="搜尋功能名稱或 Key..."
          className="w-full md:w-80 px-4 py-2 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100" />
      </div>

      <div className="space-y-3">
        {filtered.map(f => (
          <div key={f.id} className="bg-white dark:bg-stone-800 rounded-xl border dark:border-stone-700 p-5 flex items-center justify-between">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold dark:text-stone-100">{f.name}</h3>
                <code className="text-xs bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded font-mono text-stone-500 dark:text-stone-400">{f.key}</code>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  f.scope === "all" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                  f.scope === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                  f.scope === "beta" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                }`}>{f.scope}</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{f.description}</p>
              <p className="text-xs text-stone-400 mt-1">更新：{f.updatedAt}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => toggle(f.id)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${f.enabled ? "bg-green-500" : "bg-stone-300 dark:bg-stone-600"}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform mt-1 ${f.enabled ? "translate-x-6 ml-0.5" : "translate-x-0.5"}`} />
              </button>
              <button onClick={() => removeFlag(f.id)} className="text-red-400 hover:text-red-600 text-sm">刪除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
