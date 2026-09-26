import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Masuk Panel Admin — Hesolvian',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect('/admin');

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d1c18]">
            <span className="text-[20px] font-bold leading-none text-white">H</span>
          </span>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#a8a29e]">PPOB Ledger</p>
            <h1 className="text-[21px] font-bold leading-tight tracking-[-0.02em] text-[#1d1c18]">Panel Admin</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-[0_1px_2px_rgba(29,28,24,0.04)]">
          <LoginForm />
        </div>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-[#a8a29e]">
          Panel ini hanya untuk operator internal. Semua aksi tercatat di tabel transaksi &amp; pengaturan situs.
        </p>

        <p className="mt-4 text-center">
          <a href="/" className="text-[12px] font-semibold text-[#9e3823] hover:underline">
            ← Kembali ke situs
          </a>
        </p>
      </div>
    </main>
  );
}
