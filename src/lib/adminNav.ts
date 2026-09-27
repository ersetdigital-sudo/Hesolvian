/**
 * Struktur navigasi sidebar panel admin.
 *
 * Susunannya mengikuti wireframe needmcp `dashboard-sidebar-overview`:
 * empat grup menu dengan item pertama "Dasbor" dalam keadaan aktif.
 * Item dengan `ready: false` masih berupa halaman penampung.
 */

export interface AdminNavItem {
  label: string;
  href: string;
  /** Nama ikon Material Symbols. */
  icon: string;
  /** Bagian kedua breadcrumb di topbar, mis. 'Dasbor / Ringkasan'. */
  crumb: string;
  ready: boolean;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: 'Menu Utama',
    items: [
      { label: 'Dasbor', href: '/admin', icon: 'dashboard', crumb: 'Ringkasan', ready: true },
      { label: 'Produk', href: '/admin/produk', icon: 'inventory_2', crumb: 'Daftar Produk', ready: true },
      { label: 'Flash Sale', href: '/admin/flash-sale', icon: 'bolt', crumb: 'Sesi Promo', ready: true },
      { label: 'Transaksi', href: '/admin/transaksi', icon: 'receipt_long', crumb: 'Ledger', ready: true },
      { label: 'Laporan & Analitik', href: '/admin/laporan', icon: 'monitoring', crumb: 'Analitik', ready: false },
      { label: 'Pesan', href: '/admin/pesan', icon: 'forum', crumb: 'Kotak Masuk', ready: false },
      { label: 'Kinerja Tim', href: '/admin/tim', icon: 'groups', crumb: 'Operator', ready: false },
      { label: 'Kampanye', href: '/admin/kampanye', icon: 'campaign', crumb: 'Promosi', ready: false }
    ]
  },
  {
    title: 'Pelanggan',
    items: [
      { label: 'Daftar Pelanggan', href: '/admin/pelanggan', icon: 'contacts', crumb: 'Basis Data', ready: false },
      { label: 'Channel', href: '/admin/channel', icon: 'hub', crumb: 'Mitra', ready: false },
      { label: 'Manajemen Pesanan', href: '/admin/pesanan', icon: 'shopping_bag', crumb: 'Antrean', ready: false }
    ]
  },
  {
    title: 'Manajemen',
    items: [
      { label: 'Peran & Izin', href: '/admin/peran', icon: 'admin_panel_settings', crumb: 'Akses', ready: false },
      { label: 'Tagihan & Langganan', href: '/admin/langganan', icon: 'credit_card', crumb: 'Penagihan', ready: false },
      { label: 'Integrasi', href: '/admin/integrasi', icon: 'extension', crumb: 'Koneksi', ready: false }
    ]
  },
  {
    title: 'Pengaturan',
    items: [
      { label: 'Pusat Bantuan', href: '/admin/pusat-bantuan', icon: 'help', crumb: 'Dokumentasi', ready: true },
      { label: 'Metode Pembayaran', href: '/admin/pembayaran', icon: 'payments', crumb: 'QRIS & Kanal Bayar', ready: true },
      { label: 'Pengaturan Sistem', href: '/admin/sistem', icon: 'settings', crumb: 'Konfigurasi', ready: true }
    ]
  }
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV.flatMap((group) => group.items);

/** Identitas operator yang tampil di footer sidebar. Ganti sesuai kebutuhan. */
export const ADMIN_USER = {
  name: 'Admin Hesolvian',
  role: 'Super Admin'
};

/** Slug halaman penampung yang sah, dipakai route dinamis [section]. */
export const PLACEHOLDER_SLUGS: string[] = ADMIN_NAV_ITEMS.filter((item) => !item.ready).map((item) =>
  item.href.replace('/admin/', '')
);

export function findNavItem(pathname: string): AdminNavItem | undefined {
  const exact = ADMIN_NAV_ITEMS.find((item) => item.href === pathname);
  if (exact) return exact;

  // Cocokkan juga halaman anak, mis. /admin/produk/abc-123 -> Produk
  return ADMIN_NAV_ITEMS.filter((item) => item.href !== '/admin').find((item) =>
    pathname.startsWith(`${item.href}/`)
  );
}
