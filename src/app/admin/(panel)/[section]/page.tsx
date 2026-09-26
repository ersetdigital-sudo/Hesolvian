import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/ui';
import { ADMIN_NAV, ADMIN_NAV_ITEMS, PLACEHOLDER_SLUGS } from '@/lib/adminNav';

export const metadata: Metadata = {
  title: 'Panel Admin — Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

/**
 * Hanya menerima slug navigasi yang memang terdaftar sebagai halaman penampung.
 * Route statis (/admin/produk, /admin/artikel, dst.) selalu menang, jadi tidak
 * ada risiko menghabisi halaman yang sudah jadi.
 */
export default async function PlaceholderAdminPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;

  if (!PLACEHOLDER_SLUGS.includes(section)) notFound();

  const item = ADMIN_NAV_ITEMS.find((nav) => nav.href === `/admin/${section}`);
  const groupName = ADMIN_NAV.find((group) => group.items.some((nav) => nav.href === `/admin/${section}`))?.title;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title={item?.label ?? section}
        description={`Bagian ${groupName ?? 'Admin'} pada panel operator Hesolvian PPOB Ledger.`}
      />

      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#e7e5e4] bg-white px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f4]">
          <span className="material-symbols-outlined text-[28px] text-[#a8a29e]">
            {item?.icon ?? 'construction'}
          </span>
        </span>

        <div>
          <p className="text-[16px] font-bold text-[#1d1c18]">Modul ini belum dibangun</p>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-[#78716c]">
            Navigasi sidebar sudah tersusun rapi, dan halaman ini disiapkan sebagai tempat fitur
            <span className="font-semibold text-[#1d1c18]"> {item?.label} </span>
            ketika nanti diaktifkan. Modul yang sudah bisa dipakai sekarang: Dasbor, Produk, Flash Sale,
            Transaksi, Artikel, Pusat Bantuan, dan Pengaturan Sistem.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1d1c18] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#32302c]"
          >
            <span className="material-symbols-outlined text-[17px]">dashboard</span>
            Ke dasbor
          </a>
          <a
            href="/admin/produk"
            className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#1d1c18] transition hover:bg-[#fafaf9]"
          >
            <span className="material-symbols-outlined text-[17px]">inventory_2</span>
            Kelola produk
          </a>
        </div>
      </div>
    </div>
  );
}
