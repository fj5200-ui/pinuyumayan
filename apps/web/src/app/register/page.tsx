"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("密碼不一致"); return; }
    if (password.length < 6) { setError("密碼至少 6 個字元"); return; }
    setError(""); setLoading(true);
    try {
      await register(email, password, name);
      toast("註冊成功！", "success");
      router.push("/profile");
    } catch (err: any) { setError(err.message || "註冊失敗"); }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] shadow-lg p-8 w-full max-w-md border dark:border-[#333] animate-fade-in">
        <h1 className="text-2xl font-bold text-center mb-2 dark:text-gray-100">🌾 註冊帳號</h1>
        <p className="text-[var(--text-soft)] dark:text-[var(--text-light)] text-center mb-6">加入 Pinuyumayan 社群</p>
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">姓名</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border dark:border-[#444] dark:bg-[#222] focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none" placeholder="你的名字" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border dark:border-[#444] dark:bg-[#222] focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">密碼</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border dark:border-[#444] dark:bg-[#222] focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none" placeholder="至少 6 個字元" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">確認密碼</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border dark:border-[#444] dark:bg-[#222] focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none" placeholder="再輸入一次密碼" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--red)] text-white rounded-[var(--radius-md)] font-semibold hover:bg-[var(--red)] transition disabled:opacity-50">{loading ? "註冊中..." : "建立帳號"}</button>
        </form>
        <p className="text-center text-sm text-[var(--text-soft)] dark:text-[var(--text-light)] mt-6">已有帳號？ <Link href="/login" className="text-[var(--red)] dark:text-[var(--yellow)] font-medium hover:underline">前往登入</Link></p>
      </div>
    </div>
  );
}
