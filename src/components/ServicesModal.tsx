import React, { useState } from 'react';

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (serviceName: string, categoryId?: string) => void;
}

export const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  onSelectService
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const services = [
    { id: 'pln-token', categoryId: 'pln', name: 'PLN Prabayar (Token)', cat: 'Kelistrikan', icon: 'bolt', desc: 'Beli token listrik resmi 20 digit instan kliring' },
    { id: 'pln-post', categoryId: 'pln', name: 'PLN Pascabayar (Tagihan)', cat: 'Kelistrikan', icon: 'electric_meter', desc: 'Bayar tagihan listrik bulanan resmi PLN' },
    { id: 'pulsa-tsel', categoryId: 'pulsa', name: 'Pulsa Telkomsel / Halo', cat: 'Pulsa & Data', icon: 'cell_tower', desc: 'Isi pulsa & kuota internet Telkomsel' },
    { id: 'pulsa-isat', categoryId: 'pulsa', name: 'Indosat Ooredoo Hutchison', cat: 'Pulsa & Data', icon: 'signal_cellular_alt', desc: 'Paket Freedom Combo & pulsa reguler' },
    { id: 'pdam-nasional', categoryId: 'pdam', name: 'PDAM & Tagihan Air', cat: 'Utilitas', icon: 'water_drop', desc: 'Cek & bayar tagihan air PDAM seluruh Indonesia' },
    { id: 'bpjs-kes', categoryId: 'bpjs', name: 'BPJS Kesehatan', cat: 'Asuransi', icon: 'health_and_safety', desc: 'Iuran jaminan kesehatan BPJS nasional' },
    { id: 'ewallet', categoryId: 'emoney', name: 'Top Up E-Wallet', cat: 'Uang Elektronik', icon: 'account_balance_wallet', desc: 'GoPay, OVO, DANA, ShopeePay, LinkAja & isi kartu e-Toll' },
    { id: 'game-mlbb', categoryId: 'game', name: 'Voucher Game Mobile Legends', cat: 'Game & Entertainment', icon: 'sports_esports', desc: 'Top up Diamond MLBB dan Pass mingguan' },
    { id: 'internet-wifi', categoryId: 'internet', name: 'Tagihan IndiHome & TV Kabel', cat: 'Internet & TV', icon: 'router', desc: 'Pembayaran langganan internet bulanan' },
  ];

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#ece7e1] flex flex-col max-h-[85vh]">
        {/* Search header */}
        <div className="p-4 bg-[#f8f3ec] border-b border-[#ece7e1] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#7e210e] text-[22px]">search</span>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari layanan (contoh: PLN, Telkomsel, PDAM, BPJS)..."
            className="flex-1 bg-transparent text-[15px] font-medium text-[#1d1c18] outline-hidden placeholder:text-[#8a716c]"
          />
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#ece7e1] flex items-center justify-center text-[#57423d] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Results */}
        <div className="p-4 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-[#57423d]">
              <span className="material-symbols-outlined text-4xl text-[#dec0ba] mb-2 block">
                search_off
              </span>
              <p className="text-[14px]">Layanan tidak ditemukan</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectService(item.name, item.categoryId);
                  onClose();
                }}
                className="p-3.5 rounded-2xl hover:bg-[#f8f3ec] transition-colors flex items-center justify-between gap-4 cursor-pointer border border-transparent hover:border-[#dec0ba]/40 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#ffdad3] text-[#7e210e] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-['Manrope'] text-[14px] font-bold text-[#1d1c18]">
                        {item.name}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-[#7e210e] bg-[#ece7e1] px-1.5 py-0.5 rounded">
                        {item.cat}
                      </span>
                    </div>
                    <p className="font-['Manrope'] text-[12px] text-[#57423d]">{item.desc}</p>
                  </div>
                </div>

                <span className="material-symbols-outlined text-[#8a716c] group-hover:text-[#7e210e] text-[18px]">
                  arrow_forward
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
