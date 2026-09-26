import React from 'react';

interface FooterProps {
  onSelectCategory?: (category: string) => void;
  onOpenHelpDesk?: () => void;
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenHelpDesk,
  onNavigate
}) => {
  return (
    <footer className="w-full bg-white border-t border-[#E8DDD2] pt-12 sm:pt-14 pb-8 font-['Plus_Jakarta_Sans',sans-serif]" id="footer">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E2694A] to-[#B4432C] flex items-center justify-center text-white font-extrabold text-base shadow-xs">
                H
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#2C211D]">
                Hesolvian
              </span>
            </div>
            <p className="text-[13px] text-[#6B5A53] leading-relaxed">
              Semua Pembayaran Lebih Mudah. Pulsa, PLN, PDAM, BPJS, Internet, E-Wallet, dan Multifinance dalam satu platform.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {['Instagram', 'Facebook', 'YouTube', 'WhatsApp'].map((net) => (
                <a
                  key={net}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (net === 'WhatsApp') {
                      window.open('https://wa.me/6281200110022', '_blank');
                    }
                  }}
                  className="w-9 h-9 rounded-xl bg-[#FBF6EF] hover:bg-[#FCEAE5] hover:text-[#B4432C] text-[#6B5A53] flex items-center justify-center transition-colors border border-[#E8DDD2]"
                  title={net}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {net === 'WhatsApp' ? 'chat' : net === 'Instagram' ? 'photo_camera' : net === 'YouTube' ? 'smart_display' : 'share'}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#9B8A82] mb-4">
              Menu Layanan
            </h4>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('beranda')}
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors cursor-pointer"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate('beranda');
                    setTimeout(() => {
                      document.getElementById('kategori-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors cursor-pointer"
                >
                  Kategori
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate('beranda');
                    setTimeout(() => {
                      document.getElementById('promo-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors cursor-pointer"
                >
                  Promo
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('cek-transaksi')}
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors cursor-pointer font-semibold"
                >
                  Cek Transaksi
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenHelpDesk && onOpenHelpDesk()}
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors cursor-pointer"
                >
                  Pusat Bantuan
                </button>
              </li>
            </ul>
          </div>

          {/* Tentang Kami */}
          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#9B8A82] mb-4">
              Tentang Kami
            </h4>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('tentang')}
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors cursor-pointer"
                >
                  Tentang Hesolvian
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('syarat-ketentuan')}
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors cursor-pointer"
                >
                  Syarat &amp; Ketentuan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('kebijakan-privasi')}
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors cursor-pointer"
                >
                  Kebijakan Privasi
                </button>
              </li>
            </ul>
          </div>

          {/* Hubungi Kami */}
          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#9B8A82] mb-4">
              Hubungi Kami
            </h4>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <a
                  href="https://wa.me/6281200110022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#1F7A54]">chat</span>
                  <span>WhatsApp: 0812-0011-0022</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:cs@hesolvian.com"
                  className="text-[#6B5A53] hover:text-[#B4432C] transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <span>Email: cs@hesolvian.com</span>
                </a>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FBF6EF] rounded-full text-[12px] font-bold text-[#1F7A54]">
                  <span className="w-2 h-2 rounded-full bg-[#1F7A54] animate-pulse" />
                  Layanan Bantuan 24 Jam
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#E8DDD2] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#9B8A82] text-center sm:text-left">
            © 2025 Hesolvian. Semua hak dilindungi undang-undang.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6B5A53] bg-[#FBF6EF] px-3 py-1.5 rounded-lg border border-[#E8DDD2]">
              <span className="material-symbols-outlined text-[15px] text-[#1F7A54]">
                verified_user
              </span>
              Server Resmi
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6B5A53] bg-[#FBF6EF] px-3 py-1.5 rounded-lg border border-[#E8DDD2]">
              <span className="material-symbols-outlined text-[15px] text-[#1F7A54]">
                qr_code_2
              </span>
              QRIS Verified
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6B5A53] bg-[#FBF6EF] px-3 py-1.5 rounded-lg border border-[#E8DDD2]">
              <span className="material-symbols-outlined text-[15px] text-[#1F7A54]">lock</span>
              SSL Secure
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
