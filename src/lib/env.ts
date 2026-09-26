/**
 * Pembacaan environment variable.
 *
 * Sengaja lazy (baru divalidasi saat dipakai) supaya proses `next build`
 * tidak langsung gagal total kalau satu variabel belum diisi.
 */

const missing = new Set<string>();

function read(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    if (!missing.has(name)) {
      missing.add(name);
      console.error(
        `[env] Variabel ${name} belum diisi. Salin .env.example menjadi .env.local lalu lengkapi nilainya.`
      );
    }
    throw new Error(`Environment variable ${name} belum diisi.`);
  }
  return value;
}

export const env = {
  /* ---------- Admin panel ---------- */
  get adminPassword() {
    return read('ADMIN_PASSWORD');
  },
  get adminSessionSecret() {
    return read('ADMIN_SESSION_SECRET');
  },

  /* ---------- Supabase ---------- */
  get supabaseUrl() {
    return read('NEXT_PUBLIC_SUPABASE_URL');
  },
  get supabaseServiceRoleKey() {
    return read('SUPABASE_SERVICE_ROLE_KEY');
  },

  /* ---------- Cloudinary ---------- */
  get cloudinaryCloudName() {
    return read('CLOUDINARY_CLOUD_NAME');
  },
  get cloudinaryApiKey() {
    return read('CLOUDINARY_API_KEY');
  },
  get cloudinaryApiSecret() {
    return read('CLOUDINARY_API_SECRET');
  },
  get cloudinaryUploadPreset() {
    return read('CLOUDINARY_UPLOAD_PRESET');
  }
};
