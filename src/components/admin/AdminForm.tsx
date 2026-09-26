'use client';

import { useActionState, type ReactNode } from 'react';
import { buttonClass } from '@/components/admin/ui';
import type { ActionState } from '@/lib/types';

/**
 * Pembungkus <form> untuk seluruh halaman form admin.
 * - Menjalankan server action lewat `useActionState`
 * - Menampilkan pesan sukses/gagal di atas formulir
 * - Menyuntikkan `_id` supaya satu action bisa dipakai untuk buat & ubah
 *
 * `children` adalah input-input isi dari halaman server (termasuk ImageUpload
 * yang mengisi hidden input sendiri).
 */
export default function AdminForm({
  action,
  id,
  submitLabel,
  cancelHref,
  children
}: {
  action: (prevState: ActionState | null, formData: FormData) => Promise<ActionState>;
  id?: string;
  submitLabel: string;
  cancelHref: string;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {id && <input type="hidden" name="_id" value={id} />}

      {state && state.message && (
        <p
          role="status"
          className={`rounded-lg px-4 py-3 text-[12.5px] font-medium leading-relaxed ${
            state.ok
              ? 'border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'
              : 'border border-[#fecaca] bg-[#fef2f2] text-[#991b1b]'
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="space-y-5">{children}</div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[#f0efed] pt-5">
        <button type="submit" disabled={pending} className={buttonClass('primary')}>
          {pending ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Menyimpan…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[17px]">save</span>
              {submitLabel}
            </>
          )}
        </button>

        <a href={cancelHref} className={buttonClass('outline')}>
          Batal
        </a>
      </div>
    </form>
  );
}
