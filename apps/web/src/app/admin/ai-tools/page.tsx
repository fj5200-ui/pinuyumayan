"use client";
import { useState } from "react";
import { useToast } from "@/lib/toast-context";

interface AITool { id: string; name: string; icon: string; description: string; status: "active" | "inactive" | "beta"; lastUsed: string; usage: number; }

const TOOLS: AITool[] = [
  { id: "1", name: "族語翻譯", icon: "", description: "卑南語⇄中文雙向翻譯，支援句子與詞彙", status: "beta", lastUsed: "2026-03-30", usage: 128 },
  { id: "2", name: "內容摘要", icon: "", description: "自動生成文章摘要與關鍵詞", status: "active", lastUsed: "2026-03-31", usage: 256 },
  { id: "3", name: "圖片描述", icon: "", description: "自動為上傳圖片生成 alt text 描述", status: "inactive", lastUsed: "2026-03-20", usage: 45 },
  { id: "4", name: "內容審核", icon: "", description: "自動偵測不當內容、垃圾留言", status: "active", lastUsed: "2026-03-31", usage: 512 },
  { id: "5", name: "推薦引擎", icon: "", description: "個人化內容推薦（文章、詞彙、活動）", status: "beta", lastUsed: "2026-03-28", usage: 89 },
  { id: "6", name: "語音辨識", icon: "", description: "族語語音轉文字，用於學習評估", status: "inactive", lastUsed: "2026-03-15", usage: 12 },
];

export default function AIToolsPage() {
  const { toast } = useToast();
  const [tools, setTools] = useState<AITool[]>(TOOLS);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testing, setTesting] = useState(false);

  const toggleStatus = (id: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } as AITool : t));
    toast("狀態已更新", "success");
  };

  const runTest = async () => {
    if (!testInput.trim()) { toast("請輸入測試內容", "error"); return; }
    setTesting(true);
    setTestOutput("");
    // Simulated AI processing
    await new Promise(r => setTimeout(r, 1500));
    const outputs: Record<string, string> = {
      "1": `翻譯結果：「${testInput}」→ 「uninan na Pinuyumayan」（模擬翻譯）`,
      "2": `摘要：${testInput.slice(0, 50)}...（AI 自動摘要）\n關鍵詞：卑南族、文化、傳承`,
      "3": `圖片描述：一張展示卑南族傳統文化的圖片，包含豐富的色彩和民族元素`,
      "4": `審核結果：內容安全 — 未偵測到不當內容\n信心度：98.5%`,
      "5": `推薦：1. 南王部落歷史 2. 大獵祭傳說 3. 族語問候語`,
      "6": `語音辨識：「${testInput}」→ 辨識完成（模擬結果）`,
    };
    setTestOutput(outputs[selectedTool?.id || "1"] || "處理完成");
    setTesting(false);
  };

  const statusColor = (s: string) => {
    if (s === "active") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (s === "beta") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    return "bg-gray-100 text-[var(--text-soft)] dark:bg-[#222] dark:text-[var(--text-light)]";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">AI 工具管理</h1>
        <p className="text-sm text-[var(--text-soft)] mt-1">管理與測試 AI 自動化功能</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{tools.filter(t => t.status === "active").length}</p>
          <p className="text-xs text-[var(--text-soft)]">啟用中</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{tools.filter(t => t.status === "beta").length}</p>
          <p className="text-xs text-[var(--text-soft)]">Beta 測試</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--yellow)]">{tools.reduce((a, t) => a + t.usage, 0)}</p>
          <p className="text-xs text-[var(--text-soft)]">總呼叫次數</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tool List */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-[var(--text-soft)] dark:text-[var(--text-light)] mb-2">工具列表</h3>
          {tools.map(t => (
            <div key={t.id}
              onClick={() => { setSelectedTool(t); setTestOutput(""); setTestInput(""); }}
              className={`bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-4 cursor-pointer transition hover:shadow-sm ${selectedTool?.id === t.id ? "ring-2 ring-red-500" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <h3 className="font-bold dark:text-gray-100">{t.name}</h3>
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-light)]">{t.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>
                    {t.status === "active" ? "啟用" : t.status === "beta" ? "Beta" : "停用"}
                  </span>
                  <p className="text-xs text-[var(--text-light)] mt-1">{t.usage} 次</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Test Panel */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-6 sticky top-20">
          {selectedTool ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedTool.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg dark:text-gray-100">{selectedTool.name}</h3>
                    <p className="text-sm text-[var(--text-soft)]">{selectedTool.description}</p>
                  </div>
                </div>
                <button onClick={() => toggleStatus(selectedTool.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${selectedTool.status === "active" ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300" : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"}`}>
                  {selectedTool.status === "active" ? "停用" : "啟用"}
                </button>
              </div>

              <div className="border-t dark:border-[#333] pt-4">
                <h4 className="font-medium text-sm dark:text-gray-200 mb-2">測試面板</h4>
                <textarea value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="輸入測試內容..."
                  rows={3} className="w-full px-3 py-2 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100 text-sm mb-3" />
                <button onClick={runTest} disabled={testing}
                  className="bg-[var(--red)] text-white px-4 py-2 rounded-lg hover:bg-[var(--red)] transition text-sm disabled:opacity-50 w-full">
                  {testing ? "處理中..." : "執行測試"}
                </button>

                {testOutput && (
                  <div className="mt-4 bg-[var(--cream)] dark:bg-[#222]/50 rounded-lg p-4">
                    <h5 className="text-xs font-medium text-[var(--text-soft)] dark:text-[var(--text-light)] mb-2">輸出結果</h5>
                    <pre className="text-sm whitespace-pre-wrap dark:text-gray-200">{testOutput}</pre>
                  </div>
                )}
              </div>

              <div className="border-t dark:border-[#333] pt-4 mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="text-[var(--text-soft)]">最後使用</div><div className="dark:text-gray-200">{selectedTool.lastUsed}</div>
                <div className="text-[var(--text-soft)]">呼叫次數</div><div className="dark:text-gray-200">{selectedTool.usage}</div>
                <div className="text-[var(--text-soft)]">狀態</div><div><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(selectedTool.status)}`}>{selectedTool.status}</span></div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-[var(--text-light)]">
              <p className="text-4xl mb-3"></p>
              <p>選擇左側工具進行測試</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
