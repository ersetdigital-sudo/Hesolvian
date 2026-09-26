import React from 'react';

export const EmptyTransactionState: React.FC = () => {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 -mt-4 mb-16" id="resultSection">
      <div className="bg-white rounded-3xl shadow-[0_16px_48px_-12px_rgba(44,33,29,0.08)] border border-[#E8DDD2] overflow-hidden">
        {/* Neutral status accent bar */}
        <div className="h-2.5 w-full bg-[#E8DDD2]" />

        <div className="p-8 sm:p-12 lg:p-14 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FBF6EF] border border-[#E8DDD2] flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-[32px] text-[#9B8A82]">receipt_long</span>
          </div>

          <h2 className="font-['Newsreader'] text-2xl sm:text-3xl font-extrabold text-[#2C211D] tracking-tight">
            Belum Ada Transaksi Dilacak
          </h2>

          <p className="text-[13.5px] sm:text-[14.5px] text-[#6B5A53] max-w-md mt-2.5 leading-relaxed font-['Manrope']">
            Masukkan Nomor Transaksi atau Nomor HP / ID Pelanggan pada kolom pencarian di atas,
            lalu tekan <strong className="font-bold text-[#2C211D]">Cek Sekarang</strong> untuk
            melihat status pembayaran Anda.
          </p>

          <div className="mt-7 pt-6 border-t border-[#F2EDE6] w-full max-w-md grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {[
              { icon: 'receipt_long', label: 'Nomor Transaksi', hint: 'Format HSV...' },
              { icon: 'smartphone', label: 'Nomor HP', hint: '08xxxxxxxxxx' },
              { icon: 'bolt', label: 'ID Pelanggan', hint: 'Nomor meter / pelanggan' }
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FBF6EF] border border-[#E8DDD2]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#B4432C] mt-0.5 shrink-0">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-[11.5px] font-bold text-[#2C211D] leading-tight">{item.label}</div>
                  <div className="text-[11px] text-[#9B8A82] leading-tight mt-0.5">{item.hint}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
