"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      toast("登入成功！", "success");
      router.push("/profile");
    } catch (err: any) { setError(err.message || "登入失敗"); }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] shadow-lg p-8 w-full max-w-md border dark:border-[#333] animate-fade-in">
        <h1 className="text-2xl font-bold text-center mb-2 dark:text-gray-100">登入</h1>
        <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-center mb-6">歡迎回到 Pinuyumayan</p>
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border dark:border-[#444] dark:bg-[#222] focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">密碼</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border dark:border-[#444] dark:bg-[#222] focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--red)] text-white rounded-[var(--radius-md)] font-semibold hover:bg-[var(--red)] transition disabled:opacity-50">{loading ? "登入中..." : "登入"}</button>
        </form>
        <div className="flex items-center justify-between mt-6 text-sm">
          <Link href="/forgot-password" className="text-[var(--text-soft)] dark:text-[var(--text-light)] hover:text-[var(--red)] dark:hover:text-[var(--yellow)]">忘記密碼？</Link>
          <p className="text-[var(--text-soft)] dark:text-[var(--text-light)]">還沒有帳號？ <Link href="/register" className="text-[var(--red)] dark:text-[var(--yellow)] font-medium hover:underline">立即註冊</Link></p>
        </div>
        <div className="mt-4 p-3 bg-[var(--cream)] dark:bg-[#222] rounded-[var(--radius-md)] text-xs text-[var(--text-light)]">
          <p className="font-medium mb-1">測試帳號：</p>
          <p>管理員: admin@pinuyumayan.tw / admin123</p>
          <p>編輯者: editor@pinuyumayan.tw / editor123</p>
          <p>一般用戶: user@pinuyumayan.tw / user123</p>
        </div>
      </div>
    </div>
  );
}
