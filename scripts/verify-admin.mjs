/* eslint-disable */
/**
 * Verifikasi panel admin lewat Chrome DevTools Protocol.
 *
 * Cara pakai:
 *   1. npx next start --port 3010
 *   2. chrome --headless=new --remote-debugging-port=9224 --user-data-dir=...
 *   3. node scripts/verify-admin.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEBUG = 'http://localhost:9224';
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'hesolvian-admin';
const OUT = path.join(os.tmpdir(), 'hesolvian-admin-shots');

fs.mkdirSync(OUT, { recursive: true });

const consoleErrors = [];
let seq = 0;
const pending = new Map();

function createSession(ws) {
  return function send(method, params = {}) {
    const id = ++seq;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout: ${method}`)), 180000);
      pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        }
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };
}

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
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
      return;
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(`exception: ${msg.params.exceptionDetails?.text ?? 'unknown'}`);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const text = (msg.params.args ?? [])
        .map((a) => a.value ?? a.description ?? '')
        .join(' ')
        .slice(0, 300);
      consoleErrors.push(`console.error: ${text}`);
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry?.level === 'error') {
      consoleErrors.push(`log: ${msg.params.entry.text.slice(0, 300)}`);
    }
    if (msg.method === 'Network.responseReceived') {
      const status = msg.params.response.status;
      if (status === 404 || status >= 500) {
        consoleErrors.push(`HTTP ${status}: ${msg.params.response.url}`);
      }
    }
  });

  const send = createSession(ws);
  await Promise.all([
    send('Page.enable'),
    send('Runtime.enable'),
    send('Log.enable'),
    send('Network.enable')
  ]);
  // Mulai dari keadaan logout supaya alur login benar-benar teruji.
  await send('Network.clearBrowserCookies').catch(() => {});
  // Terima semua window.confirm secara otomatis (untuk alur hapus).
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Page.javascriptDialogOpening') {
      ws.send(
        JSON.stringify({
          id: ++seq,
          method: 'Page.handleJavaScriptDialog',
          params: { accept: true }
        })
      );
    }
  });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1600,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  });

  return { ws, send };
}

async function navigate(send, url) {
  await send('Page.navigate', { url });
  for (let i = 0; i < 60; i++) {
    const state = await send('Runtime.evaluate', {
      expression: 'document.readyState',
      returnByValue: true
    });
    if (state.result.value === 'complete') break;
    await new Promise((r) => setTimeout(r, 250));
  }
  await new Promise((r) => setTimeout(r, 900));
}

async function evaluate(send, expression) {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description ?? 'evaluate gagal');
  }
  return res.result.value;
}

async function shot(send, name) {
  const res = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const file = path.join(OUT, `${name}.png`);
  fs.writeFileSync(file, Buffer.from(res.data, 'base64'));
  return file;
}

async function overflow(send) {
  return evaluate(
    send,
    `(() => {
      const doc = document.documentElement;
      const bad = [];
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2)) {
          const cls = (el.className && typeof el.className === 'string') ? el.className.slice(0, 70) : el.tagName;
          if (!bad.includes(cls)) bad.push(cls);
        }
      });
      return { scroll: doc.scrollWidth, client: doc.clientWidth, overflow: doc.scrollWidth > doc.clientWidth + 1, bad: bad.slice(0, 6) };
    })()`
  );
}

const log = (...args) => console.log(...args);

try {
  /* ============ 1. HALAMAN LOGIN ============ */
  const { send } = await connect(`${BASE}/admin/login`);
  await navigate(send, `${BASE}/admin/login`);

  const loginInfo = await evaluate(
    send,
    `({ title: document.title, hasForm: !!document.querySelector('form'), hasPassword: !!document.getElementById('password') })`
  );
  log('1. login page:', JSON.stringify(loginInfo));
  log('   screenshot:', await shot(send, '01-login'));

  /* ============ 2. LOGIN ============ */
  await evaluate(
    send,
    `(() => {
      const input = document.getElementById('password');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      // Sengaja tambah spasi + newline biar teruji: password tempelan copy-paste
      // tetap harus diterima (login action me-trim input).
      setter.call(input, ${JSON.stringify(PASSWORD)} + '   ' + String.fromCharCode(10));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('form').requestSubmit();
      return true;
    })()`
  );
  await new Promise((r) => setTimeout(r, 3000));
  log('2. url setelah login:', await evaluate(send, 'location.pathname'));

  /* ============ 3. DASBOR ============ */
  await navigate(send, `${BASE}/admin`);
  const dash = await evaluate(
    send,
    `(() => {
      const text = document.body.innerText;
      return {
        path: location.pathname,
        brand: document.querySelector('aside p:last-child')?.innerText ?? '',
        navGroups: document.querySelectorAll('aside nav > div').length,
        navItems: document.querySelectorAll('aside nav a').length,
        breadcrumb: document.querySelector('nav[aria-label="Breadcrumb"]')?.innerText.replace(/\\s+/g, ' ').trim() ?? '',
        cards: document.querySelectorAll('main .grid > div').length,
        hasTrend: !!Array.from(document.querySelectorAll('h2')).find(h => h.innerText.includes('Tren Penjualan')),
        hasBreakdown: !!Array.from(document.querySelectorAll('h2')).find(h => h.innerText.includes('Rincian Pendapatan')),
        hasRecent: !!Array.from(document.querySelectorAll('h2')).find(h => h.innerText.includes('Transaksi Terbaru')),
        bars: document.querySelectorAll('main .flex.h-52 > div').length,
        statLabels: Array.from(document.querySelectorAll('main .grid > div p:first-child')).map(p => p.innerText).slice(0, 8),
        first: text.slice(0, 200).replace(/\\s+/g, ' ')
      };
    })()`
  );
  log('3. dashboard:', JSON.stringify(dash, null, 2));
  log('   overflow:', JSON.stringify(await overflow(send)));
  log('   screenshot:', await shot(send, '02-dashboard'));

  /* ============ 4. TAB GRAFIK ============ */
  const tabClick = await evaluate(
    send,
    `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Mingguan');
      if (!btn) return 'no-tab';
      btn.click();
      return document.querySelectorAll('main .flex.h-52 > div').length;
    })()`
  );
  await new Promise((r) => setTimeout(r, 400));
  log('4. tab Mingguan -> jumlah bar:', tabClick);
  log('   screenshot:', await shot(send, '03-dashboard-weekly'));

  /* ============ 5. CLOUDINARY SIGN + UPLOAD DARI BROWSER ============ */
  const cld = await evaluate(
    send,
    `(async () => {
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'produk' })
      });
      const sign = await signRes.json();
      if (!signRes.ok) return { step: 'sign-failed', status: signRes.status, body: sign };

      const canvas = document.createElement('canvas');
      canvas.width = 640; canvas.height = 640;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#B4432C'; ctx.fillRect(0, 0, 640, 640);
      ctx.fillStyle = '#FFD839'; ctx.fillRect(80, 80, 480, 480);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const file = new File([blob], 'verifikasi.png', { type: 'image/png' });

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sign.apiKey);
      fd.append('timestamp', String(sign.timestamp));
      fd.append('upload_preset', sign.uploadPreset);
      fd.append('folder', sign.folder);
      fd.append('signature', sign.signature);

      const up = await fetch(sign.uploadUrl, { method: 'POST', body: fd });
      const upj = await up.json();
      if (up.status >= 300) return { step: 'upload-failed', status: up.status, body: upj };

      const optimized = 'https://res.cloudinary.com/' + sign.cloudName + '/image/upload/f_auto,q_auto,w_400,c_fill/' + upj.public_id;
      const head = await fetch(optimized, { method: 'GET' });

      const del = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: upj.public_id })
      });
      const delj = await del.json();

      return {
        step: 'ok',
        folder: sign.folder,
        hasSignature: typeof sign.signature === 'string' && sign.signature.length === 40,
        uploadStatus: up.status,
        publicId: upj.public_id,
        optimizedStatus: head.status,
        deleteStatus: del.status,
        deleteOk: delj.ok === true,
        secretLeaked: JSON.stringify(sign).includes('wWDaelf')
      };
    })()`
  );
  log('5. cloudinary:', JSON.stringify(cld, null, 2));

  /* ============ 6. HALAMAN CRUD ============ */
  const pages = [
    ['produk', '/admin/produk'],
    ['produk-baru', '/admin/produk/baru'],
    ['flash-sale', '/admin/flash-sale'],
    ['flash-sale-baru', '/admin/flash-sale/baru'],
    ['transaksi', '/admin/transaksi'],
    ['transaksi-baru', '/admin/transaksi/baru'],
    ['artikel', '/admin/artikel'],
    ['artikel-baru', '/admin/artikel/baru'],
    ['sistem', '/admin/sistem'],
    ['pusat-bantuan', '/admin/pusat-bantuan'],
    ['pusat-bantuan-baru', '/admin/pusat-bantuan/baru'],
    ['penampung', '/admin/laporan']
  ];

  for (const [name, url] of pages) {
    await navigate(send, `${BASE}${url}`);
    const info = await evaluate(
      send,
      `(() => ({
        path: location.pathname,
        heading: document.querySelector('main h1')?.innerText ?? '',
        inputs: document.querySelectorAll('main input, main select, main textarea').length,
        imgs: document.querySelectorAll('main img').length,
        rows: document.querySelectorAll('main tbody tr').length
      }))()`
    );
    const ov = await overflow(send);
    log(`6. ${name}: ${JSON.stringify(info)} overflow=${ov.overflow ? 'YA ' + JSON.stringify(ov.bad) : 'tidak'}`);
    log(`   screenshot: ${await shot(send, `06-${name}`)}`);
  }

  /* ============ 7. ERROR 404 & ACCESS TANPA LOGIN ============ */
  log('7. akses /admin/artikel tanpa cookie:', 'n/a (sudah login)');
  /* ============ 7. MODUL YANG SUDAH DIHAPUS DARI MENU ============ */
  for (const slug of ['dukungan', 'promo']) {
    await navigate(send, `${BASE}/admin/${slug}`);
    const gone = await evaluate(
      send,
      `({ path: location.pathname, notFound: document.body.innerText.toLowerCase().includes('could not be found') })`
    );
    log(`7. /admin/${slug} (dihapus):`, JSON.stringify(gone), gone.notFound ? 'OK (404)' : 'PERIKSA');
  }

  /* ============ 7a. UANG ELEKTRONIK TERPISAH DI FORM PRODUK ============ */
  await navigate(send, `${BASE}/admin/produk/baru`);
  const kategori = await evaluate(
    send,
    `Array.from(document.querySelectorAll('#category_id option')).map(o => o.value)`
  );
  const wallets = ['gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'etoll'];
  const missingWallets = wallets.filter((id) => !kategori.includes(id));
  log(
    '7a. kategori form produk:',
    JSON.stringify(kategori),
    missingWallets.length === 0 && !kategori.includes('emoney')
      ? `OK (${kategori.length} kategori, 6 dompet terpisah)`
      : `PERIKSA (hilang: ${missingWallets.join(', ') || '-'})`
  );

  await navigate(send, `${BASE}/admin/sistem`);
  const settingsFields = await evaluate(
    send,
    `({
        inputs: Array.from(document.querySelectorAll('main input, main select, main textarea'))
          .map(el => el.name)
          .filter(Boolean),
        uploads: document.querySelectorAll('main input[type="file"]').length
      })`
  );
  log(
    '7a. field di Pengaturan Sistem:',
    JSON.stringify(settingsFields),
    settingsFields.uploads === 0 &&
      !settingsFields.inputs.some((n) => ['tagline', 'seo_title', 'seo_description', 'logo_url', 'favicon_url', 'og_image_url'].includes(n))
      ? 'OK (tanpa logo/favicon/tagline/SEO)'
      : 'PERIKSA'
  );

  /* ============ 7c. FAQ PUBLIK DI /bantuan ============ */
  await navigate(send, `${BASE}/`);
  const faqPublic = await evaluate(
    send,
    `(async () => {
      const nav = Array.from(document.querySelectorAll('nav button, button')).find(el =>
        ['Bantuan', 'Pusat Bantuan CS'].includes(el.innerText.replace(/\\s+/g, ' ').trim())
      );
      if (!nav) return { step: 'no-nav' };
      nav.click();
      await new Promise(r => setTimeout(r, 600));

      const heading = Array.from(document.querySelectorAll('h2')).find(h =>
        h.innerText.includes('Pertanyaan yang Sering Diajukan')
      );
      if (!heading) return { step: 'no-heading' };

      const pills = Array.from(document.querySelectorAll('button')).filter(b =>
        ['Semua', 'Token PLN', 'Pulsa & Data', 'Pembayaran', 'Refund', 'Riwayat'].includes(b.innerText.trim())
      );
      // Accordion FAQ = tombol header yang membungkus teks pertanyaan.
      const items = Array.from(document.querySelectorAll('button')).filter(b =>
        b.innerText.includes('?')
      );
      const section = heading.closest('div.space-y-4, div.space-y-6') ?? heading.parentElement;
      return {
        step: 'ok',
        pills: pills.map(p => p.innerText.trim()),
        items: items.length,
        empty: (section?.innerText ?? '').includes('Tidak ada pertanyaan yang sesuai'),
        firstQuestion: items[0]?.innerText.split('?')[0]?.trim().slice(0, 60) ?? ''
      };
    })()`
  );
  log('7c. FAQ publik /bantuan:', JSON.stringify(faqPublic), faqPublic.items >= 6 ? 'OK' : 'PERIKSA');
  log(`   screenshot: ${await shot(send, '08-pusat-bantuan-publik')}`);

  /* ============ 7d. CRUD FAQ -> TAMPIL DI PUBLIK -> DIHAPUS ============ */
  const TEST_FAQ = `Pertanyaan uji coba ${Date.now()}?`;
  await navigate(send, `${BASE}/admin/pusat-bantuan/baru`);
  const faqSave = await evaluate(
    send,
    `(async () => {
      const setVal = (el, v) => {
        const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setVal(document.getElementById('question'), ${JSON.stringify(TEST_FAQ)});
      setVal(document.getElementById('answer'), 'Jawaban verifikasi otomatis untuk FAQ.');
      document.querySelector('main button[type="submit"]').click();
      for (let i = 0; i < 50; i++) {
        await new Promise(r => setTimeout(r, 400));
        const t = document.body.innerText;
        if (t.includes('FAQ ditambahkan')) return 'saved';
        if (t.includes('wajib diisi')) return 'validation-failed';
        if (t.includes('Sesi admin habis')) return 'unauthorized';
      }
      return 'timeout';
    })()`
  );
  log('7d. simpan FAQ:', faqSave);

  await navigate(send, `${BASE}/`);
  const faqVisible = await evaluate(
    send,
    `(async () => {
      Array.from(document.querySelectorAll('nav button, button')).find(el =>
        ['Bantuan', 'Pusat Bantuan CS'].includes(el.innerText.replace(/\\s+/g, ' ').trim())
      )?.click();
      await new Promise(r => setTimeout(r, 600));
      const t = document.body.innerText;
      return {
        found: t.includes(${JSON.stringify(TEST_FAQ)}),
        accordions: Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('?')).length
      };
    })()`
  );
  log('7d. FAQ baru tampil di publik:', JSON.stringify(faqVisible), faqVisible.found ? 'OK' : 'PERIKSA');

  await navigate(send, `${BASE}/admin/pusat-bantuan`);
  const faqDelete = await evaluate(
    send,
    `(async () => {
      const row = Array.from(document.querySelectorAll('main tbody tr')).find(tr =>
        tr.innerText.includes(${JSON.stringify(TEST_FAQ)})
      );
      if (!row) return 'row-not-found';
      const btn = row.querySelector('button[aria-label^="Hapus"]');
      if (!btn) return 'delete-button-not-found';
      btn.click();
      for (let i = 0; i < 50; i++) {
        await new Promise(r => setTimeout(r, 400));
        if (!document.body.innerText.includes(${JSON.stringify(TEST_FAQ)})) return 'deleted';
        if (document.body.innerText.includes('Gagal menghapus')) return 'delete-failed';
      }
      return 'timeout';
    })()`
  );
  log('7d. hapus FAQ:', faqDelete);

  // Beranda publik di berbagai lebar layar.
  for (const [label, width, height] of [
    ['mobile-390', 390, 844],
    ['tablet-768', 768, 1024],
    ['desktop-1440', 1440, 900],
    ['wide-1920', 1920, 1080]
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 700
    });
    await navigate(send, `${BASE}/`);
    const info = await evaluate(
      send,
      `({ path: location.pathname, tabs: document.querySelectorAll('.border-y button').length,
          flash: !!document.getElementById('flash-sale-section'),
          text: document.body.innerText.length })`
    );
    const ov = await overflow(send);
    log(
      `8. beranda ${label}: ${JSON.stringify(info)} overflow=${
        ov.overflow ? 'YA ' + JSON.stringify(ov.bad) : 'tidak'
      }`
    );
    log(`   screenshot: ${await shot(send, `07-home-${label}`)}`);
  }
  await send('Emulation.clearDeviceMetricsOverride').catch(() => {});

  /* ============ 9. CRUD END-TO-END: BUAT + UPLOAD GAMBAR + HAPUS ============ */
  const TEST_LABEL = `Produk Uji Coba ${Date.now()}`;
  await navigate(send, `${BASE}/admin/produk/baru`);

  const uploadResult = await evaluate(
    send,
    `(async () => {
      const setVal = (el, v) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setVal(document.getElementById('label'), ${JSON.stringify(TEST_LABEL)});
      setVal(document.getElementById('group_name'), 'Grup Uji');
      setVal(document.getElementById('price'), '12345');

      const input = document.querySelector('input[type="file"]');
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0891B2'; ctx.fillRect(0, 0, 512, 512);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const dt = new DataTransfer();
      dt.items.add(new File([blob], 'produk-uji.png', { type: 'image/png' }));
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));

      for (let i = 0; i < 70; i++) {
        await new Promise(r => setTimeout(r, 500));
        // Catatan: properti CSS uppercase bikin innerText jadi
        // TERSIMPAN DI CLOUDINARY (huruf besar), jadi pencarian case-insensitive.
        const t = document.body.innerText.toLowerCase();
        if (t.includes('berhasil diunggah')) {
          return {
            state: 'uploaded',
            publicId: document.querySelector('input[name="image_public_id"]').value,
            url: document.querySelector('input[name="image_url"]').value,
            info: document.body.innerText.match(/.*berhasil diunggah\..*/)?.[0] ?? ''
          };
        }
        if (t.includes('format harus') || t.includes('ukuran maksimal')) {
          return { state: 'validation-error', t: t.slice(0, 300) };
        }
        if (t.includes('gagal meminta tanda tangan')) return { state: 'sign-error' };
      }
      return { state: 'timeout' };
    })()`
  );
  log('9a. upload gambar:', JSON.stringify(uploadResult));

  const saveResult = await evaluate(
    send,
    `(async () => {
      // Harus di-scope ke <main> — tombol submit pertama di dokumen
      // adalah tombol Logout di sidebar.
      const btn = document.querySelector('main button[type="submit"]');
      if (!btn) return 'no-submit-button';
      btn.click();
      for (let i = 0; i < 50; i++) {
        await new Promise(r => setTimeout(r, 400));
        const t = document.body.innerText;
        if (t.includes('berhasil ditambahkan')) return 'saved';
        if (t.includes('wajib diisi')) return 'validation-failed';
        if (t.includes('Sesi admin habis')) return 'unauthorized';
        if (t.includes('Gagal') && t.includes('duplicate')) return 'duplicate';
      }
      return 'timeout';
    })()`
  );
  log('9b. simpan produk:', saveResult);

  await navigate(send, `${BASE}/admin/produk?q=${encodeURIComponent(TEST_LABEL)}`);
  const listed = await evaluate(
    send,
    `({ rows: document.querySelectorAll('main tbody tr').length,
        text: document.querySelector('main tbody')?.innerText ?? '',
        img: document.querySelector('main tbody img')?.getAttribute('src') ?? '' })`
  );
  log('9c. muncul di daftar:', JSON.stringify({ rows: listed.rows, img: listed.img }));
  log('   screenshot:', await shot(send, '09-produk-baru-terdaftar'));

  const deleteResult = await evaluate(
    send,
    `(async () => {
      const rows = Array.from(document.querySelectorAll('main tbody tr'));
      const row = rows.find(tr => tr.innerText.includes(${JSON.stringify(TEST_LABEL)}));
      if (!row) return 'row-not-found';
      const btn = row.querySelector('button[aria-label^="Hapus"]');
      if (!btn) return 'delete-button-not-found';
      btn.click();
      for (let i = 0; i < 50; i++) {
        await new Promise(r => setTimeout(r, 400));
        if (document.querySelectorAll('main tbody tr').length === 0) return 'deleted';
        const t = document.body.innerText;
        if (t.includes('Tidak ada produk yang cocok')) return 'deleted';
        if (t.includes('Gagal menghapus')) return 'delete-failed';
      }
      return 'timeout';
    })()`
  );
  log('9d. hapus produk:', deleteResult);

  // Aset Cloudinary ikut terhapus? Cek langsung ke URL transformasinya.
  const assetCheck = await evaluate(
    send,
    `(async () => {
      const publicId = ${JSON.stringify(uploadResult?.publicId ?? '')};
      if (!publicId) return { ok: false, why: 'publicId kosong' };
      const sign = await (await fetch('/api/cloudinary/sign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: 'produk' })
      })).json();
      const url = 'https://res.cloudinary.com/' + sign.cloudName + '/image/upload/f_auto,q_auto,w_400,c_fill/' + publicId;
      // Invalidate + propagasi CDN bisa makan waktu beberapa detik,
      // jadi coba berulang sampai benar-benar 404.
      let status = 0;
      for (let i = 0; i < 24; i++) {
        const res = await fetch(url, { cache: 'no-store' });
        status = res.status;
        if (status === 404) break;
        await new Promise(r => setTimeout(r, 1000));
      }
      return { ok: status === 404, status, url };
    })()`
  );
  log('9e. aset Cloudinary ikut terhapus:', JSON.stringify(assetCheck));

  log('\n=== CONSOLE ERRORS ===');
  log(consoleErrors.length === 0 ? '(tidak ada)' : consoleErrors.join('\n'));
  log(`\nScreenshot tersimpan di: ${OUT}`);
  process.exit(0);
} catch (error) {
  console.error('GAGAL:', error.stack ?? error.message);
  if (consoleErrors.length) console.error('Console errors:\n' + consoleErrors.join('\n'));
  process.exit(1);
}
