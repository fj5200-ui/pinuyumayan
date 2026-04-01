"use client";
import { ReactNode, useEffect } from "react";

interface Props { open: boolean; onClose: () => void; title?: string; children: ReactNode; size?: "sm" | "md" | "lg"; }

export default function Modal({ open, onClose, title, children, size = "md" }: Props) {
  useEffect(() => { if (open) document.body.style.overflow = "hidden"; else document.body.style.overflow = ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  if (!open) return null;
  const w = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className={`relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full ${w} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b dark:border-stone-700">
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">{title}</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
