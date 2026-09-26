import { isAdminAuthenticated } from '@/lib/adminAuth';
import { formatDateTime } from '@/lib/format';
import { supabaseAdmin } from '@/lib/supabase';
import type { TransactionRow } from '@/lib/types';

/** Escaping CSV: bungkus dengan tanda kutip dan gandakan kutip di dalamnya. */
function cell(value: string | number): string {
  const raw = String(value ?? '');
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return new Response('Tidak diizinkan.', { status: 401 });
  }

  const { data, error } = await supabaseAdmin()
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10000);

  if (error) {
    return new Response(`Gagal membaca transaksi: ${error.message}`, { status: 500 });
  }

  const header = [
    'id',
    'waktu',
    'pelanggan',
    'nomor_pelanggan',
    'kategori',
    'produk',
    'status',
    'jumlah',
    'harga_satuan',
    'biaya_admin',
    'diskon',
    'total',
    'metode'
  ];

  const lines = [
    header.join(','),
    ...((data ?? []) as TransactionRow[]).map((row) =>
      [
        row.id,
        formatDateTime(row.created_at),
        row.customer_name,
        row.customer_id,
        row.category_id,
        row.product_label,
        row.status,
        row.qty,
        row.unit_price,
        row.admin_fee,
        row.discount,
        row.total,
        row.method
      ]
        .map(cell)
        .join(',')
    )
  ];

  const stamp = new Date().toISOString().slice(0, 10);

  // \ufeff (BOM) supaya Excel membuka file dengan encoding UTF-8 dengan benar.
  const csv = '\ufeff' + lines.join('\r\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="hesolvian-transaksi-${stamp}.csv"`,
      'Cache-Control': 'no-store'
    }
  });
}
