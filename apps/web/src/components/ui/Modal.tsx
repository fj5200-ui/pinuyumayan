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
      <div className={`relative bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] shadow-2xl w-full ${w} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b dark:border-[#333]">
            <h2 className="text-lg font-bold text-[var(--text-main)] dark:text-stone-100">{title}</h2>
            <button onClick={onClose} className="text-[var(--text-light)] hover:text-[var(--text-soft)] text-xl">✕</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
