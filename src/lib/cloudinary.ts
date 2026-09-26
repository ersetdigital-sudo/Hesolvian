import crypto from 'crypto';
import { env } from './env';
import { optimizedImageUrl, publicIdFromUrl, type ImageUrlOptions } from './imageRules';

/**
 * ============================================================
 * CLOUDINARY — SIGNED UPLOAD (server-only)
 * ============================================================
 * Alur:
 *   1. Client minta tanda tangan ke /api/cloudinary/sign
 *   2. Client upload langsung ke Cloudinary (file tidak melewati server kita)
 *   3. Server simpan `secure_url` + `public_id` ke database
 *   4. Kalau gambar diganti, aset lama dihapus lewat /api/cloudinary/delete
 *
 * Modul ini memakai Node crypto + api_secret, jadi JANGAN diimpor dari
 * client component. Untuk konstanta/validasi, pakai `@/lib/imageRules`.
 */

/** Folder default di akun Cloudinary supaya aset rapi dan mudah diaudit. */
export const CLOUDINARY_ROOT_FOLDER = 'hesolvian';

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  uploadPreset: string;
  signature: string;
  uploadUrl: string;
}

/**
 * Cloudinary menandatangani dengan cara:
 *   - ambil semua parameter yang ikut dikirim (kecuali file, api_key, signature)
 *   - urutkan berdasarkan nama kunci
 *   - rangkai "kunci=nilai" disambung "&"
 *   - tambahkan api_secret di belakang, lalu SHA-1
 */
function signParams(params: Record<string, string>): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + env.cloudinaryApiSecret).digest('hex');
}

/** Parameter upload bertanda tangan untuk folder tertentu. */
export function createSignedUpload(folder?: string): SignedUploadParams {
  const timestamp = Math.floor(Date.now() / 1000);
  const targetFolder = folder ?? CLOUDINARY_ROOT_FOLDER;

  const params: Record<string, string> = {
    folder: targetFolder,
    timestamp: String(timestamp),
    upload_preset: env.cloudinaryUploadPreset
  };

  return {
    cloudName: env.cloudinaryCloudName,
    apiKey: env.cloudinaryApiKey,
    folder: targetFolder,
    uploadPreset: params.upload_preset,
    timestamp,
    signature: signParams(params),
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`
  };
}

/** Hapus aset berdasarkan public_id (juga butuh tanda tangan). */
export async function destroyCloudinaryAsset(publicId: string): Promise<{ ok: boolean; message?: string }> {
  if (!publicId) return { ok: false, message: 'public_id kosong.' };

  const timestamp = Math.floor(Date.now() / 1000);
  // `invalidate` ikut disertakan dalam penandatanganan. Cloudinary akan
  // menolak permintaan kalau ada param tanpa tanda tangan.
  const invalidate = 'true';
  const signature = signParams({ public_id: publicId, invalidate, timestamp: String(timestamp) });

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: env.cloudinaryApiKey,
    timestamp: String(timestamp),
    signature,
    invalidate
  });

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      cache: 'no-store'
    });

    const payload = (await response.json()) as { result?: string; error?: { message?: string } };

    // 'not found' dianggap sukses: asetnya memang sudah tidak ada.
    if (payload.result === 'ok' || payload.result === 'not found') return { ok: true };

    return { ok: false, message: payload.error?.message ?? 'Gagal menghapus aset di Cloudinary.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Gagal menghubungi Cloudinary.' };
  }
}

/** URL tampilan teroptimasi (delegasi ke helper yang aman untuk client). */
export function cloudinaryImageUrl(publicId: string | null | undefined, options: ImageUrlOptions = {}): string | null {
  return optimizedImageUrl(env.cloudinaryCloudName, publicId, options);
}

export { publicIdFromUrl };
