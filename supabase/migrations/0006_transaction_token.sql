-- ============================================================
-- 0006_transaction_token.sql
-- Simpan token / SN / nomor referensi pesanan secara permanen.
--
-- Sebelumnya token hanya dihasilkan dan disimpan di memori browser,
-- jadi setelah refresh halaman Cek Transaksi kehilangan kotak token
-- padahal statusnya sudah 'success'.
-- ============================================================

alter table public.transactions
  add column if not exists token_code  text not null default '',
  add column if not exists token_label text not null default '',
  add column if not exists token_sub   text not null default '';
