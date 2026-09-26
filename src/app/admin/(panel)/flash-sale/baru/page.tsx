import type { Metadata } from 'next';
import FlashSaleForm from '../FlashSaleForm';
import { PageHeader } from '@/components/admin/ui';
import { listCategoryLabels } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Tambah Flash Sale — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function NewFlashSalePage() {
  let targetLabels: Record<string, string[]> = {};
  try {
    targetLabels = await listCategoryLabels();
  } catch {
    targetLabels = {};
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Tambah entri Flash Sale"
        description="Entri baru langsung mengikuti sesi yang dipilih. Pastikan target nominal cocok dengan katalog."
      />
      <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
        <FlashSaleForm targetLabels={targetLabels} />
      </div>
    </div>
  );
}
