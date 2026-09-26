'use server';

import { redirect } from 'next/navigation';
import { startAdminSession, verifyPassword } from '@/lib/adminAuth';
import type { ActionState } from '@/lib/types';

export async function loginAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  // Buang spasi/newline yang ikut ter-bawa saat copy-paste.
  const password = String(formData.get('password') ?? '').replace(/\r?\n/g, '').trim();

  if (!password) {
    return { ok: false, message: 'Password wajib diisi.' };
  }

  let valid: boolean;
  try {
    valid = verifyPassword(password);
  } catch {
    return {
      ok: false,
      message: 'ADMIN_PASSWORD belum diisi di .env.local. Isi dulu lalu jalankan ulang server.'
    };
  }

  if (!valid) {
    // Jeda kecil untuk memperlambat percobaan brute force sederhana.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ok: false, message: 'Password salah.' };
  }

  await startAdminSession();
  redirect('/admin');
}
