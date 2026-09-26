import type { Metadata } from 'next';
import ArticleForm from '../ArticleForm';
import { PageHeader } from '@/components/admin/ui';

export const metadata: Metadata = {
  title: 'Tulis Artikel — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default function NewArticlePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Tulis artikel"
        description="Artikel disimpan sebagai draf sampai statusnya diubah menjadi Terbit."
      />
      <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
        <ArticleForm />
      </div>
    </div>
  );
}
