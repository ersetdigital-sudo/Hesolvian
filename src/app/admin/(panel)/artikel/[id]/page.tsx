import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleForm from '../ArticleForm';
import { PageHeader } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/format';
import { getArticle } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Ubah Artikel — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Ubah artikel"
        description={`Terakhir disimpan ${formatDateTime(article.updated_at)}`}
      />
      <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)] sm:p-6">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}
