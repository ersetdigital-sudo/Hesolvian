import type { Metadata } from 'next';
import DeleteButton from '@/components/admin/DeleteButton';
import { Alert, ContentStatusPill, LinkButton, PageHeader } from '@/components/admin/ui';
import { deleteFlashSaleAction } from '@/app/admin/(panel)/actions';
import { categoryMeta } from '@/lib/categories';
import { discountPercentOf } from '@/lib/flashSale';
import { formatNumber, formatRupiah } from '@/lib/format';
import { listFlashSales } from '@/lib/queries';
import type { ContentStatus, FlashSaleRow } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Flash Sale — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

const SESSIONS = [
  { id: 'flash-11', label: '11:00 – 13:00' },
  { id: 'flash-13', label: '13:00 – 15:00' },
  { id: 'flash-15', label: '15:00 – 17:00' }
];

function soldBar(row: FlashSaleRow) {
  const percent = row.quota > 0 ? Math.min(100, Math.round((row.sold / row.quota) * 100)) : 0;
  return (
    <div className="min-w-[130px]">
      <div className="flex items-center justify-between text-[11px] text-[#78716c]">
        <span className="font-semibold text-[#1d1c18]">{formatNumber(row.sold)}</span>
        <span>{formatNumber(row.quota)}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#f5f5f4]">
        <div
          className={`h-full rounded-full ${percent >= 100 ? 'bg-[#16A34A]' : 'bg-[#E2694A]'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-[10.5px] text-[#a8a29e]">{percent}% kuota terpakai</p>
    </div>
  );
}

export default async function FlashSalePage() {
  let rows: FlashSaleRow[] = [];
  let loadError: string | null = null;
  try {
    rows = await listFlashSales();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Gagal memuat Flash Sale.';
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Flash Sale"
        description="Sesi promo harian di beranda. Kolom 'Target nominal' harus sama persis dengan nama nominal di katalog agar otomatis terpilih saat user beli."
        action={
          <LinkButton href="/admin/flash-sale/baru">
            <span className="material-symbols-outlined text-[17px]">add</span>
            Tambah entri
          </LinkButton>
        }
      />

      {loadError && (
        <div className="mb-5">
          <Alert tone="danger">{loadError}</Alert>
        </div>
      )}

      {/* Ringkasan sesi */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SESSIONS.map((session) => {
          const members = rows.filter((row) => row.session_id === session.id);
          const quota = members.reduce((sum, row) => sum + row.quota, 0);
          const sold = members.reduce((sum, row) => sum + row.sold, 0);
          return (
            <div key={session.id} className="rounded-2xl border border-[#e7e5e4] bg-white p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF8E1]">
                  <span className="material-symbols-outlined text-[17px] text-[#F59E0B]">bolt</span>
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#1d1c18]">{session.label}</p>
                  <p className="text-[11px] text-[#a8a29e]">{members.length} produk</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#f5f5f4]">
                <div
                  className="h-full rounded-full bg-[#E2694A]"
                  style={{ width: `${quota > 0 ? Math.round((sold / quota) * 100) : 0}%` }}
                />
              </div>
              <p className="mt-2 text-[11.5px] text-[#78716c]">
                {formatNumber(sold)} dari {formatNumber(quota)} kuota terpakai
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_2px_rgba(29,28,24,0.04)]">
        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="material-symbols-outlined text-[38px] text-[#d6d3d1]">bolt</span>
            <p className="mt-3 text-[14px] font-semibold text-[#1d1c18]">Belum ada entri Flash Sale</p>
            <p className="mt-1 text-[12.5px] text-[#78716c]">
              Tambahkan entri pertama supaya section Flash Sale muncul di beranda.
            </p>
            <div className="mt-5 flex justify-center">
              <LinkButton href="/admin/flash-sale/baru">Tambah entri Flash Sale</LinkButton>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0efed] text-[11px] font-bold uppercase tracking-wide text-[#a8a29e]">
                  <th className="px-5 py-3 sm:px-6">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Sesi</th>
                  <th className="px-4 py-3 text-right">Harga Normal</th>
                  <th className="px-4 py-3 text-right">Harga Promo</th>
                  <th className="px-4 py-3 text-right">Diskon</th>
                  <th className="px-4 py-3">Kuota</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right sm:px-6">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const meta = categoryMeta(row.category_id);
                  const session = SESSIONS.find((s) => s.id === row.session_id);
                  return (
                    <tr key={row.id} className="border-b border-[#f7f6f4] last:border-0 hover:bg-[#fafaf9]">
                      <td className="px-5 py-3.5 sm:px-6">
                        <div className="flex items-center gap-3">
                          {row.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={row.image_url}
                              alt=""
                              loading="lazy"
                              className="h-10 w-10 shrink-0 rounded-lg border border-[#f0efed] bg-[#f5f5f4] object-cover"
                            />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF8E1]">
                              <span className="material-symbols-outlined text-[19px] text-[#F59E0B]">bolt</span>
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#1d1c18]">{row.name}</p>
                            <p className="truncate text-[11.5px] text-[#a8a29e]">
                              {row.provider || 'Tanpa provider'} • {row.target_label ?? 'tanpa target'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-bold"
                          style={{ backgroundColor: meta.bg, color: meta.color }}
                        >
                          {meta.short}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[12.5px] font-semibold text-[#1d1c18]">{session?.label ?? row.session_start}</p>
                        <p className="text-[11px] text-[#a8a29e]">{row.session_id}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right text-[12.5px] text-[#57534e] line-through">
                        {formatRupiah(row.normal_price)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#E2694A]">
                        {formatRupiah(row.promo_price)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex rounded-md bg-[#FFF8E1] px-2 py-1 text-[11px] font-bold text-[#92400e]">
                          -{discountPercentOf(row.normal_price, row.promo_price)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{soldBar(row)}</td>
                      <td className="px-4 py-3.5">
                        <ContentStatusPill status={row.status as ContentStatus} />
                      </td>
                      <td className="px-4 py-3.5 sm:px-6">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/admin/flash-sale/${row.id}`}
                            title={`Ubah ${row.name}`}
                            aria-label={`Ubah ${row.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#78716c] transition hover:bg-[#f5f5f4] hover:text-[#1d1c18]"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </a>
                          <DeleteButton action={deleteFlashSaleAction} id={row.id} name={row.name} />
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
          <p className="text-[11.5px] text-[#a8a29e]">{formatNumber(rows.length)} entri Flash Sale</p>
          <a href="/admin" className="text-[12px] font-bold text-[#9e3823] hover:underline">
            ← Kembali ke dasbor
          </a>
        </div>
      </div>
    </div>
  );
}
