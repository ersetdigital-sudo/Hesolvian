import type { Metadata } from 'next';
import TransactionCreateForm from './TransactionCreateForm';
import { PageHeader } from '@/components/admin/ui';
import { listCategoryLabels } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Catat Transaksi — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function NewTransactionPage() {
  let productLabels: string[] = [];
  try {
    const byCategory = await listCategoryLabels();
    productLabels = Object.values(byCategory).flat();
  } catch {
    productLabels = [];
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Catat transaksi"
        description="Untuk transaksi luring yang perlu masuk ledger. ID dibuat otomatis dengan format HSVYYYYMMDD-XXXX."
      />
      <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
        <TransactionCreateForm productLabels={productLabels} />
      </div>
    </div>
  );
}
