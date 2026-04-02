const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = { "Content-Type": "application/json", ...(options?.headers || {}) };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "API Error");
  }
  return res.json();
}

async function uploadFetcher<T>(path: string, formData: FormData): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { method: "POST", headers, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Upload Error");
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => fetcher<T>(path),
  post: <T>(path: string, body: unknown) => fetcher<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => fetcher<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => fetcher<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) => uploadFetcher<T>(path, formData),
};

// Auth helpers
export function getToken() { return typeof window !== "undefined" ? localStorage.getItem("token") : null; }
export function getUser() { const u = typeof window !== "undefined" ? localStorage.getItem("user") : null; return u ? JSON.parse(u) : null; }
export function setAuth(token: string, user: any) { localStorage.setItem("token", token); localStorage.setItem("user", JSON.stringify(user)); }
export function logout() { localStorage.removeItem("token"); localStorage.removeItem("user"); }
