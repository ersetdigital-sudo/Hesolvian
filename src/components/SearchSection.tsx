import React from 'react';

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchType: 'trx' | 'cust';
  setSearchType: (type: 'trx' | 'cust') => void;
  onSearch: (q?: string) => void;
  onPaste: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  onSearch,
  onPaste
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#fef9f2] via-[#f8f3ec] to-[#fef9f2] pb-8 sm:pb-12 pt-4 sm:pt-8">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#fe7e5d]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-0 w-80 sm:w-[480px] h-80 sm:h-96 rounded-full bg-[#9e3823]/5 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col items-center text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 bg-[#ece7e1]/90 text-[#7e210e] px-3.5 py-1.5 rounded-full mb-3 sm:mb-4 shadow-xs border border-[#dec0ba]/40">
          <span className="material-symbols-outlined text-[15px] sm:text-[16px] animate-pulse">radar</span>
          <span className="font-['Manrope'] text-[10px] sm:text-[11px] uppercase tracking-wider font-bold">
            Pelacakan Status Transaksi Real-Time
          </span>
        </div>

        {/* Main Heading & Premise (Updated to user's exact wording) */}
        <h1 className="font-['Newsreader'] text-3xl sm:text-4xl md:text-5xl text-[#1d1c18] max-w-3xl tracking-tight mb-2 sm:mb-3 font-semibold leading-tight">
          Lacak Transaksi PPOB Anda
        </h1>
        <p className="font-['Manrope'] text-[14px] sm:text-[16px] text-[#57423d] max-w-2xl leading-relaxed mb-6 sm:mb-8 px-2">
          Cek status pulsa, token PLN, PDAM, paket data, dan e-wallet Anda secara real-time dalam satu tempat.
        </p>

        {/* Prominent Search Console Box - High End Mobile Styling */}
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-[0_12px_40px_-10px_rgba(44,33,29,0.08)] text-left border border-[#ece7e1]">
          {/* Switchable Segmented Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 pb-2 mb-3 sm:mb-4 border-b border-[#f2ede6]">
            <button
              type="button"
              onClick={() => {
                setSearchType('trx');
              }}
              className={`flex-1 sm:flex-initial font-['Manrope'] text-[12px] sm:text-[13px] px-3 sm:px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
                searchType === 'trx'
                  ? 'bg-[#9e3823] text-white shadow-xs'
                  : 'bg-[#f2ede6] text-[#57423d] hover:text-[#1d1c18] hover:bg-[#ece7e1]'
              }`}
            >
              No. Transaksi (HSV...)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchType('cust');
              }}
              className={`flex-1 sm:flex-initial font-['Manrope'] text-[12px] sm:text-[13px] px-3 sm:px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
                searchType === 'cust'
                  ? 'bg-[#9e3823] text-white shadow-xs'
                  : 'bg-[#f2ede6] text-[#57423d] hover:text-[#1d1c18] hover:bg-[#ece7e1]'
              }`}
            >
              No. HP / ID Pelanggan
            </button>
          </div>

          {/* Master Input Row */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3">
            <div className="relative flex-1 flex items-center bg-[#fef9f2] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#9e3823]/30 transition-all border border-[#dec0ba]/60 shadow-inner">
              <span className="material-symbols-outlined text-[#7e210e] text-[20px] sm:text-[22px] mr-2.5 shrink-0">
                search_check
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  searchType === 'trx'
                    ? 'Masukkan nomor transaksi'
                    : 'Masukkan nomor HP / ID pelanggan'
                }
                className="w-full bg-transparent font-['Manrope'] text-base sm:text-xl font-bold text-[#1d1c18] outline-hidden placeholder:text-[#8a716c]/50 placeholder:font-normal placeholder:text-xs sm:placeholder:text-sm"
              />
              <button
                type="button"
                onClick={onPaste}
                title="Tempel dari Papan Klip"
                className="shrink-0 flex items-center gap-1 bg-[#ece7e1] hover:bg-[#e6e2db] text-[#57423d] hover:text-[#1d1c18] px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">content_paste</span>
                <span>Tempel</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSearch()}
              className="bg-[#7e210e] hover:bg-[#9e3823] text-white font-['Manrope'] text-[13px] sm:text-[14px] font-bold px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.985] flex items-center justify-center gap-2 shrink-0 cursor-pointer min-h-[44px]"
            >
              <span>Cek Sekarang</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
