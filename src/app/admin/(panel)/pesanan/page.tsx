import type { Metadata } from 'next';
import { EmptyState, LinkButton, PageHeader } from '@/components/admin/ui';
import { formatNumber } from '@/lib/format';
import { listTransactions } from '@/lib/queries';
import type { TransactionRow, TransactionStatus } from '@/lib/types';
import OrdersTable from './OrdersTable';

export const metadata: Metadata = {
  title: 'Manajemen Pesanan — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'processing', label: 'Diproses' },
  { value: 'success', label: 'Berhasil' },
  { value: 'failed', label: 'Gagal' }
];

export default async function OrdersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = '', status = 'all' } = await searchParams;

  let rows: TransactionRow[] = [];
  let loadError: string | null = null;

  try {
    rows = await listTransactions({ query: q, status: status as TransactionStatus | 'all', limit: 200 });
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Gagal memuat pesanan.';
  }

  const buildHref = (nextStatus: string, nextQuery: string) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    if (nextStatus !== 'all') params.set('status', nextStatus);
    const search = params.toString();
    return `/admin/pesanan${search ? `?${search}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Manajemen Pesanan"
        description="Ubah status, produk, jumlah, nominal, dan metode pembayaran langsung dari tabel — tanpa membuka halaman lain."
        action={
          <LinkButton href="/admin/transaksi/baru">
            <span className="material-symbols-outlined text-[17px]">add</span>
            Pesanan baru
          </LinkButton>
        }
      />

      {loadError && (
        <p className="mb-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[12.5px] font-medium text-[#991b1b]">
          {loadError}
        </p>
      )}

      <div className="rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_2px_rgba(29,28,24,0.04)]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#f0efed] p-5 sm:p-6">
          <form method="get" className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#a8a29e]">
              search
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari ID, nomor, atau produk…"
              aria-label="Cari pesanan"
              className="h-10 w-full rounded-lg border border-[#e7e5e4] bg-white pl-10 pr-3 text-[13px] outline-none transition placeholder:text-[#a8a29e] focus:border-[#E2694A] focus:ring-2 focus:ring-[#E2694A]/20"
            />
            {status !== 'all' && <input type="hidden" name="status" value={status} />}
          </form>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#f5f5f4] p-1">
            {STATUS_FILTERS.map((filter) => (
              <a
                key={filter.value}
                href={buildHref(filter.value, q)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${
                  status === filter.value ? 'bg-white text-[#1d1c18] shadow-sm' : 'text-[#78716c] hover:text-[#1d1c18]'
                }`}
              >
                {filter.label}
              </a>
            ))}
          </div>
        </div>

        {/* Tabel */}
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon="shopping_bag"
              title={q || status !== 'all' ? 'Tidak ada pesanan cocok' : 'Belum ada pesanan'}
              description={
                q || status !== 'all'
                  ? 'Coba ubah kata kunci atau filter status.'
                  : 'Pesanan yang tercatat di ledger akan tampil di sini dan bisa diubah.'
              }
              action={<LinkButton href="/admin/transaksi/baru">Catat pesanan</LinkButton>}
            />
          </div>
        ) : (
          <OrdersTable rows={rows} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0efed] px-5 py-3.5 sm:px-6">
          <p className="text-[11.5px] text-[#a8a29e]">
            Menampilkan {formatNumber(rows.length)} pesanan
            {q ? ` untuk pencarian "${q}"` : ''}
            {status !== 'all' ? ` • filter ${status}` : ''}
          </p>
          <a href="/admin" className="text-[12px] font-bold text-[#9e3823] hover:underline">
            ← Kembali ke dasbor
          </a>
        </div>
      </div>
    </div>
  );
}
