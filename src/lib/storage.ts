import { supabaseAdmin } from './supabase';

/**
 * Supabase Storage untuk gambar admin (QRIS).
 * Server-only: memakai service role key lewat supabaseAdmin().
 *
 * Bucket `images` bersifat publik, jadi URL hasil unggahan bisa langsung
 * dipakai di <img>. Tulis/hapus hanya lewat service key.
 */

export const IMAGE_BUCKET = 'images';
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
} as const;

export type ImageMime = keyof typeof EXTENSIONS;
const ALLOWED_MIME = Object.keys(EXTENSIONS) as ImageMime[];

/**
 * Kenali tipe gambar dari byte awalnya (magic number), bukan dari header
 * Content-Type yang bisa dipalsukan klien.
 */
export function sniffImageType(bytes: Uint8Array): ImageMime | null {
  const startsWith = (signature: number[], offset = 0): boolean =>
    signature.every((byte, index) => bytes[offset + index] === byte);

  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (startsWith([0xff, 0xd8, 0xff])) return 'image/jpeg';
  // WebP: "RIFF" .... "WEBP"
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
    return 'image/webp';
  }
  return null;
}

/** Nama objek unik: tidak menimpa file lama dan aman di-cache lama. */
function buildObjectPath(folder: string, mime: ImageMime): string {
  return `${folder}/${Date.now()}-${crypto.randomUUID()}.${EXTENSIONS[mime]}`;
}

function publicPrefix(): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${IMAGE_BUCKET}/`;
}

/** true bila URL menunjuk ke bucket gambar kita (bukan gambar eksternal/lama). */
export function isStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const prefix = publicPrefix();
  return prefix.startsWith('https://') && url.startsWith(prefix);
}

function pathFromPublicUrl(url: string): string | null {
  if (!isStorageUrl(url)) return null;
  const clean = url.split(/[?#]/)[0] ?? '';
  const path = decodeURIComponent(clean.slice(publicPrefix().length));
  if (!path || path.includes('..') || path.startsWith('/')) return null;
  return path;
}

/** Buat bucket kalau belum ada, supaya deploy baru langsung jalan tanpa SQL manual. */
async function ensureBucket(): Promise<void> {
  const { error } = await supabaseAdmin().storage.createBucket(IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_UPLOAD_BYTES,
    allowedMimeTypes: ALLOWED_MIME
  });
  if (error && !/already exists|duplicate/i.test(error.message)) throw error;
}

export async function uploadImage(
  bytes: Uint8Array,
  mime: ImageMime,
  folder: string
): Promise<{ url: string; path: string }> {
  const path = buildObjectPath(folder, mime);
  const options = { contentType: mime, cacheControl: '31536000', upsert: false };

  let { error } = await supabaseAdmin().storage.from(IMAGE_BUCKET).upload(path, bytes, options);
  if (error && /bucket not found/i.test(error.message)) {
    await ensureBucket();
    ({ error } = await supabaseAdmin().storage.from(IMAGE_BUCKET).upload(path, bytes, options));
  }
  if (error) throw error;

  const url = supabaseAdmin().storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  return { url, path };
}

/**
 * Hapus gambar lama setelah diganti/dikosongkan. URL di luar bucket kita
 * (mis. Cloudinary lama) dilewati. Gagal hapus bukan fatal — hanya dicatat.
 */
export async function deleteImageByUrl(url: string | null | undefined): Promise<void> {
  const path = url ? pathFromPublicUrl(url) : null;
  if (!path) return;
  const { error } = await supabaseAdmin().storage.from(IMAGE_BUCKET).remove([path]);
  if (error) console.error('[storage] hapus gagal', path, error.message);
}
