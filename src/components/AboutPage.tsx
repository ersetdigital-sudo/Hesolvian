import React from 'react';

interface AboutPageProps {
  onGoHome: () => void;
  onGoToCekTransaksi: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onGoHome, onGoToCekTransaksi }) => {
  const stats = [
    { value: '8', label: 'Kategori Layanan', icon: 'grid_view' },
    { value: '24/7', label: 'Layanan Customer Care', icon: 'support_agent' },
    { value: '99.98%', label: 'Uptime Sistem', icon: 'sensors' },
    { value: '11 dtk', label: 'Rata-rata Terbit Token', icon: 'bolt' }
  ];

  const values = [
    {
      title: 'Transparan',
      desc: 'Setiap nominal, biaya admin, dan status mutasi ditampilkan apa adanya tanpa biaya tersembunyi.',
      icon: 'visibility',
      bg: '#FFF8E1',
      color: '#F59E0B'
    },
    {
      title: 'Aman',
      desc: 'Kanal pembayaran terverifikasi, data terenkripsi, dan setiap transaksi tercatat pada jejak audit.',
      icon: 'verified_user',
      bg: '#E8F5E9',
      color: '#16A34A'
    },
    {
      title: 'Cepat',
      desc: 'Pemrosesan otomatis lewat mitra switching nasional agar tagihan dan token segera diterbitkan.',
      icon: 'speed',
      bg: '#E3F4FC',
      color: '#0891B2'
    },
    {
      title: 'Merakyat',
      desc: 'Harga kompetitif dengan promo rutin, supaya layanan pembayaran digital terjangkau siapa saja.',
      icon: 'volunteer_activism',
      bg: '#FCEAE5',
      color: '#B4432C'
    }
  ];

  const milestones = [
    {
      year: 'Loket',
      title: 'Dimulai dari kebutuhan loket',
      desc: 'Hesolvian tumbuh dari kebutuhan sederhana: satu tempat untuk membayar semua tagihan tanpa antre dan tanpa ribet registrasi berlapis.'
    },
    {
      year: 'Jaringan',
      title: 'Terhubung ke jaringan biller',
      desc: 'Kami menjalin kerja sama dengan operator telekomunikasi, PLN, PDAM, BPJS, penyedia internet, dan mitra switching nasional.'
    },
    {
      year: 'Hari ini',
      title: 'Satu platform multiaset',
      desc: 'Kini pulsa, paket data, token listrik, air, BPJS, internet, e-wallet, hingga multifinance dapat diselesaikan dalam satu alur.'
    }
  ];

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] text-[#2C211D] animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-b from-[#F3EADF] via-[#FBF6EF] to-[#FBF6EF] border-b border-[#E8DDD2] pt-8 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] text-[#8a716c] font-medium mb-4">
            <button
              type="button"
              onClick={onGoHome}
              className="hover:text-[#B4432C] transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <span>/</span>
            <span className="text-[#2C211D] font-bold">Tentang Hesolvian</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#FCEAE5] text-[#B4432C] px-3.5 py-1.5 rounded-full text-[12px] font-bold border border-[#F5A896]/40 shadow-xs">
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                <span>Tentang Kami</span>
              </div>

              <h1 className="font-['Newsreader'] text-3xl sm:text-5xl font-extrabold text-[#2C211D] tracking-tight leading-[1.15]">
                Semua Pembayaran <span className="text-[#B4432C]">Lebih Mudah.</span>
              </h1>

              <p className="text-[14px] sm:text-[16px] text-[#6B5A53] leading-relaxed font-['Manrope'] max-w-xl">
                Hesolvian adalah platform loket pembayaran multiaset dan PPOB terpadu. Kami
                menghubungkan pelanggan dengan operator, PLN, PDAM, BPJS, penyedia internet, dan
                dompet digital melalui satu alur transaksi yang cepat, aman, dan transparan.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onGoToCekTransaksi}
                  className="inline-flex items-center justify-center gap-2 bg-[#B4432C] hover:bg-[#8E3220] text-white text-[13.5px] font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-[0.985] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">search_check</span>
                  <span>Lacak Transaksi</span>
                </button>

                <a
                  href="https://wa.me/6281200110022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-[#FCEAE5] text-[#B4432C] border-2 border-[#B4432C] text-[13.5px] font-bold px-6 py-3 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Hubungi Kami</span>
                </a>
              </div>
            </div>

            {/* Right card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DDD2] shadow-[0_8px_30px_rgba(44,33,29,0.06)] space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E2694A] to-[#B4432C] flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
                    H
                  </div>
                  <div>
                    <div className="text-[17px] font-extrabold text-[#2C211D] tracking-tight">
                      Hesolvian
                    </div>
                    <div className="text-[11px] text-[#9B8A82]">
                      Loket Resmi PPOB &amp; Multiaset Transaksi
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-[12.5px]">
                  <div className="flex justify-between items-center gap-3 p-2.5 bg-[#FBF6EF] rounded-xl">
                    <span className="text-[#6B5A53]">Badan Penyelenggara</span>
                    <span className="font-bold text-[#2C211D] text-right">
                      PT Hesolvian Pembayaran Nusantara
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3 p-2.5 bg-[#FBF6EF] rounded-xl">
                    <span className="text-[#6B5A53]">Metode Pembayaran</span>
                    <span className="font-bold text-[#1F7A54]">QRIS Otomatis 24 Jam</span>
                  </div>
                  <div className="flex justify-between items-center gap-3 p-2.5 bg-[#FBF6EF] rounded-xl">
                    <span className="text-[#6B5A53]">Kanal Dukungan</span>
                    <span className="font-bold text-[#2C211D]">WhatsApp &amp; Email</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#9B8A82] leading-relaxed pt-1 border-t border-[#F2EDE6]">
                  Dokumen legalitas dan perizinan usaha tersedia atas permintaan melalui
                  Customer Care resmi kami.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. STATS */}
      {/* ======================================================== */}
      <section className="bg-white border-b border-[#E8DDD2]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-[#FBF6EF] border border-[#E8DDD2] rounded-2xl p-5 text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-[#E8DDD2] text-[#B4432C] flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                </div>
                <div className="font-['Newsreader'] text-2xl sm:text-3xl font-extrabold text-[#2C211D] tracking-tight">
                  {s.value}
                </div>
                <div className="text-[11.5px] sm:text-[12px] text-[#6B5A53] font-semibold mt-1 leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. STORY / MILESTONES */}
      {/* ======================================================== */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <div className="max-w-xl mb-8">
          <div className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#B4432C]">
            Perjalanan Kami
          </div>
          <h2 className="font-['Newsreader'] text-2xl sm:text-3xl font-extrabold text-[#2C211D] tracking-tight mt-1">
            Dari Loket Kecil ke Platform Terpadu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {milestones.map((m) => (
            <div
              key={m.title}
              className="bg-white border border-[#E8DDD2] rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FCEAE5] text-[#B4432C] text-[11px] font-bold uppercase tracking-wider mb-3">
                {m.year}
              </div>
              <h3 className="text-[15px] font-bold text-[#2C211D] mb-2">{m.title}</h3>
              <p className="text-[12.5px] text-[#6B5A53] leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. VALUES */}
      {/* ======================================================== */}
      <section className="bg-[#FBF6EF] border-y border-[#E8DDD2]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-['Newsreader'] text-2xl sm:text-3xl font-extrabold text-[#2C211D] tracking-tight">
              Nilai yang Kami Pegang
            </h2>
            <p className="text-[14px] text-[#6B5A53] mt-2 font-['Manrope']">
              Prinsip yang kami jaga di setiap transaksi yang Anda percayakan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white border border-[#E8DDD2] rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: v.bg, color: v.color }}
                >
                  <span className="material-symbols-outlined text-[28px]">{v.icon}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#2C211D] mb-2">{v.title}</h3>
                <p className="text-[13px] text-[#6B5A53] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. CTA BANNER */}
      {/* ======================================================== */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <div className="bg-gradient-to-r from-[#B4432C] via-[#943420] to-[#711700] rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-['Newsreader'] text-2xl sm:text-3xl font-bold">
              Siap Bertransaksi Bersama Kami?
            </h3>
            <p className="text-[13px] sm:text-[14px] text-white/80 max-w-lg leading-relaxed">
              Mulai dari pulsa, token listrik, hingga pembayaran tagihan bulanan — semuanya bisa
              diselesaikan dalam satu platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onGoHome}
              className="w-full sm:w-auto bg-white hover:bg-[#FBF6EF] text-[#B4432C] px-6 py-3 rounded-xl font-bold text-[13.5px] transition-all cursor-pointer shadow-md active:scale-95"
            >
              Mulai Transaksi
            </button>
            <button
              type="button"
              onClick={onGoToCekTransaksi}
              className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/30 px-5 py-3 rounded-xl font-semibold text-[13.5px] transition-all cursor-pointer"
            >
              Lacak Transaksi
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
