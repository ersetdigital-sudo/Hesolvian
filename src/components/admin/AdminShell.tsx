'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV, findNavItem } from '@/lib/adminNav';

/**
 * Kerangka panel admin, mengikuti wireframe needmcp `dashboard-sidebar-overview`:
 *   - sidebar tetap 256px (w-64) berwarna putih dipisah garis tipis
 *   - blok brand: kotak logo hitam membulat + label kecil abu + nama tebal
 *   - empat grup navigasi + footer pengguna yang menempel di bawah
 *   - topbar lengket: breadcrumb di kiri, pencarian + notifikasi + arsip + avatar di kanan
 */

interface AdminShellProps {
  brandName: string;
  brandTagline: string;
  userName: string;
  userRole: string;
  children: ReactNode;
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const item = findNavItem(pathname);
  if (!item) return <span className="text-[13.5px] font-bold text-[#1d1c18]">Admin</span>;

  // Halaman anak (baru/edit) tetap memakai breadcrumb induknya.
  const isChild = pathname !== item.href;
  const leaf = isChild ? (pathname.endsWith('/baru') ? 'Tambah Baru' : 'Detail') : item.crumb;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13.5px]">
      <span className="font-semibold text-[#78716c]">{item.label}</span>
      <span className="text-[#d6d3d1]">/</span>
      <span className="font-bold text-[#1d1c18]">{leaf}</span>
    </nav>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {ADMIN_NAV.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#a8a29e]">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition ${
                      isActive
                        ? 'bg-[#1d1c18] font-semibold text-white'
                        : 'font-medium text-[#57534e] hover:bg-[#f5f5f4] hover:text-[#1d1c18]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[19px] ${isActive ? 'text-white' : 'text-[#a8a29e] group-hover:text-[#78716c]'}`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {!item.ready && (
                      <span
                        className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#f5f5f4] text-[#a8a29e]'
                        }`}
                        title="Halaman penampung"
                      >
                        Soon
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function BrandBlock({
  brandName,
  brandTagline
}: {
  brandName: string;
  brandTagline: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      {/* Logo sengaja statis: kotak gelap berisi inisial nama situs. */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1d1c18]">
        <span className="text-[17px] font-bold leading-none text-white">{brandName.charAt(0).toUpperCase()}</span>
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#a8a29e]">{brandTagline}</p>
        <p className="truncate text-[15px] font-bold leading-tight tracking-[-0.01em] text-[#1d1c18]">{brandName}</p>
      </div>
    </div>
  );
}

function UserFooter({ userName, userRole }: { userName: string; userRole: string }) {
  return (
    <div className="border-t border-[#f0efed] px-4 py-4">
      <div className="flex items-center gap-3 rounded-xl px-1 py-1">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fde8e2] text-[12px] font-bold text-[#9e3823]">
          {userName
            .split(' ')
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join('')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight text-[#1d1c18]">{userName}</p>
          <p className="truncate text-[11.5px] leading-tight text-[#a8a29e]">{userRole}</p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            title="Keluar"
            aria-label="Keluar dari panel admin"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a8a29e] transition hover:bg-[#f5f5f4] hover:text-[#1d1c18]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminShell({
  brandName,
  brandTagline,
  userName,
  userRole,
  children
}: AdminShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Tutup drawer setiap kali pindah halaman.
  useEffect(() => {
    setDrawerOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // Kunci scroll body saat drawer terbuka.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Tutup drawer dengan Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1d1c18]">
      {/* ---------- Sidebar desktop: tetap 256px ---------- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#f0efed] bg-white lg:flex">
        <BrandBlock brandName={brandName} brandTagline={brandTagline} />
        <NavList pathname={pathname} />
        <UserFooter userName={userName} userRole={userRole} />
      </aside>

      {/* ---------- Drawer mobile ---------- */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          tabIndex={drawerOpen ? 0 : -1}
          aria-label="Tutup menu"
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-[#1d1c18]/40 transition-opacity duration-200 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-64 flex-col border-r border-[#f0efed] bg-white transition-transform duration-200 ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between pr-3">
            <BrandBlock brandName={brandName} brandTagline={brandTagline} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Tutup menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#78716c] hover:bg-[#f5f5f4]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <NavList pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          <UserFooter userName={userName} userRole={userRole} />
        </div>
      </div>

      {/* ---------- Area kerja ---------- */}
      <div className="lg:pl-64">
        {/* Topbar lengket */}
        <header className="sticky top-0 z-20 border-b border-[#f0efed] bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#57534e] transition hover:bg-[#f5f5f4] lg:hidden"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            <Breadcrumb pathname={pathname} />

            <div className="ml-auto flex items-center gap-2">
              {/* Pencarian: 256px, abu-abu, ikon kaca pembesar */}
              <form action="/admin/transaksi" method="get" className="relative hidden md:block">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#a8a29e]">
                  search
                </span>
                <input
                  type="search"
                  name="q"
                  placeholder="Cari transaksi…"
                  aria-label="Cari transaksi"
                  className="h-10 w-64 rounded-lg border border-transparent bg-[#f5f5f4] pl-10 pr-3 text-[13px] text-[#1d1c18] outline-none transition placeholder:text-[#a8a29e] focus:border-[#E2694A] focus:bg-white focus:ring-2 focus:ring-[#E2694A]/20"
                />
              </form>

              {/* Notifikasi */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((open) => !open)}
                  aria-label="Notifikasi"
                  aria-expanded={notifOpen}
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#57534e] transition hover:bg-[#f5f5f4]"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#E2694A]" />
                </button>
                {notifOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Tutup notifikasi"
                      onClick={() => setNotifOpen(false)}
                      className="fixed inset-0 z-10 cursor-default"
                    />
                    <div className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-[#e7e5e4] bg-white p-4 shadow-lg">
                      <p className="text-[12.5px] font-bold text-[#1d1c18]">Notifikasi</p>
                      <p className="mt-2 text-[12px] leading-relaxed text-[#78716c]">
                        Belum ada notifikasi baru. Pemberitahuan transaksi berstatus menunggu akan muncul di sini.
                      </p>
                      <a
                        href="/admin/transaksi?status=pending"
                        className="mt-3 inline-flex text-[12px] font-semibold text-[#9e3823] hover:underline"
                      >
                        Lihat transaksi menunggu →
                      </a>
                    </div>
                  </>
                )}
              </div>

              <a
                href="/admin/transaksi"
                title="Arsip transaksi"
                aria-label="Arsip transaksi"
                className="hidden h-10 w-10 items-center justify-center rounded-lg text-[#57534e] transition hover:bg-[#f5f5f4] sm:flex"
              >
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </a>

              <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#1d1c18] text-[11.5px] font-bold text-white">
                {userName
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join('')}
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
