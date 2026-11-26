-- Bucket publik untuk gambar admin (QRIS).
-- Tulis/hapus hanya lewat server (service role), jadi tidak ada policy untuk anon/authenticated.
-- Aplikasi juga membuat bucket ini otomatis saat upload pertama bila belum ada.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
