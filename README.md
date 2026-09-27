# Hesolvian PPOB Ledger - Lacak Transaksi

Platform loket pembayaran multiaset dan PPOB terpadu dengan pelacakan status transaksi real-time.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Supabase** (PostgreSQL) — katalog, Flash Sale, artikel, FAQ, ledger transaksi
- **Cloudinary** — upload gambar bertanda tangan (SIGNED)

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Salin `.env.example` menjadi `.env.local` lalu isi nilainya.
3. Jalankan migrasi database:
   `supabase/migrations/*.sql` lalu `supabase/seed.sql`
4. Run the dev server:
   `npm run dev`
5. Open http://localhost:3000

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Typecheck with `tsc --noEmit` |
| `node scripts/generate-seed.cjs` | Regenerate `supabase/seed.sql` dari data di `src/data/` |

## Panel Admin

Akses di **`/admin`** (login: `/admin/login`), memakai password `ADMIN_PASSWORD` dari `.env.local`.

Struktur route mengikuti wireframe `dashboard-sidebar-overview` (sidebar 256px,
4 grup menu, topbar lengket dengan breadcrumb + pencarian + notifikasi + arsip):

```
src/app/admin/
  login/                 Halaman masuk (server action + cookie httpOnly)
  (panel)/
    layout.tsx           Guard sesi + shell (sidebar & topbar)
    page.tsx             Dasbor: 4 kartu statistik, Tren Penjualan,
                         Rincian Pendapatan, Transaksi Terbaru
    produk/              CRUD katalog PPOB (+ gambar)
    flash-sale/          CRUD entri Flash Sale (+ gambar)
    artikel/             CRUD artikel (+ gambar sampul)
    pusat-bantuan/       CRUD FAQ yang tampil di halaman publik /bantuan
    transaksi/           Ledger, filter, entri manual, ekspor CSV
    pembayaran/          Metode Pembayaran: QRIS (gambar diunggah ke Cloudinary),
                         transfer bank, Virtual Account, tunai + toggle aktif
    sistem/              Pengaturan nama situs + kontak
    [section]/           Halaman penampung untuk menu yang belum dibangun
src/app/api/
  cloudinary/sign        Buat tanda tangan upload (rahasia tetap di server)
  cloudinary/delete      Hapus aset lama saat gambar diganti
  admin/logout           Akhiri sesi
  admin/export/transactions  Unduh ledger sebagai CSV
src/components/admin/    Shell, ImageUpload, tabel, form bersama
```

### Keamanan

- RLS aktif di **semua** tabel tanpa policy → `anon` key tidak bisa membaca apa pun.
- Hanya server yang memakai `SUPABASE_SERVICE_ROLE_KEY`; key ini tidak pernah masuk bundle browser.
- Sesi admin: cookie `httpOnly` + `sameSite=lax`, token bertanda HMAC-SHA256, berlaku 8 jam.
- `/api/cloudinary/*` dan semua server action memanggil `requireAdmin()`.

### Upload gambar (Cloudinary, signed)

1. Frontend minta tanda tangan ke `POST /api/cloudinary/sign`.
2. File dikirim **langsung** ke `https://api.cloudinary.com/v1_1/{cloud}/image/upload`.
3. Server menyimpan `secure_url` + `public_id` ke kolom `image_url` / `image_public_id`.
4. Ganti gambar → aset lama dihapus lewat `POST /api/cloudinary/delete`.

Validasi: maks **2 MB**, format **JPG/PNG/WEBP**.

Tampilan selalu pakai URL transformasi `f_auto,q_auto,w_800,c_fill` + `loading="lazy"`,
dan upload preset sudah diset transformasi default `f_auto,q_auto,w_800,c_fill`
supaya kuota Cloudinary hemat.

### Identitas & SEO (diatur di kode)

Logo, favicon, tagline, dan metadata SEO **sengaja tidak bisa diubah dari panel
admin**: nilai-nilai itu menentukan tata letak dan hasil pencarian, jadi
rawannya berubah tanpa ikut ter-review. Semuanya konstanta di `src/lib/site.ts`,
lalu dipakai oleh:

- `src/app/layout.tsx` — title, description, keywords, robots, Open Graph, Twitter.
- `src/app/opengraph-image.tsx` + `twitter-image.tsx` — kartu berbagi 1200×630
yang digenerate otomatis (tanpa file gambar manual).
- `src/app/icon.svg` — favicon.
- `src/app/robots.ts` / `src/app/sitemap.ts` — `robots.txt` & `sitemap.xml`,
`/admin` dan `/api` tidak diindeks.

Isi **`NEXT_PUBLIC_SITE_URL`** di produksi supaya URL kanonik & gambar Open Graph
absolut (lokal default-nya `http://localhost:3000`).

### Metode pembayaran

Diatur di **`/admin/pembayaran`**, tersimpan sebagai satu key `payments` di
`site_settings` (jsonb). Gambar QRIS diunggah lewat Cloudinary bertanda tangan
(`/api/cloudinary/sign`), lalu URL-nya dipakai `QrisPaymentCard` dan langkah
pembayaran di `TransactionModal`. Kalau belum ada gambar, kartu memakai kode QR
contoh. Kalau QRIS dimatikan dari panel, kartu pembayaran menampilkan
pemberitahuan bahwa metode itu sedang tidak tersedia.

### Data publik

`src/app/page.tsx` mengambil katalog, Flash Sale, dan FAQ dari Supabase lalu
meneruskannya ke `App` sebagai prop. Kalau query gagal, `resolvePublicData(null)`
di `src/lib/publicCatalog.ts` memakai data statis dari `src/data/` sebagai cadangan.

FAQ yang diatur di **/admin/pusat-bantuan** langsung muncul di accordion
"Pertanyaan yang Sering Diajukan" pada halaman publik `/bantuan`. Kategori FAQ
menentukan pill filter-nya (`FAQ_CATEGORIES` di `src/data/faqData.ts`).

Kategori PPOB bersumber dari `src/data/categoriesData.ts`. Uang elektronik adalah
satu kategori gabungan **`emoney` (E-Wallet)**, tapi tiap dompet (GoPay, OVO,
DANA, ShopeePay, LinkAja, e-Toll) jadi grup/tab terpisah di dalam modal, jadi
nominal "Top Up 50.000" tetap jelas milik dompet mana. `src/lib/categories.ts`
menyimpan metadata nama/ikon/warna sekaligus urutan tampilannya di panel admin
(`CATEGORY_ORDER`).

## Project Structure

```
src/
  app/          Next.js App Router (halaman publik + /admin + /api)
  components/   UI components (client), admin/ untuk panel
  data/         Kategori PPOB, Flash Sale, & FAQ statis (fallback + sumber seed)
  lib/          Env, Supabase, Cloudinary, auth, query, adapter data, identitas situs
  types/        Shared TypeScript types
  utils/        Receipt downloader & timeline helpers
  App.tsx       Client shell wiring all state and modals together
supabase/       migrations/ (skema) dan seed.sql
scripts/        generate-seed.cjs, verify-admin.mjs, verify-public.mjs
```
