'use client';

import AdminForm from '@/components/admin/AdminForm';
import ImageUpload from '@/components/admin/ImageUpload';
import { Alert, Field, Select, TextInput } from '@/components/admin/ui';
import { saveFlashSaleAction } from '@/app/admin/(panel)/actions';
import { CATEGORY_ORDER, categoryMeta } from '@/lib/categories';
import type { FlashSaleRow } from '@/lib/types';

const SESSION_PRESETS = [
  { id: 'flash-11', start: '11:00', end: '13:00' },
  { id: 'flash-13', start: '13:00', end: '15:00' },
  { id: 'flash-15', start: '15:00', end: '17:00' }
];

export default function FlashSaleForm({
  row,
  targetLabels
}: {
  row?: FlashSaleRow;
  targetLabels: Record<string, string[]>;
}) {
  const isEdit = Boolean(row);
  const categoryId = row?.category_id ?? 'pulsa';

  return (
    <AdminForm
      action={saveFlashSaleAction}
      id={row?.id}
      submitLabel={isEdit ? 'Simpan perubahan' : 'Tambah entri'}
      cancelHref="/admin/flash-sale"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nama produk promo" htmlFor="name" hint="Tampil judul di kartu Flash Sale.">
          <TextInput id="name" name="name" defaultValue={row?.name ?? ''} placeholder="Pulsa 25.000" required />
        </Field>

        <Field label="Provider / subjudul" htmlFor="provider" optional>
          <TextInput
            id="provider"
            name="provider"
            defaultValue={row?.provider ?? ''}
            placeholder="Semua Operator"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Kategori PPOB" htmlFor="category_id">
          <Select id="category_id" name="category_id" defaultValue={categoryId} required>
            {CATEGORY_ORDER.map((id) => (
              <option key={id} value={id}>
                {categoryMeta(id).name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Target nominal"
          htmlFor="target_label"
          hint="Dipilih otomatis saat user menekan Beli Sekarang."
        >
          <TextInput
            id="target_label"
            name="target_label"
            list="target-label-options"
            defaultValue={row?.target_label ?? ''}
            placeholder="Pulsa 25.000"
          />
          <datalist id="target-label-options">
            {(targetLabels[categoryId] ?? []).map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="Harga normal" htmlFor="normal_price" hint="Rupiah, tanpa titik.">
          <TextInput
            id="normal_price"
            name="normal_price"
            type="number"
            min={0}
            defaultValue={row?.normal_price ?? 0}
            required
          />
        </Field>

        <Field label="Harga promo" htmlFor="promo_price" hint="Wajib lebih rendah dari harga normal.">
          <TextInput
            id="promo_price"
            name="promo_price"
            type="number"
            min={0}
            defaultValue={row?.promo_price ?? 0}
            required
          />
        </Field>

        <Field label="Diskon (%)" htmlFor="discount_percent" optional hint="Kosongkan untuk hitung otomatis.">
          <TextInput
            id="discount_percent"
            name="discount_percent"
            type="number"
            min={0}
            max={100}
            defaultValue={row?.discount_percent ?? ''}
            placeholder="10"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="Kuota promo" htmlFor="quota" hint="Jumlah slot yang boleh terpakai.">
          <TextInput id="quota" name="quota" type="number" min={0} defaultValue={row?.quota ?? 100} />
        </Field>

        <Field label="Sudah terjual" htmlFor="sold" optional>
          <TextInput id="sold" name="sold" type="number" min={0} defaultValue={row?.sold ?? 0} />
        </Field>

        <Field label="Urutan tampil" htmlFor="sort_order">
          <TextInput id="sort_order" name="sort_order" type="number" defaultValue={row?.sort_order ?? 0} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Field label="Sesi" htmlFor="session_id">
            <Select id="session_id" name="session_id" defaultValue={row?.session_id ?? 'flash-11'}>
              {SESSION_PRESETS.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.start} – {session.end}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Mulai" htmlFor="session_start">
          <TextInput id="session_start" name="session_start" type="time" defaultValue={row?.session_start ?? '11:00'} />
        </Field>

        <Field label="Selesai" htmlFor="session_end">
          <TextInput id="session_end" name="session_end" type="time" defaultValue={row?.session_end ?? '13:00'} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={row?.status ?? 'active'}>
            <option value="active">Aktif</option>
            <option value="draft">Draf</option>
            <option value="archived">Arsip</option>
          </Select>
        </Field>
      </div>

      <Alert>
        Tips: pastikan <strong>Target nominal</strong> sama persis dengan nama di katalog Produk — kalau beda
        satu huruf, otomatisasi pilihan nominal akan gagal dan modal langsung terbuka tanpa preselect.
      </Alert>

      <ImageUpload
        urlField="image_url"
        publicIdField="image_public_id"
        initialUrl={row?.image_url}
        initialPublicId={row?.image_public_id}
        folder="flash-sale"
        label="Gambar produk promo"
        ratio="square"
        previewWidth={400}
        hint="Opsional. Gambar akan dikompres otomatis oleh Cloudinary sebelum ditampilkan."
      />
    </AdminForm>
  );
}
