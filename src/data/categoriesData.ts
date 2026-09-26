export interface NomItem {
  l: string;
  d: string;
  p: number;
  variable?: boolean;
}

export interface NomGroup {
  name: string;
  items: NomItem[];
}

export interface CategoryData {
  id: string;
  name: string;
  desc: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  field: {
    label: string;
    ph: string;
    hint: string;
  };
  admin: number;
  groups: NomGroup[];
}

export const CATEGORIES_DATA: CategoryData[] = [
  {
    id: 'pulsa',
    name: 'Pulsa',
    desc: 'Semua operator, harga terbaik',
    iconName: 'smartphone',
    iconBg: '#FFEAE4',
    iconColor: '#E2694A',
    field: {
      label: 'Nomor Handphone',
      ph: '08xxxxxxxxxx',
      hint: 'Operator terdeteksi otomatis (Telkomsel, Indosat, XL, Tri, Smartfren).'
    },
    admin: 0,
    groups: [
      {
        name: 'Nominal Pulsa',
        items: [
          { l: 'Pulsa 5.000', d: 'Masa aktif +7 hari', p: 6500 },
          { l: 'Pulsa 10.000', d: 'Masa aktif +14 hari', p: 11500 },
          { l: 'Pulsa 15.000', d: 'Masa aktif +14 hari', p: 16500 },
          { l: 'Pulsa 20.000', d: 'Masa aktif +30 hari', p: 21000 },
          { l: 'Pulsa 25.000', d: 'Masa aktif +30 hari', p: 26000 },
          { l: 'Pulsa 50.000', d: 'Masa aktif +45 hari', p: 50500 },
          { l: 'Pulsa 100.000', d: 'Masa aktif +60 hari', p: 99500 }
        ]
      }
    ]
  },
  {
    id: 'data',
    name: 'Paket Data',
    desc: 'Internet lebih hemat, proses instan',
    iconName: 'signal_cellular_alt',
    iconBg: '#E3F4FC',
    iconColor: '#0891B2',
    field: {
      label: 'Nomor Handphone',
      ph: '08xxxxxxxxxx',
      hint: 'Paket aktif maksimal 5 menit setelah mutasi terverifikasi.'
    },
    admin: 0,
    groups: [
      {
        name: 'Kuota Harian',
        items: [
          { l: '1 GB / 3 Hari', d: 'Kuota utama 24 jam', p: 12000 },
          { l: '2 GB / 7 Hari', d: 'Kuota utama 24 jam', p: 19000 }
        ]
      },
      {
        name: 'Kuota Bulanan',
        items: [
          { l: '5 GB / 30 Hari', d: 'Kuota utama 24 jam', p: 40000 },
          { l: '10 GB / 30 Hari', d: 'Kuota utama 24 jam', p: 65000 },
          { l: '15 GB / 30 Hari', d: 'Kuota utama + aplikasi', p: 80000 },
          { l: '25 GB / 30 Hari', d: 'Kuota utama 24 jam', p: 95000 },
          { l: '50 GB / 30 Hari', d: 'Kuota utama 24 jam', p: 135000 },
          { l: 'Unlimited 30 Hari', d: 'FUP 2 GB/hari', p: 120000 }
        ]
      }
    ]
  },
  {
    id: 'pln',
    name: 'PLN',
    desc: 'Bayar tagihan listrik dengan mudah',
    iconName: 'bolt',
    iconBg: '#FFF8E1',
    iconColor: '#F59E0B',
    field: {
      label: 'Nomor Meter / ID Pelanggan',
      ph: '14123456789',
      hint: '11-12 digit angka pada meteran atau kartu pelanggan.'
    },
    admin: 2500,
    groups: [
      {
        name: 'Token Prabayar',
        items: [
          { l: 'Token 20.000', d: '± 14,3 kWh', p: 22500 },
          { l: 'Token 50.000', d: '± 35,8 kWh', p: 52500 },
          { l: 'Token 100.000', d: '± 71,6 kWh', p: 102500 },
          { l: 'Token 200.000', d: '± 143 kWh', p: 202500 },
          { l: 'Token 500.000', d: '± 358 kWh', p: 502500 },
          { l: 'Token 1.000.000', d: '± 716 kWh', p: 1002500 }
        ]
      },
      {
        name: 'Pascabayar',
        items: [{ l: 'Tagihan Bulan Ini', d: 'Nominal sesuai tagihan berjalan', p: 0, variable: true }]
      }
    ]
  },
  {
    id: 'pdam',
    name: 'PDAM',
    desc: 'Bayar tagihan air kapan saja',
    iconName: 'water_drop',
    iconBg: '#E0F7FA',
    iconColor: '#0097A7',
    field: {
      label: 'ID Pelanggan PDAM',
      ph: '1102003456',
      hint: 'Nomor tertera pada struk atau kartu pelanggan PDAM.'
    },
    admin: 2500,
    groups: [
      {
        name: 'Tagihan Air',
        items: [
          { l: 'Tagihan Bulan Ini', d: 'Nominal sesuai tagihan', p: 0, variable: true },
          { l: 'Estimasi RT A1', d: '± 10 m³ pemakaian', p: 67500 },
          { l: 'Estimasi RT A2', d: '± 15 m³ pemakaian', p: 98500 },
          { l: 'Estimasi RT B', d: '± 20 m³ pemakaian', p: 142500 }
        ]
      }
    ]
  },
  {
    id: 'bpjs',
    name: 'BPJS',
    desc: 'Kesehatan & Ketenagakerjaan',
    iconName: 'favorite',
    iconBg: '#FCE4EC',
    iconColor: '#E91E63',
    field: {
      label: 'Nomor Kartu BPJS',
      ph: '0001234567890',
      hint: '13 digit nomor peserta BPJS Kesehatan / Ketenagakerjaan.'
    },
    admin: 2500,
    groups: [
      {
        name: 'BPJS Kesehatan',
        items: [
          { l: 'Kelas I - 1 Bulan', d: 'Rp150.000 / jiwa', p: 152500 },
          { l: 'Kelas II - 1 Bulan', d: 'Rp100.000 / jiwa', p: 102500 },
          { l: 'Kelas III - 1 Bulan', d: 'Rp35.000 / jiwa', p: 37500 },
          { l: 'Kelas I - 3 Bulan', d: 'Rp450.000 / jiwa', p: 452500 },
          { l: 'Kelas II - 3 Bulan', d: 'Rp300.000 / jiwa', p: 302500 },
          { l: 'Kelas III - 3 Bulan', d: 'Rp105.000 / jiwa', p: 107500 }
        ]
      },
      {
        name: 'BPJS Ketenagakerjaan',
        items: [
          { l: 'BPU - 1 Bulan', d: 'Bukan Penerima Upah', p: 39300 },
          { l: 'Tagihan Berjalan', d: 'Sesuai tagihan berjalan', p: 0, variable: true }
        ]
      }
    ]
  },
  {
    id: 'internet',
    name: 'Pembayaran Internet',
    desc: 'Tagihan Indihome, First Media, dll',
    iconName: 'wifi',
    iconBg: '#EDE7F6',
    iconColor: '#7C3AED',
    field: {
      label: 'Nomor Pelanggan Internet',
      ph: '1234567890',
      hint: 'Nomor ID pelanggan tertera di tagihan bulanan.'
    },
    admin: 2500,
    groups: [
      {
        name: 'Paket Langganan',
        items: [
          { l: 'IndiHome 30 Mbps', d: 'Internet + TV interaktif', p: 302500 },
          { l: 'IndiHome 50 Mbps', d: 'Internet + TV + Telepon', p: 387500 },
          { l: 'Biznet 100 Mbps', d: 'Internet broadband super cepat', p: 375500 },
          { l: 'First Media 50 Mbps', d: 'Internet + TV kabel HD', p: 291500 },
          { l: 'MyRepublic 100 Mbps', d: 'Internet gaming low latency', p: 332500 }
        ]
      },
      {
        name: 'Lainnya',
        items: [{ l: 'Tagihan Bulan Ini', d: 'Sesuai nominal tagihan provider', p: 0, variable: true }]
      }
    ]
  },
  /*
   * Satu kategori gabungan "E-Wallet" seperti tampilan lama, tapi tiap dompet
   * (GoPay, OVO, DANA, ShopeePay, LinkAja, e-Toll) jadi grup/tab terpisah di
   * dalamnya — jadi nominal "Top Up 50.000" tetap jelas milik dompet mana.
   */
  {
    id: 'emoney',
    name: 'E-Wallet',
    desc: 'Top up e-wallet lebih praktis',
    iconName: 'account_balance_wallet',
    iconBg: '#E8EEF7',
    iconColor: '#0B5FA5',
    field: {
      label: 'Nomor HP / ID E-Wallet',
      ph: '08xxxxxxxxxx',
      hint: 'Gunakan nomor HP terdaftar di aplikasi e-wallet; untuk e-Toll isi 16 digit nomor kartu.'
    },
    admin: 1000,
    groups: [
      {
        name: 'GoPay',
        items: [
          { l: 'Top Up 20.000', d: 'GoPay', p: 21000 },
          { l: 'Top Up 50.000', d: 'GoPay', p: 51000 },
          { l: 'Top Up 100.000', d: 'GoPay', p: 101000 },
          { l: 'Top Up 200.000', d: 'GoPay', p: 201000 },
          { l: 'Top Up 500.000', d: 'GoPay', p: 501000 }
        ]
      },
      {
        name: 'OVO',
        items: [
          { l: 'Top Up 20.000', d: 'OVO', p: 21000 },
          { l: 'Top Up 50.000', d: 'OVO', p: 51000 },
          { l: 'Top Up 100.000', d: 'OVO', p: 101000 },
          { l: 'Top Up 200.000', d: 'OVO', p: 201000 },
          { l: 'Top Up 500.000', d: 'OVO', p: 501000 }
        ]
      },
      {
        name: 'DANA',
        items: [
          { l: 'Top Up 20.000', d: 'DANA', p: 21000 },
          { l: 'Top Up 50.000', d: 'DANA', p: 51000 },
          { l: 'Top Up 100.000', d: 'DANA', p: 101000 },
          { l: 'Top Up 200.000', d: 'DANA', p: 201000 },
          { l: 'Top Up 500.000', d: 'DANA', p: 501000 }
        ]
      },
      {
        name: 'ShopeePay',
        items: [
          { l: 'Top Up 20.000', d: 'ShopeePay', p: 21000 },
          { l: 'Top Up 50.000', d: 'ShopeePay', p: 51000 },
          { l: 'Top Up 100.000', d: 'ShopeePay', p: 101000 },
          { l: 'Top Up 200.000', d: 'ShopeePay', p: 201000 },
          { l: 'Top Up 500.000', d: 'ShopeePay', p: 501000 }
        ]
      },
      {
        name: 'LinkAja',
        items: [
          { l: 'Top Up 20.000', d: 'LinkAja', p: 21000 },
          { l: 'Top Up 50.000', d: 'LinkAja', p: 51000 },
          { l: 'Top Up 100.000', d: 'LinkAja', p: 101000 },
          { l: 'Top Up 200.000', d: 'LinkAja', p: 201000 },
          { l: 'Top Up 500.000', d: 'LinkAja', p: 501000 }
        ]
      },
      {
        name: 'e-Toll',
        items: [
          { l: 'e-Toll 50.000', d: 'Mandiri e-Money / TapCash / Flazz', p: 51000 },
          { l: 'e-Toll 100.000', d: 'Mandiri e-Money / TapCash / Flazz', p: 101000 },
          { l: 'e-Toll 200.000', d: 'Mandiri e-Money / TapCash / Flazz', p: 201000 }
        ]
      }
    ]
  },
  {
    id: 'multi',
    name: 'Multifinance',
    desc: 'Bayar cicilan motor, mobil, dll',
    iconName: 'directions_car',
    iconBg: '#FFF3E0',
    iconColor: '#EA580C',
    field: {
      label: 'Nomor Kontrak Perjanjian',
      ph: '001234567890',
      hint: 'Nomor kontrak tertera pada buku angsuran nasabah.'
    },
    admin: 3500,
    groups: [
      {
        name: 'Angsuran Kendaraan',
        items: [
          { l: 'FIF Group', d: 'Angsuran motor Honda', p: 853500 },
          { l: 'Adira Finance', d: 'Angsuran motor / mobil', p: 1253500 },
          { l: 'BAF', d: 'Angsuran motor Yamaha', p: 753500 },
          { l: 'WOM Finance', d: 'Angsuran pembiayaan motor', p: 703500 }
        ]
      },
      {
        name: 'Pembiayaan & Paylater',
        items: [
          { l: 'Home Credit', d: 'Cicilan gadget & elektronik', p: 453500 },
          { l: 'Kredivo', d: 'Tagihan cicilan paylater', p: 353500 },
          { l: 'Akulaku', d: 'Tagihan belanja kredit', p: 303500 },
          { l: 'Tagihan Berjalan', d: 'Sesuai kontrak perjanjian', p: 0, variable: true }
        ]
      }
    ]
  }
];
