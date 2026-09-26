-- ============================================================
-- 0002_sales_series.sql
-- RPC seri penjualan untuk grafik "Tren Penjualan".
-- Dipakai oleh tab Mingguan / Bulanan / Tahunan di halaman Dasbor.
-- ============================================================

create or replace function public.admin_sales_series(
  p_unit   text default 'month',   -- 'week' | 'month' | 'year'
  p_points integer default 12
)
returns jsonb
language sql
stable
as $$
with cfg as (
  select
    case
      when p_unit in ('week', 'weekly', 'minggu', 'mingguan') then 'week'
      when p_unit in ('year', 'yearly', 'tahun', 'tahunan')  then 'year'
      else 'month'
    end as unit,
    greatest(least(coalesce(p_points, 12), 60), 2) as points
),
anchored as (
  select date_trunc(c.unit, now()) as anchor_start, c.unit, c.points
  from cfg c
),
buckets as (
  select generate_series(
           a.anchor_start - ((a.points - 1) * ('1 ' || a.unit)::interval),
           a.anchor_start,
           ('1 ' || a.unit)::interval
         ) as bucket
  from anchored a
),
first_seen as (
  select customer_id, min(created_at) as first_at
  from public.transactions
  where customer_id <> ''
  group by customer_id
),
series as (
  select
    b.bucket,
    count(t.id) as orders,
    coalesce(sum(t.total) filter (where t.status = 'success'), 0) as revenue,
    count(t.id) filter (
      where fs.first_at >= b.bucket
        and fs.first_at < b.bucket + ('1 ' || (select unit from cfg))::interval
    ) as new_users,
    count(t.id) filter (
      where fs.first_at is not null
        and not (
          fs.first_at >= b.bucket
          and fs.first_at < b.bucket + ('1 ' || (select unit from cfg))::interval
        )
    ) as existing_users
  from buckets b
  left join public.transactions t
    on date_trunc((select unit from cfg), t.created_at) = b.bucket
  left join first_seen fs on fs.customer_id = t.customer_id
  group by b.bucket
)
select coalesce(jsonb_agg(to_jsonb(s) order by s.bucket), '[]'::jsonb)
from series s;
$$;

revoke all on function public.admin_sales_series(text, integer) from public, anon, authenticated;
