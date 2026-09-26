import React from 'react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
  onOpenHelp: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenHelp
}) => {
  const handleNavClick = (tab: string) => {
    if (tab === 'beranda') {
      setActiveTab('beranda');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'cek-transaksi') {
      setActiveTab('cek-transaksi');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'kategori') {
      if (activeTab !== 'beranda') {
        setActiveTab('beranda');
        setTimeout(() => {
          document.getElementById('kategori-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        document.getElementById('kategori-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'bantuan') {
      setActiveTab('bantuan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DDD2] shadow-[0_-4px_16px_rgba(44,33,29,0.06)] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around relative">
        {/* Item 1: Beranda */}
        <button
          type="button"
          onClick={() => handleNavClick('beranda')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'beranda' ? 'text-[#B4432C]' : 'text-[#9B8A82] hover:text-[#2C211D]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {activeTab === 'beranda' ? 'home' : 'home'}
          </span>
          <span className={`text-[10px] mt-0.5 ${activeTab === 'beranda' ? 'font-bold' : 'font-medium'}`}>
            Beranda
          </span>
        </button>

        {/* Item 2: Kategori */}
        <button
          type="button"
          onClick={() => handleNavClick('kategori')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[#9B8A82] hover:text-[#2C211D] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">grid_view</span>
          <span className="text-[10px] mt-0.5 font-medium">Kategori</span>
        </button>

        {/* Center Floating Action: Mulai Transaksi */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-5">
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#B4432C] via-[#E2694A] to-[#B4432C] text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer border-2 border-white ring-2 ring-[#B4432C]/20"
            title="Mulai Transaksi Baru"
          >
            <span className="material-symbols-outlined text-[26px]">add</span>
          </button>
          <span className="text-[10px] font-bold text-[#B4432C] mt-1">Beli / Bayar</span>
        </div>

        {/* Item 4: Lacak Transaksi */}
        <button
          type="button"
          onClick={() => handleNavClick('cek-transaksi')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'cek-transaksi' ? 'text-[#B4432C]' : 'text-[#9B8A82] hover:text-[#2C211D]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">search_check</span>
          <span
            className={`text-[10px] mt-0.5 ${activeTab === 'cek-transaksi' ? 'font-bold' : 'font-medium'}`}
          >
            Lacak
          </span>
        </button>

        {/* Item 5: Bantuan */}
        <button
          type="button"
          onClick={() => handleNavClick('bantuan')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'bantuan' ? 'text-[#B4432C]' : 'text-[#9B8A82] hover:text-[#2C211D]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">support_agent</span>
          <span className={`text-[10px] mt-0.5 ${activeTab === 'bantuan' ? 'font-bold' : 'font-medium'}`}>
            Bantuan
          </span>
        </button>
      </div>
    </nav>
  );
};
