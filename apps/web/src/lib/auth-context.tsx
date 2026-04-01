"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api, setAuth, logout as doLogout, getToken, getUser } from "./api";

interface User { id: number; email: string; name: string; role: string; avatarUrl?: string; bio?: string; tribeId?: number; createdAt?: string; }
interface AuthCtx { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string, name: string) => Promise<void>; logout: () => void; refresh: () => Promise<void>; isAdmin: boolean; isEditor: boolean; }

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const d = await api.get<any>("/api/auth/me");
      const u = d.user || d;
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    } catch { doLogout(); setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const cached = getUser();
    if (cached) setUser(cached);
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const d = await api.post<any>("/api/auth/login", { email, password });
    setAuth(d.token, d.user);
    setUser(d.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const d = await api.post<any>("/api/auth/register", { email, password, name });
    setAuth(d.token, d.user);
    setUser(d.user);
  };

  const logout = () => { doLogout(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, isAdmin: user?.role === "admin", isEditor: user?.role === "editor" || user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}
