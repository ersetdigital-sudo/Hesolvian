-- ============================================================
-- 0001_admin_schema.sql
-- Skema panel admin Hesolvian PPOB Ledger
-- Project: Hesolvian (khwmdxprniextbuzmpxp)
-- ============================================================
--
-- Catatan keamanan:
--   Semua tabel di-enable RLS TANPA policy apa pun. Artinya anon key
--   & authenticated tidak bisa membaca/menulis sama sekali.
--   Hanya service_role (dipakai server-side oleh /admin) yang bisa.
-- ============================================================

-- ------------------------------------------------------------
-- Trigger helper: jaga kolom updated_at tetap akurat
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- products : katalog PPOB (sumber data kategori & nominal)
-- category_id harus cocok dengan id di src/data/categoriesData.ts
-- ------------------------------------------------------------
create table if not exists public.products (
  id              uuid        primary key default gen_random_uuid(),
  category_id     text        not null,
  group_name      text        not null default 'Umum',
  label           text        not null,
  description     text        not null default '',
  price           integer     not null default 0,
  promo_price     integer,
  is_variable     boolean     not null default false,
  image_url       text,
  image_public_id text,
  status          text        not null default 'active'
                              check (status in ('active', 'draft', 'archived')),
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Label nominal bisa berulang dalam satu kategori asalkan beda grup
-- (contoh: 'Top Up 50.000' ada di grup GoPay/OVO/DANA dan ShopeePay/LinkAja).
create unique index if not exists products_category_group_label_key
  on public.products (category_id, group_name, label);
create index if not exists products_category_sort_idx
  on public.products (category_id, sort_order);

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- flash_sales : entri Flash Sale (menggantikan src/data/flashSaleData.ts)
-- ------------------------------------------------------------
create table if not exists public.flash_sales (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  provider         text        not null default '',
  category_id      text        not null,
  target_label     text,
  normal_price     integer     not null default 0,
  promo_price      integer     not null default 0,
  discount_percent integer,
  quota            integer     not null default 0,
  sold             integer     not null default 0,
  session_id       text        not null default 'flash-11',
  session_start    text        not null default '11:00',
  session_end      text        not null default '13:00',
  image_url        text,
  image_public_id  text,
  status           text        not null default 'active'
                               check (status in ('active', 'draft', 'archived')),
  sort_order       integer     not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index if not exists flash_sales_session_name_provider_key
  on public.flash_sales (session_id, name, provider);
create index if not exists flash_sales_session_idx
  on public.flash_sales (session_id, sort_order);

drop trigger if exists flash_sales_touch on public.flash_sales;
create trigger flash_sales_touch before update on public.flash_sales
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- articles : konten / artikel / panduan
-- ------------------------------------------------------------
create table if not exists public.articles (
  id                     uuid        primary key default gen_random_uuid(),
  title                  text        not null,
  slug                   text        not null,
  excerpt                text        not null default '',
  content                text        not null default '',
  cover_image_url        text,
  cover_image_public_id  text,
  author                 text        not null default 'Admin',
  status                 text        not null default 'draft'
                                     check (status in ('draft', 'published', 'archived')),
  published_at           timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create unique index if not exists articles_slug_key on public.articles (slug);
create index if not exists articles_status_idx on public.articles (status, published_at desc);

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- promos : banner / promo / flash banner di beranda
-- ------------------------------------------------------------
create table if not exists public.promos (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  subtitle        text        not null default '',
  image_url       text,
  image_public_id text,
  cta_label       text,
  cta_url         text,
  starts_at       date,
  ends_at         date,
  is_active       boolean     not null default true,
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists promos_touch on public.promos;
create trigger promos_touch before update on public.promos
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- transactions : ledger transaksi PPOB
-- ------------------------------------------------------------
create table if not exists public.transactions (
  id            text        primary key,
  customer_name text        not null default '',
  customer_id   text        not null default '',
  category_id   text        not null default '',
  product_label text        not null default '',
  status        text        not null default 'success'
                            check (status in ('success', 'pending', 'processing', 'failed')),
  qty           integer     not null default 1,
  unit_price    integer     not null default 0,
  admin_fee     integer     not null default 0,
  discount      integer     not null default 0,
  total         integer     not null default 0,
  method        text        not null default 'QRIS',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists transactions_created_idx
  on public.transactions (created_at desc);
create index if not exists transactions_customer_idx
  on public.transactions (customer_id);
create index if not exists transactions_status_idx
  on public.transactions (status);

drop trigger if exists transactions_touch on public.transactions;
create trigger transactions_touch before update on public.transactions
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- site_settings : key-value bebas untuk pengaturan situs
-- contoh key: 'brand', 'contact', 'seo'
-- ------------------------------------------------------------
create table if not exists public.site_settings (
  key        text        primary key,
  value      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- Kunci akses: RLS aktif, tanpa policy = tertutup untuk publik
-- ------------------------------------------------------------
alter table public.products      enable row level security;
alter table public.flash_sales   enable row level security;
alter table public.articles      enable row level security;
alter table public.promos        enable row level security;
alter table public.transactions  enable row level security;
alter table public.site_settings enable row level security;

-- ------------------------------------------------------------
-- RPC: satu panggilan untuk semua angka di halaman Dasbor
-- ------------------------------------------------------------
create or replace function public.admin_dashboard(
  p_months integer default 12,
  p_from   timestamptz default null,
  p_to     timestamptz default null
)
returns jsonb
language sql
stable
as $$
with bounds as (
  select
    coalesce(p_from, now() - (greatest(p_months, 1) || ' months')::interval) as from_ts,
    coalesce(p_to, now()) as to_ts
),
base as (
  select t.* from public.transactions t, bounds b
  where t.created_at >= b.from_ts and t.created_at <= b.to_ts
),
prev as (
  select
    coalesce(sum(t.total) filter (where t.status = 'success'), 0) as revenue,
    count(*) as orders,
    count(distinct t.customer_id) filter (where t.customer_id <> '') as customers,
    case when count(*) = 0 then 0
         else round((count(*) filter (where t.status = 'success'))::numeric * 100 / count(*), 2)
    end as conversion
  from public.transactions t, bounds b
  where t.created_at >= b.from_ts - (b.to_ts - b.from_ts)
    and t.created_at <  b.from_ts
),
totals as (
  select
    coalesce(sum(total) filter (where status = 'success'), 0) as revenue,
    count(*) as orders,
    count(distinct customer_id) filter (where customer_id <> '') as customers,
    case when count(*) = 0 then 0
         else round((count(*) filter (where status = 'success'))::numeric * 100 / count(*), 2)
    end as conversion
  from base
),
first_seen as (
  select customer_id, min(created_at) as first_at
  from public.transactions
  where customer_id <> ''
  group by customer_id
),
monthly as (
  select
    to_char(d.month, 'YYYY-MM') as month,
    count(t.id) as orders,
    coalesce(sum(t.total) filter (where t.status = 'success'), 0) as revenue,
    count(t.id) filter (
      where fs.first_at >= d.month and fs.first_at < d.month + interval '1 month'
    ) as new_users,
    count(t.id) filter (
      where fs.first_at is not null
        and not (fs.first_at >= d.month and fs.first_at < d.month + interval '1 month')
    ) as existing_users
  from generate_series(
         date_trunc('month', (select from_ts from bounds)),
         date_trunc('month', (select to_ts   from bounds)),
         interval '1 month'
       ) as d(month)
  left join public.transactions t on date_trunc('month', t.created_at) = d.month
  left join first_seen fs on fs.customer_id = t.customer_id
  group by d.month
),
breakdown as (
  select
    category_id,
    coalesce(sum(total) filter (where status = 'success'), 0) as revenue,
    count(*) as orders
  from base
  group by category_id
)
select jsonb_build_object(
  'totals',    (select to_jsonb(x) from totals x),
  'previous',  (select to_jsonb(x) from prev x),
  'monthly',   (select coalesce(jsonb_agg(to_jsonb(x) order by x.month), '[]'::jsonb) from monthly x),
  'breakdown', (select coalesce(jsonb_agg(to_jsonb(x) order by x.revenue desc), '[]'::jsonb) from breakdown x),
  'recent',    (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
                  select id, customer_name, customer_id, category_id, product_label,
                         status, qty, unit_price, total, created_at
                  from public.transactions
                  order by created_at desc
                  limit 6
                ) x)
);
$$;

revoke all on function public.admin_dashboard(integer, timestamptz, timestamptz) from public, anon, authenticated;
