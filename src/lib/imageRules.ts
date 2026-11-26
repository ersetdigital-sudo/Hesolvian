/**
 * Aturan validasi gambar (sisi client).
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

/** Validasi ukuran + format sebelum file dikirim ke server. */
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
