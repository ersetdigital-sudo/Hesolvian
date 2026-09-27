'use client';

import { useMemo, useState, useTransition } from 'react';
import { Field, Select, TextInput, buttonClass } from '@/components/admin/ui';
import { showToast } from '@/components/admin/Toaster';
import { updateTransactionAction } from '@/app/admin/(panel)/actions';
import { CATEGORY_ORDER, categoryMeta } from '@/lib/categories';
import { formatNumber, formatRupiah } from '@/lib/format';
import type { ActionState, TransactionRow } from '@/lib/types';

const METHODS = ['QRIS', 'Transfer Bank', 'Tunai Agen'];
const STATUSES = [
  { value: 'pending', label: 'Menunggu pembayaran' },
  { value: 'processing', label: 'Diproses provider' },
  { value: 'success', label: 'Berhasil / selesai' },
  { value: 'failed', label: 'Gagal / batal' }
];

/**
 * Penyunting pesanan yang dirender di dalam tabel (`OrdersTable`), jadi admin
 * tidak pernah berpindah halaman. Selesai → panggil `onSaved`, batal → `onCancel`.
 */
export default function OrderForm({
  row,
  onCancel,
  onSaved
}: {
  row: TransactionRow;
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  const [unitPrice, setUnitPrice] = useState(row.unit_price);
  const [qty, setQty] = useState(row.qty);
  const [adminFee, setAdminFee] = useState(row.admin_fee);
  const [discount, setDiscount] = useState(row.discount);
  const [isPending, startTransition] = useTransition();

  const total = useMemo(
    () => Math.max(0, unitPrice * qty + adminFee - discount),
    [unitPrice, qty, adminFee, discount]
  );

  const number = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('_id', row.id);

    startTransition(async () => {
      try {
        const result: ActionState = await updateTransactionAction(null, formData);
        showToast(result.message || (result.ok ? 'Perubahan disimpan.' : 'Gagal menyimpan.'), result.ok ? 'success' : 'error');
        if (result.ok) onSaved?.();
      } catch {
        showToast('Gagal menyimpan perubahan.', 'error');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {row.token_code && (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#166534]">
            {row.token_label || 'Token / Serial Number'}
          </p>
          <p className="mt-1 font-mono text-[15px] font-bold tracking-wider text-[#166534]">{row.token_code}</p>
          {row.token_sub && <p className="mt-1 text-[12px] text-[#57534e]">{row.token_sub}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Status" htmlFor={`status-${row.id}`}>
          <Select id={`status-${row.id}`} name="status" defaultValue={row.status}>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Kategori" htmlFor={`category-${row.id}`}>
          <Select id={`category-${row.id}`} name="category_id" defaultValue={row.category_id || 'pulsa'}>
            {CATEGORY_ORDER.map((id) => (
              <option key={id} value={id}>
                {categoryMeta(id).name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Metode bayar" htmlFor={`method-${row.id}`}>
          <Select id={`method-${row.id}`} name="method" defaultValue={row.method || 'QRIS'}>
            {[...new Set([row.method, ...METHODS])].filter(Boolean).map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Field label="Nama produk" htmlFor={`product-${row.id}`}>
            <TextInput id={`product-${row.id}`} name="product_label" defaultValue={row.product_label} required />
          </Field>
        </div>

        <Field label="Nomor pelanggan" htmlFor={`cust-${row.id}`} optional>
          <TextInput id={`cust-${row.id}`} name="customer_id" defaultValue={row.customer_id} placeholder="081288294910" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Harga satuan" htmlFor={`price-${row.id}`}>
          <TextInput
            id={`price-${row.id}`}
            name="unit_price"
            type="number"
            min={0}
            defaultValue={row.unit_price}
            onChange={(event) => setUnitPrice(number(event.target.value))}
          />
        </Field>

        <Field label="Jumlah" htmlFor={`qty-${row.id}`}>
          <TextInput
            id={`qty-${row.id}`}
            name="qty"
            type="number"
            min={1}
            defaultValue={row.qty}
            onChange={(event) => setQty(Math.max(1, number(event.target.value)))}
          />
        </Field>

        <Field label="Biaya admin" htmlFor={`admin-${row.id}`}>
          <TextInput
            id={`admin-${row.id}`}
            name="admin_fee"
            type="number"
            min={0}
            defaultValue={row.admin_fee}
            onChange={(event) => setAdminFee(number(event.target.value))}
          />
        </Field>

        <Field label="Diskon" htmlFor={`discount-${row.id}`}>
          <TextInput
            id={`discount-${row.id}`}
            name="discount"
            type="number"
            min={0}
            defaultValue={row.discount}
            onChange={(event) => setDiscount(number(event.target.value))}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#f0d9d2] bg-[#fdf3f0] px-4 py-3">
        <div>
          <p className="text-[12px] font-semibold text-[#9e3823]">Total pesanan setelah diubah</p>
          <p className="mt-1 text-[11.5px] text-[#8a716c]">
            ({formatNumber(unitPrice)} × {qty}) + {formatNumber(adminFee)} − {formatNumber(discount)}
          </p>
        </div>
        <p className="text-[20px] font-bold leading-none tracking-[-0.02em] text-[#7e210e]">{formatRupiah(total)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[#f0efed] pt-5">
        <button type="submit" disabled={isPending} className={buttonClass('primary')}>
          {isPending ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Menyimpan…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[17px]">save</span>
              Simpan perubahan
            </>
          )}
        </button>
        <button type="button" onClick={onCancel} disabled={isPending} className={buttonClass('outline')}>
          Batal
        </button>
      </div>
    </form>
  );
}
