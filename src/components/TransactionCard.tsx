import React from 'react';
import { TransactionRecord, formatRupiah } from '../types/ppob';
import { QrisPaymentCard } from './QrisPaymentCard';
import { downloadReceiptImage, printReceipt } from '../utils/receiptDownloader';
import { buildDynamicTimeline } from '../utils/timelineHelper';

interface TransactionCardProps {
  data: TransactionRecord;
  onCopyToken: () => void;
  onPrint: () => void;
  onShare: () => void;
  onOpenResolution: () => void;
  onPaymentSuccess: () => void;
  onSyncMutasi: () => void;
  showToast: (msg: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  data,
  onCopyToken,
  onPrint,
  onShare,
  onOpenResolution,
  onPaymentSuccess,
  onSyncMutasi,
  showToast
}) => {
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} berhasil disalin: ${text}`);
  };

  // Build dynamic timeline steps based on product & status
  const {
    steps,
    activeStep,
    progressLabel,
    headerBadgeText,
    headerBadgeBg,
    dotBg,
    statusDetailText
  } = buildDynamicTimeline(data);

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 -mt-4 mb-16" id="resultSection">
      {/* Archival Sheet Wrapper */}
      <div className="bg-white rounded-3xl shadow-[0_16px_48px_-12px_rgba(44,33,29,0.08)] overflow-hidden transition-all border border-[#E8DDD2]">
        {/* Top Status Accent Bar */}
        <div className={`h-2.5 w-full ${data.status === 'success' ? 'bg-[#1F7A54]' : data.status === 'processing' ? 'bg-[#B4432C]' : 'bg-[#D97706]'}`} />

        <div className="p-4 sm:p-7 lg:p-10 space-y-6 sm:space-y-8">
          {/* ======================================================== */}
          {/* 1. HEADER TRANSAKSI (MODERN, CLEAN & RESPONSIVE) */}
          {/* ======================================================== */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 sm:pb-6 bg-[#FBF6EF]/70 -mx-4 sm:-mx-7 lg:-mx-10 -mt-4 sm:-mt-7 lg:-mt-10 p-4 sm:p-6 lg:p-8 border-b border-[#E8DDD2]">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span className="font-['Newsreader'] text-2xl lg:text-3xl font-extrabold text-[#2C211D] tracking-tight font-mono">
                  {data.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-2xs ${headerBadgeBg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${dotBg}`} />
                  <span>{headerBadgeText}</span>
                </span>
              </div>

              <div className="text-[12.5px] sm:text-[13px] text-[#6B5A53] flex items-center gap-1.5 sm:gap-2 flex-wrap leading-relaxed">
                <span className="material-symbols-outlined text-[16px] text-[#9B8A82] shrink-0">schedule</span>
                <span>
                  Waktu Pemesanan: <strong className="text-[#2C211D] font-semibold">{data.createdAt}</strong>
                </span>
                <span className="text-[#dec0ba] hidden sm:inline">•</span>
                <span>
                  Status Transaksi:{' '}
                  <strong className={data.status === 'success' ? 'text-[#1F7A54] font-semibold' : 'text-[#B4432C] font-semibold'}>
                    {statusDetailText}
                  </strong>
                </span>
              </div>
            </div>

            {/* Quick Action Buttons (Responsive 3-Column on Mobile, Horizontal on Desktop) */}
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5 shrink-0 pt-1 lg:pt-0">
              <button
                type="button"
                onClick={() => {
                  downloadReceiptImage(data);
                  showToast('Gambar struk resmi berhasil diunduh!');
                }}
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2.5 bg-[#1F7A54] hover:bg-[#165a3d] text-white rounded-xl text-[11.5px] sm:text-[13px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                title="Unduh struk resmi transaksi"
              >
                <span className="material-symbols-outlined text-[17px] sm:text-[18px]">download</span>
                <span className="truncate">Unduh Struk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('Membuka dialog cetak printer / PDF...');
                  printReceipt(data, () => {
                    showToast('Dokumen struk siap dicetak.');
                  });
                }}
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2.5 bg-white hover:bg-[#F3EADF] text-[#2C211D] rounded-xl text-[11.5px] sm:text-[13px] font-bold transition-all cursor-pointer border border-[#dec0ba] shadow-xs active:scale-95"
                title="Cetak struk ke printer thermal / PDF"
              >
                <span className="material-symbols-outlined text-[17px] sm:text-[18px]">print</span>
                <span className="truncate">Cetak</span>
              </button>

              <button
                type="button"
                onClick={onShare}
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2.5 bg-white hover:bg-[#F3EADF] text-[#2C211D] rounded-xl text-[11.5px] sm:text-[13px] font-bold transition-all cursor-pointer border border-[#dec0ba] shadow-xs active:scale-95"
                title="Bagikan rincian transaksi"
              >
                <span className="material-symbols-outlined text-[17px] sm:text-[18px]">share</span>
                <span className="truncate">Bagikan</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. TIMELINE PROSES TRANSAKSI (DINAMIS SESUAI PRODUK) */}
          {/* ======================================================== */}
          <div className="py-2 space-y-4">
            {/* Header Timeline */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] sm:text-[14px] font-bold text-[#2C211D] tracking-tight">
                Status Proses Transaksi
              </span>
              <span className="text-[12px] sm:text-[12.5px] font-bold text-[#B4432C] bg-[#FCEAE5] px-3 py-1 rounded-full border border-[#F5A896]/40">
                {progressLabel}
              </span>
            </div>

            {/* Desktop Horizontal Stepper Bar */}
            <div className="hidden sm:block relative pt-2 pb-1">
              <div className="grid grid-cols-4 gap-4 relative">
                {/* Continuous Connecting Line Background */}
                <div className="absolute top-5 left-10 right-10 h-0.5 bg-[#E8DDD2] -z-0" />
                {/* Active progress fill line */}
                <div
                  className="absolute top-5 left-10 h-0.5 bg-[#1F7A54] -z-0 transition-all duration-500"
                  style={{
                    width:
                      activeStep === 4
                        ? 'calc(100% - 80px)'
                        : activeStep === 3
                        ? '66%'
                        : activeStep === 2
                        ? '33%'
                        : '0%'
                  }}
                />

                {steps.map((st) => {
                  const isCompleted = st.status === 'completed';
                  const isActive = st.status === 'active';

                  return (
                    <div key={st.step} className="flex flex-col items-center text-center relative z-10 px-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] transition-all duration-300 shadow-xs mb-2.5 ${
                          isCompleted
                            ? 'bg-[#1F7A54] text-white ring-4 ring-[#E4F3EC]'
                            : isActive
                            ? 'bg-[#B4432C] text-white ring-4 ring-[#FCEAE5] animate-pulse'
                            : 'bg-white text-[#9B8A82] border-2 border-[#E8DDD2]'
                        }`}
                      >
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-[20px]">check</span>
                        ) : isActive ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">
                            sync
                          </span>
                        ) : (
                          <span>{st.step}</span>
                        )}
                      </div>

                      <div className="space-y-0.5 max-w-[200px]">
                        <div
                          className={`text-[13px] font-bold leading-tight ${
                            isCompleted || isActive ? 'text-[#2C211D]' : 'text-[#8a716c]'
                          }`}
                        >
                          {st.title}
                        </div>
                        <div className="text-[11px] text-[#6B5A53] leading-snug">
                          {st.subtitle}
                        </div>
                        {st.time && st.time !== '-' && (
                          <div
                            className={`text-[10.5px] font-medium pt-0.5 ${
                              isActive ? 'text-[#B4432C] font-bold' : 'text-[#8a716c]'
                            }`}
                          >
                            {st.time}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical Stepper Flow (No cramped layout, clean touch UI) */}
            <div className="sm:hidden relative pl-8 space-y-5 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8DDD2]">
              {steps.map((st) => {
                const isCompleted = st.status === 'completed';
                const isActive = st.status === 'active';

                return (
                  <div key={st.step} className="relative">
                    <div
                      className={`absolute -left-[32px] top-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                        isCompleted
                          ? 'bg-[#1F7A54] text-white ring-2 ring-[#E4F3EC]'
                          : isActive
                          ? 'bg-[#B4432C] text-white ring-2 ring-[#FCEAE5] animate-pulse'
                          : 'bg-white text-[#9B8A82] border border-[#dec0ba]'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : (
                        <span>{st.step}</span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className={`text-[13.5px] font-bold leading-tight ${isCompleted || isActive ? 'text-[#2C211D]' : 'text-[#8a716c]'}`}>
                        {st.title}
                      </div>
                      <div className="text-[12px] text-[#6B5A53] leading-snug">
                        {st.subtitle}
                      </div>
                      {st.time && st.time !== '-' && (
                        <div className="text-[11px] text-[#8a716c] font-medium pt-0.5">
                          {st.time}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* MIDDLE HERO AREA (PENDING / PROCESSING / TOKEN SUCCESS) */}
          {/* ======================================================== */}
          {/* Case 1: Status is Pending -> Show authentic QRIS payment box with countdown & QR code */}
          {data.status === 'pending' && (
            <QrisPaymentCard
              data={data}
              onPaymentSuccess={onPaymentSuccess}
              showToast={showToast}
            />
          )}

          {/* Case 2: Status is Processing -> Show active biller switching queue banner with resync button */}
          {data.status === 'processing' && (
            <div className="bg-gradient-to-r from-[#FCEAE5]/60 via-[#FBF6EF] to-[#FCEAE5]/60 p-5 sm:p-6 rounded-2xl border-2 border-[#B4432C]/30 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#B4432C] text-white flex items-center justify-center shrink-0 shadow-xs animate-spin">
                    <span className="material-symbols-outlined text-[24px]">sync</span>
                  </div>
                  <div>
                    <h3 className="font-['Newsreader'] text-xl font-bold text-[#2C211D]">
                      Sedang Diproses Server Provider
                    </h3>
                    <p className="text-[13px] text-[#6B5A53] mt-0.5 max-w-xl">
                      {data.processingMessage ||
                        'Pembayaran telah diverifikasi. Sistem sedang meminta penyelesaian transaksi ke server provider.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSyncMutasi}
                  className="bg-[#B4432C] hover:bg-[#8E3220] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>Cek Status Sekarang</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#dec0ba]/40 flex items-center justify-between text-[11px] text-[#6B5A53]">
                <span>
                  Antrean Provider: <strong>{data.billerName}</strong>
                </span>
                <span className="text-[#1F7A54] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A54] animate-ping" />
                  Pengecekan callback aktif otomatis
                </span>
              </div>
            </div>
          )}

          {/* Case 3: Status is Success -> Show authentic 20-digit PLN Token or Serial Number */}
          {data.status === 'success' && data.tokenCode && (
            <div className="bg-gradient-to-r from-[#FBF6EF] via-[#F3EADF]/50 to-[#FBF6EF] p-4 sm:p-7 rounded-2xl relative overflow-hidden border border-[#dec0ba]/60 shadow-inner">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-[#B4432C] text-[11px] sm:text-[12px] uppercase tracking-wider font-bold">
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                      {data.category.toLowerCase().includes('pln') ? 'bolt' : 'verified'}
                    </span>
                    <span>{data.tokenLabel || 'Nomor Serial / Token'}</span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#2C211D] tracking-wider select-all font-mono bg-white/90 px-3.5 sm:px-4 py-2 rounded-xl border border-[#dec0ba]/60 shadow-xs break-all">
                      {data.tokenCode}
                    </span>
                  </div>

                  <p className="text-[12px] sm:text-[13px] text-[#6B5A53] leading-relaxed">
                    {data.tokenSub}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={onCopyToken}
                    className="w-full md:w-auto bg-[#B4432C] hover:bg-[#8E3220] text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-[13px] sm:text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer min-h-[44px]"
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">content_copy</span>
                    <span>{data.hasCopyToken ? 'Salin 20 Digit' : 'Salin Serial'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* INFORMASI PELANGGAN & PRODUK + RINCIAN PEMBAYARAN */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Card 1: Informasi Pelanggan & Produk */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-[#E8DDD2] shadow-[0_4px_20px_-4px_rgba(44,33,29,0.04)] flex flex-col justify-between space-y-5 sm:space-y-6">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-4 border-b border-[#E8DDD2]">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FCEAE5] flex items-center justify-center text-[#B4432C] shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[20px] sm:text-[22px]">contact_page</span>
                    </div>
                    <div>
                      <h3 className="font-['Newsreader'] text-lg sm:text-xl font-bold text-[#2C211D] leading-tight">
                        Informasi Pelanggan
                      </h3>
                      <p className="text-[11px] text-[#8a716c] mt-0.5">
                        Data kepemilikan rekening &amp; spesifikasi layanan
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] sm:text-[11px] font-bold text-[#B4432C] bg-[#FCEAE5] border border-[#F5A896]/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {data.categoryCode}
                  </span>
                </div>

                {/* Target Account Banner */}
                <div className="my-4 sm:my-5 p-3.5 sm:p-4 rounded-2xl bg-[#FBF6EF] border border-[#dec0ba]/60 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] font-bold text-[#8a716c] uppercase tracking-wider">
                    <span>
                      {data.category.toLowerCase().includes('pln')
                        ? 'Nomor Meter / IDPEL'
                        : data.category.toLowerCase().includes('pdam')
                        ? 'Nomor Sambungan PDAM'
                        : 'Nomor Handphone Tujuan'}
                    </span>
                    <span className="text-[10px] text-[#1F7A54] bg-[#E4F3EC] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A54]" />
                      <span>Terverifikasi</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#2C211D] tracking-tight select-all break-all">
                      {data.custId}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyText(data.custId, 'Nomor Tujuan/IDPEL')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F3EADF] text-[#2C211D] rounded-xl text-[12px] font-bold transition-all border border-[#dec0ba]/70 shadow-xs cursor-pointer shrink-0"
                      title="Salin Nomor Tujuan"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#B4432C]">content_copy</span>
                      <span>Salin</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] font-semibold text-[#1F7A54] pt-0.5">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    <span>{data.custName}</span>
                  </div>
                </div>

                {/* Structured Specs Grid */}
                <div className="space-y-3 text-[13px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 py-2 border-b border-[#FBF6EF]">
                    <span className="text-[11px] sm:text-[13px] font-bold sm:font-normal text-[#8a716c] sm:text-[#6B5A53] uppercase sm:normal-case tracking-wider sm:tracking-normal shrink-0">
                      Kategori Layanan
                    </span>
                    <span className="font-bold sm:font-semibold text-[#2C211D] sm:text-right">
                      {data.category}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-3 py-2 border-b border-[#FBF6EF]">
                    <span className="text-[11px] sm:text-[13px] font-bold sm:font-normal text-[#8a716c] sm:text-[#6B5A53] uppercase sm:normal-case tracking-wider sm:tracking-normal shrink-0">
                      Nama Produk
                    </span>
                    <span className="font-bold sm:font-semibold text-[#2C211D] sm:text-right leading-snug">
                      {data.product}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 py-2 border-b border-[#FBF6EF]">
                    <span className="text-[11px] sm:text-[13px] font-bold sm:font-normal text-[#8a716c] sm:text-[#6B5A53] uppercase sm:normal-case tracking-wider sm:tracking-normal shrink-0">
                      Tarif / Daya / Tipe
                    </span>
                    <span className="font-bold sm:font-semibold text-[#2C211D] bg-[#FBF6EF] px-2.5 py-0.5 rounded-lg text-[12px] self-start sm:self-auto border border-[#dec0ba]/40">
                      {data.tarif}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 py-2 border-b border-[#FBF6EF]">
                    <span className="text-[11px] sm:text-[13px] font-bold sm:font-normal text-[#8a716c] sm:text-[#6B5A53] uppercase sm:normal-case tracking-wider sm:tracking-normal shrink-0">
                      No. Referensi Biller
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#2C211D] text-[12px] break-all">
                        {data.refCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(data.refCode, 'No. Referensi')}
                        className="p-1 rounded bg-[#FBF6EF] text-[#8a716c] hover:text-[#B4432C] hover:bg-[#F3EADF] transition-colors cursor-pointer"
                        title="Salin No. Referensi"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Provider Footer */}
              <div className="pt-3 border-t border-[#E8DDD2] flex items-center justify-between text-[11px] text-[#6B5A53]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#1F7A54]">
                    domain
                  </span>
                  <span>{data.billerName}</span>
                </span>
                <span className="text-[#1F7A54] font-bold">Terverifikasi</span>
              </div>
            </div>

            {/* Card 2: Rincian Pembayaran */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-[#E8DDD2] shadow-[0_4px_20px_-4px_rgba(44,33,29,0.04)] flex flex-col justify-between space-y-5 sm:space-y-6">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-4 border-b border-[#E8DDD2]">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FCEAE5] flex items-center justify-center text-[#B4432C] shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                        account_balance_wallet
                      </span>
                    </div>
                    <div>
                      <h3 className="font-['Newsreader'] text-lg sm:text-xl font-bold text-[#2C211D] leading-tight">
                        Rincian Pembayaran
                      </h3>
                      <p className="text-[11px] text-[#8a716c] mt-0.5">
                        Kuitansi faktur digital &amp; transaksi kas
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Status Tag */}
                  <span
                    className={`shrink-0 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                      data.status === 'success'
                        ? 'bg-[#E4F3EC] text-[#1F7A54]'
                        : data.status === 'pending'
                        ? 'bg-[#FFF8E1] text-[#D97706]'
                        : 'bg-[#FCEAE5] text-[#B4432C]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {data.status === 'success' ? 'check_circle' : 'pending'}
                    </span>
                    <span>
                      {data.status === 'success'
                        ? 'LUNAS'
                        : data.status === 'pending'
                        ? 'MENUNGGU'
                        : 'PROSES'}
                    </span>
                  </span>
                </div>

                {/* Itemized Calculation */}
                <div className="my-4 sm:my-5 space-y-3 text-[13px]">
                  <div className="flex justify-between items-center text-[#6B5A53]">
                    <span>Harga Pokok Produk</span>
                    <span className="font-semibold text-[#2C211D] font-mono">
                      {formatRupiah(data.priceBase)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#6B5A53]">
                    <span>Biaya Layanan &amp; Administrasi</span>
                    <span className="font-semibold text-[#2C211D] font-mono">
                      {formatRupiah(data.adminFee)}
                    </span>
                  </div>

                  {data.discount > 0 && (
                    <div className="flex justify-between items-center text-[#B4432C] bg-[#FCEAE5] px-3 py-1.5 rounded-lg border border-[#F5A896]/50">
                      <span className="flex items-center gap-1 font-semibold text-[12px]">
                        <span className="material-symbols-outlined text-[14px]">sell</span>
                        <span>Diskon Kupon HESOLHEMAT</span>
                      </span>
                      <span className="font-bold font-mono">-{formatRupiah(data.discount)}</span>
                    </div>
                  )}

                  {/* Dashed Separator */}
                  <div className="border-t-2 border-dashed border-[#E8DDD2] my-3" />

                  {/* Total Amount Box */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FBF6EF] border border-[#dec0ba]/60 flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-bold text-[#2C211D]">Total Pembayaran</div>
                      <div className="text-[10px] text-[#8a716c]">Sudah termasuk PPN &amp; kliring</div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#B4432C] tracking-tight">
                      {formatRupiah(data.total)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Channel Metadata */}
              <div className="pt-3 border-t border-[#E8DDD2] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6B5A53] gap-1">
                  <span>
                    Kanal:{' '}
                    <strong className="text-[#2C211D] font-semibold">{data.method}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <span>Reconcile ID:</span>
                    <strong className="text-[#2C211D] font-mono font-semibold">{data.reconcileId}</strong>
                    <button
                      type="button"
                      onClick={() => handleCopyText(data.reconcileId, 'Reconcile ID')}
                      className="text-[#8a716c] hover:text-[#B4432C] cursor-pointer ml-1"
                      title="Salin Reconcile ID"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assistance Action Row */}
          <div className="pt-4 border-t border-[#E8DDD2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-[#6B5A53]">
              <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-[#1F7A54] shrink-0">
                verified_user
              </span>
              <span className="text-[12px] sm:text-[13px] leading-snug">
                Bukti transaksi resmi dan sah tersimpan aman di server loket pembayaran.
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenResolution}
              className="w-full sm:w-auto justify-center text-[#B4432C] hover:text-[#8E3220] bg-[#FCEAE5] sm:bg-transparent py-2.5 px-3.5 sm:p-0 rounded-xl text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#F5A896]/40 sm:border-0"
            >
              <span>Mengalami kendala pada transaksi ini?</span>
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">support_agent</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
