"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
      toast("重設連結已發送", "success");
    } catch { toast("發送失敗，請稍後再試", "error"); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] shadow-sm p-8 border dark:border-[#333]">
        <h1 className="text-2xl font-bold text-center mb-2 dark:text-gray-100">🔑 忘記密碼</h1>
        {sent ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-4">📧</p>
            <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] mb-2">重設連結已發送</p>
            <p className="text-sm text-[var(--text-light)]">如果 {email} 已註冊，您將收到重設密碼的電子郵件。</p>
            <Link href="/login" className="text-[var(--red)] dark:text-[var(--yellow)] text-sm mt-4 inline-block hover:underline">← 回到登入</Link>
          </div>
        ) : (
          <>
            <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-center text-sm mb-6">輸入您的電子郵件，我們會寄送重設密碼連結</p>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-[var(--text-light)]">電子郵件</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg dark:border-[#444] dark:bg-[#222] dark:text-gray-100 focus:ring-2 focus:ring-red-500" placeholder="your@email.com" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[var(--red)] text-white py-2.5 rounded-lg hover:bg-[var(--red)] transition disabled:opacity-50 font-medium">
                {loading ? "發送中..." : "發送重設連結"}
              </button>
            </form>
            <p className="text-center text-sm text-[var(--text-light)] mt-4">
              記起密碼了？ <Link href="/login" className="text-[var(--red)] dark:text-[var(--yellow)] hover:underline">登入</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
