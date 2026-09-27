'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { buttonClass } from '@/components/admin/ui';
import { showToast } from '@/components/admin/Toaster';
import type { ActionState } from '@/lib/types';

/**
 * Tombol hapus dengan modal konfirmasi buatan sendiri (bukan window.confirm)
 * dan toast sebagai umpan balik hasil, bukan teks inline di dalam sel tabel.
 */
export default function DeleteButton({
  action,
  id,
  name
}: {
  action: (id: string) => Promise<ActionState>;
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup modal dengan Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function handleConfirm() {
    startTransition(async () => {
      try {
        const result = await action(id);
        showToast(result.message || (result.ok ? 'Berhasil dihapus.' : 'Gagal menghapus.'), result.ok ? 'success' : 'error');
        if (result.ok) setOpen(false);
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Gagal menghapus.', 'error');
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        title={`Hapus ${name}`}
        aria-label={`Hapus ${name}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#78716c] transition hover:bg-[#fef2f2] hover:text-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">{pending ? 'hourglass_top' : 'delete'}</span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-label={`Konfirmasi hapus ${name}`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !pending) setOpen(false);
            }}
          >
            <div className="w-full max-w-sm rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-2xl sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-[#b91c1c]">
                  <span className="material-symbols-outlined text-[22px]">delete</span>
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-[#1d1c18]">Hapus data ini?</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[#57534e]">
                    <span className="font-mono font-semibold text-[#1d1c18]">{name}</span> akan dihapus permanen dan
                    tidak bisa dibatalkan.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className={buttonClass('outline')}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={pending}
                  className={buttonClass('danger')}
                >
                  {pending ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                      Menghapus…
                    </>
                  ) : (
                    'Ya, hapus'
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
