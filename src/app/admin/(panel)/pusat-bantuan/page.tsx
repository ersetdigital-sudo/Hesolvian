import type { Metadata } from 'next';
import DeleteButton from '@/components/admin/DeleteButton';
import { Alert, LinkButton, PageHeader } from '@/components/admin/ui';
import { deleteFaqAction } from '@/app/admin/(panel)/actions';
import { FAQ_CATEGORIES } from '@/data/faqData';
import { formatNumber } from '@/lib/format';
import { listFaqs } from '@/lib/queries';
import type { FaqRow } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Pusat Bantuan — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

const CATEGORY_LABEL = new Map(FAQ_CATEGORIES.map((category) => [category.id, category.label]));

export default async function HelpCenterPage() {
  let rows: FaqRow[] = [];
  let loadError: string | null = null;
  try {
    rows = await listFaqs();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Gagal memuat FAQ.';
  }

  const published = rows.filter((row) => row.is_published).length;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Pusat Bantuan"
        description="Kelola FAQ yang tampil di halaman publik /bantuan. Perubahan langsung terlihat setelah disimpan."
        action={
          <LinkButton href="/admin/pusat-bantuan/baru">
            <span className="material-symbols-outlined text-[17px]">add</span>
            Tambah FAQ
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
            <span className="material-symbols-outlined text-[38px] text-[#d6d3d1]">help</span>
            <p className="mt-3 text-[14px] font-semibold text-[#1d1c18]">Belum ada FAQ</p>
            <p className="mt-1 text-[12.5px] text-[#78716c]">
              Tambahkan pertanyaan pertama untuk pusat bantuan.
            </p>
            <div className="mt-5 flex justify-center">
              <LinkButton href="/admin/pusat-bantuan/baru">Tambah FAQ pertama</LinkButton>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0efed] text-[11px] font-bold uppercase tracking-wide text-[#a8a29e]">
                  <th className="px-5 py-3 sm:px-6">Pertanyaan</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Urutan</th>
                  <th className="px-4 py-3 text-right sm:px-6">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#f7f6f4] last:border-0 hover:bg-[#fafaf9]">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="max-w-xl text-[13px] font-semibold text-[#1d1c18]">{row.question}</p>
                      <p className="mt-0.5 max-w-xl truncate text-[11.5px] text-[#78716c]">
                        {row.answer || 'Tanpa jawaban'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-full bg-[#f5f5f4] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#57534e]">
                        {CATEGORY_LABEL.get(row.category) ?? row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
                          row.is_published ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fef3c7] text-[#92400e]'
                        }`}
                      >
                        {row.is_published ? 'Tampil' : 'Disembunyikan'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-[#57534e]">{row.sort_order}</td>
                    <td className="px-4 py-3.5 sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/admin/pusat-bantuan/${row.id}`}
                          title={`Ubah ${row.question}`}
                          aria-label={`Ubah ${row.question}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#78716c] transition hover:bg-[#f5f5f4] hover:text-[#1d1c18]"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </a>
                        <DeleteButton action={deleteFaqAction} id={row.id} name={row.question} />
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
            {formatNumber(rows.length)} FAQ • {formatNumber(published)} tampil
          </p>
          <a href="/admin" className="text-[12px] font-bold text-[#9e3823] hover:underline">
            ← Kembali ke dasbor
          </a>
        </div>
      </div>
    </div>
  );
}
