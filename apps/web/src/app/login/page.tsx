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
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-8 w-full max-w-md border dark:border-stone-700 animate-fade-in">
        <h1 className="text-2xl font-bold text-center mb-2 dark:text-stone-100">🌾 登入</h1>
        <p className="text-stone-500 dark:text-stone-400 text-center mb-6">歡迎回到 Pinuyumayan</p>
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-stone-200">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border dark:border-stone-600 dark:bg-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-stone-200">密碼</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border dark:border-stone-600 dark:bg-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 transition disabled:opacity-50">{loading ? "登入中..." : "登入"}</button>
        </form>
        <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">還沒有帳號？ <Link href="/register" className="text-amber-700 dark:text-amber-400 font-medium hover:underline">立即註冊</Link></p>
        <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-xs text-stone-400">
          <p className="font-medium mb-1">測試帳號：</p>
          <p>管理員: admin@pinuyumayan.tw / admin123</p>
          <p>編輯者: editor@pinuyumayan.tw / editor123</p>
          <p>一般用戶: user@pinuyumayan.tw / user123</p>
        </div>
      </div>
    </div>
  );
}
