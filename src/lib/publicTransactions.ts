import { categoryMeta } from '@/lib/categories';
import type { TransactionRow, TransactionStatus } from '@/lib/types';
import type { AuditStep, TransactionRecord } from '@/types/ppob';

/**
 * Penghubung antara baris tabel `transactions` di Supabase dan bentuk
 * `TransactionRecord` yang dipakai halaman Cek Transaksi pelanggan.
 *
 * Modul ini murni (tanpa akses database) supaya bisa dipakai di server action
 * maupun diuji terpisah. Semua hasilnya hanya berisi field yang aman dipublik.
 */

const TIME_FMT = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta'
});

const DATE_FMT = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta'
});

const STATUS_META: Record<
  TransactionStatus,
  { label: string; badgeBg: string; badgeColor: string; accentBg: string; activeStep: number; progress: string }
> = {
  pending: {
    label: 'Menunggu Pembayaran',
    badgeBg: 'bg-[#FFF8E1]',
    badgeColor: 'text-[#D97706]',
    accentBg: 'bg-[#D97706]',
    activeStep: 2,
    progress: 'Menunggu Pembayaran'
  },
  processing: {
    label: 'Diproses Provider',
    badgeBg: 'bg-[#FCEAE5]',
    badgeColor: 'text-[#B4432C]',
    accentBg: 'bg-[#B4432C]',
    activeStep: 3,
    progress: 'Sedang Diproses • 3 dari 4 tahap'
  },
  success: {
    label: 'Berhasil / Selesai',
    badgeBg: 'bg-[#E4F3EC]',
    badgeColor: 'text-[#1F7A54]',
    accentBg: 'bg-[#1F7A54]',
    activeStep: 4,
    progress: 'Selesai • 4 dari 4 tahap'
  },
  failed: {
    label: 'Transaksi Gagal',
    badgeBg: 'bg-[#FEE2E2]',
    badgeColor: 'text-[#DC2626]',
    accentBg: 'bg-[#DC2626]',
    activeStep: 2,
    progress: 'Transaksi Gagal'
  }
};

function toDate(value: string): Date {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function clock(date: Date): string {
  return `${TIME_FMT.format(date)} WIB`;
}

function stamp(date: Date): string {
  return `${DATE_FMT.format(date)}, ${clock(date).replace(' WIB', '')} WIB`;
}

function buildSteps(status: TransactionStatus, activeStep: number, createdTime: string, updatedTime: string): AuditStep[] {
  const defs = [
    { step: 1, title: 'Pesanan Dibuat', subtitle: 'ID transaksi tercatat di sistem', icon: 'receipt_long' },
    { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran diterima loket', icon: 'payments' },
    { step: 3, title: 'Diproses Provider', subtitle: 'Routing ke server biller', icon: 'hub' },
    { step: 4, title: 'Selesai', subtitle: 'Layanan / token diterbitkan', icon: 'verified' }
  ];

  const times = [
    createdTime,
    status === 'pending' ? '-' : createdTime,
    status === 'processing' ? 'Sedang Berjalan' : status === 'success' ? updatedTime : '-',
    status === 'success' ? updatedTime : '-'
  ];

  return defs.map((def, index) => {
    const stepNum = index + 1;
    const stepStatus: AuditStep['status'] =
      status === 'success'
        ? 'completed'
        : stepNum < activeStep
        ? 'completed'
        : stepNum === activeStep
        ? 'active'
        : 'waiting';

    return { ...def, time: times[index], status: stepStatus };
  });
}

/** Ubah baris Supabase menjadi record yang aman ditampilkan ke pelanggan. */
export function toPublicRecord(row: TransactionRow): TransactionRecord {
  const status: TransactionStatus = row.status;
  const meta = STATUS_META[status] ?? STATUS_META.pending;

  const created = toDate(row.created_at);
  const updated = toDate(row.updated_at);
  const createdTime = clock(created);
  const updatedTime = clock(updated);
  const categoryName = categoryMeta(row.category_id).name;

  const tokenCode = cleanText(row.token_code, 64);
  const tokenLabel = cleanText(row.token_label, 80);
  const tokenSub = cleanText(row.token_sub, 200);

  return {
    id: row.id,
    status,
    statusLabel: meta.label,
    badgeBg: meta.badgeBg,
    badgeColor: meta.badgeColor,
    accentBg: meta.accentBg,
    createdAt: stamp(created),
    clearedAt: updatedTime,
    durationText: status === 'success' ? 'Selesai' : 'Sedang Diproses',
    stepActive: meta.activeStep,
    stepProgressText: meta.progress,
    steps: buildSteps(status, meta.activeStep, createdTime, updatedTime),
    tokenLabel: tokenCode ? tokenLabel || undefined : undefined,
    tokenCode: tokenCode || undefined,
    tokenSub: tokenCode ? tokenSub || undefined : undefined,
    hasCopyToken: /20\s*digit/i.test(tokenLabel),
    category: categoryName,
    categoryCode: row.category_id.toUpperCase(),
    product: row.product_label || categoryName,
    custId: row.customer_id || '-',
    custName: row.customer_name?.trim() || 'Pelanggan Hesolvian',
    tarif: 'Reguler / Prabayar',
    refCode: `REF-${row.category_id.toUpperCase()}-${row.id}`,
    priceBase: row.unit_price * row.qty,
    adminFee: row.admin_fee,
    discount: row.discount,
    total: row.total,
    method: row.method || 'QRIS',
    reconcileId: `#RC-${row.id.slice(-4)}-X`,
    billerName: 'Mitra Switching Nasional Host-to-Host'
  };
}

function clampInt(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

function cleanText(value: unknown, max: number, fallback = ''): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : fallback;
}

/**
 * Ubah record dari checkout pelanggan menjadi payload tabel `transactions`.
 * Semua input dibersihkan karena datang dari browser.
 */
export function toDbPayload(record: Partial<TransactionRecord> | null) {
  const status: TransactionStatus = (['pending', 'processing', 'success', 'failed'] as TransactionStatus[]).includes(
    record?.status as TransactionStatus
  )
    ? (record!.status as TransactionStatus)
    : 'pending';

  const payload: Record<string, string | number> = {
    id: cleanText(record?.id, 40),
    customer_id: cleanText(record?.custId, 40),
    category_id: cleanText(record?.categoryCode, 24).toLowerCase() || 'pulsa',
    product_label: cleanText(record?.product, 120),
    status,
    qty: 1,
    unit_price: clampInt(record?.priceBase),
    admin_fee: clampInt(record?.adminFee),
    discount: clampInt(record?.discount),
    total: clampInt(record?.total),
    method: cleanText(record?.method, 60, 'QRIS')
  };

  // Token hanya ditulis kalau memang ada; kalau tidak, kolomnya dibiarkan
  // apa adanya supaya menyimpan ulang pesanan lama tidak menghapus token.
  const tokenCode = cleanText(record?.tokenCode, 64);
  if (tokenCode) {
    payload.token_code = tokenCode;
    payload.token_label = cleanText(record?.tokenLabel, 80);
    payload.token_sub = cleanText(record?.tokenSub, 200);
  }

  return payload;
}
