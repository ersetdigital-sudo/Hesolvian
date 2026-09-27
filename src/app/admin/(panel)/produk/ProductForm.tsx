'use client';

import { useState } from 'react';
import AdminForm from '@/components/admin/AdminForm';
import { Checkbox, Field, Select, TextArea, TextInput } from '@/components/admin/ui';
import { saveProductAction } from '@/app/admin/(panel)/actions';
import { CATEGORY_ORDER, categoryMeta } from '@/lib/categories';
import type { ProductRow } from '@/lib/types';

/**
 * Formulir produk. Berjalan di client supaya centang "Harga beban tagihan"
 * bisa langsung menonaktifkan input harga.
 */
export default function ProductForm({ product }: { product?: ProductRow }) {
  const [isVariable, setIsVariable] = useState(product?.is_variable ?? false);
  const isEdit = Boolean(product);

  return (
    <AdminForm
      action={saveProductAction}
      id={product?.id}
      submitLabel={isEdit ? 'Simpan perubahan' : 'Tambah produk'}
      cancelHref="/admin/produk"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Kategori PPOB" htmlFor="category_id" hint="Menentukan halaman mana produk ini muncul.">
          <Select
            id="category_id"
            name="category_id"
            defaultValue={product?.category_id ?? 'pulsa'}
            required
          >
            {CATEGORY_ORDER.map((id) => (
              <option key={id} value={id}>
                {categoryMeta(id).name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Grup / subjudul" htmlFor="group_name" hint="Mis. 'Kuota Bulanan', 'Token Prabayar'.">
          <TextInput
            id="group_name"
            name="group_name"
            defaultValue={product?.group_name ?? ''}
            placeholder="Nominal Pulsa"
            required
          />
        </Field>
      </div>

      <Field
        label="Nama nominal"
        htmlFor="label"
        hint="Wajib unik dalam satu kategori + grup. Kalau diisi untuk Flash Sale, isi harus sama persis."
      >
        <TextInput id="label" name="label" defaultValue={product?.label ?? ''} placeholder="Pulsa 25.000" required />
      </Field>

      <Field label="Deskripsi singkat" htmlFor="description" optional>
        <TextArea
          id="description"
          name="description"
          defaultValue={product?.description ?? ''}
          placeholder="Masa aktif +30 hari"
          rows={3}
        />
      </Field>

      <div className="space-y-4">
        <Checkbox
          label="Harga mengikuti tagihan (bukan nominal tetap)"
          checked={isVariable}
          onChange={(event) => setIsVariable(event.target.checked)}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Harga"
            htmlFor="price"
            hint={isVariable ? 'Dinonaktifkan karena harga mengikuti tagihan.' : 'Dalam rupiah, tanpa titik/koma.'}
          >
            <TextInput
              id="price"
              name="price"
              type="number"
              min={0}
              step={1}
              disabled={isVariable}
              defaultValue={product?.price ?? 0}
              placeholder="26000"
            />
          </Field>

          <Field label="Harga promo" htmlFor="promo_price" optional hint="Kosongkan kalau tidak ada harga promo.">
            <TextInput
              id="promo_price"
              name="promo_price"
              type="number"
              min={0}
              step={1}
              defaultValue={product?.promo_price ?? ''}
              placeholder="23500"
            />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Urutan tampil" htmlFor="sort_order" hint="Angka kecil tampil lebih dulu.">
          <TextInput id="sort_order" name="sort_order" type="number" defaultValue={product?.sort_order ?? 0} />
        </Field>

        <Field label="Status" htmlFor="status" hint="Produk berstatus arsip tidak muncul di situs.">
          <Select id="status" name="status" defaultValue={product?.status ?? 'active'}>
            <option value="active">Aktif</option>
            <option value="draft">Draf</option>
            <option value="archived">Arsip</option>
          </Select>
        </Field>
      </div>

    </AdminForm>
  );
}
