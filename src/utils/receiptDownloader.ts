import { TransactionRecord, formatRupiah } from '../types/ppob';

export function downloadReceiptImage(data: TransactionRecord) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 640;
  const isToken = Boolean(data.tokenCode);
  const height = isToken ? 920 : 820;

  // High-DPI / Retina scale 2x
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = '#B4432C';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Header band
  ctx.fillStyle = '#B4432C';
  ctx.fillRect(16, 16, width - 32, 64);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PT HESOLVIAN PEMBAYARAN NUSANTARA', width / 2, 44);

  ctx.font = '600 11px sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('LOKET RESMI PPOB & MULTIASET TRANSAKSI', width / 2, 64);

  // Receipt title
  let y = 110;
  ctx.fillStyle = '#2C211D';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STRUK BUKTI TRANSAKSI PEMBAYARAN SAH', width / 2, y);

  y += 24;
  ctx.fillStyle = '#1F7A54';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('STATUS: ' + data.statusLabel.toUpperCase() + ' (LUNAS)', width / 2, y);

  // Dashed separator line
  y += 16;
  drawDashedLine(ctx, 30, y, width - 30, y);

  // Metadata block
  y += 26;
  const leftX = 40;
  const rightX = width - 40;

  ctx.textAlign = 'left';
  ctx.font = '13px monospace';
  ctx.fillStyle = '#6B5A53';

  const rows1 = [
    ['No. Transaksi', data.id],
    ['Waktu Transaksi', data.createdAt],
    ['Status Mutasi', data.clearedAt],
    ['Kategori', data.category],
    ['Nama Produk', data.product],
    ['No. Tujuan / IDPEL', data.custId],
    ['Nama Pelanggan', data.custName],
    ['Tarif / Daya', data.tarif],
    ['No. Ref Biller', data.refCode],
  ];

  rows1.forEach(([k, v]) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B5A53';
    ctx.font = '12px sans-serif';
    ctx.fillText(k, leftX, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#2C211D';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(String(v), rightX, y);
    y += 22;
  });

  // Token Box (if applicable)
  if (data.tokenCode) {
    y += 10;
    ctx.fillStyle = '#FBF6EF';
    ctx.strokeStyle = '#E8DDD2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(36, y, width - 72, 70, 10);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#B4432C';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(data.tokenLabel || 'STROOM TOKEN PLN RESMI (20 DIGIT)', width / 2, y + 20);

    ctx.fillStyle = '#2C211D';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(data.tokenCode, width / 2, y + 46);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#6B5A53';
    ctx.fillText('Masukkan 20 digit di atas ke kWh meteran Anda lalu tekan Enter', width / 2, y + 62);
    y += 82;
  }

  // Payment Calculation
  y += 6;
  drawDashedLine(ctx, 30, y, width - 30, y);
  y += 24;

  const rows2 = [
    ['Harga Pokok Produk', formatRupiah(data.priceBase)],
    ['Biaya Layanan & Admin', formatRupiah(data.adminFee)],
  ];

  if (data.discount > 0) {
    rows2.push(['Diskon Promo (HESOLHEMAT)', '-' + formatRupiah(data.discount)]);
  }

  rows2.forEach(([k, v]) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B5A53';
    ctx.font = '12px sans-serif';
    ctx.fillText(k, leftX, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#2C211D';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(v, rightX, y);
    y += 22;
  });

  // Total Bayar Highlight
  y += 6;
  ctx.fillStyle = '#FCEAE5';
  ctx.beginPath();
  ctx.roundRect(36, y, width - 72, 46, 8);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#B4432C';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('TOTAL PEMBAYARAN', leftX + 10, y + 28);

  ctx.textAlign = 'right';
  ctx.font = 'extrabold 20px sans-serif';
  ctx.fillText(formatRupiah(data.total), rightX - 10, y + 29);

  y += 60;
  drawDashedLine(ctx, 30, y, width - 30, y);

  // Footer notes
  y += 20;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6B5A53';
  ctx.font = '10px sans-serif';
  ctx.fillText('Struk ini merupakan bukti pelunasan sah elektronik yang diterbitkan otomatis.', width / 2, y);

  y += 16;
  ctx.fillStyle = '#9B8A82';
  ctx.font = '10px monospace';
  ctx.fillText(`Kanal: ${data.method} · Reconcile: ${data.reconcileId}`, width / 2, y);

  y += 16;
  ctx.font = '10px sans-serif';
  ctx.fillText('Layanan CS 24 Jam WhatsApp: 0812-0011-0022 · www.hesolvian.com', width / 2, y);

  // Trigger Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `struk-hesolvian-${data.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export function downloadQrisStandImage(data: TransactionRecord) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 500;
  const height = 660;
  const scale = 2;

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Border card
  ctx.strokeStyle = '#E8DDD2';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(16, 16, width - 32, height - 32, 20);
  ctx.stroke();

  // QRIS Red Banner Header
  ctx.fillStyle = '#BA1A1A';
  ctx.beginPath();
  ctx.roundRect(30, 30, width - 60, 44, 10);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('QRIS', 46, 59);

  ctx.textAlign = 'right';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('PEMBAYARAN NASIONAL', width - 46, 57);

  // Merchant Name (NEVER CUT OFF!)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2C211D';
  ctx.font = 'bold 14px sans-serif';
  const merchantName = data.qrisData?.merchantName || 'Hesolvian Payment / PT Hesolvian Nusantara';
  ctx.fillText(merchantName, width / 2, 102);

  ctx.fillStyle = '#8A716C';
  ctx.font = '11px monospace';
  ctx.fillText(`NMID: ${data.qrisData?.nmid || 'ID1020039281920'}`, width / 2, 120);

  // QR matrix box
  const qrX = (width - 280) / 2;
  const qrY = 135;
  ctx.fillStyle = '#FAFAFA';
  ctx.strokeStyle = '#E8DDD2';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, 280, 280, 14);
  ctx.fill();
  ctx.stroke();

  // Draw QR Modules representation
  drawQrModules(ctx, qrX + 15, qrY + 15, 250);

  // Total Payment
  let y = 445;
  ctx.fillStyle = '#FBF0D8';
  ctx.beginPath();
  ctx.roundRect(40, y, width - 80, 72, 12);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#9A6B12';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('TOTAL PEMBAYARAN TEPAT (TERMASUK KODE UNIK)', width / 2, y + 25);

  ctx.fillStyle = '#B4432C';
  ctx.font = 'extrabold 26px sans-serif';
  ctx.fillText(formatRupiah(data.total), width / 2, y + 54);

  // Instruction & Footer
  y = 540;
  ctx.fillStyle = '#6B5A53';
  ctx.font = '11px sans-serif';
  ctx.fillText('Scan kode QR ini menggunakan BCA, Mandiri, BRI, GoPay, OVO, DANA', width / 2, y);

  y += 20;
  ctx.fillStyle = '#1F7A54';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('✓ Dicetak otomatis oleh Bank Indonesia & GPN', width / 2, y);

  y += 24;
  ctx.fillStyle = '#9B8A82';
  ctx.font = '10px monospace';
  ctx.fillText(`ID Transaksi: ${data.id}`, width / 2, y);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qris-hesolvian-${data.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  ctx.save();
  ctx.strokeStyle = '#D6C2BC';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawQrModules(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cellSize = size / 25;
  ctx.fillStyle = '#2C211D';

  // 3 Corner Finders
  drawFinder(ctx, x, y, cellSize);
  drawFinder(ctx, x + cellSize * 18, y, cellSize);
  drawFinder(ctx, x, y + cellSize * 18, cellSize);

  // Simulated pseudo modules
  for (let r = 0; r < 25; r++) {
    for (let c = 0; c < 25; c++) {
      if (
        (r <= 7 && c <= 7) ||
        (r <= 7 && c >= 17) ||
        (r >= 17 && c <= 7)
      ) {
        continue;
      }
      // GPN center space
      if (r >= 10 && r <= 14 && c >= 10 && c <= 14) {
        continue;
      }

      if ((r * 13 + c * 17 + 7) % 3 === 0 || (r === 6 || c === 6)) {
        ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize - 0.5, cellSize - 0.5);
      }
    }
  }

  // GPN Center Red Icon
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.fillStyle = '#BA1A1A';
  ctx.beginPath();
  ctx.roundRect(cx - 20, cy - 14, 40, 28, 4);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('GPN', cx, cy + 4);
}

function drawFinder(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number) {
  ctx.fillStyle = '#2C211D';
  ctx.fillRect(x, y, cellSize * 7, cellSize * 7);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);

  ctx.fillStyle = '#2C211D';
  ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
}

export function printReceipt(data: TransactionRecord, onDone?: () => void) {
  // Create an isolated printing iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    onDone?.();
    return;
  }

  const tokenHtml = data.tokenCode
    ? `
      <div class="token-box">
        <div class="token-title">${data.tokenLabel || 'TOKEN / SERIAL NUMBER RESMI'}</div>
        <div class="token-num">${data.tokenCode}</div>
        <div class="token-desc">${data.tokenSub || 'Masukkan kode di atas ke meteran Anda'}</div>
      </div>
    `
    : '';

  const discountHtml = data.discount > 0
    ? `<div class="row"><span>DISKON PROMO:</span><span class="val">-${formatRupiah(data.discount)}</span></div>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>Struk Pembayaran Hesolvian - ${data.id}</title>
        <style>
          @page {
            size: auto;
            margin: 4mm 6mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Courier New', Courier, monospace;
          }
          body {
            background: #fff;
            color: #000;
            padding: 8px 12px;
            font-size: 12px;
            line-height: 1.35;
          }
          .receipt {
            max-width: 340px;
            margin: 0 auto;
            border: 1px dashed #555;
            padding: 14px 12px;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #666;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .header h1 {
            font-size: 13.5px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .header p {
            font-size: 9.5px;
            color: #333;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 11px;
          }
          .row .val {
            font-weight: bold;
            text-align: right;
            word-break: break-all;
          }
          .divider {
            border-top: 1px dashed #777;
            margin: 7px 0;
          }
          .token-box {
            background: #f5f5f5;
            border: 1px solid #999;
            border-radius: 4px;
            padding: 8px 6px;
            text-align: center;
            margin: 8px 0;
          }
          .token-title {
            font-size: 9.5px;
            font-weight: bold;
            color: #333;
          }
          .token-num {
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 1px;
            margin: 4px 0;
            word-break: break-all;
          }
          .token-desc {
            font-size: 8.5px;
            color: #555;
          }
          .total {
            font-size: 13.5px;
            font-weight: bold;
            border-top: 1px dashed #444;
            padding-top: 5px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            font-size: 9px;
            color: #444;
            margin-top: 10px;
            border-top: 1px dashed #666;
            padding-top: 6px;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>PT HESOLVIAN PEMBAYARAN NUSANTARA</h1>
            <p>LOKET RESMI PPOB & MULTIASET TRANSAKSI</p>
            <p>SETTLEMENT GATEWAY SERVER ID: 103.14.88.21</p>
          </div>

          <div class="row"><span>NO. TRANSAKSI:</span><span class="val">${data.id}</span></div>
          <div class="row"><span>TANGGAL/WAKTU:</span><span class="val">${data.createdAt}</span></div>
          <div class="row"><span>STATUS:</span><span class="val">${data.statusLabel.toUpperCase()} (LUNAS)</span></div>
          <div class="row"><span>RECONCILE:</span><span class="val">${data.reconcileId}</span></div>

          <div class="divider"></div>

          <div class="row"><span>ID PELANGGAN:</span><span class="val">${data.custId}</span></div>
          <div class="row"><span>NAMA:</span><span class="val">${data.custName}</span></div>
          <div class="row"><span>PRODUK:</span><span class="val">${data.product}</span></div>
          <div class="row"><span>TARIF/DAYA:</span><span class="val">${data.tarif}</span></div>
          <div class="row"><span>REF BILLER:</span><span class="val">${data.refCode}</span></div>

          ${tokenHtml}

          <div class="divider"></div>

          <div class="row"><span>HARGA POKOK:</span><span class="val">${formatRupiah(data.priceBase)}</span></div>
          <div class="row"><span>BIAYA ADMIN:</span><span class="val">${formatRupiah(data.adminFee)}</span></div>
          ${discountHtml}

          <div class="row total">
            <span>TOTAL BAYAR:</span>
            <span>${formatRupiah(data.total)}</span>
          </div>

          <div class="footer">
            <p>STRUK INI MERUPAKAN BUKTI PEMBAYARAN SAH</p>
            <p>Kanal: ${data.method}</p>
            <p>Layanan CS 24 Jam WhatsApp: 0812-0011-0022</p>
            <p>Terima kasih atas transaksi Anda di Hesolvian</p>
          </div>
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  // Trigger print after styles render
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      onDone?.();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 250);
}
