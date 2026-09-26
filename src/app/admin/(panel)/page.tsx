import type { Metadata } from 'next';
import SalesTrendChart, { type SalesTrendTab } from '@/components/admin/dashboard/SalesTrendChart';
import StatCard from '@/components/admin/dashboard/StatCard';
import RevenueBreakdown from '@/components/admin/dashboard/RevenueBreakdown';
import RecentTransactions from '@/components/admin/dashboard/RecentTransactions';
import { bucketLabel, deltaPercent, formatDate, formatNumber, formatPercent, formatRupiah } from '@/lib/format';
import { getDashboardData, getSalesSeries } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Dasbor — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

/** Tiga tab periode, diambil paralel dari database. */
async function loadTrendTabs(): Promise<SalesTrendTab[]> {
  const [weekly, monthly, twoYears] = await Promise.all([
    getSalesSeries('week', 8),
    getSalesSeries('month', 12),
    getSalesSeries('month', 24)
  ]);

  return [
    { key: 'weekly', label: 'Mingguan', variant: 'day', points: weekly },
    { key: 'monthly', label: 'Bulanan', variant: 'month', points: monthly },
    { key: 'two-years', label: '2 Tahun', variant: 'month-year', points: twoYears }
  ];
}

export default async function AdminDashboardPage() {
  const [{ data, error }, trendTabs] = await Promise.all([getDashboardData(12), loadTrendTabs()]);

  const totals = data?.totals;
  const previous = data?.previous;
  const hasData = Boolean(totals);

  const statCards = [
    {
      label: 'Total Pendapatan',
      value: formatRupiah(totals?.revenue ?? 0, { compact: false }),
      delta: deltaPercent(totals?.revenue ?? 0, previous?.revenue ?? 0),
      icon: 'payments',
      iconBg: '#FFF3E0',
      iconColor: '#EA580C'
    },
    {
      label: 'Total Pesanan',
      value: formatNumber(totals?.orders ?? 0),
      delta: deltaPercent(totals?.orders ?? 0, previous?.orders ?? 0),
      icon: 'receipt_long',
      iconBg: '#E3F4FC',
      iconColor: '#0891B2'
    },
    {
      label: 'Pelanggan Baru',
      value: formatNumber(totals?.customers ?? 0),
      delta: deltaPercent(totals?.customers ?? 0, previous?.customers ?? 0),
      icon: 'person_add',
      iconBg: '#E8F5E9',
      iconColor: '#16A34A'
    },
    {
      label: 'Tingkat Konversi',
      value: formatPercent(totals?.conversion ?? 0, 2),
      delta: deltaPercent(totals?.conversion ?? 0, previous?.conversion ?? 0),
      icon: 'percent',
      iconBg: '#EDE7F6',
      iconColor: '#7C3AED'
    }
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* ---------- Sapaan + kontrol periode ---------- */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#1d1c18]">
            Selamat datang kembali, Admin
          </h1>
          <p className="mt-1 text-[13px] text-[#78716c]">
            Ringkasan operasional ledger PPOB per {formatDate(new Date().toISOString())}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-3 py-2 text-[12.5px] font-medium text-[#57534e] sm:inline-flex">
            <span className="material-symbols-outlined text-[17px] text-[#a8a29e]">calendar_today</span>
            12 bulan terakhir
          </span>

          <a
            href="/api/admin/export/transactions"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-[#1d1c18] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#32302c]"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            Ekspor CSV
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[12.5px] font-medium text-[#991b1b]">
          Gagal memuat data dasbor: {error}
        </div>
      )}

      {!error && !hasData && (
        <div className="mb-6 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-[12.5px] font-medium text-[#1e40af]">
          Belum ada transaksi di ledger. Tambahkan lewat menu Transaksi untuk mulai mengisi dasbor.
        </div>
      )}

      {/* ---------- Grid 4 kartu statistik ---------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            delta={card.delta}
            deltaCaption="vs tahun lalu"
            icon={card.icon}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      {/* ---------- Grafik ---------- */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesTrendChart tabs={trendTabs} />
        </div>
        <RevenueBreakdown items={data?.breakdown ?? []} />
      </div>

      {/* ---------- Tabel transaksi terbaru ---------- */}
      <div className="mt-5">
        <RecentTransactions rows={data?.recent ?? []} />
      </div>

      {/* ---------- Catatan sumber data ---------- */}
      <p className="mt-6 text-[11.5px] leading-relaxed text-[#a8a29e]">
        Angka di atas dihitung langsung dari tabel <code className="font-mono">transactions</code> pada Supabase
        project <code className="font-mono">Hesolvian</code>. Bucket grafik:{' '}
        {trendTabs.map((tab) => `${tab.label} (${bucketLabel(tab.points.at(-1)?.bucket ?? '', tab.variant)})`).join(' • ')}
      </p>
    </div>
  );
}
