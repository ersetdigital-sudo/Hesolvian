import React, { useState } from 'react';
import { CATEGORIES_DATA, CategoryData } from '../data/categoriesData';
import { FlashSaleProduct } from '../data/flashSaleData';
import { FlashSaleSection } from './FlashSaleSection';

interface HomePageProps {
  /** Katalog PPOB yang sudah disatukan dengan data Supabase. */
  categories?: CategoryData[];
  /** Entri Flash Sale dari Supabase. */
  flashSales?: FlashSaleProduct[];
  onOpenCategory: (categoryId: string) => void;
  onOpenFlashSale: (product: FlashSaleProduct) => void;
  onGoToCekTransaksi: () => void;
  showToast: (msg: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  categories = CATEGORIES_DATA,
  flashSales,
  onOpenCategory,
  onOpenFlashSale,
  onGoToCekTransaksi,
  showToast
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredCategories =
    activeFilter === 'all'
      ? categories
      : categories.filter((c) => c.id === activeFilter);

  const handleCopyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Kode promo ${code} berhasil disalin ke papan klip!`);
  };

  return (
    <div className="w-full flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ========== HERO SECTION ========== */}
      <section className="py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-b from-[#FBF6EF] via-[#F3EADF]/40 to-[#FBF6EF]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-[12px] font-bold tracking-wider uppercase text-[#E2694A] bg-[#FCEAE5] px-3.5 py-2 rounded-full mb-4.5 shadow-xs border border-[#F5A896]/40">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Bayar Tagihan &amp; Beli Pulsa</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[52px] leading-[1.14] font-extrabold tracking-[-1.5px] text-[#2C211D] mb-5">
                Semua Kebutuhan PPOB Dalam{' '}
                <span className="text-[#E2694A]">Satu Platform</span>
              </h1>

              <p className="text-[16px] sm:text-[17px] text-[#6B5A53] max-w-[490px] mx-auto lg:mx-0 leading-relaxed mb-7">
                Pulsa, paket data, listrik, PDAM, BPJS, internet, e-wallet, hingga multifinance.
                Transaksi cepat, aman, dan terpercaya di Hesolvian.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('kategori-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-[#B4432C] hover:bg-[#8E3220] text-white text-[14px] font-bold px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.985] cursor-pointer"
                >
                  <span>Mulai Transaksi</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>

                <button
                  type="button"
                  onClick={onGoToCekTransaksi}
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-[#FCEAE5] text-[#B4432C] border-2 border-[#B4432C] text-[14px] font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">search_check</span>
                  <span>Lacak Transaksi</span>
                </button>
              </div>
            </div>

            {/* Right Visual Phone Mockup with Floating Badges */}
            <div className="relative flex justify-center items-center min-h-[380px] lg:min-h-[440px]">
              {/* Badge 1 */}
              <div className="badge-float bf-1 absolute top-4 left-2 sm:left-6 z-20 bg-white rounded-2xl p-2.5 px-3.5 shadow-lg border border-[#E8DDD2] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFF8E1] text-[#F59E0B] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#9B8A82] font-semibold">PLN Token</div>
                  <div className="text-[12px] font-bold text-[#2C211D]">Proses Instan</div>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="badge-float bf-2 absolute top-20 right-2 sm:right-6 z-20 bg-white rounded-2xl p-2.5 px-3.5 shadow-lg border border-[#E8DDD2] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FCE4EC] text-[#E91E63] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#9B8A82] font-semibold">BPJS</div>
                  <div className="text-[12px] font-bold text-[#2C211D]">Selalu Tepat Waktu</div>
                </div>
              </div>

              {/* Center Phone */}
              <div className="w-[220px] h-[430px] bg-white rounded-[32px] shadow-2xl border-[3px] border-[#E8DDD2] relative z-10 overflow-hidden flex flex-col p-3">
                <div className="text-center py-2.5 border-b border-[#E8DDD2] mb-3">
                  <div className="text-[15px] font-extrabold text-[#B4432C]">Hesolvian</div>
                  <div className="text-[9px] text-[#9B8A82]">Transaksi Mudah, Tagihan Beres</div>
                </div>

                <div className="grid grid-cols-3 gap-2 flex-1">
                  {[
                    { name: 'PLN', icon: '⚡', bg: '#FFF8E1', id: 'pln' },
                    { name: 'Pulsa', icon: '📱', bg: '#FFEAE4', id: 'pulsa' },
                    { name: 'Data', icon: '📶', bg: '#E3F4FC', id: 'data' },
                    { name: 'PDAM', icon: '💧', bg: '#E0F7FA', id: 'pdam' },
                    { name: 'E-Wallet', icon: '💳', bg: '#E8EEF7', id: 'emoney' },
                    { name: 'Internet', icon: '🌐', bg: '#EDE7F6', id: 'internet' },
                  ].map((pItem) => (
                    <div
                      key={pItem.name}
                      onClick={() => onOpenCategory(pItem.id)}
                      className="text-center cursor-pointer group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl mx-auto mb-1 flex items-center justify-center text-[16px] group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: pItem.bg }}
                      >
                        {pItem.icon}
                      </div>
                      <span className="text-[9px] font-bold text-[#6B5A53] group-hover:text-[#B4432C]">
                        {pItem.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto p-2 bg-[#FBF6EF] rounded-xl text-center border border-[#E8DDD2]">
                  <div className="text-[9px] text-[#9B8A82]">Metode Pembayaran</div>
                  <div className="text-[10px] font-bold text-[#1F7A54] mt-0.5">QRIS Otomatis 24 Jam</div>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="badge-float bf-3 absolute bottom-24 -left-2 sm:left-4 z-20 bg-white rounded-2xl p-2.5 px-3.5 shadow-lg border border-[#E8DDD2] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] text-[#16A34A] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#9B8A82] font-semibold">E-Wallet</div>
                  <div className="text-[12px] font-bold text-[#2C211D]">Top Up Mudah</div>
                </div>
              </div>

              {/* Badge 4 */}
              <div className="badge-float bf-4 absolute bottom-8 right-2 sm:right-6 z-20 bg-white rounded-2xl p-2.5 px-3.5 shadow-lg border border-[#E8DDD2] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EDE7F6] text-[#7C3AED] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">wifi</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#9B8A82] font-semibold">Internet</div>
                  <div className="text-[12px] font-bold text-[#2C211D]">Bayar Online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FLASH SALE SECTION ========== */}
      <FlashSaleSection products={flashSales} onSelectProduct={onOpenFlashSale} />

      {/* ========== CATEGORY TABS BAR ========== */}
      <div className="py-4 border-y border-[#E8DDD2] bg-white sticky top-16 sm:top-20 z-30 shadow-xs">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#B4432C] text-white shadow-xs'
                  : 'bg-[#FBF6EF] text-[#6B5A53] hover:bg-[#FCEAE5] hover:text-[#B4432C]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Semua Layanan</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === cat.id
                    ? 'bg-[#B4432C] text-white shadow-xs'
                    : 'bg-[#FBF6EF] text-[#6B5A53] hover:bg-[#FCEAE5] hover:text-[#B4432C]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.iconName}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== CATEGORY GRID SECTION ========== */}
      <section className="py-14 sm:py-16 bg-[#FBF6EF]" id="kategori-section">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.7px] text-[#2C211D]">
                Pilih Layanan Favoritmu
              </h2>
              <p className="text-[14px] text-[#6B5A53] mt-1">
                Transaksi cepat, aman, dan terpercaya tanpa perlu ribet registrasi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="text-[13px] font-bold text-[#E2694A] hover:text-[#B4432C] inline-flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Lihat Semua Layanan</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredCategories.map((c) => (
              <div
                key={c.id}
                onClick={() => onOpenCategory(c.id)}
                className="bg-white border border-[#E8DDD2] hover:border-[#E2694A] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer relative group"
              >
                <div className="space-y-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs"
                    style={{ backgroundColor: c.iconBg, color: c.iconColor }}
                  >
                    <span className="material-symbols-outlined text-[28px]">{c.iconName}</span>
                  </div>

                  <div>
                    <h3 className="text-[16px] font-bold text-[#2C211D] group-hover:text-[#B4432C] transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-[12.5px] text-[#6B5A53] line-clamp-2 mt-1 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F3EADF]/60 text-[11px] text-[#9B8A82]">
                  <span>{c.admin ? `Admin Rp${c.admin.toLocaleString('id-ID')}` : 'Bebas Admin'}</span>
                  <div className="w-7 h-7 rounded-lg bg-[#FBF6EF] group-hover:bg-[#FCEAE5] group-hover:text-[#B4432C] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PROMO BANNER SECTION ========== */}
      <section className="py-4 sm:py-8 bg-[#FBF6EF]" id="promo-section">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="bg-gradient-to-br from-[#B4432C] to-[#E2694A] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Ambient decorative circles */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-20 w-72 h-72 rounded-full bg-white/5 blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="text-[12px] font-bold uppercase tracking-widest text-white/80">
                Promo Spesial Hesolvian
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.8px] leading-tight text-white">
                Biaya Admin <span className="text-[#FFE082]">Lebih Hemat</span>
              </h3>
              <p className="text-[15px] text-white/90 leading-relaxed max-w-md">
                Nikmati berbagai promo menarik untuk semua layanan PPOB di Hesolvian. Hemat hingga 50% biaya admin!
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenCategory('pln')}
                  className="bg-white hover:bg-[#FBF6EF] text-[#B4432C] font-bold text-[14px] px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Gunakan Promo</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Visual Voucher Card */}
            <div className="relative z-10 flex justify-center lg:justify-end">
              <div className="bg-white rounded-2xl p-6 shadow-2xl text-[#2C211D] w-full max-w-[280px] -rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FCEAE5] text-[#E2694A] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">redeem</span>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#9B8A82]">Diskon Admin</div>
                    <div className="text-[18px] font-extrabold tracking-tight text-[#2C211D]">
                      Hingga 50%
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleCopyPromo('HESOLHEMAT')}
                  className="bg-[#FBF6EF] border-2 border-dashed border-[#E2694A] rounded-xl p-3 text-center cursor-pointer hover:bg-[#FCEAE5] transition-colors"
                  title="Klik untuk salin kode"
                >
                  <div className="text-[10px] text-[#9B8A82] mb-0.5">KODE KUPON:</div>
                  <div className="text-[15px] font-extrabold text-[#B4432C] tracking-widest font-mono">
                    HESOLHEMAT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHY CHOOSE SECTION ========== */}
      <section className="py-14 sm:py-20 bg-[#FBF6EF]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.7px] text-[#2C211D]">
              Kenapa Pilih Hesolvian?
            </h2>
            <p className="text-[14px] text-[#6B5A53] mt-2">
              Solusi pembayaran digital yang aman, cepat, dan terpercaya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Proses Instan',
                desc: 'Transaksi diproses otomatis dalam hitungan detik.',
                icon: 'bolt',
                bg: '#FFF8E1',
                color: '#F59E0B'
              },
              {
                title: 'Aman & Terpercaya',
                desc: 'Transaksi dijamin aman dengan sistem terenkripsi.',
                icon: 'verified_user',
                bg: '#E8F5E9',
                color: '#16A34A'
              },
              {
                title: 'Harga Terbaik',
                desc: 'Nikmati harga kompetitif dengan promo menarik.',
                icon: 'sell',
                bg: '#FFF3E0',
                color: '#EA580C'
              },
              {
                title: 'Layanan 24/7',
                desc: 'Customer service siap membantu kapan saja.',
                icon: 'support_agent',
                bg: '#E3F4FC',
                color: '#0891B2'
              }
            ].map((w) => (
              <div
                key={w.title}
                className="bg-white border border-[#E8DDD2] rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: w.bg, color: w.color }}
                >
                  <span className="material-symbols-outlined text-[28px]">{w.icon}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#2C211D] mb-2">{w.title}</h3>
                <p className="text-[13px] text-[#6B5A53] leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS SECTION ========== */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#E8DDD2]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.7px] text-[#2C211D]">
                Apa Kata Mereka?
              </h2>
              <p className="text-[14px] text-[#6B5A53] mt-1">
                Ribuan pelanggan sudah mempercayai Hesolvian.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[13px] font-bold text-[#E2694A]">
              <span>4.9 / 5.0 Rating Pelanggan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: 'Andi Rachman',
                initials: 'AR',
                bg: 'linear-gradient(135deg,#E2694A,#B4432C)',
                quote: 'Prosesnya cepat dan harga sangat terjangkau. Recommended banget untuk beli token listrik!'
              },
              {
                name: 'Siti Wulandari',
                initials: 'SW',
                bg: 'linear-gradient(135deg,#0891B2,#0E7490)',
                quote: 'Langganan bayar PLN dan PDAM di Hesolvian, selalu aman dan gak pernah ada kendala mutasi.'
              },
              {
                name: 'Dimas Pratama',
                initials: 'DP',
                bg: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                quote: 'Top up e-wallet super cepat masuk dalam hitungan detik. Adminnya juga responsif.'
              }
            ].map((t) => (
              <div
                key={t.name}
                className="bg-[#FBF6EF] border border-[#E8DDD2] rounded-2xl p-6 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-[14px]"
                    style={{ background: t.bg }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#2C211D]">{t.name}</div>
                    <div className="flex text-[#F59E0B] text-[13px]">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                </div>
                <p className="text-[13.5px] text-[#6B5A53] leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
