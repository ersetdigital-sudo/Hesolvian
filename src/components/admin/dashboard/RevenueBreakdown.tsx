import { categoryMeta } from '@/lib/categories';
import { formatNumber, formatRupiah } from '@/lib/format';
import type { DashboardBreakdownItem } from '@/lib/types';

/** Panel batang vertikal: kontribusi tiap kategori PPOB terhadap pendapatan. */
export default function RevenueBreakdown({ items }: { items: DashboardBreakdownItem[] }) {
  const rows = items.filter((item) => item.revenue > 0).slice(0, 8);
  const max = Math.max(1, ...rows.map((row) => row.revenue));
  const total = rows.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
      <h2 className="text-[17px] font-bold leading-tight tracking-[-0.01em] text-[#1d1c18]">Rincian Pendapatan</h2>
      <p className="mt-1 text-[12.5px] text-[#78716c]">
        {total > 0 ? `${formatRupiah(total)} dari ${rows.length} kategori` : 'Belum ada transaksi berhasil.'}
      </p>

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#e7e5e4] bg-[#fafaf9] px-4 py-10 text-center">
          <p className="text-[12.5px] text-[#a8a29e]">Belum ada data untuk ditampilkan.</p>
        </div>
      ) : (
        <div className="mt-6 flex h-44 items-end gap-2">
          {rows.map((row) => {
            const meta = categoryMeta(row.category_id);
            const heightPercent = Math.max(4, (row.revenue / max) * 100);

            return (
              <div key={row.category_id} className="group relative flex h-full flex-1 flex-col justify-end">
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1d1c18] px-3 py-2 text-[11px] text-white shadow-lg group-hover:block">
                  <p className="font-bold">{meta.name}</p>
                  <p className="mt-1 opacity-80">{formatRupiah(row.revenue)}</p>
                  <p className="opacity-80">{formatNumber(row.orders)} pesanan</p>
                </div>

                <div
                  className="w-full rounded-t-md transition-opacity duration-200 group-hover:opacity-80"
                  style={{ height: `${heightPercent}%`, backgroundColor: meta.color }}
                />
                <span className="mt-2 truncate text-center text-[10px] font-semibold text-[#78716c]">{meta.short}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Banner insight */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#f0d9d2] bg-gradient-to-br from-[#fdf3f0] to-[#fbe9e3] p-4">
        <span className="material-symbols-outlined mt-0.5 text-[20px] text-[#9e3823]">auto_awesome</span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold leading-snug text-[#7e210e]">
            Dapatkan insight AI untuk analisis lebih baik
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#8a716c]">
            Bedah pola kategori, jam ramai, dan produk paling menguntungkan.
          </p>
          <a
            href="/admin/laporan"
            className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-[#9e3823] hover:underline"
          >
            Buka laporan
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  );
}
