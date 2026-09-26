import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { destroyCloudinaryAsset } from '@/lib/cloudinary';

/**
 * Hapus aset lama saat gambar diganti atau item dihapus.
 * Dipanggil dari ImageUpload, bukan langsung dari <form>, supaya proses
 * hapus bisa dilaporkan tanpa menggagalkan penyimpanan data.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Tidak diizinkan. Silakan login ulang.' }, { status: 401 });
  }

  let publicId = '';
  try {
    const body = (await request.json()) as { publicId?: unknown };
    if (typeof body?.publicId === 'string') publicId = body.publicId.trim();
  } catch {
    // Biarkan kosong, akan ditolak di bawah.
  }

  if (!publicId) {
    return NextResponse.json({ error: 'publicId wajib diisi.' }, { status: 400 });
  }

  const result = await destroyCloudinaryAsset(publicId);

  if (!result.ok) {
    return NextResponse.json({ error: result.message ?? 'Gagal menghapus aset.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
