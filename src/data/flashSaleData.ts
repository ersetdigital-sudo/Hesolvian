/**
 * ============================================================
 * FLASH SALE — DATA LAYER
 * ============================================================
 * Semua yang tampil di section Flash Sale diatur dari file ini.
 * Admin cukup mengubah jadwal sesi + daftar produk di bawah, tanpa
 * menyentuh komponennya.
 *
 * Catatan penting:
 * - `categoryId` HARUS sama dengan id di `categoriesData.ts` (pulsa, data,
 *   pln, pdam, bpjs, internet, gopay, ovo, dana, shopeepay, linkaja, etoll, multi).
 * - `targetLabel` opsional: kalau diisi, nominal dengan label persis itu
 *   akan langsung terpilih saat modal transaksi terbuka.
 * - Flash Sale hanya mengubah harga promo + tampilan. Alur transaksi,
 *   validasi nomor tujuan, metode bayar, dan checkout tetap memakai
 *   flow PPOB yang sudah ada.
 */

export interface FlashSaleSessionConfig {
  id: string;
  /** Format 'HH:MM' (24 jam) */
  startTime: string;
  /** Format 'HH:MM' (24 jam) */
  endTime: string;
}

export type FlashSaleSessionState = 'active' | 'upcoming' | 'expired';

export type FlashSaleProductState = 'active' | 'upcoming' | 'sold_out' | 'expired';

export interface FlashSaleProduct {
  id: string;
  sessionId: string;
  /** Nama produk yang tampil di card */
  name: string;
  /** Kategori / provider, mis. 'Semua Operator', 'Token Listrik' */
  provider: string;
  normalPrice: number;
  promoPrice: number;
  /** Opsional. Kalau kosong, dihitung otomatis dari normalPrice & promoPrice. */
  discountPercent?: number;
  /** Kuota promo (bukan stok fisik) */
  quota: number;
  /** Kuota promo yang sudah terpakai */
  sold: number;
  /** id kategori PPOB yang dipakai saat user klik "Beli Sekarang" */
  categoryId: string;
  /** Label nominal di katalog PPOB yang mau langsung dipilih */
  targetLabel?: string;
}

export interface ResolvedSession extends FlashSaleSessionConfig {
  startsAt: Date | null;
  endsAt: Date | null;
  state: FlashSaleSessionState;
  dayLabel: 'Hari ini' | 'Besok';
}

/* ============================================================
 * JADWAL SESI
 * ============================================================ */
export const FLASH_SALE_SESSIONS: FlashSaleSessionConfig[] = [
  { id: 'flash-11', startTime: '11:00', endTime: '13:00' },
  { id: 'flash-13', startTime: '13:00', endTime: '15:00' },
  { id: 'flash-15', startTime: '15:00', endTime: '17:00' }
];

/* ============================================================
 * PRODUK PROMO
 * ============================================================ */
export const FLASH_SALE_PRODUCTS: FlashSaleProduct[] = [
  /* ---------- Sesi 11:00 - 13:00 ---------- */
  {
    id: 'fs-a-1',
    sessionId: 'flash-11',
    name: 'Pulsa 25.000',
    provider: 'Semua Operator',
    normalPrice: 26000,
    promoPrice: 23500,
    quota: 120,
    sold: 84,
    categoryId: 'pulsa',
    targetLabel: 'Pulsa 25.000'
  },
  {
    id: 'fs-a-2',
    sessionId: 'flash-11',
    name: 'Token PLN 50.000',
    provider: 'Token Listrik',
    normalPrice: 52500,
    promoPrice: 48000,
    quota: 90,
    sold: 90,
    categoryId: 'pln',
    targetLabel: 'Token 50.000'
  },
  {
    id: 'fs-a-3',
    sessionId: 'flash-11',
    name: 'Paket Data 5GB',
    provider: 'Semua Operator',
    normalPrice: 40000,
    promoPrice: 33500,
    quota: 75,
    sold: 31,
    categoryId: 'data',
    targetLabel: '5 GB / 30 Hari'
  },
  {
    id: 'fs-a-4',
    sessionId: 'flash-11',
    name: 'Top Up GoPay 20.000',
    provider: 'GoPay',
    normalPrice: 21000,
    promoPrice: 18500,
    quota: 100,
    sold: 22,
    categoryId: 'gopay',
    targetLabel: 'Top Up 20.000'
  },
  {
    id: 'fs-a-5',
    sessionId: 'flash-11',
    name: 'Pulsa 100.000',
    provider: 'Semua Operator',
    normalPrice: 99500,
    promoPrice: 94000,
    quota: 50,
    sold: 12,
    categoryId: 'pulsa',
    targetLabel: 'Pulsa 100.000'
  },

  /* ---------- Sesi 13:00 - 15:00 ---------- */
  {
    id: 'fs-b-1',
    sessionId: 'flash-13',
    name: 'Pulsa 10.000',
    provider: 'Semua Operator',
    normalPrice: 12000,
    promoPrice: 9500,
    quota: 100,
    sold: 72,
    categoryId: 'pulsa',
    targetLabel: 'Pulsa 10.000'
  },
  {
    id: 'fs-b-2',
    sessionId: 'flash-13',
    name: 'Paket Data 10GB',
    provider: 'Semua Operator',
    normalPrice: 28000,
    promoPrice: 22500,
    quota: 80,
    sold: 61,
    categoryId: 'data',
    targetLabel: '10 GB / 30 Hari'
  },
  {
    id: 'fs-b-3',
    sessionId: 'flash-13',
    name: 'Token PLN 20.000',
    provider: 'Token Listrik',
    normalPrice: 23000,
    promoPrice: 20500,
    quota: 120,
    sold: 120,
    categoryId: 'pln',
    targetLabel: 'Token 20.000'
  },
  {
    id: 'fs-b-4',
    sessionId: 'flash-13',
    name: 'Top Up OVO 50.000',
    provider: 'OVO',
    normalPrice: 52000,
    promoPrice: 48500,
    quota: 60,
    sold: 18,
    categoryId: 'ovo',
    targetLabel: 'Top Up 50.000'
  },
  {
    id: 'fs-b-5',
    sessionId: 'flash-13',
    name: 'Pulsa 50.000',
    provider: 'Semua Operator',
    normalPrice: 50500,
    promoPrice: 46500,
    quota: 90,
    sold: 45,
    categoryId: 'pulsa',
    targetLabel: 'Pulsa 50.000'
  },
  {
    id: 'fs-b-6',
    sessionId: 'flash-13',
    name: 'Paket Data 25GB',
    provider: 'Semua Operator',
    normalPrice: 95000,
    promoPrice: 86000,
    quota: 40,
    sold: 9,
    categoryId: 'data',
    targetLabel: '25 GB / 30 Hari'
  },

  /* ---------- Sesi 15:00 - 17:00 ---------- */
  {
    id: 'fs-c-1',
    sessionId: 'flash-15',
    name: 'Token PLN 100.000',
    provider: 'Token Listrik',
    normalPrice: 102500,
    promoPrice: 96500,
    quota: 60,
    sold: 0,
    categoryId: 'pln',
    targetLabel: 'Token 100.000'
  },
  {
    id: 'fs-c-2',
    sessionId: 'flash-15',
    name: 'Pulsa 20.000',
    provider: 'Semua Operator',
    normalPrice: 21000,
    promoPrice: 18000,
    quota: 110,
    sold: 0,
    categoryId: 'pulsa',
    targetLabel: 'Pulsa 20.000'
  },
  {
    id: 'fs-c-3',
    sessionId: 'flash-15',
    name: 'Paket Data 15GB',
    provider: 'Semua Operator',
    normalPrice: 80000,
    promoPrice: 72000,
    quota: 50,
    sold: 0,
    categoryId: 'data',
    targetLabel: '15 GB / 30 Hari'
  },
  {
    id: 'fs-c-4',
    sessionId: 'flash-15',
    name: 'Top Up DANA 100.000',
    provider: 'DANA',
    normalPrice: 101000,
    promoPrice: 96000,
    quota: 70,
    sold: 0,
    categoryId: 'dana',
    targetLabel: 'Top Up 100.000'
  }
];

/* ============================================================
 * HELPERS
 * ============================================================ */

function atTime(base: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Ubah jadwal sesi jadi sesi konkret untuk hari ini.
 * `now === null` dipakai saat render pertama (sebelum jam client tersedia)
 * supaya HTML server & client sama — mencegah hydration mismatch.
 */
export function resolveSessions(now: Date | null): ResolvedSession[] {
  if (!now) {
    return FLASH_SALE_SESSIONS.map((s) => ({
      ...s,
      startsAt: null,
      endsAt: null,
      state: 'upcoming' as const,
      dayLabel: 'Hari ini' as const
    }));
  }

  const build = (dayOffset: number, dayLabel: 'Hari ini' | 'Besok'): ResolvedSession[] => {
    const base = new Date(now);
    base.setDate(base.getDate() + dayOffset);
    return FLASH_SALE_SESSIONS.map((s) => {
      const startsAt = atTime(base, s.startTime);
      const endsAt = atTime(base, s.endTime);
      const state: FlashSaleSessionState =
        now.getTime() < startsAt.getTime()
          ? 'upcoming'
          : now.getTime() < endsAt.getTime()
          ? 'active'
          : 'expired';
      return { ...s, startsAt, endsAt, state, dayLabel };
    });
  };

  const today = build(0, 'Hari ini');
  // Kalau seluruh sesi hari ini sudah lewat, tampilkan jadwal besok.
  if (today.every((s) => s.state === 'expired')) return build(1, 'Besok');
  return today;
}

export function discountPercentOf(p: FlashSaleProduct): number {
  if (typeof p.discountPercent === 'number') return p.discountPercent;
  if (p.normalPrice <= 0) return 0;
  return Math.round(((p.normalPrice - p.promoPrice) / p.normalPrice) * 100);
}

export function productState(
  p: FlashSaleProduct,
  session: ResolvedSession | null
): FlashSaleProductState {
  if (!session) return 'upcoming';
  if (session.state === 'expired') return 'expired';
  // Kuota promo habis lebih relevan ditampilkan daripada status sesi.
  if (p.sold >= p.quota) return 'sold_out';
  if (session.state === 'upcoming') return 'upcoming';
  return 'active';
}

export function soldPercentOf(p: FlashSaleProduct): number {
  if (p.quota <= 0) return 0;
  return Math.min(100, Math.round((p.sold / p.quota) * 100));
}

export function productsOfSession(sessionId: string): FlashSaleProduct[] {
  return FLASH_SALE_PRODUCTS.filter((p) => p.sessionId === sessionId);
}
