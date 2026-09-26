import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Client Supabase server-side memakai service_role key.
 *
 * Konsekuensi: SEMUA proteksi data bergantung pada kode ini hanya boleh
 * dipanggil dari server (server component / route handler / server action).
 * RLS di database aktif tanpa policy, jadi anon key tidak bisa apa-apa.
 */

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (!cached) {
    cached = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { 'x-application-name': 'hesolvian-admin' } }
    });
  }
  return cached;
}

/** Buang pesan error Supabase supaya bisa ditampilkan di UI. */
export function describeDbError(error: unknown): string {
  if (!error) return 'Terjadi kesalahan yang tidak diketahui.';
  if (typeof error === 'string') return error;
  const e = error as { message?: string; details?: string; hint?: string; code?: string };
  const parts = [e.message, e.details, e.hint].filter(Boolean);
  return parts.join(' — ') || 'Terjadi kesalahan pada database.';
}
