import type { Metadata } from 'next';
import PaymentSettingsForm from './PaymentSettingsForm';
import { Alert, PageHeader } from '@/components/admin/ui';
import { getPaymentSettings } from '@/lib/queries';
import { DEFAULT_PAYMENT_SETTINGS, type PaymentSettings } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Metode Pembayaran — Panel Admin Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function PaymentSettingsPage() {
  let settings: PaymentSettings = DEFAULT_PAYMENT_SETTINGS;
  let loadError: string | null = null;

  try {
    settings = await getPaymentSettings();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Gagal memuat metode pembayaran.';
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Metode Pembayaran"
        description="Atur QRIS, transfer bank, virtual account, dan pembayaran tunai yang tampil di halaman pembayaran pelanggan."
      />

      {loadError && (
        <div className="mb-5">
          <Alert tone="danger">
            {loadError} — nilai default akan dipakai, dan penyimpanan akan gagal sampai koneksi pulih.
          </Alert>
        </div>
      )}

      <PaymentSettingsForm settings={settings} />
    </div>
  );
}
