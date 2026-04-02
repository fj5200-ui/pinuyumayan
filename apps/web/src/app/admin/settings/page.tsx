"use client";
import { useState } from "react";
import { useToast } from "@/lib/toast-context";

interface Setting { key: string; label: string; description: string; type: "text" | "toggle" | "select" | "number"; value: any; options?: string[]; group: string; }

const INITIAL_SETTINGS: Setting[] = [
  // General
  { key: "site_name", label: "網站名稱", description: "顯示在標題與 SEO 中", type: "text", value: "Pinuyumayan 卑南族入口網", group: "general" },
  { key: "site_description", label: "網站描述", description: "SEO meta description", type: "text", value: "保存與推廣卑南族語言、文化與傳統知識的數位平台", group: "general" },
  { key: "contact_email", label: "聯絡信箱", description: "公開聯絡信箱", type: "text", value: "pinuyumayan@example.com", group: "general" },
  { key: "default_language", label: "預設語言", description: "網站預設顯示語言", type: "select", value: "zh-TW", options: ["zh-TW", "en", "puyuma"], group: "general" },
  // Content
  { key: "articles_per_page", label: "每頁文章數", description: "文章列表分頁數量", type: "number", value: 10, group: "content" },
  { key: "vocab_per_page", label: "每頁詞彙數", description: "詞彙列表分頁數量", type: "number", value: 20, group: "content" },
  { key: "enable_comments", label: "開放留言", description: "允許用戶在文章下方留言", type: "toggle", value: true, group: "content" },
  { key: "require_approval", label: "留言審核", description: "新留言需管理員審核後才顯示", type: "toggle", value: false, group: "content" },
  { key: "auto_publish", label: "自動發布", description: "編輯者的文章自動發布（不需管理員審核）", type: "toggle", value: true, group: "content" },
  // Security
  { key: "enable_registration", label: "開放註冊", description: "允許新用戶自行註冊帳號", type: "toggle", value: true, group: "security" },
  { key: "jwt_expiry", label: "登入過期時間", description: "JWT Token 有效時間（小時）", type: "number", value: 72, group: "security" },
  { key: "max_login_attempts", label: "最大登入嘗試", description: "連續錯誤登入後暫時鎖定", type: "number", value: 5, group: "security" },
  { key: "enable_2fa", label: "雙因素驗證", description: "啟用 2FA 兩步驟驗證", type: "toggle", value: false, group: "security" },
  // Notifications
  { key: "email_notifications", label: "信箱通知", description: "寄送 email 通知給用戶", type: "toggle", value: false, group: "notifications" },
  { key: "notify_new_comment", label: "新留言通知", description: "有新留言時通知文章作者", type: "toggle", value: true, group: "notifications" },
  { key: "notify_new_follower", label: "新追蹤通知", description: "有人追蹤部落時通知管理員", type: "toggle", value: true, group: "notifications" },
];

const GROUPS = [
  { id: "general", label: "一般設定", icon: "" },
  { id: "content", label: "內容設定", icon: "" },
  { id: "security", label: "安全設定", icon: "" },
  { id: "notifications", label: "通知設定", icon: "" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Setting[]>(INITIAL_SETTINGS);
  const [activeGroup, setActiveGroup] = useState("general");
  const [saving, setSaving] = useState(false);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const saveAll = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast("設定已儲存", "success");
  };

  const resetGroup = () => {
    const original = INITIAL_SETTINGS.filter(s => s.group === activeGroup);
    setSettings(prev => prev.map(s => {
      const orig = original.find(o => o.key === s.key);
      return orig ? { ...s, value: orig.value } : s;
    }));
    toast("已重設為預設值", "info");
  };

  const groupSettings = settings.filter(s => s.group === activeGroup);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">系統設定</h1>
          <p className="text-sm text-[var(--text-soft)] mt-1">全站功能與安全性設定</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetGroup} className="px-4 py-2 border rounded-lg dark:border-[#444] dark:text-[var(--text-light)] text-sm hover:bg-[var(--cream)] dark:hover:bg-[#333]">重設此分類</button>
          <button onClick={saveAll} disabled={saving} className="bg-[var(--red)] text-white px-6 py-2 rounded-lg hover:bg-[var(--red)] transition text-sm disabled:opacity-50">
            {saving ? "儲存中..." : "儲存設定"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-3">
            {GROUPS.map(g => (
              <button key={g.id} onClick={() => setActiveGroup(g.id)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition text-sm ${activeGroup === g.id ? "bg-[rgba(153,27,27,0.06)] dark:bg-[#222]/30 text-[var(--red)] dark:text-[var(--yellow)] font-medium" : "text-[var(--text-soft)] dark:text-[var(--text-light)] hover:bg-[var(--cream)] dark:hover:bg-[#333]/50"}`}>
                <span className="mr-2">{g.icon}</span>{g.label}
                <span className="text-xs text-[var(--text-light)] ml-2">({settings.filter(s => s.group === g.id).length})</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Settings Form */}
        <div className="md:col-span-3 space-y-4">
          {groupSettings.map(s => (
            <div key={s.key} className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <label className="font-medium dark:text-gray-100">{s.label}</label>
                  <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-light)] mt-0.5">{s.description}</p>
                  <code className="text-xs text-[var(--text-light)] font-mono mt-1 block">{s.key}</code>
                </div>

                {s.type === "toggle" && (
                  <button onClick={() => updateSetting(s.key, !s.value)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${s.value ? "bg-green-500" : "bg-gray-300 dark:bg-[#444]"}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform mt-1 ${s.value ? "translate-x-6 ml-0.5" : "translate-x-0.5"}`} />
                  </button>
                )}

                {s.type === "text" && (
                  <input value={s.value} onChange={e => updateSetting(s.key, e.target.value)}
                    className="w-64 px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100 text-sm" />
                )}

                {s.type === "number" && (
                  <input type="number" value={s.value} onChange={e => updateSetting(s.key, parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100 text-sm text-center" />
                )}

                {s.type === "select" && (
                  <select value={s.value} onChange={e => updateSetting(s.key, e.target.value)}
                    className="w-40 px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100 text-sm">
                    {s.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
