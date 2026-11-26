import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { MAX_UPLOAD_BYTES, sniffImageType, uploadImage } from '@/lib/storage';

export const runtime = 'nodejs';

/**
 * Unggah gambar admin ke Supabase Storage (bucket `images`).
 * Service key hanya hidup di server; browser cukup mengirim file lewat sini.
 * Gambar lama dihapus server setelah formulir disimpan, bukan saat unggah.
 */

const FOLDER_PATTERN = /^[a-z0-9-]{1,32}$/;

const reply = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return reply('Tidak diizinkan. Silakan login ulang.', 401);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return reply('File tidak ditemukan.', 400);
  if (file.size === 0) return reply('File kosong atau tidak bisa dibaca.', 400);
  if (file.size > MAX_UPLOAD_BYTES) {
    return reply(`Ukuran maksimal ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`, 413);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageType(bytes);
  if (!mime) return reply('Format harus JPG, PNG, atau WEBP.', 415);

  const rawFolder = form?.get('folder');
  const folder = typeof rawFolder === 'string' && FOLDER_PATTERN.test(rawFolder) ? rawFolder : 'umum';

  try {
    const { url, path } = await uploadImage(bytes, mime, folder);
    return NextResponse.json({ url, path }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[upload] gagal', error);
    return reply('Gagal menyimpan gambar ke Supabase Storage.', 502);
  }
}
