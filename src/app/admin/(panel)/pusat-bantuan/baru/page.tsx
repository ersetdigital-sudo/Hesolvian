import type { Metadata } from 'next';
import FaqForm from '../FaqForm';
import { PageHeader } from '@/components/admin/ui';

export const metadata: Metadata = {
  title: 'Tambah FAQ — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default function NewFaqPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Tambah FAQ"
        description="FAQ langsung tampil di halaman publik /bantuan kalau opsi Tampilkan dicentang."
      />
      <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
        <FaqForm />
      </div>
    </div>
  );
}
