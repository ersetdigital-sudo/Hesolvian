import type { Metadata } from 'next';
import DeleteButton from '@/components/admin/DeleteButton';
import { Alert, LinkButton, PageHeader, TransactionStatusPill } from '@/components/admin/ui';
import { deleteArticleAction } from '@/app/admin/(panel)/actions';
import { formatDate, formatNumber } from '@/lib/format';
import { listArticles } from '@/lib/queries';
import type { ArticleRow } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Artikel — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

const ARTICLE_STATUS_STYLE: Record<string, { className: string; label: string }> = {
  published: { className: 'bg-[#dcfce7] text-[#166534]', label: 'Terbit' },
  draft: { className: 'bg-[#fef3c7] text-[#92400e]', label: 'Draf' },
  archived: { className: 'bg-[#f5f5f4] text-[#57534e]', label: 'Arsip' }
};

function ArticleStatusPill({ status }: { status: string }) {
  const style = ARTICLE_STATUS_STYLE[status] ?? { className: 'bg-[#f5f5f4] text-[#57534e]', label: status };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export default async function ArticlesPage() {
  let rows: ArticleRow[] = [];
  let loadError: string | null = null;
  try {
    rows = await listArticles();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Gagal memuat artikel.';
  }

  const published = rows.filter((row) => row.status === 'published').length;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Artikel"
        description="Konten panduan dan informasi. Sertakan gambar sampul agar menarik saat dibagikan."
        action={
          <LinkButton href="/admin/artikel/baru">
            <span className="material-symbols-outlined text-[17px]">add</span>
            Tulis artikel
          </LinkButton>
        }
      />

      {loadError && (
        <div className="mb-5">
          <Alert tone="danger">{loadError}</Alert>
        </div>
      )}

      <div className="rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_2px_rgba(29,28,24,0.04)]">
        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="material-symbols-outlined text-[38px] text-[#d6d3d1]">article</span>
            <p className="mt-3 text-[14px] font-semibold text-[#1d1c18]">Belum ada artikel</p>
            <p className="mt-1 text-[12.5px] text-[#78716c]">Tulis artikel pertama untuk pusat bantuan.</p>
            <div className="mt-5 flex justify-center">
              <LinkButton href="/admin/artikel/baru">Tulis artikel pertama</LinkButton>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0efed] text-[11px] font-bold uppercase tracking-wide text-[#a8a29e]">
                  <th className="px-5 py-3 sm:px-6">Artikel</th>
                  <th className="px-4 py-3">Penulis</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Terbit</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3 text-right sm:px-6">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#f7f6f4] last:border-0 hover:bg-[#fafaf9]">
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex items-center gap-3">
                        {row.cover_image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={row.cover_image_url}
                            alt=""
                            loading="lazy"
                            className="h-12 w-16 shrink-0 rounded-lg border border-[#f0efed] bg-[#f5f5f4] object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f4]">
                            <span className="material-symbols-outlined text-[20px] text-[#a8a29e]">image</span>
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-[#1d1c18]">{row.title}</p>
                          <p className="mt-0.5 max-w-md truncate text-[11.5px] text-[#78716c]">
                            {row.excerpt || 'Tanpa ringkasan'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-[#57534e]">{row.author}</td>
                    <td className="px-4 py-3.5">
                      <ArticleStatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-[#57534e]">{formatDate(row.published_at)}</td>
                    <td className="px-4 py-3.5">
                      <code className="rounded bg-[#f5f5f4] px-2 py-1 text-[11.5px] text-[#57534e]">{row.slug}</code>
                    </td>
                    <td className="px-4 py-3.5 sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/admin/artikel/${row.id}`}
                          title={`Ubah ${row.title}`}
                          aria-label={`Ubah ${row.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#78716c] transition hover:bg-[#f5f5f4] hover:text-[#1d1c18]"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </a>
                        <DeleteButton action={deleteArticleAction} id={row.id} name={row.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0efed] px-5 py-3.5 sm:px-6">
          <p className="text-[11.5px] text-[#a8a29e]">
            {formatNumber(rows.length)} artikel • {formatNumber(published)} terbit
          </p>
          <a href="/admin" className="text-[12px] font-bold text-[#9e3823] hover:underline">
            ← Kembali ke dasbor
          </a>
        </div>
      </div>
    </div>
  );
}
