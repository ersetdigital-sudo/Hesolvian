'use client';

import { useState } from 'react';
import { SalesSeriesPoint } from '@/lib/queries';
import { bucketLabel, formatNumber, formatRupiah } from '@/lib/format';

export interface SalesTrendTab {
  key: string;
  label: string;
  variant: 'day' | 'month' | 'month-year';
  points: SalesSeriesPoint[];
}

/**
 * Grafik batang bertumpuk: tinggi batang = jumlah pesanan, dipecah jadi
 * pelanggan baru vs pelanggan lama. Angka besar di kanan = total pendapatan
 * periode yang sedang dipilih.
 */
export default function SalesTrendChart({ tabs }: { tabs: SalesTrendTab[] }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? '');
  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  const points = active?.points ?? [];
  const maxOrders = Math.max(1, ...points.map((point) => point.orders));
  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = points.reduce((sum, point) => sum + point.orders, 0);

  return (
    <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold leading-tight tracking-[-0.01em] text-[#1d1c18]">Tren Penjualan</h2>
          <p className="mt-1 text-[12.5px] text-[#78716c]">
            Tinggi batang = jumlah pesanan, dibedakan pelanggan baru dan pelanggan lama.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-[#f5f5f4] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveKey(tab.key)}
              aria-pressed={tab.key === active?.key}
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${
                tab.key === active?.key ? 'bg-white text-[#1d1c18] shadow-sm' : 'text-[#78716c] hover:text-[#1d1c18]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#57534e]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#E2694A]" />
            Pelanggan Baru
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#57534e]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#f0c8bc]" />
            Pelanggan Lama
          </span>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-bold leading-none tracking-[-0.02em] text-[#1d1c18]">
            {formatRupiah(totalRevenue)}
          </p>
          <p className="mt-1 text-[11.5px] text-[#a8a29e]">{formatNumber(totalOrders)} pesanan pada periode ini</p>
        </div>
      </div>

      {/* ---------- Grafik ---------- */}
      <div className="mt-6">
        <div className="flex h-52 items-end gap-1.5 sm:gap-2">
          {points.map((point) => {
            const newHeight = (point.new_users / maxOrders) * 100;
            const existingHeight = (point.existing_users / maxOrders) * 100;
            const hasOrders = point.orders > 0;

            return (
              <div key={point.bucket} className="group relative flex h-full flex-1 flex-col justify-end">
                {/* Kartu info saat hover */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1d1c18] px-3 py-2 text-[11px] text-white shadow-lg group-hover:block">
                  <p className="font-bold">{bucketLabel(point.bucket, active.variant)}</p>
                  <p className="mt-1 opacity-80">Pendapatan: {formatRupiah(point.revenue)}</p>
                  <p className="opacity-80">Pesanan: {formatNumber(point.orders)}</p>
                  <p className="opacity-80">
                    Baru {point.new_users} • Lama {point.existing_users}
                  </p>
                </div>

                <div className="flex h-full w-full flex-col justify-end overflow-hidden rounded-t-md bg-[#f5f5f4]">
                  <div
                    className="w-full bg-[#f0c8bc] transition-[height] duration-300 group-hover:bg-[#e5b3a3]"
                    style={{ height: `${existingHeight}%` }}
                  />
                  <div
                    className="w-full bg-[#E2694A] transition-[height] duration-300 group-hover:bg-[#d05a3c]"
                    style={{ height: `${newHeight}%` }}
                  />
                </div>

                <span
                  className={`mt-2 truncate text-center text-[10.5px] font-medium ${
                    hasOrders ? 'text-[#78716c]' : 'text-[#c8c5c2]'
                  }`}
                >
                  {bucketLabel(point.bucket, active.variant)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
