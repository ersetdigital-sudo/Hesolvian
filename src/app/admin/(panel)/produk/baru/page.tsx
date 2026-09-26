import type { Metadata } from 'next';
import ProductForm from '../ProductForm';
import { PageHeader } from '@/components/admin/ui';

export const metadata: Metadata = {
  title: 'Tambah Produk — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Tambah produk"
        description="Produk baru langsung tampil di katalog setelah statusnya diaktifkan."
      />
      <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
        <ProductForm />
      </div>
    </div>
  );
}
