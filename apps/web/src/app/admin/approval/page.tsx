"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

interface ApprovalItem {
  id: number; type: string; title: string; content: string;
  submittedBy: string; submittedById: number; status: string;
  reviewedBy?: string; reviewNote?: string; createdAt: string; reviewedAt?: string;
}

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  article: { label: "文章", icon: "", color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  comment: { label: "留言", icon: "", color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
  media: { label: "媒體", icon: "", color: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
  event: { label: "活動", icon: "", color: "bg-[rgba(217,119,6,0.1)] dark:bg-orange-900/40 text-[var(--yellow)] dark:text-orange-300" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "待審", color: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300" },
  approved: { label: "已核准", color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
  rejected: { label: "已退回", color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
};

export default function AdminApprovalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterType) params.set("type", filterType);
      const r = await api.get<any>(`/api/approval/queue?${params.toString()}`);
      setItems(r.items || []);
      setStats(r.stats || { pending: 0, approved: 0, rejected: 0 });
    } catch {
      toast("載入審核隊列失敗", "error");
    }
    setLoading(false);
  };

  useEffect(() => { loadQueue(); }, [filterStatus, filterType]);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/api/approval/${id}/approve`, { note: reviewNote });
      toast("已核准", "success");
      setReviewingId(null); setReviewNote(""); setSelectedItem(null);
      loadQueue();
    } catch { toast("操作失敗", "error"); }
  };

  const handleReject = async (id: number) => {
    try {
      await api.post(`/api/approval/${id}/reject`, { note: reviewNote });
      toast("已退回", "success");
      setReviewingId(null); setReviewNote(""); setSelectedItem(null);
      loadQueue();
    } catch { toast("操作失敗", "error"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">審核管理</h1>
          <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] mt-1">管理內容審核隊列</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-[var(--radius-md)] p-4 text-center border border-yellow-200 dark:border-yellow-800">
          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">待審核</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-[var(--radius-md)] p-4 text-center border border-green-200 dark:border-green-800">
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.approved}</p>
          <p className="text-sm text-green-600 dark:text-green-400">已核准</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-[var(--radius-md)] p-4 text-center border border-red-200 dark:border-red-800">
          <p className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</p>
          <p className="text-sm text-red-600 dark:text-red-400">已退回</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-200">
          <option value="">全部狀態</option>
          <option value="pending">待審</option>
          <option value="approved">已核准</option>
          <option value="rejected">已退回</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-200">
          <option value="">全部類型</option>
          <option value="article">文章</option>
          <option value="comment">留言</option>
          <option value="media">媒體</option>
          <option value="event">活動</option>
        </select>
        <button onClick={loadQueue} className="px-4 py-2 bg-[var(--red)] text-white rounded-lg text-sm hover:bg-[var(--red)] transition">
          重新整理
        </button>
      </div>

      {/* Queue items */}
      {loading ? <div className="text-center py-10 text-[var(--text-light)]">載入中...</div> :
        items.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333]">
            <p className="text-4xl mb-4"></p>
            <p className="text-[var(--text-soft)]">目前沒有待審項目</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const typeInfo = TYPE_LABELS[item.type] || { label: item.type, icon: "", color: "bg-gray-100 text-[var(--text-soft)]" };
              const statusInfo = STATUS_LABELS[item.status] || { label: item.status, color: "bg-gray-100 text-[var(--text-soft)]" };
              const isReviewing = reviewingId === item.id;

              return (
                <div key={item.id} className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] border dark:border-[#333] p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}>{typeInfo.icon} {typeInfo.label}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>
                      <h3 className="font-bold dark:text-gray-100 mb-1">{item.title}</h3>
                      <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-sm line-clamp-2">{item.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-light)]">
                        <span>{item.submittedBy}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString("zh-TW")}</span>
                        {item.reviewedBy && <span>審核: {item.reviewedBy}</span>}
                        {item.reviewNote && <span>{item.reviewNote}</span>}
                      </div>
                    </div>

                    {item.status === "pending" && (
                      <div className="flex gap-2 ml-4">
                        {!isReviewing ? (
                          <button onClick={() => setReviewingId(item.id)} className="text-xs px-3 py-1.5 bg-[rgba(153,27,27,0.06)] dark:bg-[#222]/30 text-[var(--red)] dark:text-[var(--yellow)] rounded-lg hover:bg-[rgba(217,119,6,0.1)] transition">
                            審核
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <input value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="審核備註（選填）"
                              className="px-3 py-1.5 border rounded-lg text-xs dark:bg-[#222] dark:border-[#444] dark:text-gray-200" />
                            <div className="flex gap-1">
                              <button onClick={() => handleApprove(item.id)} className="flex-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">核准</button>
                              <button onClick={() => handleReject(item.id)} className="flex-1 text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">退回</button>
                              <button onClick={() => { setReviewingId(null); setReviewNote(""); }} className="text-xs px-2 py-1.5 bg-gray-200 dark:bg-[#222] rounded-lg">取消</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
