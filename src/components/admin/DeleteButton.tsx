'use client';

import { useState, useTransition } from 'react';
import type { ActionState } from '@/lib/types';

/**
 * Tombol hapis dengan konfirmasi.
 * `action` adalah server action yang menerima id dan mengembalikan ActionState.
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
  const [message, setMessage] = useState<string | null>(null);

  function handleDelete() {
    const confirmed = window.confirm(`Hapus "${name}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmed) return;

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action(id);
        if (!result.ok) setMessage(result.message);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Gagal menghapus.');
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        title={`Hapus ${name}`}
        aria-label={`Hapus ${name}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#78716c] transition hover:bg-[#fef2f2] hover:text-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">{pending ? 'hourglass_top' : 'delete'}</span>
      </button>
      {message && <span className="text-[11px] font-medium text-[#b91c1c]">{message}</span>}
    </span>
  );
}
