/**
 * Aturan gambar + helper URL Cloudinary.
 *
 * Modul ini SENGAJA tidak mengimpor apa pun dari Node (crypto, env, dll)
 * supaya aman dipakai di client component tanpa ikut membundel modul server.
 */

/** Batas ukuran file yang diterima (2 MB). */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** MIME type yang diterima. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

/** Ekstensi yang diterima (dipakai untuk validasi cadangan). */
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

export const IMAGE_ACCEPT_ATTRIBUTE = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export type ImageValidation = { ok: true } | { ok: false; message: string };

/** Validasi ukuran + format sebelum file dikirim ke Cloudinary. */
export function validateImageFile(file: File): ImageValidation {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const typeOk =
    (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type) ||
    (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(extension);

  if (!typeOk) {
    return { ok: false, message: 'Format harus JPG, PNG, atau WEBP.' };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: `Ukuran maksimal ${formatFileSize(MAX_IMAGE_BYTES)}. File kamu ${formatFileSize(file.size)}.`
    };
  }

  if (file.size === 0) {
    return { ok: false, message: 'File kosong atau tidak bisa dibaca.' };
  }

  return { ok: true };
}

export interface ImageUrlOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
}

/**
 * URL tampilan yang sudah dioptimasi.
 *   f_auto -> format paling ringan yang didukung browser (webp/avif)
 *   q_auto -> kompresi otomatis tanpa penurunan kualitas yang kelihatan
 *   w_/h_  -> jangan kirim gambar 4000px untuk thumbnail
 */
export function optimizedImageUrl(
  cloudName: string,
  publicId: string | null | undefined,
  options: ImageUrlOptions = {}
): string | null {
  if (!cloudName || !publicId) return null;

  const { width = 800, height, crop = 'fill' } = options;
  const parts = ['f_auto', 'q_auto', `w_${width}`, `c_${crop}`];
  if (height) parts.push(`h_${height}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${parts.join(',')}/${publicId}`;
}

/** Ambil public_id dari sebuah URL Cloudinary (untuk membersihkan aset lama). */
export function publicIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+)$/);
  if (!match) return null;
  return match[1].replace(/\.[a-z0-9]+$/i, '');
}
