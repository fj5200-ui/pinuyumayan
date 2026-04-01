"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setAuth } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await api.post<any>("/api/auth/register", form);
      setAuth(data.token, data.user);
      router.push("/profile");
    } catch (err: any) { setError(err.message || "註冊失敗"); }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border">
        <h1 className="text-2xl font-bold text-center mb-2">🌾 註冊</h1>
        <p className="text-stone-500 text-center mb-6">加入 Pinuyumayan 社群</p>
        {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" placeholder="您的名字" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密碼</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} className="w-full px-4 py-2.5 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none" placeholder="至少 6 個字元" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 transition disabled:opacity-50">{loading ? "註冊中..." : "註冊"}</button>
        </form>
        <p className="text-center text-sm text-stone-500 mt-6">已有帳號？ <Link href="/login" className="text-amber-700 font-medium hover:underline">立即登入</Link></p>
      </div>
    </div>
  );
}
