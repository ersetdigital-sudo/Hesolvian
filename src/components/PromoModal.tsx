import React from 'react';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPromo: (code: string) => void;
  showToast: (msg: string) => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  isOpen,
  onClose,
  onApplyPromo,
  showToast
}) => {
  if (!isOpen) return null;

  const promos = [
    {
      code: 'HESOLHEMAT',
      title: 'Diskon Spesial Kliring Rp1.250',
      desc: 'Potongan langsung untuk transaksi Token PLN & PDAM dengan pembayaran QRIS Dinamis.',
      minTrx: 'Rp50.000',
      badge: 'POPULER'
    },
    {
      code: 'PLNBERKAH',
      title: 'Cashback Admin PLN Rp2.000',
      desc: 'Bebas biaya administrasi untuk pembelian token listrik prabayar nominal Rp100.000 ke atas.',
      minTrx: 'Rp100.000',
      badge: 'TERBATAS'
    },
    {
      code: 'KILATDATA',
      title: 'Diskon Pulsa & Paket Data 5%',
      desc: 'Hemat biaya isi ulang kuota data Telkomsel, Indosat, dan XL Axiata.',
      minTrx: 'Rp25.000',
      badge: 'ALL OPERATOR'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#ece7e1] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f8f3ec] border-b border-[#ece7e1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7e210e] text-[22px]">sell</span>
            <h3 className="font-['Newsreader'] text-xl font-bold text-[#1d1c18]">
              Promo &amp; Voucher Ledger Aktif
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#ece7e1] flex items-center justify-center text-[#57423d] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {promos.map((promo) => (
            <div
              key={promo.code}
              className="p-4 rounded-2xl bg-[#fef9f2] border border-[#dec0ba]/60 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['Newsreader'] text-lg font-bold text-[#1d1c18]">
                      {promo.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#7e210e] bg-[#ffdad3] px-2 py-0.5 rounded-full">
                      {promo.badge}
                    </span>
                  </div>
                  <p className="font-['Manrope'] text-[12px] text-[#57423d] mt-1 leading-relaxed">
                    {promo.desc}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#ece7e1] flex items-center justify-between">
                <div className="font-['Manrope'] text-[11px] text-[#8a716c]">
                  Min. Trx: <strong className="text-[#1d1c18]">{promo.minTrx}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-bold text-[#7e210e] bg-white px-2.5 py-1 rounded-lg border border-[#dec0ba]">
                    {promo.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code);
                      onApplyPromo(promo.code);
                      showToast(`Kode promo ${promo.code} disalin!`);
                      onClose();
                    }}
                    className="bg-[#7e210e] hover:bg-[#9e3823] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Gunakan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
