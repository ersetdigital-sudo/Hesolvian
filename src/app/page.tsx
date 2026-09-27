import App from '../App';
import { getPaymentSettings, getPublicData } from '@/lib/queries';
import type { PublicData } from '@/lib/publicTypes';
import { DEFAULT_PAYMENT_SETTINGS, type PaymentSettings } from '@/lib/types';

/**
 * Data katalog & Flash Sale diambil di server (service_role) supaya:
 *   - tidak ada key Supabase yang pernah masuk ke bundle browser
 *   - beranda sudah menampilkan data terbaru pada paint pertama
 *
 * Kalau query gagal, `publicData` jadi null dan App kembali ke data statis.
 */
export const dynamic = 'force-dynamic';

export default async function Page() {
  let publicData: PublicData | null = null;
  let payments: PaymentSettings = DEFAULT_PAYMENT_SETTINGS;

  try {
    publicData = await getPublicData();
  } catch (error) {
    console.error('[public] Gagal memuat katalog Supabase, memakai data statis:', error);
    publicData = null;
  }

  // Metode pembayaran ditampilkan di kartu pembayaran; kalau gagal, pakai default.
  try {
    payments = await getPaymentSettings();
  } catch (error) {
    console.error('[public] Gagal memuat metode pembayaran, memakai nilai default:', error);
  }

  return <App publicData={publicData} payments={payments} />;
}
