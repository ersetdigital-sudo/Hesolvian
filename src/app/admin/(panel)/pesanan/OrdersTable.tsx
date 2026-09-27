'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import DeleteButton from '@/components/admin/DeleteButton';
import { showToast } from '@/components/admin/Toaster';
import { deleteTransactionAction, setTransactionStatusAction } from '@/app/admin/(panel)/actions';
import { categoryMeta } from '@/lib/categories';
import { formatDateTime, formatNumber, formatRupiah } from '@/lib/format';
import type { TransactionRow, TransactionStatus } from '@/lib/types';
import OrderForm from './OrderForm';

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'processing', label: 'Diproses' },
  { value: 'success', label: 'Berhasil' },
  { value: 'failed', label: 'Gagal' }
];

/**
 * Tabel pesanan di menu Antrean.
 *
 * Tombol "Ubah" TIDAK berpindah halaman: ia menyetel `editing` ke pesanan yang
 * dipilih lalu merender modal edit di atas tabel yang sama. Simpan → modal
 * tertutup dan tabel di-refresh lewat `router.refresh()` tanpa reload.
 */
export default function OrdersTable({ rows }: { rows: TransactionRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<TransactionRow | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kunci scroll & tutup modal dengan Escape selama modal terbuka.
  useEffect(() => {
    if (!editing) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEditing(null);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [editing]);

  const handleStatusChange = (id: string, status: TransactionStatus) => {
    startTransition(async () => {
      try {
        const result = await setTransactionStatusAction(id, status);
        showToast(
          result.message || (result.ok ? 'Status diperbarui.' : 'Gagal mengubah status.'),
          result.ok ? 'success' : 'error'
        );
        if (result.ok) router.refresh();
      } catch {
        showToast('Gagal mengubah status.', 'error');
      }
    });
  };

  const handleSaved = () => {
    setEditing(null);
    router.refresh();
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#f0efed] text-[11px] font-bold uppercase tracking-wide text-[#a8a29e]">
              <th className="px-5 py-3 sm:px-6">ID &amp; waktu</th>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3 text-right sm:px-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const meta = categoryMeta(row.category_id);

              return (
                <tr key={row.id} className="border-b border-[#f7f6f4] last:border-0 hover:bg-[#fafaf9]">
                  <td className="px-5 py-3.5 sm:px-6">
                    <p className="font-mono text-[12px] font-semibold text-[#1d1c18]">{row.id}</p>
                    <p className="mt-0.5 text-[11px] text-[#a8a29e]">{formatDateTime(row.created_at)}</p>
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
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] text-[#1d1c18]">{row.product_label}</p>
                        <p className="truncate text-[11px] text-[#a8a29e]">{meta.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={row.status}
                      aria-label={`Status pesanan ${row.id}`}
                      disabled={isPending}
                      onChange={(event) => handleStatusChange(row.id, event.target.value as TransactionStatus)}
                      className="h-8 cursor-pointer rounded-lg border border-[#e7e5e4] bg-white px-2 text-[12px] font-semibold text-[#1d1c18] outline-none transition hover:border-[#d6d3d1] focus:border-[#E2694A] focus:ring-2 focus:ring-[#E2694A]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-right text-[12.5px] text-[#57534e]">{formatNumber(row.qty)}</td>
                  <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#1d1c18]">
                    {formatRupiah(row.total)}
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-[#57534e]">{row.method}</td>
                  <td className="px-4 py-3.5 sm:px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        aria-haspopup="dialog"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e7e5e4] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1d1c18] transition hover:bg-[#fafaf9]"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Ubah
                      </button>
                      <DeleteButton action={deleteTransactionAction} id={row.id} name={row.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal edit pesanan — tetap di layar Antrean yang sama. */}
      {mounted &&
        editing &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[2px] sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={`Ubah pesanan ${editing.id}`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setEditing(null);
            }}
          >
            <div className="my-6 w-full max-w-3xl rounded-2xl border border-[#e7e5e4] bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-[#f0efed] px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <h2 className="text-[16px] font-bold text-[#1d1c18]">Ubah pesanan</h2>
                  <p className="mt-1 truncate font-mono text-[12.5px] font-semibold text-[#1d1c18]">{editing.id}</p>
                  <p className="mt-0.5 text-[11.5px] text-[#8a716c]">Dibuat {formatDateTime(editing.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="Tutup modal"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#78716c] transition hover:bg-[#f5f5f4] hover:text-[#1d1c18]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <OrderForm row={editing} onCancel={() => setEditing(null)} onSaved={handleSaved} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
