import type { Metadata } from 'next';
import DeleteButton from '@/components/admin/DeleteButton';
import { LinkButton, PageHeader, TransactionStatusPill } from '@/components/admin/ui';
import { deleteTransactionAction } from '@/app/admin/(panel)/actions';
import { categoryMeta } from '@/lib/categories';
import { formatDateTime, formatNumber, formatRupiah } from '@/lib/format';
import { getTransactionStats, listTransactions } from '@/lib/queries';
import type { TransactionRow, TransactionStatus } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Transaksi — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'success', label: 'Berhasil' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'processing', label: 'Diproses' },
  { value: 'failed', label: 'Gagal' }
];

export default async function TransactionsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = '', status = 'all' } = await searchParams;

  let rows: TransactionRow[] = [];
  let stats = { total: 0, success: 0, pending: 0, revenue: 0 };
  let loadError: string | null = null;

  try {
    [rows, stats] = await Promise.all([
      listTransactions({ query: q, status: status as TransactionStatus | 'all', limit: 200 }),
      getTransactionStats()
    ]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Gagal memuat transaksi.';
  }

  const buildHref = (nextStatus: string, nextQuery: string) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    if (nextStatus !== 'all') params.set('status', nextStatus);
    const search = params.toString();
    return `/admin/transaksi${search ? `?${search}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Transaksi"
        description="Ledger lengkap seluruh transaksi PPOB. Pencarian mendukung ID, nama, nomor pelanggan, dan nama produk."
        action={
          <LinkButton href="/admin/transaksi/baru">
            <span className="material-symbols-outlined text-[17px]">add</span>
            Catat transaksi
          </LinkButton>
        }
      />

      {loadError && (
        <p className="mb-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[12.5px] font-medium text-[#991b1b]">
          {loadError}
        </p>
      )}

      {/* Ringkasan */}
      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: 'Total baris', value: formatNumber(stats.total), tone: 'text-[#1d1c18]' },
          { label: 'Berhasil', value: formatNumber(stats.success), tone: 'text-[#166534]' },
          { label: 'Menunggu / diproses', value: formatNumber(stats.pending), tone: 'text-[#92400e]' },
          { label: 'Pendapatan berhasil', value: formatRupiah(stats.revenue), tone: 'text-[#E2694A]' }
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#e7e5e4] bg-white p-4">
            <p className="text-[11.5px] font-semibold text-[#78716c]">{item.label}</p>
            <p className={`mt-2 text-[20px] font-bold leading-none tracking-[-0.02em] ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>

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
              placeholder="Cari ID, pelanggan, nomor, atau produk…"
              aria-label="Cari transaksi"
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

          <a
            href="/api/admin/export/transactions"
            download
            className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-3 py-2.5 text-[12.5px] font-semibold text-[#1d1c18] transition hover:bg-[#fafaf9]"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            CSV
          </a>
        </div>

        {/* Tabel */}
        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="material-symbols-outlined text-[38px] text-[#d6d3d1]">receipt_long</span>
            <p className="mt-3 text-[14px] font-semibold text-[#1d1c18]">
              {q || status !== 'all' ? 'Tidak ada hasil' : 'Belum ada transaksi'}
            </p>
            <p className="mt-1 text-[12.5px] text-[#78716c]">
              {q || status !== 'all'
                ? 'Coba ubah kata kunci atau ubah filter status.'
                : 'Catat transaksi pertama untuk mulai mengisi ledger.'}
            </p>
            {!q && status === 'all' && (
              <div className="mt-5 flex justify-center">
                <LinkButton href="/admin/transaksi/baru">Catat transaksi</LinkButton>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0efed] text-[11px] font-bold uppercase tracking-wide text-[#a8a29e]">
                  <th className="px-5 py-3 sm:px-6">ID &amp; waktu</th>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Satuan</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3 text-right sm:px-6">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const meta = categoryMeta(row.category_id);
                  return (
                    <tr key={row.id} className="border-b border-[#f7f6f4] last:border-0 hover:bg-[#fafaf9]">
                      <td className="px-5 py-3.5 sm:px-6">
                        <p className="font-mono text-[12px] font-semibold text-[#1d1c18]">{row.id}</p>
                        <p className="mt-0.5 text-[11px] text-[#a8a29e]">{formatDateTime(row.created_at)}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[12.5px] font-semibold text-[#1d1c18]">{row.customer_name}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-[#a8a29e]">{row.customer_id || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: meta.bg }}
                          >
                            <span className="material-symbols-outlined text-[15px]" style={{ color: meta.color }}>
                              {meta.icon}
                            </span>
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] text-[#1d1c18]">{row.product_label}</p>
                            <p className="truncate text-[11px] text-[#a8a29e]">{meta.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <TransactionStatusPill status={row.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right text-[12.5px] text-[#57534e]">{formatNumber(row.qty)}</td>
                      <td className="px-4 py-3.5 text-right text-[12.5px] text-[#57534e]">
                        {formatRupiah(row.unit_price)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#1d1c18]">
                        {formatRupiah(row.total)}
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-[#57534e]">{row.method}</td>
                      <td className="px-4 py-3.5 sm:px-6">
                        <div className="flex items-center justify-end gap-1">
                          <DeleteButton action={deleteTransactionAction} id={row.id} name={row.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0efed] px-5 py-3.5 sm:px-6">
          <p className="text-[11.5px] text-[#a8a29e]">
            Menampilkan {formatNumber(rows.length)} baris
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
