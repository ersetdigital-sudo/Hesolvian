-- ============================================================
-- 0003_help_center.sql
-- Tabel FAQ untuk modul "Pusat Bantuan".
-- Konten FAQ ini yang tampil di halaman publik /bantuan
-- (accordion "Pertanyaan yang Sering Diajukan").
-- ============================================================

create table if not exists public.faqs (
  id           uuid        primary key default gen_random_uuid(),
  category     text        not null default 'umum',
  question     text        not null,
  answer       text        not null default '',
  is_published boolean     not null default true,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index if not exists faqs_question_key on public.faqs (question);
create index if not exists faqs_category_order_idx on public.faqs (category, sort_order);

drop trigger if exists faqs_touch on public.faqs;
create trigger faqs_touch before update on public.faqs
  for each row execute function public.touch_updated_at();

-- Konsisten dengan tabel admin lainnya: RLS aktif tanpa policy, sehingga
-- anon/authenticated tidak punya akses sama sekali. Hanya service_role
-- (dipakai server Next.js) yang bisa membaca & menulis.
alter table public.faqs enable row level security;
