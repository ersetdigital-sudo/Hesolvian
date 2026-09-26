/** Baris tabel & bentuk data yang dipakai panel admin. */

export type ContentStatus = 'active' | 'draft' | 'archived';
export type ArticleStatus = 'draft' | 'published' | 'archived';
export type TransactionStatus = 'success' | 'pending' | 'processing' | 'failed';

export interface ProductRow {
  id: string;
  category_id: string;
  group_name: string;
  label: string;
  description: string;
  price: number;
  promo_price: number | null;
  is_variable: boolean;
  image_url: string | null;
  image_public_id: string | null;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FlashSaleRow {
  id: string;
  name: string;
  provider: string;
  category_id: string;
  target_label: string | null;
  normal_price: number;
  promo_price: number;
  discount_percent: number | null;
  quota: number;
  sold: number;
  session_id: string;
  session_start: string;
  session_end: string;
  image_url: string | null;
  image_public_id: string | null;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  cover_image_public_id: string | null;
  author: string;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FaqRow {
  id: string;
  category: string;
  question: string;
  answer: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionRow {
  id: string;
  customer_name: string;
  customer_id: string;
  category_id: string;
  product_label: string;
  status: TransactionStatus;
  qty: number;
  unit_price: number;
  admin_fee: number;
  discount: number;
  total: number;
  method: string;
  created_at: string;
  updated_at: string;
}

/**
 * Identitas merek yang masih bisa diatur admin.
 * Logo, favicon, tagline, dan metadata SEO sengaja TIDAK di sini — semuanya
 * konstanta di `src/lib/site.ts` supaya tata letak & hasil pencarian stabil.
 */
export interface BrandSettings {
  name: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
}

/* ---------- Dasbor ---------- */

export interface DashboardTotals {
  revenue: number;
  orders: number;
  customers: number;
  conversion: number;
}

export interface DashboardMonthlyPoint {
  month: string;
  orders: number;
  revenue: number;
  new_users: number;
  existing_users: number;
}

export interface DashboardBreakdownItem {
  category_id: string;
  revenue: number;
  orders: number;
}

export interface DashboardRecentTransaction {
  id: string;
  customer_name: string;
  customer_id: string;
  category_id: string;
  product_label: string;
  status: TransactionStatus;
  qty: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface DashboardData {
  totals: DashboardTotals;
  previous: DashboardTotals;
  monthly: DashboardMonthlyPoint[];
  breakdown: DashboardBreakdownItem[];
  recent: DashboardRecentTransaction[];
}

/* ---------- Form ---------- */

/** Hasil server action yang dipakai form admin. */
export interface ActionState {
  ok: boolean;
  message: string;
}
