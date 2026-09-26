import React from 'react';
import { LegalPageShell, LegalSection } from './LegalPageShell';

interface TermsPageProps {
  onGoHome: () => void;
}

const SECTIONS: LegalSection[] = [
  {
    id: 'tk-definisi',
    title: 'Definisi',
    paragraphs: [
      'Istilah "Hesolvian", "kami", atau "Platform" merujuk pada layanan loket pembayaran PPOB dan multiaset yang diselenggarakan oleh PT Hesolvian Pembayaran Nusantara.',
      '"Pengguna" adalah setiap orang yang mengakses atau menggunakan layanan Hesolvian, baik sebagai pembeli maupun sebagai mitra agen.',
      '"Transaksi" adalah setiap perintah pembelian produk atau pembayaran tagihan yang dikirimkan Pengguna melalui Platform dan diproses oleh mitra switching serta biller terkait.'
    ]
  },
  {
    id: 'tk-penerimaan',
    title: 'Penerimaan Ketentuan',
    paragraphs: [
      'Dengan mengakses, mendaftar, atau menggunakan layanan Hesolvian, Pengguna menyatakan telah membaca, memahami, dan menyetujui seluruh isi Syarat & Ketentuan ini.',
      'Apabila Pengguna tidak menyetujui sebagian atau seluruh ketentuan di sini, Pengguna diminta untuk tidak menggunakan layanan Hesolvian.'
    ]
  },
  {
    id: 'tk-kelayakan',
    title: 'Kelayakan Pengguna',
    bullets: [
      'Pengguna berusia minimal 18 tahun atau telah mendapat persetujuan dari orang tua / wali yang sah.',
      'Pengguna memberikan data yang benar, akurat, dan mutakhir saat melakukan pendaftaran maupun Transaksi.',
      'Pengguna bertanggung jawab penuh atas kerahasiaan data akses dan seluruh aktivitas yang terjadi melalui akunnya.'
    ]
  },
  {
    id: 'tk-layanan',
    title: 'Lingkup Layanan',
    paragraphs: [
      'Hesolvian menyediakan layanan pembelian pulsa, paket data, token listrik, serta pembayaran tagihan seperti PDAM, BPJS, internet, multifinance, dan pengisian saldo dompet digital.',
      'Ketersediaan produk dapat berubah sewaktu-waktu menyesuaikan kebijakan operator, biller, dan mitra switching. Hesolvian berhak menambah, mengubah, atau menghentikan produk tertentu tanpa pemberitahuan terlebih dahulu.'
    ]
  },
  {
    id: 'tk-pembayaran',
    title: 'Pembayaran, Biaya, dan Harga',
    bullets: [
      'Seluruh nominal Transaksi, biaya admin, dan potongan lainnya ditampilkan sebelum Pengguna mengonfirmasi pembayaran.',
      'Transaksi dinyatakan sah setelah pembayaran berhasil diverifikasi oleh sistem kliring kami.',
      'Hesolvian dapat mengubah besaran biaya admin dan harga produk dari waktu ke waktu sesuai kebijakan mitra penyedia layanan.',
      'Bukti pembayaran resmi berupa struk digital diterbitkan setelah Transaksi berhasil dan dapat diunduh atau dicetak dari halaman Lacak Transaksi.'
    ]
  },
  {
    id: 'tk-refund',
    title: 'Kebijakan Refund dan Pembatalan',
    paragraphs: [
      'Transaksi yang telah berhasil diproses dan produk telah terkirim (misalnya pulsa masuk atau token terbit) tidak dapat dibatalkan atau dikembalikan.',
      'Apabila Transaksi dinyatakan gagal oleh sistem atau tujuan tidak valid, dana akan dikembalikan secara penuh sesuai metode pembayaran yang digunakan tanpa potongan biaya admin.',
      'Proses pengembalian dana mengikuti waktu penyelesaian dari bank atau penyedia pembayaran terkait, umumnya dalam 1–7 hari kerja.'
    ]
  },
  {
    id: 'tk-kewajiban',
    title: 'Kewajiban dan Larangan Pengguna',
    bullets: [
      'Pengguna dilarang menggunakan layanan Hesolvian untuk aktivitas pencucian uang, penipuan, perjudian, atau tindak pidana lainnya.',
      'Pengguna dilarang melakukan manipulasi data, eksploitasi celah keamanan, maupun penggunaan sistem otomatis yang membebani layanan secara tidak wajar.',
      'Pelanggaran terhadap ketentuan ini dapat mengakibatkan penangguhan Transaksi hingga penutupan akses secara permanen.'
    ]
  },
  {
    id: 'tk-hki',
    title: 'Hak Kekayaan Intelektual',
    paragraphs: [
      'Seluruh merek, logo, desain antarmuka, kode program, dan konten yang terdapat pada Platform merupakan milik Hesolvian atau pemberi lisensinya dan dilindungi oleh peraturan perundang-undangan yang berlaku.',
      'Pengguna dilarang memperbanyak, memodifikasi, atau menggunakan materi tersebut untuk kepentingan komersial tanpa izin tertulis dari Hesolvian.'
    ]
  },
  {
    id: 'tk-tanggung-jawab',
    title: 'Batasan Tanggung Jawab',
    paragraphs: [
      'Hesolvian berupaya menjaga layanan tetap tersedia dan akurat. Namun kami tidak menjamin layanan bebas dari gangguan teknis, keterlambatan, atau kegagalan yang berasal dari jaringan operator dan biller pihak ketiga.',
      'Sepanjang diizinkan hukum, Hesolvian tidak bertanggung jawab atas kerugian tidak langsung, kehilangan keuntungan, atau kerusakan yang timbul akibat penggunaan layanan di luar kendali kami.'
    ]
  },
  {
    id: 'tk-perubahan',
    title: 'Perubahan Ketentuan dan Hukum yang Berlaku',
    paragraphs: [
      'Hesolvian dapat memperbarui Syarat & Ketentuan ini sewaktu-waktu. Versi terbaru akan dipublikasikan pada halaman ini beserta keterangan tanggal pembaruan.',
      'Dengan tetap menggunakan layanan setelah perubahan dipublikasikan, Pengguna dianggap menyetujui ketentuan yang telah diperbarui.',
      'Syarat & Ketentuan ini diatur dan ditafsirkan berdasarkan hukum yang berlaku di Republik Indonesia.'
    ]
  }
];

export const TermsPage: React.FC<TermsPageProps> = ({ onGoHome }) => {
  return (
    <LegalPageShell
      eyebrow="Ketentuan Penggunaan Layanan"
      icon="gavel"
      title="Syarat & Ketentuan"
      description="Aturan yang mengatur penggunaan layanan loket pembayaran PPOB dan multiaset di platform Hesolvian. Mohon dibaca dengan saksama sebelum bertransaksi."
      updatedAt="1 Mei 2025"
      sections={SECTIONS}
      onGoHome={onGoHome}
    />
  );
};
