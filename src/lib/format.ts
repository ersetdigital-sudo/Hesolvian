/** Formatter angka & tanggal untuk panel admin. Selalu locale id-ID. */

export function formatRupiah(amount: number, options: { compact?: boolean; withSymbol?: boolean } = {}): string {
  const { compact = false, withSymbol = true } = options;
  const prefix = withSymbol ? 'Rp' : '';

  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) return `${prefix}${(amount / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
    if (abs >= 1_000_000) return `${prefix}${(amount / 1_000_000).toFixed(1).replace('.', ',')} jt`;
    if (abs >= 1_000) return `${prefix}${(amount / 1_000).toFixed(0)} rb`;
  }

  return prefix + amount.toLocaleString('id-ID');
}

export function formatNumber(value: number): string {
  return value.toLocaleString('id-ID');
}

export function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits).replace('.', ',')}%`;
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(input: string | Date | null | undefined): string {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return (
    date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' • ' +
    date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}

/** 'YYYY-MM' -> 'Sep 2026' */
export function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(year, m - 1, 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

/** 'YYYY-MM' -> 'Sep' */
export function monthShortLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(year, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
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
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }
  if (variant === 'month-year') {
    return `${date.toLocaleDateString('id-ID', { month: 'short' })} '${String(date.getFullYear()).slice(2)}`;
  }
  return date.toLocaleDateString('id-ID', { month: 'short' });
}

export function toISODateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}
