import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { ADMIN_USER } from '@/lib/adminNav';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getSiteSettings } from '@/lib/queries';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

/** Semua halaman di grup ini butuh sesi admin, jadi tidak boleh di-prerender. */
export const dynamic = 'force-dynamic';

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');

  // Kalau tabel pengaturan belum siap, panel tetap bisa dibuka dengan nilai default.
  let brandName = SITE_NAME;
  try {
    const settings = await getSiteSettings();
    brandName = settings.brand.name || SITE_NAME;
  } catch {
    // diamkan: nilai default sudah dipakai
  }

  return (
    <AdminShell
      brandName={brandName}
      brandTagline={SITE_TAGLINE}
      userName={ADMIN_USER.name}
      userRole={ADMIN_USER.role}
    >
      {children}
    </AdminShell>
  );
}
