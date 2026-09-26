import { CATEGORIES_DATA, type CategoryData } from '@/data/categoriesData';
import { FAQS_DATA, type FaqEntry } from '@/data/faqData';
import { FLASH_SALE_PRODUCTS, type FlashSaleProduct } from '@/data/flashSaleData';
import type { PublicData } from './publicTypes';

/**
 * ============================================================
 * ADAPTER DATA PUBLIK
 * ============================================================
 * Sumber kebenaran utama: database Supabase (diatur dari /admin).
 * Data statis (`categoriesData.ts` / `flashSaleData.ts`) hanya dipakai kalau
 * query gagal — bukan ketika hasilnya memang kosong.
 *
 * Alasan fallbacknya beda per bagian:
 * - Katalog: DB tanpa satu pun produk dianggap "belum disiapkan" dan tetap
 *   pakai data statis, supaya beranda tidak pernah jadi kosong total.
 *   (Sebaliknya, kategori yang semua produknya diarsipkan memang dikosongkan.)
 * - Flash Sale: hasil kosong DIHORMATI, jadi admin bisa menghapus seluruh
 *   entri dan section Flash Sale ikut hilang dari beranda.
 * - FAQ: kalau database belum punya FAQ terbit, halaman bantuan memakai daftar
 *   statis supaya tidak pernah kosong.
 */

export interface ResolvedPublicData {
  categories: CategoryData[];
  flashSales: FlashSaleProduct[];
  faqs: FaqEntry[];
}

export function resolvePublicData(publicData: PublicData | null): ResolvedPublicData {
  /* ---------- katalog ---------- */
  let categories = CATEGORIES_DATA;

  if (publicData && publicData.catalog.length > 0) {
    const groupsById = new Map(publicData.catalog.map((entry) => [entry.id, entry.groups]));

    categories = CATEGORIES_DATA.map((category) => {
      const groups = groupsById.get(category.id);
      // Kategori tidak punya produk aktif di DB -> dikosongkan.
      if (!groups) return { ...category, groups: [] };
      if (groups.length === 0) return { ...category, groups: [] };
      // Metadata kategori (nama, ikon, warna, label field, biaya admin)
      // tidak ikut disimpan di DB, jadi tetap dari data statis.
      return { ...category, groups };
    });
  }

  /* ---------- flash sale ---------- */
  let flashSales: FlashSaleProduct[] = FLASH_SALE_PRODUCTS;

  if (publicData) {
    flashSales = publicData.flashSales.map((item) => ({
      id: item.id,
      sessionId: item.sessionId,
      name: item.name,
      provider: item.provider,
      normalPrice: item.normalPrice,
      promoPrice: item.promoPrice,
      discountPercent: item.discountPercent,
      quota: item.quota,
      sold: item.sold,
      categoryId: item.categoryId,
      targetLabel: item.targetLabel
    }));
  }

  /* ---------- pusat bantuan ---------- */
  const faqs: FaqEntry[] =
    publicData && publicData.faqs.length > 0 ? publicData.faqs : FAQS_DATA;

  return { categories, flashSales, faqs };
}

/** Daftar id kategori yang masih punya produk aktif (untuk filter beranda). */
export function categoriesWithContent(categories: CategoryData[]): CategoryData[] {
  return categories.filter((category) => category.groups.some((group) => group.items.length > 0));
}
