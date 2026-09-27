'use client';

import { useState } from 'react';
import AdminForm from '@/components/admin/AdminForm';
import { Field, Select, TextArea, TextInput } from '@/components/admin/ui';
import { saveArticleAction } from '@/app/admin/(panel)/actions';
import type { ArticleRow } from '@/lib/types';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export default function ArticleForm({ article }: { article?: ArticleRow }) {
  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
  const [status, setStatus] = useState(article?.status ?? 'draft');
  const isEdit = Boolean(article);

  return (
    <AdminForm
      action={saveArticleAction}
      id={article?.id}
      submitLabel={isEdit ? 'Simpan perubahan' : 'Terbitkan artikel'}
      cancelHref="/admin/artikel"
    >
      <Field label="Judul" htmlFor="title" hint="Jadi dasar slug otomatis kalau slug tidak diisi manual.">
        <TextInput
          id="title"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          placeholder="Cara Lacak Status Transaksi PPOB"
          required
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint="Hanya huruf kecil, angka, dan tanda hubung."
      >
        <TextInput
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          placeholder="cara-lacak-status-transaksi"
        />
      </Field>

      <Field label="Ringkasan" htmlFor="excerpt" optional hint="Tampil di daftar artikel dan deskripsi meta.">
        <TextArea id="excerpt" name="excerpt" defaultValue={article?.excerpt ?? ''} rows={3} />
      </Field>

      <Field label="Isi artikel" htmlFor="content" optional hint="Dukungan markdown akan ditambahkan di iterasi berikutnya.">
        <TextArea
          id="content"
          name="content"
          defaultValue={article?.content ?? ''}
          rows={14}
          placeholder="Tulis isi artikel di sini…"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="Penulis" htmlFor="author">
          <TextInput id="author" name="author" defaultValue={article?.author ?? 'Admin'} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Status" htmlFor="status" hint="Artikel 'Terbit' memperbarui waktu publikasi.">
            <Select
              id="status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as ArticleRow['status'])}
            >
              <option value="draft">Draf</option>
              <option value="published">Terbit</option>
              <option value="archived">Arsip</option>
            </Select>
          </Field>
        </div>
      </div>

    </AdminForm>
  );
}
