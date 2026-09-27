'use client';

import AdminForm from '@/components/admin/AdminForm';
import ImageUpload from '@/components/admin/ImageUpload';
import { Alert, Checkbox, Field, SectionHeading, TextArea } from '@/components/admin/ui';
import BankAccountsEditor from './BankAccountsEditor';
import { savePaymentSettingsAction } from '@/app/admin/(panel)/actions';
import type { PaymentSettings } from '@/lib/types';

/**
 * Satu formulir untuk semua metode pembayaran.
 *
 * Gambar QRIS tidak dikirim lewat server kita: `ImageUpload` mengunggahnya
 * langsung ke Cloudinary (signed) lalu menaruh `secure_url` + `public_id` ke
 * hidden input yang ikut ter-submit bersama formulir ini.
 */
export default function PaymentSettingsForm({ settings }: { settings: PaymentSettings }) {
  const { qris, transfer, tunai } = settings;

  return (
    <AdminForm
      action={savePaymentSettingsAction}
      submitLabel="Simpan metode pembayaran"
      cancelHref="/admin"
    >
      {/* ---------- QRIS ---------- */}
      <section className="rounded-xl border border-[#f0efed] p-5">
        <SectionHeading
          title="QRIS"
          subtitle="Cukup unggah gambar QRIS-nya — disimpan di Cloudinary dan ditampilkan di kartu pembayaran pelanggan."
        />

        <div className="mb-5">
          <Checkbox
            name="qris_enabled"
            label="Tampilkan QRIS sebagai metode pembayaran"
            defaultChecked={qris.enabled}
          />
        </div>

        {/* Dibuat sempit supaya pratinjau QR tidak membengkak sebesar lebar form. */}
        <div className="max-w-[260px]">
          <ImageUpload
            urlField="qris_image_url"
            publicIdField="qris_image_public_id"
            initialUrl={qris.imageUrl}
            initialPublicId={qris.imagePublicId}
            folder="pembayaran"
            label="Gambar QRIS"
            hint="JPG/PNG/WEBP, maks 2 MB. Kalau kosong, kartu pembayaran memakai kode QR contoh."
            ratio="square"
            previewWidth={600}
          />
        </div>
      </section>

      {/* ---------- Transfer bank ---------- */}
      <section className="rounded-xl border border-[#f0efed] p-5">
        <SectionHeading
          title="Transfer bank"
          subtitle="Rekening tujuan yang dapat dipilih pelanggan saat membayar lewat transfer manual."
        />

        <div className="mb-5">
          <Checkbox
            name="transfer_enabled"
            label="Aktifkan transfer bank"
            defaultChecked={transfer.enabled}
          />
        </div>

        <BankAccountsEditor initialAccounts={transfer.accounts} />
      </section>

      {/* ---------- Tunai ---------- */}
      <section className="rounded-xl border border-[#f0efed] p-5">
        <SectionHeading
          title="Tunai / agen"
          subtitle="Pembayaran langsung di agen mitra Hesolvian."
        />

        <div className="mb-5">
          <Checkbox
            name="tunai_enabled"
            label="Aktifkan pembayaran tunai"
            defaultChecked={tunai.enabled}
          />
        </div>

        <Field label="Catatan / instruksi" htmlFor="tunai_note" optional>
          <TextArea
            id="tunai_note"
            name="tunai_note"
            defaultValue={tunai.note}
            placeholder="Bayar tunai di agen Hesolvian terdekat dengan menyebut ID transaksi."
          />
        </Field>
      </section>

      <Alert>
        Gambar QRIS diunggah langsung ke Cloudinary dengan tanda tangan sisi server, jadi API secret
        tidak pernah masuk ke browser.
      </Alert>
    </AdminForm>
  );
}
