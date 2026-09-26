import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FlashSaleForm from '../FlashSaleForm';
import { ContentStatusPill, PageHeader } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/format';
import { getFlashSale, listCategoryLabels } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Ubah Flash Sale — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function EditFlashSalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getFlashSale(id);
  if (!row) notFound();

  let targetLabels: Record<string, string[]> = {};
  try {
    targetLabels = await listCategoryLabels();
  } catch {
    targetLabels = {};
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Ubah entri Flash Sale"
        action={<ContentStatusPill status={row.status} />}
        description={`Terakhir disimpan ${formatDateTime(row.updated_at)}`}
      />
      <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
        <FlashSaleForm row={row} targetLabels={targetLabels} />
      </div>
    </div>
  );
}
