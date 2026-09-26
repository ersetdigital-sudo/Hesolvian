import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductForm from '../ProductForm';
import { ContentStatusPill, PageHeader } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/format';
import { getProduct } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Ubah Produk — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Ubah produk"
        action={<ContentStatusPill status={product.status} />}
        description={`Terakhir disimpan ${formatDateTime(product.updated_at)}`}
      />
      <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
