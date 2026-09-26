'use client';

import AdminForm from '@/components/admin/AdminForm';
import { Alert, Field, SectionHeading, TextInput } from '@/components/admin/ui';
import { saveSettingsAction } from '@/app/admin/(panel)/actions';
import { SITE_TAGLINE } from '@/lib/site';
import type { SiteSettings } from '@/lib/queries';

/**
 * Logo, favicon, tagline, dan metadata SEO sengaja tidak bisa diubah dari sini:
 * semuanya konstanta di `src/lib/site.ts` supaya tata letak situs & panel tetap
 * konsisten dan hasil pencarian tidak ikut rusak.
 */
export default function SettingsForm({ settings }: { settings?: SiteSettings }) {
  const brand = settings?.brand;
  const contact = settings?.contact;

  return (
    <AdminForm action={saveSettingsAction} submitLabel="Simpan pengaturan" cancelHref="/admin">
      {/* ---------- Identitas merek ---------- */}
      <section className="rounded-xl border border-[#f0efed] p-5">
        <SectionHeading
          title="Identitas merek"
          subtitle="Nama situs tampil di blok brand panel operator."
        />

        <Field label="Nama situs" htmlFor="name">
          <TextInput id="name" name="name" defaultValue={brand?.name ?? 'Hesolvian'} required />
        </Field>

        <div className="mt-4 rounded-lg border border-[#f0efed] bg-[#fafaf9] px-4 py-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#a8a29e]">
            Tagline (diatur di kode)
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[#1d1c18]">{SITE_TAGLINE}</p>
        </div>
      </section>

      {/* ---------- Kontak ---------- */}
      <section className="rounded-xl border border-[#f0efed] p-5">
        <SectionHeading title="Kontak" subtitle="Dipakai di footer dan halaman Bantuan." />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Email" htmlFor="email">
            <TextInput id="email" name="email" type="email" defaultValue={contact?.email ?? ''} placeholder="cs@hesolvian.id" />
          </Field>

          <Field label="Telepon" htmlFor="phone">
            <TextInput id="phone" name="phone" defaultValue={contact?.phone ?? ''} placeholder="0812-8829-4910" />
          </Field>

          <Field label="WhatsApp" htmlFor="whatsapp" hint="Format internasional tanpa +. Mis. 6281288294910.">
            <TextInput
              id="whatsapp"
              name="whatsapp"
              defaultValue={contact?.whatsapp ?? ''}
              placeholder="6281288294910"
            />
          </Field>

          <Field label="Alamat" htmlFor="address">
            <TextInput id="address" name="address" defaultValue={contact?.address ?? ''} />
          </Field>
        </div>
      </section>

      <Alert>
        Logo, favicon, tagline, dan metadata SEO diatur di kode (<code>src/lib/site.ts</code> &
        <code> src/app/layout.tsx</code>) supaya tata letak tidak mudah rusak.
      </Alert>
    </AdminForm>
  );
}
