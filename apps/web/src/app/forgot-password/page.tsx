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
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-8 border dark:border-stone-700">
        <h1 className="text-2xl font-bold text-center mb-2 dark:text-stone-100">🔑 忘記密碼</h1>
        {sent ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-4">📧</p>
            <p className="text-stone-600 dark:text-stone-300 mb-2">重設連結已發送</p>
            <p className="text-sm text-stone-400">如果 {email} 已註冊，您將收到重設密碼的電子郵件。</p>
            <Link href="/login" className="text-amber-700 dark:text-amber-400 text-sm mt-4 inline-block hover:underline">← 回到登入</Link>
          </div>
        ) : (
          <>
            <p className="text-stone-500 dark:text-stone-400 text-center text-sm mb-6">輸入您的電子郵件，我們會寄送重設密碼連結</p>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-stone-300">電子郵件</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 focus:ring-2 focus:ring-amber-500" placeholder="your@email.com" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-amber-700 text-white py-2.5 rounded-lg hover:bg-amber-800 transition disabled:opacity-50 font-medium">
                {loading ? "發送中..." : "發送重設連結"}
              </button>
            </form>
            <p className="text-center text-sm text-stone-400 mt-4">
              記起密碼了？ <Link href="/login" className="text-amber-700 dark:text-amber-400 hover:underline">登入</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
