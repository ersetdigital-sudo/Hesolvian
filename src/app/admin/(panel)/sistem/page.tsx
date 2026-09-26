import type { Metadata } from 'next';
import SettingsForm from './SettingsForm';
import { Alert, PageHeader } from '@/components/admin/ui';
import { getSiteSettings } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Pengaturan Sistem — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function SystemSettingsPage() {
  let settings;
  let loadError: string | null = null;

  try {
    settings = await getSiteSettings();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Gagal memuat pengaturan.';
    settings = undefined;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Pengaturan Sistem"
        description="Nama situs dan kontak layanan. Logo, favicon, tagline, serta metadata SEO diatur di kode supaya tata letak situs tetap stabil."
      />

      {loadError && (
        <div className="mb-5">
          <Alert tone="danger">
            {loadError} — nilai default akan dipakai, dan penyimpanan akan gagal sampai koneksi pulih.
          </Alert>
        </div>
      )}

      <SettingsForm settings={settings} />
    </div>
  );
}
