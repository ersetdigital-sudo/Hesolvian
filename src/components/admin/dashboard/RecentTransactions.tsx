'use client';

import { useMemo, useState } from 'react';
import { categoryMeta } from '@/lib/categories';
import { formatDateTime, formatNumber, formatRupiah } from '@/lib/format';
import { TransactionStatusPill } from '@/components/admin/ui';
import type { DashboardRecentTransaction } from '@/lib/types';

/** Tabel transaksi terbaru + toolbar pencarian dan tombol tambah. */
export default function RecentTransactions({ rows }: { rows: DashboardRecentTransaction[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.id, row.customer_name, row.customer_id, row.product_label]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }, [rows, query]);

  return (
    <div className="rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_2px_rgba(29,28,24,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0efed] p-5 sm:p-6">
        <div>
          <h2 className="text-[17px] font-bold leading-tight tracking-[-0.01em] text-[#1d1c18]">Transaksi Terbaru</h2>
          <p className="mt-1 text-[12.5px] text-[#78716c]">{rows.length} transaksi terakhir masuk</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-[#a8a29e]">
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari transaksi…"
              aria-label="Cari transaksi terbaru"
              className="h-9 w-44 rounded-lg bg-[#f5f5f4] pl-9 pr-3 text-[12.5px] text-[#1d1c18] outline-none transition placeholder:text-[#a8a29e] focus:bg-white focus:ring-2 focus:ring-[#E2694A]/25 sm:w-56"
            />
          </div>
          <a
            href="/admin/transaksi/baru"
            title="Catat transaksi baru"
            aria-label="Catat transaksi baru"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1d1c18] text-white transition hover:bg-[#32302c]"
          >
            <span className="material-symbols-outlined text-[19px]">add</span>
          </a>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <span className="material-symbols-outlined text-[34px] text-[#d6d3d1]">receipt_long</span>
          <p className="mt-2 text-[13px] font-semibold text-[#1d1c18]">
            {rows.length === 0 ? 'Belum ada transaksi' : 'Tidak ada hasil'}
          </p>
          <p className="mt-1 text-[12px] text-[#78716c]">
            {rows.length === 0
              ? 'Transaksi yang tercatat di ledger akan muncul di sini.'
              : 'Coba kata kunci lain atau bersihkan pencarian.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#f0efed] text-[11px] font-bold uppercase tracking-wide text-[#a8a29e]">
                <th className="px-5 py-3 sm:px-6">ID</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Harga Satuan</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right sm:px-6">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const meta = categoryMeta(row.category_id);
                return (
                  <tr key={row.id} className="border-b border-[#f7f6f4] last:border-0 hover:bg-[#fafaf9]">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-mono text-[12px] font-semibold text-[#1d1c18]">{row.id}</p>
                      <p className="mt-0.5 text-[11px] text-[#a8a29e]">{formatDateTime(row.created_at)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[12.5px] font-semibold text-[#1d1c18]">{row.customer_name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#a8a29e]">{row.customer_id}</p>
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
                        <span className="text-[12.5px] text-[#1d1c18]">{row.product_label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <TransactionStatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right text-[12.5px] text-[#57534e]">{formatNumber(row.qty)}</td>
                    <td className="px-4 py-3.5 text-right text-[12.5px] text-[#57534e]">
                      {formatRupiah(row.unit_price)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[12.5px] font-bold text-[#1d1c18]">
                      {formatRupiah(row.total)}
                    </td>
                    <td className="px-4 py-3.5 text-right sm:px-6">
                      <a
                        href={`/admin/transaksi?q=${encodeURIComponent(row.id)}`}
                        title="Lihat detail di daftar transaksi"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#78716c] transition hover:bg-[#f5f5f4] hover:text-[#1d1c18]"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#f0efed] px-5 py-3.5 sm:px-6">
        <p className="text-[11.5px] text-[#a8a29e]">
          {filtered.length === rows.length ? 'Menampilkan semua' : `Menampilkan ${filtered.length} dari ${rows.length}`}
        </p>
        <a href="/admin/transaksi" className="text-[12px] font-bold text-[#9e3823] hover:underline">
          Lihat semua transaksi →
        </a>
      </div>
    </div>
  );
}
