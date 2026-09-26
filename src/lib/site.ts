/**
 * Identitas & metadata situs.
 *
 * Sengaja berupa konstanta di kode, bukan kolom yang bisa diubah dari panel
 * admin: logo, favicon, tagline, dan metadata SEO menentukan tata letak serta
 * hasil pencarian, jadi lebih aman diatur di sini dan ikut ter-review bersama
 * kode (lihat `src/app/layout.tsx`).
 *
 * File ini aman diimpor dari komponen client maupun server.
 */

export const SITE_NAME = 'Hesolvian';

/** Label kecil pada blok brand panel admin & footer. */
export const SITE_TAGLINE = 'Loket Digital Terpadu';

export const SITE_TITLE = 'Hesolvian — Loket Digital PPOB & Lacak Transaksi';

export const SITE_DESCRIPTION =
  'Loket digital PPOB untuk isi pulsa, paket data, token PLN, bayar PDAM, BPJS, internet, dan top up e-wallet. Lacak transaksi real-time dengan struk digital.';

export const SITE_KEYWORDS = [
  'PPOB',
  'loket digital',
  'isi pulsa',
  'paket data',
  'token listrik PLN',
  'bayar PDAM',
  'bayar BPJS',
  'tagihan internet',
  'top up e-wallet',
  'top up GoPay',
  'top up OVO',
  'top up DANA',
  'top up ShopeePay',
  'top up LinkAja',
  'isi e-Toll',
  'lacak transaksi',
  'struk digital'
];

/**
 * URL kanonik situs. Dipakai `metadataBase` supaya URL gambar Open Graph
 * absolut saat dibagikan. Isi `NEXT_PUBLIC_SITE_URL` di produksi.
 */
export function siteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim();
  const fallback = 'http://localhost:3000';
  const value = raw === '' ? fallback : raw;
  return value.replace(/\/+$/, '');
}
