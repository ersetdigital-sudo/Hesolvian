import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

/**
 * Hanya beranda yang berupa route publik. Halaman lain (Bantuan, Tentang,
 * Syarat & Ketentuan, Kebijakan Privasi) adalah tab di dalam beranda, jadi
 * tidak punya URL sendiri untuk didaftarkan.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl()}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    }
  ];
}
