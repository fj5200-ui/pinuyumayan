"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType; }
interface ToastCtx { toast: (msg: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastCtx>({} as ToastCtx);
export const useToast = () => useContext(ToastContext);

let _id = 0;
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++_id;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const colors = { success: "bg-green-600", error: "bg-red-600", info: "bg-amber-700" };
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`${colors[t.type]} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in max-w-sm`}>
            {t.type === "success" && "✅ "}{t.type === "error" && "❌ "}{t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
