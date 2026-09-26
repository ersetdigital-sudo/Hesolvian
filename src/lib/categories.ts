/**
 * Metadata kategori PPOB (nama tampilan, ikon, warna).
 * `id` harus sama dengan `category_id` di tabel products.
 */

export interface CategoryMeta {
  name: string;
  short: string;
  icon: string;
  color: string;
  bg: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  pulsa: { name: 'Pulsa', short: 'Pulsa', icon: 'smartphone', color: '#E2694A', bg: '#FFEAE4' },
  data: { name: 'Paket Data', short: 'Data', icon: 'signal_cellular_alt', color: '#0891B2', bg: '#E3F4FC' },
  pln: { name: 'PLN', short: 'PLN', icon: 'bolt', color: '#F59E0B', bg: '#FFF8E1' },
  pdam: { name: 'PDAM', short: 'PDAM', icon: 'water_drop', color: '#0097A7', bg: '#E0F7FA' },
  bpjs: { name: 'BPJS', short: 'BPJS', icon: 'favorite', color: '#E91E63', bg: '#FCE4EC' },
  internet: { name: 'Pembayaran Internet', short: 'Internet', icon: 'wifi', color: '#7C3AED', bg: '#EDE7F6' },
  // Uang elektronik dipisah per penyedia supaya nominal yang sama tidak ambigu.
  gopay: { name: 'GoPay', short: 'GoPay', icon: 'account_balance_wallet', color: '#0284C7', bg: '#E0F2FE' },
  ovo: { name: 'OVO', short: 'OVO', icon: 'savings', color: '#4C3494', bg: '#EDE7F6' },
  dana: { name: 'DANA', short: 'DANA', icon: 'payments', color: '#118EEA', bg: '#E3F2FD' },
  shopeepay: { name: 'ShopeePay', short: 'ShopeePay', icon: 'shopping_bag', color: '#EE4D2D', bg: '#FFEAE4' },
  linkaja: { name: 'LinkAja', short: 'LinkAja', icon: 'account_balance', color: '#E82529', bg: '#FCE4EC' },
  etoll: { name: 'e-Toll & e-Money', short: 'e-Toll', icon: 'toll', color: '#0B5FA5', bg: '#E8EEF7' },
  multi: { name: 'Multifinance', short: 'Multifinance', icon: 'directions_car', color: '#EA580C', bg: '#FFF3E0' }
};

export const FALLBACK_CATEGORY: CategoryMeta = {
  name: 'Lainnya',
  short: 'Lainnya',
  icon: 'category',
  color: '#78716c',
  bg: '#f5f5f4'
};

export function categoryMeta(id: string): CategoryMeta {
  return CATEGORY_META[id] ?? FALLBACK_CATEGORY;
}

export function categoryName(id: string): string {
  return categoryMeta(id).name;
}

/** Urutan tampilan kategori di filter & tabel. */
export const CATEGORY_ORDER = [
  'pulsa',
  'data',
  'pln',
  'pdam',
  'bpjs',
  'internet',
  'gopay',
  'ovo',
  'dana',
  'shopeepay',
  'linkaja',
  'etoll',
  'multi'
];
