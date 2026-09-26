import crypto from 'crypto';
import { cookies } from 'next/headers';
import { env } from './env';

/**
 * Sesi admin: cookie httpOnly berisi "admin.<expiry>.<hmac-sha256>".
 * Tidak ada state di server, cukup verifikasi tanda tangan + masa berlaku.
 *
 * Ini bukan auth tingkat produksi (tidak ada user, tidak ada rate limit
 * per akun, tidak ada rotasi sesi). Cocok untuk panel internal satu admin.
 */

export const ADMIN_COOKIE = 'hesolvian_admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 jam

function hmac(payload: string): string {
  return crypto.createHmac('sha256', env.adminSessionSecret).update(payload).digest('hex');
}

export function createSessionToken(now = Date.now()): string {
  const expiresAt = now + ADMIN_SESSION_MAX_AGE * 1000;
  const payload = `admin.${expiresAt}`;
  return `${payload}.${hmac(payload)}`;
}

export function verifySessionToken(token: string | undefined | null, now = Date.now()): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [role, expiresAt, signature] = parts;
  if (role !== 'admin') return false;

  const expected = hmac(`${role}.${expiresAt}`);
  // Panjang harus sama sebelum timingSafeEqual, kalau tidak akan throw.
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > now;
}

/**
 * Cek password terhadap ADMIN_PASSWORD dengan perbandingan waktu konstan.
 *
 * Sisi input DAN .env.local sama-sama di-trim supaya copy-paste yang membawa
 * spasi/newline di akhir tetap bisa masuk.
 */
export function verifyPassword(input: string): boolean {
  const normalize = (value: string) =>
    value
      .replace(/\r?\n/g, '')
      .trim();

  const a = crypto.createHash('sha256').update(normalize(input)).digest();
  const b = crypto.createHash('sha256').update(normalize(env.adminPassword)).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export async function startAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE
  });
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/** Lempar error kalau dipakai di luar sesi admin. Dipakai di server action & API route. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error('UNAUTHORIZED: sesi admin tidak valid atau sudah kedaluwarsa.');
  }
}
