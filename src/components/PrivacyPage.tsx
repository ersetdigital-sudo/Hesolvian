import React from 'react';
import { LegalPageShell, LegalSection } from './LegalPageShell';

interface PrivacyPageProps {
  onGoHome: () => void;
}

const SECTIONS: LegalSection[] = [
  {
    id: 'pp-pendahuluan',
    title: 'Pendahuluan',
    paragraphs: [
      'Kebijakan Privasi ini menjelaskan bagaimana Hesolvian mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan layanan kami.',
      'Kami berkomitmen menjaga kerahasiaan data pribadi sesuai peraturan perundang-undangan yang berlaku mengenai pelindungan data pribadi di Indonesia.'
    ]
  },
  {
    id: 'pp-data',
    title: 'Data yang Kami Kumpulkan',
    bullets: [
      'Data identitas, seperti nama dan nomor telepon atau alamat email yang Anda berikan saat mendaftar atau menghubungi Customer Care.',
      'Data Transaksi, mencakup Nomor Transaksi, produk yang dibeli, nominal pembayaran, dan status mutasi.',
      'Data tujuan transaksi, seperti nomor HP, ID pelanggan, atau nomor meter yang Anda masukkan untuk memproses pembelian dan pembayaran.',
      'Data teknis perangkat, seperti alamat IP, jenis peramban, dan informasi perangkat untuk keamanan serta pencegahan penyalahgunaan.',
      'Riwayat interaksi dengan tim dukungan, termasuk tiket pengaduan dan lampiran yang Anda kirimkan.'
    ]
  },
  {
    id: 'pp-penggunaan',
    title: 'Cara Kami Menggunakan Data',
    bullets: [
      'Memproses Transaksi dan meneruskan perintah pembelian kepada operator, biller, dan mitra switching yang relevan.',
      'Memverifikasi identitas dan mencegah penipuan, pencucian uang, serta penyalahgunaan layanan.',
      'Memberikan dukungan pelanggan, menangani pengaduan, dan memproses pengembalian dana.',
      'Memenuhi kewajiban hukum, audit internal, serta pelaporan kepada otoritas yang berwenang.',
      'Mengirimkan informasi status Transaksi, struk digital, dan pemberitahuan layanan yang penting bagi Anda.'
    ]
  },
  {
    id: 'pp-dasar-hukum',
    title: 'Dasar Hukum Pemrosesan',
    paragraphs: [
      'Kami memproses data pribadi berdasarkan pelaksanaan perjanjian layanan dengan Anda, pemenuhan kewajiban hukum yang berlaku, persetujuan yang Anda berikan, serta kepentingan sah kami untuk menjaga keamanan dan keandalan layanan.'
    ]
  },
  {
    id: 'pp-berbagi',
    title: 'Berbagi Data dengan Pihak Ketiga',
    paragraphs: [
      'Kami tidak menjual data pribadi Anda. Data hanya dibagikan secara terbatas kepada pihak yang diperlukan untuk menyelesaikan layanan, yaitu:'
    ],
    bullets: [
      'Operator telekomunikasi, PLN, PDAM, BPJS, dan biller lain yang menjadi penyedia produk atau tagihan.',
      'Penyedia jasa pembayaran dan perbankan yang memproses kliring dana, termasuk layanan QRIS.',
      'Mitra switching dan penyedia infrastruktur teknologi yang terikat perjanjian kerahasiaan dengan kami.',
      'Aparat penegak hukum atau instansi berwenang, apabila diwajibkan oleh peraturan yang berlaku.'
    ]
  },
  {
    id: 'pp-keamanan',
    title: 'Penyimpanan dan Keamanan Data',
    bullets: [
      'Data Transaksi disimpan selama diperlukan untuk keperluan operasional, audit, dan pemenuhan kewajiban hukum.',
      'Kami menerapkan enkripsi pada transmisi data, pembatasan akses internal, serta pemantauan aktivitas sistem secara berkala.',
      'Meskipun kami berupaya maksimal, tidak ada metode transmisi data melalui internet yang sepenuhnya bebas risiko. Anda diimbau menjaga kerahasiaan data akses Anda.'
    ]
  },
  {
    id: 'pp-cookie',
    title: 'Cookie dan Teknologi Serupa',
    paragraphs: [
      'Kami dapat menggunakan cookie dan teknologi serupa untuk menjaga sesi, mengingat preferensi, serta memahami cara layanan digunakan sehingga kami dapat memperbaikinya.',
      'Anda dapat mengatur peramban untuk menolak cookie, namun sebagian fitur layanan mungkin tidak berfungsi dengan optimal.'
    ]
  },
  {
    id: 'pp-hak',
    title: 'Hak Anda atas Data Pribadi',
    bullets: [
      'Meminta akses dan salinan data pribadi yang kami simpan mengenai Anda.',
      'Meminta pembaruan atau perbaikan atas data yang tidak akurat.',
      'Meminta penghapusan data sepanjang tidak bertentangan dengan kewajiban hukum yang harus kami penuhi.',
      'Menarik kembali persetujuan pemrosesan data yang sebelumnya Anda berikan.',
      'Mengajukan keberatan atas pemrosesan data tertentu melalui kanal resmi kami.'
    ]
  },
  {
    id: 'pp-anak',
    title: 'Data Anak',
    paragraphs: [
      'Layanan Hesolvian ditujukan untuk pengguna berusia dewasa. Kami tidak dengan sengaja mengumpulkan data pribadi anak di bawah usia 18 tahun tanpa persetujuan orang tua atau wali yang sah.'
    ]
  },
  {
    id: 'pp-perubahan',
    title: 'Perubahan Kebijakan dan Kontak',
    paragraphs: [
      'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Versi terbaru akan dipublikasikan pada halaman ini beserta tanggal pembaruannya.',
      'Untuk pertanyaan, permintaan akses, atau keluhan terkait data pribadi, Anda dapat menghubungi kami melalui WhatsApp 0812-0011-0022 atau email cs@hesolvian.com.'
    ]
  }
];

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onGoHome }) => {
  return (
    <LegalPageShell
      eyebrow="Pelindungan Data Pribadi"
      icon="shield_lock"
      title="Kebijakan Privasi"
      description="Bagaimana Hesolvian mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan layanan loket pembayaran kami."
      updatedAt="1 Mei 2025"
      sections={SECTIONS}
      onGoHome={onGoHome}
    />
  );
};
