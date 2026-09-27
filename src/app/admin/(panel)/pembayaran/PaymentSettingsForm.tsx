'use client';

import AdminForm from '@/components/admin/AdminForm';
import ImageUpload from '@/components/admin/ImageUpload';
import { Alert, Checkbox, Field, SectionHeading, TextArea, TextInput } from '@/components/admin/ui';
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
  const { qris, transfer, va, tunai } = settings;

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
          subtitle="Gambar QRIS disimpan di Cloudinary dan ditampilkan di kartu pembayaran pelanggan."
        />

        <div className="mb-5">
          <Checkbox
            name="qris_enabled"
            label="Tampilkan QRIS sebagai metode pembayaran"
            defaultChecked={qris.enabled}
          />
        </div>

        {/* Kolom kiri dibatasi supaya pratinjau QR tidak membengkak sebesar form. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
          <div className="md:col-span-1">
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

          <div className="grid grid-cols-1 gap-5 md:col-span-2">
            <Field label="Nama merchant" htmlFor="qris_merchant_name">
              <TextInput
                id="qris_merchant_name"
                name="qris_merchant_name"
                defaultValue={qris.merchantName}
                placeholder="Hesolvian Payment / PT Hesolvian Nusantara"
              />
            </Field>

            <Field
              label="NMID"
              htmlFor="qris_nmid"
              hint="Nomor identitas merchant QRIS, mis. ID1020039281920."
            >
              <TextInput
                id="qris_nmid"
                name="qris_nmid"
                defaultValue={qris.nmid}
                placeholder="ID1020039281920"
              />
            </Field>
          </div>
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

      {/* ---------- Virtual Account ---------- */}
      <section className="rounded-xl border border-[#f0efed] p-5">
        <SectionHeading
          title="Virtual Account"
          subtitle="Instruksi singkat yang tampil setelah pelanggan memilih Virtual Account."
        />

        <div className="mb-5">
          <Checkbox name="va_enabled" label="Aktifkan Virtual Account" defaultChecked={va.enabled} />
        </div>

        <Field label="Catatan / instruksi" htmlFor="va_note" optional>
          <TextArea
            id="va_note"
            name="va_note"
            defaultValue={va.note}
            placeholder="Nomor Virtual Account dibuat otomatis saat pesanan dikonfirmasi."
          />
        </Field>
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
        tidak pernah masuk ke browser. Nama merchant &amp; NMID di atas menggantikan nilai contoh yang
        dipakai kartu pembayaran publik.
      </Alert>
    </AdminForm>
  );
}
