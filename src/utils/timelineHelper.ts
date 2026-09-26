import { TransactionRecord } from '../types/ppob';

export type ProductKind =
  | 'pulsa'
  | 'data'
  | 'pln'
  | 'pdam'
  | 'emoney'
  | 'bpjs'
  | 'internet'
  | 'game'
  | 'general';

export function detectProductKind(data: {
  category?: string;
  categoryCode?: string;
  product?: string;
}): ProductKind {
  const code = (data.categoryCode || '').toLowerCase();
  const cat = (data.category || '').toLowerCase();
  const prod = (data.product || '').toLowerCase();

  // 1. Paket Data (check before Pulsa so "Pulsa & Paket Data" or "Data Max" matches data)
  if (
    code.includes('data') ||
    prod.includes('paket data') ||
    prod.includes('data max') ||
    prod.includes('kuota') ||
    prod.includes(' gb') ||
    prod.includes('gb ') ||
    cat.includes('paket data')
  ) {
    return 'data';
  }

  // 2. Pulsa
  if (code.includes('pulsa') || cat.includes('pulsa') || prod.includes('pulsa')) {
    return 'pulsa';
  }

  // 3. PLN / Token Listrik
  if (
    code.includes('pln') ||
    cat.includes('pln') ||
    prod.includes('pln') ||
    prod.includes('token') ||
    prod.includes('listrik')
  ) {
    return 'pln';
  }

  // 4. PDAM / Tagihan Air
  if (
    code.includes('pdam') ||
    cat.includes('pdam') ||
    prod.includes('pdam') ||
    prod.includes('tagihan air')
  ) {
    return 'pdam';
  }

  // 5. Uang elektronik & kartu e-Toll.
  // Kategori uang elektronik disatukan jadi `emoney`; kode lama per penyedia
  // (gopay, ovo, dst.) tetap dikenali supaya riwayat lawas tidak salah jenis.
  if (
    code.includes('emoney') ||
    code.includes('wallet') ||
    code.includes('gopay') ||
    code.includes('ovo') ||
    code.includes('dana') ||
    code.includes('shopeepay') ||
    code.includes('linkaja') ||
    code.includes('etoll') ||
    cat.includes('e-wallet') ||
    cat.includes('emoney') ||
    cat.includes('e-toll') ||
    prod.includes('top up') ||
    prod.includes('dana') ||
    prod.includes('gopay') ||
    prod.includes('ovo') ||
    prod.includes('shopeepay') ||
    prod.includes('linkaja') ||
    prod.includes('e-toll')
  ) {
    return 'emoney';
  }

  // 6. BPJS
  if (code.includes('bpjs') || cat.includes('bpjs') || prod.includes('bpjs')) {
    return 'bpjs';
  }

  // 7. Internet & TV
  if (
    code.includes('internet') ||
    cat.includes('internet') ||
    prod.includes('indihome') ||
    prod.includes('wifi') ||
    prod.includes('tv kabel')
  ) {
    return 'internet';
  }

  // 8. Voucher Game
  if (
    code.includes('game') ||
    cat.includes('game') ||
    prod.includes('game') ||
    prod.includes('diamond') ||
    prod.includes('mobile legends')
  ) {
    return 'game';
  }

  return 'general';
}

export function getProductStepDefinitions(kind: ProductKind) {
  switch (kind) {
    case 'pulsa':
      return [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'Transaksi berhasil dibuat', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran berhasil diverifikasi', icon: 'check_circle' },
        { step: 3, title: 'Memproses Pulsa', subtitle: 'Permintaan sedang diproses oleh provider', icon: 'sync' },
        { step: 4, title: 'Pulsa Berhasil Dikirim', subtitle: 'Pulsa berhasil dikirim ke nomor tujuan', icon: 'cell_tower' },
      ];
    case 'data':
      return [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'Transaksi berhasil dibuat', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran berhasil diverifikasi', icon: 'check_circle' },
        { step: 3, title: 'Memproses Paket Data', subtitle: 'Permintaan sedang diproses oleh provider', icon: 'sync' },
        { step: 4, title: 'Paket Data Berhasil Dikirim', subtitle: 'Paket data berhasil dikirim ke nomor tujuan', icon: 'signal_cellular_alt' },
      ];
    case 'pln':
      return [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'Transaksi berhasil dibuat', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran berhasil diverifikasi', icon: 'check_circle' },
        { step: 3, title: 'Memproses Token PLN', subtitle: 'Permintaan sedang diproses oleh provider', icon: 'sync' },
        { step: 4, title: 'Token PLN Berhasil Diterbitkan', subtitle: 'Token PLN berhasil diterbitkan', icon: 'bolt' },
      ];
    case 'pdam':
      return [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'Transaksi berhasil dibuat', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran berhasil diverifikasi', icon: 'check_circle' },
        { step: 3, title: 'Memproses Pembayaran Tagihan', subtitle: 'Permintaan sedang diproses oleh PDAM', icon: 'sync' },
        { step: 4, title: 'Pembayaran Tagihan Berhasil', subtitle: 'Tagihan air berhasil dilunasi', icon: 'water_drop' },
      ];
    case 'emoney':
      return [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'Transaksi berhasil dibuat', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran berhasil diverifikasi', icon: 'check_circle' },
        { step: 3, title: 'Memproses Top Up', subtitle: 'Saldo sedang ditransfer ke e-wallet', icon: 'sync' },
        { step: 4, title: 'Top Up Berhasil', subtitle: 'Saldo berhasil masuk ke akun', icon: 'account_balance_wallet' },
      ];
    case 'bpjs':
      return [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'Transaksi berhasil dibuat', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran berhasil diverifikasi', icon: 'check_circle' },
        { step: 3, title: 'Memproses Pembayaran', subtitle: 'Iuran BPJS sedang diproses', icon: 'sync' },
        { step: 4, title: 'Tagihan Berhasil Dibayar', subtitle: 'Pembayaran iuran BPJS berhasil diverifikasi', icon: 'health_and_safety' },
      ];
    case 'internet':
      return [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'Transaksi berhasil dibuat', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran berhasil diverifikasi', icon: 'check_circle' },
        { step: 3, title: 'Memproses Tagihan Internet', subtitle: 'Tagihan sedang diproses oleh provider', icon: 'sync' },
        { step: 4, title: 'Tagihan Berhasil Dibayar', subtitle: 'Layanan internet aktif normal', icon: 'router' },
      ];
    case 'game':
      return [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'Transaksi berhasil dibuat', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran berhasil diverifikasi', icon: 'check_circle' },
        { step: 3, title: 'Memproses Voucher Game', subtitle: 'Permintaan sedang diproses oleh provider', icon: 'sync' },
        { step: 4, title: 'Voucher Game Berhasil Dikirim', subtitle: 'Item game berhasil masuk ke akun', icon: 'sports_esports' },
      ];
    default:
      return [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'Transaksi berhasil dibuat', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaran berhasil diverifikasi', icon: 'check_circle' },
        { step: 3, title: 'Memproses Transaksi', subtitle: 'Permintaan sedang diproses oleh provider', icon: 'sync' },
        { step: 4, title: 'Transaksi Berhasil', subtitle: 'Pesanan berhasil diselesaikan', icon: 'verified' },
      ];
  }
}

export function buildDynamicTimeline(data: TransactionRecord) {
  const kind = detectProductKind(data);
  const defs = getProductStepDefinitions(kind);

  // Determine active step index (1 to 4)
  let activeStep = 4;
  if (data.status === 'success') {
    activeStep = 4;
  } else if (data.status === 'processing') {
    activeStep = 3;
  } else if (data.status === 'pending') {
    activeStep = 2;
  } else if (data.status === 'failed') {
    activeStep = data.stepActive || 3;
  }

  // Extract clean times
  const time1 =
    data.steps?.[0]?.time && data.steps[0].time !== '-'
      ? data.steps[0].time
      : data.createdAt?.includes(',')
      ? data.createdAt.split(', ')[1]
      : '14:20:12 WIB';

  const time2 =
    data.steps?.[1]?.time && data.steps[1].time !== '-'
      ? data.steps[1].time
      : '14:20:21 WIB';

  const time3 =
    data.status === 'processing'
      ? 'Sedang Berjalan'
      : data.steps?.[2]?.time && data.steps[2].time !== '-'
      ? data.steps[2].time
      : '14:20:26 WIB';

  const time4 =
    data.status === 'success'
      ? data.steps?.[3]?.time && data.steps[3].time !== '-'
        ? data.steps[3].time
        : data.clearedAt?.includes(',')
        ? data.clearedAt.split(', ')[1]
        : '14:20:29 WIB'
      : '-';

  const times = [time1, time2, time3, time4];

  const steps = defs.map((d, index) => {
    const stepNum = index + 1;
    let status: 'completed' | 'active' | 'waiting' = 'waiting';

    if (data.status === 'success') {
      status = 'completed';
    } else if (data.status === 'failed') {
      if (stepNum < activeStep) status = 'completed';
      else if (stepNum === activeStep) status = 'active';
      else status = 'waiting';
    } else {
      if (stepNum < activeStep) {
        status = 'completed';
      } else if (stepNum === activeStep) {
        status = 'active';
      } else {
        status = 'waiting';
      }
    }

    return {
      ...d,
      time: times[index] || '-',
      status
    };
  });

  // Label status di atas timeline (dinamis sesuai spesifikasi)
  let progressLabel = 'Selesai • 4 dari 4 tahap';
  if (data.status === 'success') {
    progressLabel = 'Selesai • 4 dari 4 tahap';
  } else if (data.status === 'processing') {
    progressLabel = `Sedang Diproses • ${activeStep} dari 4 tahap`;
  } else if (data.status === 'pending') {
    progressLabel = 'Menunggu Pembayaran';
  } else if (data.status === 'failed') {
    progressLabel = 'Transaksi Gagal';
  }

  // Header badge label
  let headerBadgeText = 'BERHASIL • SELESAI';
  let headerBadgeBg = 'bg-[#E4F3EC] text-[#1F7A54] border-[#1F7A54]/20';
  let dotBg = 'bg-[#1F7A54]';

  if (data.status === 'success') {
    headerBadgeText = 'BERHASIL • SELESAI';
    headerBadgeBg = 'bg-[#E4F3EC] text-[#1F7A54] border-[#1F7A54]/20';
    dotBg = 'bg-[#1F7A54]';
  } else if (data.status === 'processing') {
    headerBadgeText = 'SEDANG DIPROSES';
    headerBadgeBg = 'bg-[#FCEAE5] text-[#B4432C] border-[#B4432C]/20';
    dotBg = 'bg-[#B4432C] animate-ping';
  } else if (data.status === 'pending') {
    headerBadgeText = 'MENUNGGU PEMBAYARAN';
    headerBadgeBg = 'bg-[#FFF8E1] text-[#D97706] border-[#D97706]/20';
    dotBg = 'bg-[#D97706] animate-ping';
  } else if (data.status === 'failed') {
    headerBadgeText = 'TRANSAKSI GAGAL';
    headerBadgeBg = 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20';
    dotBg = 'bg-[#DC2626]';
  }

  // Header status text (replacing "Status Mutasi" with "Status Transaksi")
  let statusDetailText = `Berhasil diproses dalam ${data.durationText || '17 detik'}`;
  if (data.status === 'processing') {
    statusDetailText = 'Sedang diproses oleh provider';
  } else if (data.status === 'pending') {
    statusDetailText = 'Menunggu konfirmasi pembayaran';
  } else if (data.status === 'failed') {
    statusDetailText = 'Transaksi dibatalkan / gagal';
  }

  return {
    steps,
    activeStep,
    progressLabel,
    headerBadgeText,
    headerBadgeBg,
    dotBg,
    statusDetailText,
    productKind: kind
  };
}
