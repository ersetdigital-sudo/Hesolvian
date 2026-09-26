/**
 * Sumber kebenaran FAQ Pusat Bantuan.
 *
 * Dipakai untuk dua hal, sama seperti `categoriesData.ts` / `flashSaleData.ts`:
 *  1. data awal saat seed Supabase,
 *  2. cadangan kalau query database gagal atau belum punya FAQ terbit.
 *
 * Setelah di-seed, admin bisa mengelola FAQ ini dari /admin/pusat-bantuan.
 */

export interface FaqCategory {
  id: string;
  label: string;
}

/** Urutan pill filter di halaman publik /bantuan. */
export const FAQ_CATEGORIES: FaqCategory[] = [
  { id: 'token', label: 'Token PLN' },
  { id: 'pulsa', label: 'Pulsa & Data' },
  { id: 'pembayaran', label: 'Pembayaran' },
  { id: 'refund', label: 'Refund' },
  { id: 'riwayat', label: 'Riwayat' },
  { id: 'umum', label: 'Umum' }
];

export interface FaqEntry {
  category: string;
  question: string;
  answer: string;
}

export const FAQS_DATA: FaqEntry[] = [
  {
    category: 'pembayaran',
    question: 'Berapa lama transaksi diproses setelah pembayaran berhasil?',
    answer:
      'Sebagian besar transaksi diproses secara instan dalam 5 hingga 30 detik setelah pembayaran terverifikasi. Untuk beberapa layanan atau saat server operator mengalami antrean, proses dapat memerlukan waktu 1-5 menit.'
  },
  {
    category: 'pulsa',
    question: 'Pulsa atau paket data belum masuk, apa yang harus dilakukan?',
    answer:
      'Pastikan nomor tujuan sudah benar dan masa aktif kartu masih berlaku. Coba tunggu 1-3 menit, lalu cek kembali saldo pulsa atau kuota Anda. Jika belum masuk, periksa status transaksi di halaman Lacak Transaksi atau hubungi Customer Care kami dengan melampirkan nomor transaksi.'
  },
  {
    category: 'token',
    question: 'Token listrik PLN belum diterima setelah pembayaran, bagaimana?',
    answer:
      'Nomor token PLN 20 digit otomatis tampil di rincian transaksi setelah pembayaran berhasil. Jika halaman sempat tertutup, Anda dapat melihatnya kembali di menu Lacak Transaksi atau mengunduh struk resmi. Jika status masih diproses, tunggu 1-2 menit atau sampaikan melalui formulir pengaduan.'
  },
  {
    category: 'pembayaran',
    question: 'Saldo sudah terpotong, tetapi transaksi masih diproses. Apa yang harus dilakukan?',
    answer:
      'Hal ini terjadi ketika pembayaran Anda telah berhasil diverifikasi oleh bank, namun sistem sedang menunggu konfirmasi akhir dari penyedia layanan (PLN/Operator). Anda dapat menekan tombol "Cek Status Sekarang" pada halaman transaksi atau menunggu beberapa menit agar sistem menyelesaikan sinkronisasi secara otomatis.'
  },
  {
    category: 'refund',
    question: 'Bagaimana jika transaksi gagal tetapi saldo sudah terpotong?',
    answer:
      'Jangan khawatir, saldo dan dana Anda dijamin aman. Jika transaksi dinyatakan gagal oleh sistem atau nomor tujuan tidak valid, dana pembayaran akan dikembalikan secara penuh (100% refund) sesuai metode pembayaran yang digunakan tanpa potongan biaya admin.'
  },
  {
    category: 'riwayat',
    question: 'Bagaimana cara melihat kembali riwayat transaksi?',
    answer:
      'Buka menu "Lacak Transaksi" pada navigasi. Masukkan Nomor Transaksi atau nomor HP/ID Pelanggan Anda untuk melihat kembali rincian pembayaran, nomor token PLN, serta mencetak atau mengunduh struk bukti transaksi sah.'
  }
];
