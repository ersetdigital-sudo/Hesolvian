import { SITE_NAME } from './site';
import { supabaseAdmin } from './supabase';
import type {
  BrandSettings,
  ContactSettings,
  DashboardData,
  FaqRow,
  FlashSaleRow,
  PaymentSettings,
  ProductRow,
  TransactionRow,
  TransactionStatus
} from './types';
import { DEFAULT_PAYMENT_SETTINGS } from './types';

/**
 * Semua fungsi di file ini HARUS dipanggil dari server.
 * Memakai service_role key, jadi anon key tidak pernah menyentuh data ini.
 */

/* ============================================================
 * DASBOR
 * ============================================================ */

export async function getDashboardData(months = 12): Promise<{ data: DashboardData | null; error: string | null }> {
  const { data, error } = await supabaseAdmin().rpc('admin_dashboard', { p_months: months });

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as DashboardData, error: null };
}

export interface SalesSeriesPoint {
  bucket: string;
  orders: number;
  revenue: number;
  new_users: number;
  existing_users: number;
}

/**
 * Seri penjualan untuk grafik Tren Penjualan.
 * `unit`: 'week' | 'month' | 'year'
 */
export async function getSalesSeries(unit: 'week' | 'month' | 'year', points: number): Promise<SalesSeriesPoint[]> {
  const { data, error } = await supabaseAdmin().rpc('admin_sales_series', { p_unit: unit, p_points: points });
  if (error) throw new Error(error.message);
  return (data ?? []) as SalesSeriesPoint[];
}

/* ============================================================
 * PRODUK
 * ============================================================ */

export async function listProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('products')
    .select('*')
    .order('category_id', { ascending: true })
    .order('group_name', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductRow[];
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const { data, error } = await supabaseAdmin().from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ProductRow) ?? null;
}

/* ============================================================
 * FLASH SALE
 * ============================================================ */

export async function listFlashSales(): Promise<FlashSaleRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('flash_sales')
    .select('*')
    .order('session_start', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as FlashSaleRow[];
}

export async function getFlashSale(id: string): Promise<FlashSaleRow | null> {
  const { data, error } = await supabaseAdmin().from('flash_sales').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as FlashSaleRow) ?? null;
}

/* ============================================================
 * PUSAT BANTUAN (FAQ)
 * ============================================================ */

export async function listFaqs(): Promise<FaqRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('faqs')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as FaqRow[];
}

export async function getFaq(id: string): Promise<FaqRow | null> {
  const { data, error } = await supabaseAdmin().from('faqs').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as FaqRow) ?? null;
}

/* ============================================================
 * TRANSAKSI
 * ============================================================ */

export interface TransactionFilter {
  query?: string;
  status?: TransactionStatus | 'all';
  limit?: number;
}

export async function listTransactions(filter: TransactionFilter = {}): Promise<TransactionRow[]> {
  const { query = '', status = 'all', limit = 100 } = filter;

  let builder = supabaseAdmin().from('transactions').select('*').order('created_at', { ascending: false }).limit(limit);

  if (status !== 'all') builder = builder.eq('status', status);

  const trimmed = query.trim();
  if (trimmed) {
    // Cari di id / nomor pelanggan / produk (nama pelanggan tidak dipakai lagi).
    const escaped = trimmed.replace(/[%,]/g, '');
    builder = builder.or(
      `id.ilike.%${escaped}%,customer_id.ilike.%${escaped}%,product_label.ilike.%${escaped}%`
    );
  }

  const { data, error } = await builder;
  if (error) throw new Error(error.message);
  return (data ?? []) as TransactionRow[];
}

export async function getTransaction(id: string): Promise<TransactionRow | null> {
  const { data, error } = await supabaseAdmin().from('transactions').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as TransactionRow) ?? null;
}

export interface TransactionStats {
  total: number;
  success: number;
  pending: number;
  revenue: number;
}

export async function getTransactionStats(): Promise<TransactionStats> {
  const { data, error } = await supabaseAdmin().from('transactions').select('status, total');
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{ status: TransactionStatus; total: number }>;
  return {
    total: rows.length,
    success: rows.filter((r) => r.status === 'success').length,
    pending: rows.filter((r) => r.status === 'pending' || r.status === 'processing').length,
    revenue: rows.filter((r) => r.status === 'success').reduce((sum, r) => sum + (r.total ?? 0), 0)
  };
}

/* ============================================================
 * PENGATURAN SITUS
 * ============================================================ */

const DEFAULT_BRAND: BrandSettings = {
  name: SITE_NAME
};

const DEFAULT_CONTACT: ContactSettings = {
  email: '',
  phone: '',
  whatsapp: '',
  address: ''
};

export interface SiteSettings {
  brand: BrandSettings;
  contact: ContactSettings;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabaseAdmin().from('site_settings').select('key, value');
  if (error) throw new Error(error.message);

  const map = new Map<string, unknown>((data ?? []).map((row) => [row.key as string, row.value]));
  const storedBrand = (map.get('brand') as Partial<BrandSettings> | undefined) ?? {};

  return {
    // Hanya `name` yang diambil; kunci lama (tagline/logo/favicon) diabaikan.
    brand: { name: storedBrand.name || DEFAULT_BRAND.name },
    contact: { ...DEFAULT_CONTACT, ...(map.get('contact') as Partial<ContactSettings> | undefined) }
  };
}

export async function saveSiteSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabaseAdmin()
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
}

/* ============================================================
 * METODE PEMBAYARAN
 * ============================================================ */

/**
 * Konfigurasi metode pembayaran (QRIS, transfer bank, VA, tunai).
 * Bagian yang belum pernah disimpan diisi dari `DEFAULT_PAYMENT_SETTINGS`
 * supaya halaman publik tidak pernah kosong.
 */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  const { data, error } = await supabaseAdmin()
    .from('site_settings')
    .select('value')
    .eq('key', 'payments')
    .maybeSingle();

  if (error) throw new Error(error.message);

  const stored = (data?.value as Partial<PaymentSettings> | undefined) ?? {};

  return {
    qris: { ...DEFAULT_PAYMENT_SETTINGS.qris, ...stored.qris },
    transfer: {
      ...DEFAULT_PAYMENT_SETTINGS.transfer,
      ...stored.transfer,
      accounts: stored.transfer?.accounts ?? []
    },
    tunai: { ...DEFAULT_PAYMENT_SETTINGS.tunai, ...stored.tunai }
  };
}

/* ============================================================
 * DATA PUBLIK (dipakai aplikasi utama)
 * ============================================================
 */

export type {
  PublicCatalogCategory,
  PublicCatalogGroup,
  PublicCatalogItem,
  PublicData,
  PublicFaq,
  PublicFlashSaleItem
} from './publicTypes';

import type {
  PublicCatalogCategory,
  PublicCatalogGroup,
  PublicData,
  PublicFaq,
  PublicFlashSaleItem
} from './publicTypes';

/**
 * Ambil katalog + flash sale untuk aplikasi publik.
 * Kalau database error, pemanggil harus mengembalikan `null` supaya beranda
 * memakai data statis sebagai cadangan.
 */
export async function getPublicData(): Promise<PublicData> {
  const client = supabaseAdmin();

  const [productsResult, flashResult, faqResult] = await Promise.all([
    client
      .from('products')
      .select('category_id, group_name, label, description, price, is_variable, sort_order')
      .eq('status', 'active')
      .order('category_id')
      .order('sort_order'),
    client
      .from('flash_sales')
      .select('*')
      .eq('status', 'active')
      .order('session_start')
      .order('sort_order'),
    client
      .from('faqs')
      .select('category, question, answer')
      .eq('is_published', true)
      .order('sort_order')
      .order('created_at')
  ]);

  if (productsResult.error) throw new Error(productsResult.error.message);
  if (flashResult.error) throw new Error(flashResult.error.message);
  if (faqResult.error) throw new Error(faqResult.error.message);

  /* --- katalog: kelompokkan per kategori lalu per grup --- */
  const byCategory = new Map<string, Map<string, PublicCatalogGroup>>();

  for (const row of productsResult.data ?? []) {
    const categoryId = row.category_id as string;
    const groupName = row.group_name as string;

    if (!byCategory.has(categoryId)) byCategory.set(categoryId, new Map());
    const groups = byCategory.get(categoryId)!;
    if (!groups.has(groupName)) groups.set(groupName, { name: groupName, items: [] });

    groups.get(groupName)!.items.push({
      l: row.label as string,
      d: row.description as string,
      p: row.price as number,
      variable: (row.is_variable as boolean) || undefined
    });
  }

  const catalog: PublicCatalogCategory[] = [...byCategory.entries()].map(([id, groups]) => ({
    id,
    groups: [...groups.values()]
  }));

  /* --- flash sale --- */
  const flashSales: PublicFlashSaleItem[] = (flashResult.data ?? []).map((row) => ({
    id: row.id as string,
    sessionId: row.session_id as string,
    name: row.name as string,
    provider: row.provider as string,
    normalPrice: row.normal_price as number,
    promoPrice: row.promo_price as number,
    discountPercent: (row.discount_percent as number | null) ?? undefined,
    quota: row.quota as number,
    sold: row.sold as number,
    categoryId: row.category_id as string,
    targetLabel: (row.target_label as string | null) ?? undefined
  }));

  /* --- FAQ pusat bantuan --- */
  const faqs: PublicFaq[] = (faqResult.data ?? []).map((row) => ({
    category: row.category as string,
    question: row.question as string,
    answer: row.answer as string
  }));

  return { catalog, flashSales, faqs };
}

export async function listCategoryLabels(): Promise<Record<string, string[]>> {
  const { data, error } = await supabaseAdmin().from('products').select('category_id, label').order('sort_order');
  if (error) throw new Error(error.message);

  const map: Record<string, string[]> = {};
  for (const row of data ?? []) {
    const id = row.category_id as string;
    if (!map[id]) map[id] = [];
    // Kategori gabungan (E-Wallet) punya label sama di tiap grup/dompet,
    // jadi cukup tampilkan sekali di dropdown Flash Sale.
    if (!map[id].includes(row.label as string)) map[id].push(row.label as string);
  }
  return map;
}

export type { TransactionStatus };
