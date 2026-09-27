/**
 * Tipe data publik dipisah dari `queries.ts` supaya komponen client bisa
 * mengimpor tipenya dengan `import type` tanpa ikut menarik modul server
 * (supabase-js + Node crypto).
 */

export interface PublicCatalogItem {
  l: string;
  d: string;
  p: number;
  variable?: boolean;
}

export interface PublicCatalogGroup {
  name: string;
  items: PublicCatalogItem[];
}

export interface PublicCatalogCategory {
  id: string;
  groups: PublicCatalogGroup[];
}

export interface PublicFlashSaleItem {
  id: string;
  sessionId: string;
  name: string;
  provider: string;
  normalPrice: number;
  promoPrice: number;
  discountPercent?: number;
  quota: number;
  sold: number;
  categoryId: string;
  targetLabel?: string;
}

export interface PublicFaq {
  category: string;
  question: string;
  answer: string;
}

export interface PublicData {
  catalog: PublicCatalogCategory[];
  flashSales: PublicFlashSaleItem[];
  faqs: PublicFaq[];
}
