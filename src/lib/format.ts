/**
 * Formatter angka & tanggal untuk panel admin. Selalu locale id-ID.
 *
 * PENTING — semua tanggal/jam diformat dalam zona **WIB (Asia/Jakarta)**,
 * bukan zona waktu mesin. Server produksi (Vercel) berjalan di UTC sementara
 * browser pengguna di WIB. Tanpa `timeZone` eksplisit, komponen client yang
 * me-render tanggal (mis. Transaksi Terbaru & label Tren Penjualan) akan
 * menghasilkan teks berbeda antara HTML dari server dan hasil hidrasi di
 * browser, sehingga React melempar hydration error (#418).
 */

const LOCALE = 'id-ID';
const TIME_ZONE = 'Asia/Jakarta';

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: TIME_ZONE
};

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE
};

export function formatRupiah(amount: number, options: { compact?: boolean; withSymbol?: boolean } = {}): string {
  const { compact = false, withSymbol = true } = options;
  const prefix = withSymbol ? 'Rp' : '';

  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) return `${prefix}${(amount / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
    if (abs >= 1_000_000) return `${prefix}${(amount / 1_000_000).toFixed(1).replace('.', ',')} jt`;
    if (abs >= 1_000) return `${prefix}${(amount / 1_000).toFixed(0)} rb`;
  }

  return prefix + amount.toLocaleString(LOCALE);
}

export function formatNumber(value: number): string {
  return value.toLocaleString(LOCALE);
}

export function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits).replace('.', ',')}%`;
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(LOCALE, DATE_OPTIONS);
}

export function formatDateTime(input: string | Date | null | undefined): string {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return (
    date.toLocaleDateString(LOCALE, DATE_OPTIONS) +
    ' • ' +
    date.toLocaleTimeString(LOCALE, TIME_OPTIONS)
  );
}

/** 'YYYY-MM' -> 'Sep 2026' */
export function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  // Tengah hari UTC supaya pergeseran zona waktu tidak menggeser nama bulannya.
  return new Date(Date.UTC(year, m - 1, 1, 12)).toLocaleDateString(LOCALE, {
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE
  });
}

/** 'YYYY-MM' -> 'Sep' */
export function monthShortLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(Date.UTC(year, m - 1, 1, 12)).toLocaleDateString(LOCALE, {
    month: 'short',
    timeZone: TIME_ZONE
  });
}

/** Selisih persentase antara periode sekarang dan sebelumnya. */
export function deltaPercent(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous === 0) return null; // tidak ada pembanding => tidak bisa dihitung
  return ((current - previous) / previous) * 100;
}

/** Label sumbu-X untuk bucket dari RPC admin_sales_series. */
export function bucketLabel(bucket: string, variant: 'day' | 'month' | 'month-year'): string {
  const date = new Date(bucket);
  if (Number.isNaN(date.getTime())) return bucket;

  if (variant === 'day') {
    return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', timeZone: TIME_ZONE });
  }
  if (variant === 'month-year') {
    return `${date.toLocaleDateString(LOCALE, { month: 'short', timeZone: TIME_ZONE })} '${String(
      date.getUTCFullYear()
    ).slice(2)}`;
  }
  return date.toLocaleDateString(LOCALE, { month: 'short', timeZone: TIME_ZONE });
}

export function toISODateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}
