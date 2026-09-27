'use client';

import { useMemo, useState } from 'react';
import AdminForm from '@/components/admin/AdminForm';
import { Alert, Field, Select, TextInput } from '@/components/admin/ui';
import { updateTransactionAction } from '@/app/admin/(panel)/actions';
import { CATEGORY_ORDER, categoryMeta } from '@/lib/categories';
import { formatNumber, formatRupiah } from '@/lib/format';
import type { TransactionRow } from '@/lib/types';

const METHODS = ['QRIS', 'Transfer Bank', 'Tunai Agen'];
const STATUSES = [
  { value: 'pending', label: 'Menunggu pembayaran' },
  { value: 'processing', label: 'Diproses provider' },
  { value: 'success', label: 'Berhasil / selesai' },
  { value: 'failed', label: 'Gagal / batal' }
];

export default function OrderForm({ row }: { row: TransactionRow }) {
  const [unitPrice, setUnitPrice] = useState(row.unit_price);
  const [qty, setQty] = useState(row.qty);
  const [adminFee, setAdminFee] = useState(row.admin_fee);
  const [discount, setDiscount] = useState(row.discount);

  const total = useMemo(
    () => Math.max(0, unitPrice * qty + adminFee - discount),
    [unitPrice, qty, adminFee, discount]
  );

  const number = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return (
    <AdminForm action={updateTransactionAction} id={row.id} submitLabel="Simpan perubahan" cancelHref="/admin/pesanan">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Kategori" htmlFor="category_id">
          <Select id="category_id" name="category_id" defaultValue={row.category_id || 'pulsa'}>
            {CATEGORY_ORDER.map((id) => (
              <option key={id} value={id}>
                {categoryMeta(id).name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Status pesanan" htmlFor="status">
          <Select id="status" name="status" defaultValue={row.status}>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nama produk" htmlFor="product_label" hint="Isi bebas, mis. 'Pulsa 25.000'.">
          <TextInput id="product_label" name="product_label" defaultValue={row.product_label} required />
        </Field>

        <Field label="Nomor pelanggan" htmlFor="customer_id" optional hint="Nomor HP, ID pelanggan, atau nomor meter.">
          <TextInput id="customer_id" name="customer_id" defaultValue={row.customer_id} placeholder="081288294910" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Field label="Harga satuan" htmlFor="unit_price">
          <TextInput
            id="unit_price"
            name="unit_price"
            type="number"
            min={0}
            defaultValue={row.unit_price}
            onChange={(event) => setUnitPrice(number(event.target.value))}
          />
        </Field>

        <Field label="Jumlah" htmlFor="qty">
          <TextInput
            id="qty"
            name="qty"
            type="number"
            min={1}
            defaultValue={row.qty}
            onChange={(event) => setQty(Math.max(1, number(event.target.value)))}
          />
        </Field>

        <Field label="Biaya admin" htmlFor="admin_fee">
          <TextInput
            id="admin_fee"
            name="admin_fee"
            type="number"
            min={0}
            defaultValue={row.admin_fee}
            onChange={(event) => setAdminFee(number(event.target.value))}
          />
        </Field>

        <Field label="Diskon" htmlFor="discount">
          <TextInput
            id="discount"
            name="discount"
            type="number"
            min={0}
            defaultValue={row.discount}
            onChange={(event) => setDiscount(number(event.target.value))}
          />
        </Field>
      </div>

      <Field label="Metode bayar" htmlFor="method">
        <Select id="method" name="method" defaultValue={row.method || 'QRIS'}>
          {[...new Set([row.method, ...METHODS])].filter(Boolean).map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex items-center justify-between rounded-xl border border-[#f0d9d2] bg-[#fdf3f0] px-5 py-4">
        <div>
          <p className="text-[12px] font-semibold text-[#9e3823]">Total pesanan setelah diubah</p>
          <p className="mt-1 text-[11.5px] text-[#8a716c]">
            ({formatNumber(unitPrice)} × {qty}) + {formatNumber(adminFee)} − {formatNumber(discount)}
          </p>
        </div>
        <p className="text-[22px] font-bold leading-none tracking-[-0.02em] text-[#7e210e]">{formatRupiah(total)}</p>
      </div>

      <Alert>
        Perubahan langsung tersimpan ke ledger dan riwayat transaksi. Nama pelanggan tidak lagi dipakai di pesanan.
      </Alert>
    </AdminForm>
  );
}
