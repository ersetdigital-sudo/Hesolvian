import React, { useState } from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearchServices: () => void;
  onOpenNewTransaction: () => void;
  onOpenPromo: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearchServices,
  onOpenNewTransaction,
  onOpenPromo,
  onOpenHelp
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (target: string) => {
    setIsMobileMenuOpen(false);

    if (target === 'beranda') {
      setActiveTab('beranda');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'cek-transaksi') {
      setActiveTab('cek-transaksi');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'kategori') {
      if (activeTab !== 'beranda') {
        setActiveTab('beranda');
        setTimeout(() => {
          document.getElementById('kategori-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        document.getElementById('kategori-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target === 'promo') {
      if (activeTab !== 'beranda') {
        setActiveTab('beranda');
        setTimeout(() => {
          document.getElementById('promo-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        document.getElementById('promo-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target === 'bantuan') {
      setActiveTab('bantuan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(44,33,29,0.06)] border-b border-[#E8DDD2] font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="h-16 sm:h-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-8">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('beranda');
              }}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#E2694A] to-[#B4432C] flex items-center justify-center text-white font-extrabold text-xl shadow-sm transition-transform group-hover:scale-105">
                H
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2C211D]">
                Hesolvian
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleNavClick('beranda')}
                className={`text-[14px] px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'beranda'
                    ? 'bg-[#FCEAE5] text-[#B4432C]'
                    : 'text-[#6B5A53] hover:text-[#2C211D] hover:bg-[#FBF6EF]'
                }`}
              >
                Beranda
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('kategori')}
                className="text-[14px] px-3.5 py-2 rounded-xl font-semibold text-[#6B5A53] hover:text-[#2C211D] hover:bg-[#FBF6EF] transition-all cursor-pointer"
              >
                Kategori
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('promo')}
                className="text-[14px] px-3.5 py-2 rounded-xl font-semibold text-[#6B5A53] hover:text-[#2C211D] hover:bg-[#FBF6EF] transition-all cursor-pointer"
              >
                Promo
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('cek-transaksi')}
                className={`text-[14px] px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'cek-transaksi'
                    ? 'bg-[#FCEAE5] text-[#B4432C]'
                    : 'text-[#6B5A53] hover:text-[#2C211D] hover:bg-[#FBF6EF]'
                }`}
              >
                Cek Transaksi
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('bantuan')}
                className={`text-[14px] px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'bantuan'
                    ? 'bg-[#FCEAE5] text-[#B4432C]'
                    : 'text-[#6B5A53] hover:text-[#2C211D] hover:bg-[#FBF6EF]'
                }`}
              >
                Bantuan
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Search Services (Desktop Search Box) */}
            <div
              onClick={onOpenSearchServices}
              role="button"
              tabIndex={0}
              className="hidden sm:flex items-center gap-2.5 bg-[#FBF6EF] hover:bg-[#F3EADF] px-3.5 py-2.5 rounded-xl text-[#6B5A53] hover:text-[#2C211D] transition-colors cursor-pointer w-48 lg:w-52 justify-between border border-[#E8DDD2]"
            >
              <div className="flex items-center gap-2 text-[13px]">
                <span className="material-symbols-outlined text-[18px] text-[#9B8A82]">search</span>
                <span>Cari layanan...</span>
              </div>
              <kbd className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] text-[#9B8A82] font-bold border border-[#E8DDD2]">
                Ctrl K
              </kbd>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-[#FBF6EF] hover:bg-[#FCEAE5] text-[#2C211D] hover:text-[#B4432C] flex items-center justify-center border border-[#E8DDD2] transition-colors cursor-pointer"
              aria-label="Buka Menu Navigasi"
              title="Menu Navigasi"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE NAVIGATION DRAWER (Slide-out Modern Fintech Sheet) */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end font-['Plus_Jakarta_Sans',sans-serif]">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E8DDD2] flex items-center justify-between bg-[#FBF6EF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E2694A] to-[#B4432C] flex items-center justify-center text-white font-extrabold text-base shadow-xs">
                  H
                </div>
                <div>
                  <div className="text-[16px] font-extrabold text-[#2C211D]">Hesolvian</div>
                  <div className="text-[10px] text-[#9B8A82]">Menu Pembayaran PPOB</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#F3EADF] text-[#6B5A53] flex items-center justify-center border border-[#E8DDD2] transition-colors cursor-pointer"
                title="Tutup Menu"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Drawer Body Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Main Navigation Stack */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleNavClick('beranda')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-bold text-[14px] transition-all cursor-pointer ${
                    activeTab === 'beranda'
                      ? 'bg-[#FCEAE5] text-[#B4432C]'
                      : 'text-[#2C211D] hover:bg-[#FBF6EF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-[#B4432C]">
                      home
                    </span>
                    <span>Beranda Utama</span>
                  </div>
                  {activeTab === 'beranda' && (
                    <span className="w-2 h-2 rounded-full bg-[#B4432C]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('kategori')}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left font-semibold text-[14px] text-[#2C211D] hover:bg-[#FBF6EF] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-[#E2694A]">
                      grid_view
                    </span>
                    <span>Kategori Layanan</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#1F7A54] bg-[#E4F3EC] px-2 py-0.5 rounded-full">
                    8 Layanan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('cek-transaksi')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-bold text-[14px] transition-all cursor-pointer ${
                    activeTab === 'cek-transaksi'
                      ? 'bg-[#FCEAE5] text-[#B4432C]'
                      : 'text-[#2C211D] hover:bg-[#FBF6EF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-[#B4432C]">
                      search_check
                    </span>
                    <span>Lacak Transaksi</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#E2694A] bg-[#FCEAE5] px-2 py-0.5 rounded-full">
                    Real-Time
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('promo')}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left font-semibold text-[14px] text-[#2C211D] hover:bg-[#FBF6EF] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-[#EA580C]">
                      redeem
                    </span>
                    <span>Promo &amp; Diskon</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#B4432C] bg-[#FCEAE5] px-2 py-0.5 rounded-full">
                    HESOLHEMAT
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('bantuan')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-bold text-[14px] transition-all cursor-pointer ${
                    activeTab === 'bantuan'
                      ? 'bg-[#FCEAE5] text-[#B4432C]'
                      : 'text-[#2C211D] hover:bg-[#FBF6EF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-[#0891B2]">
                      support_agent
                    </span>
                    <span>Pusat Bantuan CS</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#1F7A54] bg-[#E4F3EC] px-2 py-0.5 rounded-full">
                    24 Jam
                  </span>
                </button>
              </div>

              {/* Quick Services Shortcuts */}
              <div className="pt-2 border-t border-[#E8DDD2]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#9B8A82] mb-2.5 px-1">
                  Layanan Favorit
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  {[
                    { name: 'PLN Token', icon: 'bolt', color: '#F59E0B', bg: '#FFF8E1' },
                    { name: 'Pulsa', icon: 'smartphone', color: '#E2694A', bg: '#FFEAE4' },
                    { name: 'Paket Data', icon: 'signal_cellular_alt', color: '#0891B2', bg: '#E3F4FC' },
                    { name: 'PDAM', icon: 'water_drop', color: '#0097A7', bg: '#E0F7FA' },
                    { name: 'E-Wallet', icon: 'account_balance_wallet', color: '#16A34A', bg: '#E8F5E9' },
                    { name: 'Internet', icon: 'wifi', color: '#7C3AED', bg: '#EDE7F6' },
                  ].map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenNewTransaction();
                      }}
                      className="p-2.5 rounded-xl bg-[#FBF6EF] hover:bg-white hover:shadow-xs border border-[#E8DDD2] flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: s.color }}
                      >
                        <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                      </div>
                      <span className="font-semibold text-[#2C211D] leading-tight text-[10px]">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Help WhatsApp link */}
              <div className="pt-2 border-t border-[#E8DDD2]">
                <a
                  href="https://wa.me/6281200110022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#E4F3EC] rounded-xl flex items-center justify-between text-[#1F7A54] hover:bg-[#d5ede1] transition-colors"
                >
                  <div className="flex items-center gap-2 text-[12px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Chat WhatsApp CS 24 Jam</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-[#E8DDD2] bg-[#FBF6EF] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenNewTransaction();
                }}
                className="w-full bg-[#B4432C] hover:bg-[#8E3220] text-white py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>Mulai Transaksi Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
