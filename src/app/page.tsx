import App from '../App';
import { getPublicData } from '@/lib/queries';
import type { PublicData } from '@/lib/publicTypes';

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

  try {
    publicData = await getPublicData();
  } catch (error) {
    console.error('[public] Gagal memuat katalog Supabase, memakai data statis:', error);
    publicData = null;
  }

  return <App publicData={publicData} />;
}
