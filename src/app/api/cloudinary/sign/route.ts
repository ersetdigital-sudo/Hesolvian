import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { CLOUDINARY_ROOT_FOLDER, createSignedUpload } from '@/lib/cloudinary';

/** Buang karakter yang bisa dipakai untuk keluar dari folder yang dituju. */
function sanitizeSegment(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, '')
    .replace(/\.\./g, '')
    .replace(/^\/+|\/+$/g, '');
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Tidak diizinkan. Silakan login ulang.' }, { status: 401 });
  }

  let folder = CLOUDINARY_ROOT_FOLDER;
  try {
    const body = (await request.json()) as { folder?: unknown };
    if (typeof body?.folder === 'string' && body.folder.trim()) {
      const segment = sanitizeSegment(body.folder);
      if (segment) folder = `${CLOUDINARY_ROOT_FOLDER}/${segment}`;
    }
  } catch {
    // Body kosong / bukan JSON: pakai folder default.
  }

  const signed = createSignedUpload(folder);

  // api_secret tidak pernah keluar dari server.
  return NextResponse.json(
    {
      cloudName: signed.cloudName,
      apiKey: signed.apiKey,
      timestamp: signed.timestamp,
      folder: signed.folder,
      uploadPreset: signed.uploadPreset,
      signature: signed.signature,
      uploadUrl: signed.uploadUrl
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
