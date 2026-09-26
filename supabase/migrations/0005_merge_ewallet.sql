-- ============================================================
-- 0005_merge_ewallet.sql
-- Uang elektronik disatukan kembali: gopay, ovo, dana, shopeepay,
-- linkaja, etoll digabung jadi satu kategori `emoney` (E-Wallet)
-- seperti tampilan lama — tiap dompet jadi grup/tab di dalam modal,
-- jadi label "Top Up 50.000" tetap merujuk ke dompet yang benar.
--
-- Katalog diganti dengan baris `emoney` hasil regenerate
-- `scripts/generate-seed.cjs`; Flash Sale & ledger cukup dipindahkan
-- kategori karena label nominalnya tidak berubah.
-- ============================================================

-- 1. Hapus katalog per penyedia (digantikan katalog `emoney`).
delete from public.products
 where category_id in ('gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'etoll');

-- 2. Entri Flash Sale pindah ke kategori gabungan.
update public.flash_sales
   set category_id = 'emoney'
 where category_id in ('gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'etoll');

-- 3. Ledger lama juga ikut pindah supaya laporan & dashboard konsisten.
update public.transactions
   set category_id = 'emoney'
 where category_id in ('gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'etoll');
