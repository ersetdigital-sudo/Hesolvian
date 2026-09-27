/* eslint-disable */
// Script sekali pakai: generate seed SQL dari data statis aplikasi.
/*
 * Cara pakai:
 *   node scripts/generate-seed.cjs
 * Hasil: supabase/seed.sql
 *
 * Script ini menyusun data awal (katalog PPOB, entri Flash Sale, transaksi
 * contoh 24 bulan, artikel, promo, pengaturan situs) dengan mengambil sumber
 * kebenaran dari src/data/categoriesData.ts dan src/data/flashSaleData.ts,
 * sehingga isi database dijamin sama dengan yang dipakai aplikasi.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const TMP = os.tmpdir();
const GEN = path.join(TMP, 'hesolvian-seedgen');

// Kompilasi sumber TypeScript ke JS agar bisa di-require dari script CJS ini.
fs.rmSync(GEN, { recursive: true, force: true });
fs.mkdirSync(GEN, { recursive: true });
execSync(
  `npx tsc src/data/categoriesData.ts src/data/flashSaleData.ts src/data/faqData.ts --outDir "${GEN}" --module commonjs --target es2020 --moduleResolution node --skipLibCheck`,
  { stdio: 'inherit' }
);

const { CATEGORIES_DATA } = require(path.join(GEN, 'categoriesData.js'));
const { FLASH_SALE_PRODUCTS, FLASH_SALE_SESSIONS } = require(path.join(GEN, 'flashSaleData.js'));
const { FAQS_DATA } = require(path.join(GEN, 'faqData.js'));

const q = (s) => (s === null || s === undefined ? 'null' : "'" + String(s).replace(/'/g, "''") + "'");
const n = (v) => (v === null || v === undefined || Number.isNaN(v) ? 'null' : String(v));

const out = [];
out.push('-- AUTO-GENERATED seed.');
out.push('-- Sumber: src/data/categoriesData.ts + src/data/flashSaleData.ts');

/* ---------------- products ---------------- */
const productRows = [];
CATEGORIES_DATA.forEach((cat) => {
  let order = 0;
  cat.groups.forEach((g) => {
    g.items.forEach((it) => {
      productRows.push(
        '(' +
          [
            q(cat.id),
            q(g.name),
            q(it.l),
            q(it.d),
            n(it.p),
            'null',
            it.variable ? 'true' : 'false',
            'null',
            q('active'),
            n(order++)
          ].join(', ') +
          ')'
      );
    });
  });
});
out.push(
  'insert into public.products (category_id, group_name, label, description, price, promo_price, is_variable, image_url, status, sort_order) values\n' +
    productRows.join(',\n') +
    '\non conflict (category_id, group_name, label) do nothing;'
);

/* ---------------- flash_sales ---------------- */
const sessionById = Object.fromEntries(FLASH_SALE_SESSIONS.map((s) => [s.id, s]));
const fsRows = FLASH_SALE_PRODUCTS.map((p, i) => {
  const s = sessionById[p.sessionId];
  return (
    '(' +
    [
      q(p.name),
      q(p.provider),
      q(p.categoryId),
      q(p.targetLabel ?? null),
      n(p.normalPrice),
      n(p.promoPrice),
      n(p.discountPercent ?? null),
      n(p.quota),
      n(p.sold),
      q(p.sessionId),
      q(s.startTime),
      q(s.endTime),
      'null',
      q('active'),
      n(i)
    ].join(', ') +
    ')'
  );
});
out.push(
  'insert into public.flash_sales (name, provider, category_id, target_label, normal_price, promo_price, discount_percent, quota, sold, session_id, session_start, session_end, image_url, status, sort_order) values\n' +
    fsRows.join(',\n') +
    '\non conflict (session_id, name, provider) do nothing;'
);

/* ---------------- site_settings ---------------- */
const brand = {
  name: 'Hesolvian',
  tagline: 'PPOB Ledger',
  logo_url: null,
  logo_public_id: null,
  favicon_url: null,
  favicon_public_id: null
};
const contact = {
  email: 'cs@hesolvian.id',
  phone: '0812-8829-4910',
  whatsapp: '6281288294910',
  address: 'Jl. Melati No. 42, Jakarta Selatan'
};
const seo = {
  title: 'Hesolvian PPOB Ledger - Lacak Transaksi',
  description: 'Platform loket pembayaran multiaset dan PPOB terpadu.',
  og_image_url: null,
  og_image_public_id: null
};
out.push(
  'insert into public.site_settings (key, value) values\n' +
    [
      "(" + q('brand') + ", " + q(JSON.stringify(brand)) + "::jsonb)",
      "(" + q('contact') + ", " + q(JSON.stringify(contact)) + "::jsonb)",
      "(" + q('seo') + ", " + q(JSON.stringify(seo)) + "::jsonb)"
    ].join(',\n') +
    '\non conflict (key) do nothing;'
);

fs.writeFileSync(path.join(TMP, 'seed_core.sql'), out.join('\n'), 'utf8');
console.log('products:', productRows.length, '| flash_sales:', fsRows.length);

/* ---------------- transactions (12 bulan terakhir) ---------------- */
const customers = [
  ['081288294910', 'Salung Prastyo'],
  ['081377120045', 'Dewi Anggraini'],
  ['085611203987', 'Rizky Ramadhan'],
  ['081234567890', 'Budi Santoso'],
  ['087755412309', 'Siti Nurhaliza'],
  ['081955330021', 'Andi Wijaya'],
  ['089612774455', 'Rina Kartika'],
  ['082144778899', 'Joko Susilo'],
  ['085312009876', 'Maya Sari'],
  ['081700556644', 'Fajar Nugroho'],
  ['087822334411', 'Indah Permata'],
  ['081533667788', 'Hendra Gunawan'],
  ['089522110033', 'Lestari Widodo'],
  ['082299887766', 'Bayu Pratama'],
  ['081399445566', 'Nadia Safira'],
  ['085800112233', 'Agus Setiawan'],
  ['087744556677', 'Putri Amelia'],
  ['081277889900', 'Eko Kurniawan'],
  ['089633445577', 'Wulan Sari'],
  ['082155667788', 'Doni Hermawan']
];

const allItems = [];
CATEGORIES_DATA.forEach((c) =>
  c.groups.forEach((g) => g.items.forEach((it) => allItems.push({ cat: c.id, admin: c.admin, label: it.l, price: it.p })))
);
const variableItems = allItems.filter((i) => i.price === 0);
const fixedItems = allItems.filter((i) => i.price > 0);
const methods = ['QRIS', 'Transfer Bank', 'Tunai Agen'];
const TOTAL_MONTHS = 24;

let rs = 20260101;
const rnd = () => {
  rs = (rs * 1103515245 + 12345) & 0x7fffffff;
  return rs / 0x7fffffff;
};

// Sebar pelanggan supaya masuk bertahap, bukan semuanya di bulan pertama.
// Tanpa ini, grafik "Baru vs Existing" selalu nol di periode terbaru.
const joined = customers.map((c) => ({ id: c[0], name: c[1], joinIndex: 0 }));
for (let i = 0; i < joined.length; i++) {
  const j = i + Math.floor(rnd() * (joined.length - i));
  [joined[i], joined[j]] = [joined[j], joined[i]];
}
joined.forEach((c, i) => {
  c.joinIndex = Math.min(TOTAL_MONTHS - 1, Math.round((i * (TOTAL_MONTHS - 2)) / Math.max(joined.length - 1, 1)));
});

const NOW = new Date('2026-09-26T10:00:00Z');
const txRows = [];
let seedNum = 1;

for (let m = TOTAL_MONTHS - 1; m >= 0; m--) {
  const monthIndex = TOTAL_MONTHS - 1 - m;
  const activeCustomers = joined.filter((c) => c.joinIndex <= monthIndex);
  const monthStart = new Date(Date.UTC(2026, 8 - m, 1));
  const daysInMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)).getUTCDate();
  const volume = 26 + Math.floor(rnd() * 34);
  for (let k = 0; k < volume; k++) {
    const day = 1 + Math.floor(rnd() * daysInMonth);
    const hour = 7 + Math.floor(rnd() * 14);
    const created = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), Math.min(day, daysInMonth), hour, Math.floor(rnd() * 60))
    );
    if (created > NOW) continue;

    const picked = activeCustomers[Math.floor(rnd() * activeCustomers.length)];
    const cid = picked.id;
    const cname = picked.name;
    const useVar = rnd() < 0.12;
    const item = useVar
      ? variableItems[Math.floor(rnd() * variableItems.length)]
      : fixedItems[Math.floor(rnd() * fixedItems.length)];
    const unit = useVar ? 35000 + Math.floor(rnd() * 400) * 1000 : item.price;
    const qty = rnd() < 0.88 ? 1 : 1 + Math.floor(rnd() * 3);
    const fee = item.admin;
    const disc = rnd() < 0.22 ? Math.floor(rnd() * 5) * 500 : 0;
    const total = unit * qty + fee - disc;
    const r = rnd();
    const status = r < 0.86 ? 'success' : r < 0.93 ? 'pending' : r < 0.97 ? 'processing' : 'failed';

    const stamp = `${created.getUTCFullYear()}${String(created.getUTCMonth() + 1).padStart(2, '0')}${String(
      created.getUTCDate()
    ).padStart(2, '0')}`;
    const id = `HSV${stamp}-${String(seedNum++).padStart(4, '0')}`;

    txRows.push(
      '(' +
        [
          q(id),
          q(cname),
          q(cid),
          q(item.cat),
          q(item.label),
          q(status),
          n(qty),
          n(unit),
          n(fee),
          n(disc),
          n(total),
          q(methods[Math.floor(rnd() * methods.length)]),
          q(created.toISOString())
        ].join(', ') +
        ')'
    );
  }
}

fs.writeFileSync(
  path.join(TMP, 'seed_tx.sql'),
  'insert into public.transactions (id, customer_name, customer_id, category_id, product_label, status, qty, unit_price, admin_fee, discount, total, method, created_at) values\n' +
    txRows.join(',\n') +
    '\non conflict (id) do nothing;',
  'utf8'
);
console.log('transactions:', txRows.length);

/* ---------------- articles & promos ---------------- */
const articles = [
  [
    'Panduan Lengkap Isi Token Listrik PLN',
    'panduan-isi-token-listrik',
    'Langkah demi langkah mengisi token listrik prabayar lewat Hesolvian, dari input ID meter sampai token masuk.',
    'published'
  ],
  [
    'Cara Melacak Status Transaksi PPOB',
    'cara-melacak-status-transaksi',
    'Kenali empat tahap audit transaksi: diterima, diproses, dibayar, selesai.',
    'published'
  ],
  [
    'Tips Aman Bertransaksi di Loket Digital',
    'tips-aman-bertransaksi',
    'Ciri-ciri mitra resmi, pengecekan hash server, dan kebiasaan yang bikin transaksi aman.',
    'published'
  ],
  [
    'Jadwal Flash Sale Bulan Ini',
    'jadwal-flash-sale-bulan-ini',
    'Ringkasan sesi Flash Sale harian beserta kategori produk yang ikut promo.',
    'draft'
  ]
];
const aRows = articles.map(
  ([t, s, e, st]) =>
    '(' +
    [
      q(t),
      q(s),
      q(e),
      q(''),
      'null',
      q('Admin'),
      q(st),
      st === 'published' ? q(new Date('2026-09-20T09:00:00Z').toISOString()) : 'null'
    ].join(', ') +
    ')'
);
// FAQ Pusat Bantuan. Kategori harus cocok dengan FAQ_CATEGORIES di src/data/faqData.ts.
const fRows = FAQS_DATA.map(
  (f, i) => '(' + [q(f.category), q(f.question), q(f.answer), 'true', n(i)].join(', ') + ')'
);

fs.writeFileSync(
  path.join(TMP, 'seed_content.sql'),
  'insert into public.articles (title, slug, excerpt, content, cover_image_url, author, status, published_at) values\n' +
    aRows.join(',\n') +
    '\non conflict (slug) do nothing;\n\n' +
    'insert into public.faqs (category, question, answer, is_published, sort_order) values\n' +
    fRows.join(',\n') +
    '\non conflict (question) do nothing;',
  'utf8'
);
console.log('articles:', aRows.length, '| faqs:', fRows.length);

/* ---------------- gabungkan jadi supabase/seed.sql ---------------- */
const parts = ['seed_core.sql', 'seed_tx.sql', 'seed_content.sql'].map((f) =>
  fs.readFileSync(path.join(TMP, f), 'utf8')
);
const banner = [
  '-- ============================================================',
  '-- Hesolvian PPOB Ledger — seed data awal',
  '-- Dibuat otomatis oleh scripts/generate-seed.cjs — jangan diedit manual.',
  '-- Jalankan setelah supabase/migrations/0001_admin_schema.sql.',
  '-- Semua statement bersifat idempotent (on conflict do nothing).',
  '-- ============================================================',
  '',
  ''
].join('\n');
fs.writeFileSync('supabase/seed.sql', banner + parts.join('\n\n'), 'utf8');
fs.rmSync(GEN, { recursive: true, force: true });
console.log('=> supabase/seed.sql ditulis');
