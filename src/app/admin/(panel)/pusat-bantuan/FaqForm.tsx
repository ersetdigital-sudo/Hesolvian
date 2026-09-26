'use client';

import AdminForm from '@/components/admin/AdminForm';
import { Checkbox, Field, Select, TextArea, TextInput } from '@/components/admin/ui';
import { saveFaqAction } from '@/app/admin/(panel)/actions';
import { FAQ_CATEGORIES } from '@/data/faqData';
import type { FaqRow } from '@/lib/types';

export default function FaqForm({ faq }: { faq?: FaqRow }) {
  const isEdit = Boolean(faq);

  return (
    <AdminForm
      action={saveFaqAction}
      id={faq?.id}
      submitLabel={isEdit ? 'Simpan perubahan' : 'Tambah FAQ'}
      cancelHref="/admin/pusat-bantuan"
    >
      <Field label="Kategori" htmlFor="category" hint="Menentukan pill filter di halaman publik /bantuan.">
        <Select id="category" name="category" defaultValue={faq?.category ?? 'umum'}>
          {FAQ_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Pertanyaan" htmlFor="question">
        <TextInput
          id="question"
          name="question"
          defaultValue={faq?.question ?? ''}
          placeholder="Berapa lama transaksi diproses setelah pembayaran berhasil?"
          required
        />
      </Field>

      <Field label="Jawaban" htmlFor="answer">
        <TextArea
          id="answer"
          name="answer"
          defaultValue={faq?.answer ?? ''}
          rows={6}
          placeholder="Tulis jawaban lengkap yang tampil saat pengunjung membuka pertanyaan ini…"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Urutan tampil"
          htmlFor="sort_order"
          hint="Angka kecil tampil lebih dulu di dalam kategorinya."
        >
          <TextInput
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={faq?.sort_order ?? 0}
          />
        </Field>

        <div className="flex items-end pb-1">
          <Checkbox
            name="is_published"
            label="Tampilkan di halaman publik /bantuan"
            defaultChecked={faq?.is_published ?? true}
          />
        </div>
      </div>
    </AdminForm>
  );
}
