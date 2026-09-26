-- ============================================================
-- 0004_split_emoney.sql
-- Uang elektronik dipecah dari satu kategori gabungan (`emoney`) menjadi
-- kategori per penyedia: gopay, ovo, dana, shopeepay, linkaja, etoll.
--
-- Kategori lama tidak bisa dipetakan otomatis ke penyedia yang benar karena
-- satu label ("Top Up 50.000") dipakai beberapa dompet sekaligus, jadi baris
-- katalog lamanya dihapus dan dibangun ulang oleh `supabase/seed.sql`.
--
-- Ledger uji coba juga dikosongkan agar seluruh transaksi memakai kategori
-- baru; seed akan mengisinya kembali dengan data yang setara.
-- ============================================================

-- 1. Katalog uang elektronik versi gabungan.
delete from public.products where category_id = 'emoney';

-- 2. Entri Flash Sale memakai id kategori yang sudah tidak ada.
delete from public.flash_sales;

-- 3. Ledger uji coba dibangun ulang supaya kategori produknya konsisten.
delete from public.transactions;

-- 4. Rapikan pengaturan situs: hanya `name` yang masih dipakai.
update public.site_settings
   set value = jsonb_build_object('name', coalesce(value->>'name', 'Hesolvian'))
 where key = 'brand';

-- Metadata SEO, logo, favicon, dan tagline kini konstanta di src/lib/site.ts.
delete from public.site_settings where key = 'seo';
