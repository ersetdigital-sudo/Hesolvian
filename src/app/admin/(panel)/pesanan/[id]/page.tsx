import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrderForm from '../OrderForm';
import { LinkButton, PageHeader, TransactionStatusPill } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/format';
import { getTransaction } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Ubah Pesanan — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const row = await getTransaction(decodeURIComponent(id)).catch(() => null);
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Ubah pesanan ${row.id}`}
        description={`Dibuat ${formatDateTime(row.created_at)} • terakhir diperbarui ${formatDateTime(row.updated_at)}`}
        action={
          <div className="flex items-center gap-2">
            <TransactionStatusPill status={row.status} />
            <LinkButton href="/admin/pesanan" variant="outline">
              <span className="material-symbols-outlined text-[17px]">arrow_back</span>
              Kembali
            </LinkButton>
          </div>
        }
      />
      <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
        <OrderForm row={row} />
      </div>
    </div>
  );
}
