'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastTone = 'success' | 'error';

interface AdminToast {
  id: number;
  message: string;
  tone: ToastTone;
}

const EVENT_NAME = 'admin:toast';

/**
 * Kirim notifikasi toast dari komponen mana pun (termasuk server action).
 * Tidak perlu context — event window dipakai sebagai bus kecil.
 */
export function showToast(message: string, tone: ToastTone = 'success'): void {
  if (typeof window === 'undefined' || !message) return;
  const detail: AdminToast = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    message,
    tone
  };
  window.dispatchEvent(new CustomEvent<AdminToast>(EVENT_NAME, { detail }));
}

/** Wadah toast fixed; sekali di-render di layout panel admin. */
export function AdminToaster() {
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const toast = (event as CustomEvent<AdminToast>).detail;
      if (!toast?.message) return;

      setToasts((prev) => [...prev.filter((t) => t.id !== toast.id), toast].slice(-3));
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };

    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed right-4 top-20 z-[110] flex w-[min(92vw,360px)] flex-col items-end gap-2"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex w-full items-start gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-semibold leading-relaxed shadow-lg ${
            toast.tone === 'error'
              ? 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]'
              : 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'
          }`}
        >
          <span className="material-symbols-outlined shrink-0 text-[18px]">
            {toast.tone === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="min-w-0 break-words">{toast.message}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}
