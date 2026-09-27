'use client';

import { useMemo, useState } from 'react';
import AdminForm from '@/components/admin/AdminForm';
import { Field, Select, TextInput } from '@/components/admin/ui';
import { createTransactionAction } from '@/app/admin/(panel)/actions';
import { CATEGORY_ORDER, categoryMeta } from '@/lib/categories';
import { formatNumber, formatRupiah } from '@/lib/format';

const METHODS = ['QRIS', 'Transfer Bank', 'Tunai Agen'];
const STATUSES = [
  { value: 'success', label: 'Berhasil' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'processing', label: 'Diproses' },
  { value: 'failed', label: 'Gagal' }
];

export default function TransactionCreateForm({ productLabels = [] }: { productLabels?: string[] }) {
  const [unitPrice, setUnitPrice] = useState(0);
  const [qty, setQty] = useState(1);
  const [adminFee, setAdminFee] = useState(0);
  const [discount, setDiscount] = useState(0);

  const total = useMemo(
    () => Math.max(0, unitPrice * qty + adminFee - discount),
    [unitPrice, qty, adminFee, discount]
  );

  const number = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return (
    <AdminForm action={createTransactionAction} submitLabel="Catat transaksi" cancelHref="/admin/transaksi">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nama pelanggan" htmlFor="customer_name">
          <TextInput id="customer_name" name="customer_name" placeholder="Salung Prastyo" required />
        </Field>

        <Field label="Nomor pelanggan" htmlFor="customer_id" optional hint="Nomor HP, ID pelanggan, atau nomor meter.">
          <TextInput id="customer_id" name="customer_id" placeholder="081288294910" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Kategori" htmlFor="category_id">
          <Select id="category_id" name="category_id" defaultValue="pulsa">
            {CATEGORY_ORDER.map((id) => (
              <option key={id} value={id}>
                {categoryMeta(id).name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Nama produk" htmlFor="product_label" hint="Isi bebas, mis. 'Pulsa 25.000'.">
          <TextInput
            id="product_label"
            name="product_label"
            list="transaction-product-labels"
            placeholder="Pulsa 25.000"
            required
          />
          <datalist id="transaction-product-labels">
            {productLabels.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Field label="Harga satuan" htmlFor="unit_price">
          <TextInput
            id="unit_price"
            name="unit_price"
            type="number"
            min={0}
            defaultValue={0}
            onChange={(event) => setUnitPrice(number(event.target.value))}
          />
        </Field>

        <Field label="Jumlah" htmlFor="qty">
          <TextInput
            id="qty"
            name="qty"
            type="number"
            min={1}
            defaultValue={1}
            onChange={(event) => setQty(Math.max(1, number(event.target.value)))}
          />
        </Field>

        <Field label="Biaya admin" htmlFor="admin_fee">
          <TextInput
            id="admin_fee"
            name="admin_fee"
            type="number"
            min={0}
            defaultValue={0}
            onChange={(event) => setAdminFee(number(event.target.value))}
          />
        </Field>

        <Field label="Diskon" htmlFor="discount">
          <TextInput
            id="discount"
            name="discount"
            type="number"
            min={0}
            defaultValue={0}
            onChange={(event) => setDiscount(number(event.target.value))}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue="success">
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Metode bayar" htmlFor="method">
          <Select id="method" name="method" defaultValue="QRIS">
            {METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#f0d9d2] bg-[#fdf3f0] px-5 py-4">
        <div>
          <p className="text-[12px] font-semibold text-[#9e3823]">Total yang akan tercatat</p>
          <p className="mt-1 text-[11.5px] text-[#8a716c]">
            ({formatNumber(unitPrice)} × {qty}) + {formatNumber(adminFee)} − {formatNumber(discount)}
          </p>
        </div>
        <p className="text-[22px] font-bold leading-none tracking-[-0.02em] text-[#7e210e]">
          {formatRupiah(total)}
        </p>
      </div>
    </AdminForm>
  );
}
