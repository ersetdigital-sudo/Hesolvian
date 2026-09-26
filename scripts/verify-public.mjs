/* eslint-disable */
/**
 * Verifikasi beranda publik: data dari Supabase harus menghasilkan katalog
 * yang identik dengan data statis (src/data/categoriesData.ts) sehingga
 * tampilan publik tidak berubah sama sekali.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);

const DEBUG = 'http://localhost:9224';
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const TOKEN = process.env.SUPABASE_TOKEN;
const SUPA = 'https://api.supabase.com/v1/projects/khwmdxprniextbuzmpxp';

let seq = 0;
const pending = new Map();

async function connect(url) {
  const target = await (
    await fetch(`${DEBUG}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
  ).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  await send('Page.enable');
  await send('Runtime.enable');
  return { ws, send };
}

async function evaluate(send, expression) {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description ?? 'gagal');
  return res.result.value;
}

/* ---------- 1. kumpulkan katalog dari DOM beranda ---------- */
const { send } = await connect(`${BASE}/`);
await send('Page.navigate', { url: BASE + '/' });
for (let i = 0; i < 60; i++) {
  const state = await evaluate(send, 'document.readyState');
  if (state === 'complete') break;
  await new Promise((r) => setTimeout(r, 250));
}
await new Promise((r) => setTimeout(r, 1200));

const dom = await evaluate(
  send,
  `(() => {
    const tabs = Array.from(document.querySelectorAll('.border-y button'))
      .map(b => b.innerText.trim())
      .filter(Boolean);
    const text = document.body.innerText;
    return { tabs, text, textLen: text.length };
  })()`
);
console.log('Tab kategori dari DOM:', JSON.stringify(dom.tabs));
console.log('Panjang teks beranda:', dom.textLen);

/* ---------- 2. kumpulkan katalog dari data statis ---------- */
const GEN = path.join(os.tmpdir(), 'hesolvian-cmp');
fs.rmSync(GEN, { recursive: true, force: true });
fs.mkdirSync(GEN, { recursive: true });
execSync(
  `npx tsc src/data/categoriesData.ts src/data/flashSaleData.ts --outDir "${GEN}" --module commonjs --target es2020 --moduleResolution node --skipLibCheck`,
  { stdio: 'ignore' }
);
const staticMod = nodeRequire(path.join(GEN, 'categoriesData.js'));
const staticFlash = nodeRequire(path.join(GEN, 'flashSaleData.js'));

const staticCount = staticMod.CATEGORIES_DATA.reduce(
  (sum, c) => sum + c.groups.reduce((s, g) => s + g.items.length, 0),
  0
);

/* ---------- 3. kumpulkan katalog dari database ---------- */
if (!TOKEN) {
  console.log('\n[SUPABASE_TOKEN tidak disediai — perbandingan database dilewati]');
  process.exit(0);
}

async function query(sql) {
  const r = await fetch(`${SUPA}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  const body = await r.json();
  if (r.status >= 400) throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
  return body;
}

const dbProducts = await query(
  "select category_id, group_name, label, description, price, is_variable from public.products where status='active' order by category_id, group_name, sort_order"
);
const dbFlash = await query(
  "select session_id, name, provider, normal_price, promo_price, quota, sold, category_id, target_label from public.flash_sales where status='active' order by session_start, sort_order"
);

/* ---------- 4. bandingkan ---------- */
const staticItems = [];
staticMod.CATEGORIES_DATA.forEach((c) =>
  c.groups.forEach((g) => g.items.forEach((it) => staticItems.push(`${c.id}|${g.name}|${it.l}|${it.d}|${it.p}|${it.variable ? 1 : 0}`)))
);
const dbItems = dbProducts.map(
  (r) => `${r.category_id}|${r.group_name}|${r.label}|${r.description}|${r.price}|${r.is_variable ? 1 : 0}`
);

const missing = staticItems.filter((x) => !dbItems.includes(x));
const extra = dbItems.filter((x) => !staticItems.includes(x));

console.log(`\nProduk  : statis=${staticItems.length} db=${dbItems.length}`);
console.log(`Flash   : statis=${staticFlash.FLASH_SALE_PRODUCTS.length} db=${dbFlash.length}`);
console.log(`Item hilang di DB : ${missing.length}`);
missing.slice(0, 10).forEach((m) => console.log('   - ' + m));
console.log(`Item tambahan di DB: ${extra.length}`);
extra.slice(0, 10).forEach((m) => console.log('   + ' + m));

/* ---------- 5. teks kunci di beranda ---------- */
const homeProbes = [
  'Semua Kebutuhan PPOB',
  'FLASH SALE',
  'Semua Layanan',
  'Paket Data',
  'Multifinance',
  'Cek Transaksi',
  'Lacak Transaksi'
];
console.log('\nPemeriksaan teks beranda:');
homeProbes.forEach((p) => console.log(`   ${dom.text.includes(p) ? 'OK  ' : 'HILANG'} ${p}`));

/* ---------- 6. grup & nominal di dalam modal transaksi ---------- */
async function probeModal(category, expected) {
  await evaluate(
    send,
    `(async () => {
      const card = Array.from(document.querySelectorAll('div.cursor-pointer'))
        .find(d => d.querySelector('h3')?.innerText.trim() === ${JSON.stringify(category)});
      if (!card) return false;
      card.click();
      await new Promise(r => setTimeout(r, 900));
      return true;
    })()`
  );
  const found = await evaluate(
    send,
    `(async () => {
      const card = Array.from(document.querySelectorAll('div.cursor-pointer'))
        .find(d => d.querySelector('h3')?.innerText.trim() === ${JSON.stringify(category)});
      if (!card) return false;
      card.click();
      await new Promise(r => setTimeout(r, 900));
      return true;
    })()`
  );
  const text = await evaluate(send, 'document.body.innerText');
  const results = expected.map((e) => ({ term: e, found: found && text.includes(e) }));
  if (!found) results.push({ term: `[card ${category} tidak bisa diklik]`, found: false });
  await evaluate(
    send,
    `(async () => {
      const close = Array.from(document.querySelectorAll('button')).find(b =>
        (b.getAttribute('aria-label') || '').toLowerCase().includes('tutup') ||
        (b.getAttribute('aria-label') || '').toLowerCase().includes('close')
      );
      if (close) { close.click(); await new Promise(r => setTimeout(r, 500)); }
      return true;
    })()`
  );
  return results;
}

const modalChecks = [];
// Grup pertama yang tampil otomatis yang dipilih, jadi item grup ke-2 memang
// belum dirender. Yang dicek: nama semua grup + item grup pertama.
modalChecks.push(
  ...(await probeModal('Paket Data', ['Kuota Harian', '1 GB / 3 Hari', '2 GB / 7 Hari', 'Kuota Bulanan']))
);
modalChecks.push(...(await probeModal('PLN', ['Token Prabayar', 'Token 20.000', 'Token 1.000.000', 'Pascabayar'])));
modalChecks.push(
  ...(await probeModal('Multifinance', ['Angsuran Kendaraan', 'FIF Group', 'Pembiayaan & Paylater']))
);

console.log('\nPemeriksaan isi modal transaksi:');
modalChecks.forEach((c) => console.log(`   ${c.found ? 'OK  ' : 'HILANG'} ${c.term}`));

/* ---------- 7. uang elektronik: tiap dompet berdiri sendiri ---------- */
async function modalText(category) {
  await evaluate(
    send,
    `(async () => {
      const card = Array.from(document.querySelectorAll('div.cursor-pointer'))
        .find(d => d.querySelector('h3')?.innerText.trim() === ${JSON.stringify(category)});
      if (card) { card.click(); await new Promise(r => setTimeout(r, 900)); }
      return true;
    })()`
  );
  // Teks HARUS diambil dari dalam modal saja: pill kategori di belakang modal
  // ikut memuat nama semua dompet, jadi pengecekan negatif bisa salah lolos.
  const text = await evaluate(
    send,
    `(document.querySelector('div.fixed.inset-0.z-50')?.innerText ?? '')`
  );
  await evaluate(
    send,
    `(async () => {
      const close = Array.from(document.querySelectorAll('button')).find(b =>
        (b.getAttribute('aria-label') || '').toLowerCase().includes('tutup') ||
        (b.getAttribute('aria-label') || '').toLowerCase().includes('close')
      );
      if (close) { close.click(); await new Promise(r => setTimeout(r, 500)); }
      return true;
    })()`
  );
  return text;
}

const goPayText = await modalText('GoPay');
const etollText = await modalText('e-Toll & e-Money');

const ewalletChecks = [
  { term: 'GoPay: nominal 20.000', found: goPayText.includes('Top Up 20.000') },
  { term: 'GoPay: nominal 500.000', found: goPayText.includes('Top Up 500.000') },
  { term: 'GoPay: field nomor GoPay', found: goPayText.includes('Nomor HP GoPay') },
  { term: 'GoPay: tidak menggabung OVO/DANA (tidak ambigu)', found: !goPayText.includes('OVO') && !goPayText.includes('DANA') },
  { term: 'e-Toll: field nomor kartu', found: etollText.includes('Nomor Kartu e-Money') },
  { term: 'e-Toll: nominal kartu', found: etollText.includes('e-Toll 100.000') }
];

console.log('\nPemeriksaan pemisahan uang elektronik:');
ewalletChecks.forEach((c) => console.log(`   ${c.found ? 'OK  ' : 'HILANG'} ${c.term}`));

const ok =
  missing.length === 0 &&
  extra.length === 0 &&
  homeProbes.every((p) => dom.text.includes(p)) &&
  ewalletChecks.every((c) => c.found) &&
  modalChecks.every((c) => c.found);
console.log(
  `\nHASIL: ${
    ok
      ? 'BERHASIL — katalog & Flash Sale publik identik dengan data statis'
      : 'BEDA — perlu dicek'
  }`
);
process.exit(ok ? 0 : 1);
