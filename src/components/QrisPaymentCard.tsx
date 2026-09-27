import React, { useState, useEffect } from 'react';
import { TransactionRecord, formatRupiah } from '../types/ppob';
import { downloadQrisStandImage } from '../utils/receiptDownloader';
import type { PaymentSettings } from '../lib/types';

interface QrisPaymentCardProps {
  data: TransactionRecord;
  /** Konfigurasi QRIS dari /admin/pembayaran (gambar, nama merchant, NMID). */
  payments?: PaymentSettings | null;
  onPaymentSuccess: () => void;
  showToast: (msg: string) => void;
}

export const QrisPaymentCard: React.FC<QrisPaymentCardProps> = ({
  data,
  payments = null,
  onPaymentSuccess,
  showToast
}) => {
  const [secondsLeft, setSecondsLeft] = useState(data.qrisData?.remainingSeconds || 840);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const copyNominal = () => {
    navigator.clipboard.writeText(String(data.total));
    showToast(`Nominal ${formatRupiah(data.total)} disalin ke papan klip!`);
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    showToast('Mengecek mutasi kliring QRIS ke server perbankan...');
    setTimeout(() => {
      setIsVerifying(false);
      onPaymentSuccess();
      showToast('Pembayaran QRIS tervalidasi lunas! Pesanan langsung diproses.');
    }, 1200);
  };

  const handleDownloadQr = () => {
    try {
      downloadQrisStandImage(data);
      showToast('Gambar QRIS berhasil diunduh ke perangkat Anda!');
    } catch {
      showToast('Gagal mengunduh gambar QRIS. Silakan screenshot layar ini.');
    }
  };

  const merchantName =
    data.qrisData?.merchantName || 'Hesolvian Payment / PT Hesolvian Nusantara';

  const nmid = data.qrisData?.nmid || 'ID1020039281920';

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#fe7e5d]/40 shadow-sm overflow-hidden p-4 sm:p-7">
      {/* Top Banner Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-[#ece7e1]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FBF1DF] flex items-center justify-center text-[#9C6114] shrink-0">
            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
          </div>
          <div>
            <h3 className="font-['Newsreader'] text-lg sm:text-xl font-bold text-[#1d1c18]">
              Menunggu Pembayaran QRIS
            </h3>
            <p className="font-['Manrope'] text-[12px] sm:text-[13px] text-[#57423d]">
              Pindai kode QRIS di bawah menggunakan m-Banking atau E-Wallet Anda.
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="inline-flex items-center gap-2 bg-[#FBF1DF] text-[#9C6114] px-3.5 py-1.5 sm:py-2 rounded-xl self-start sm:self-auto border border-[#9C6114]/20">
          <span className="material-symbols-outlined text-[16px] sm:text-[18px] animate-pulse">timer</span>
          <div className="font-['Manrope'] text-[12px] sm:text-[13px] font-semibold">
            Sisa Waktu:{' '}
            <strong className="font-mono text-[14px] sm:text-[15px] font-bold text-[#711700]">
              {timeFormatted}
            </strong>
          </div>
        </div>
      </div>

      {/* Main QRIS Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 pt-5 sm:pt-6 items-center">
        {/* Left Column: Official QRIS Stand Box */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[290px] bg-white rounded-2xl border border-[#dec0ba] p-4 shadow-md flex flex-col items-center text-center relative">
            {/* Official QRIS Header */}
            <div className="w-full bg-[#ba1a1a] text-white py-1.5 px-3 rounded-lg flex items-center justify-between mb-2.5 shadow-xs">
              <span className="font-['Manrope'] font-extrabold tracking-wider text-[14px]">
                QRIS
              </span>
              <span className="font-['Manrope'] text-[9px] font-bold tracking-tight uppercase opacity-90">
                Pembayaran Nasional
              </span>
            </div>

            {/* Merchant Name: NEVER TRUNCATED / NEVER CUT OFF */}
            <div className="text-[12px] sm:text-[13px] font-bold text-[#1d1c18] leading-snug text-center px-1 break-words w-full">
              {merchantName}
            </div>

            <div className="text-[10px] text-[#8a716c] font-mono mt-0.5 mb-2.5">
              NMID: {nmid}
            </div>

            {/* Generated High-Fidelity SVG QR Matrix */}
            <div
              onClick={handleDownloadQr}
              title="Klik untuk mengunduh kode QRIS"
              className="p-3 bg-white border border-[#ece7e1] rounded-xl shadow-inner relative group cursor-pointer w-full flex items-center justify-center"
            >
              {payments?.qris.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={payments.qris.imageUrl}
                  alt={`Kode QRIS ${merchantName}`}
                  loading="lazy"
                  className="w-48 h-48 sm:w-52 sm:h-52 rounded-lg bg-white object-contain"
                />
              ) : (
              <svg
                viewBox="0 0 160 160"
                className="w-48 h-48 sm:w-52 sm:h-52"
                fill="#1d1c18"
              >
                {/* Finder Pattern Top-Left */}
                <rect x="10" y="10" width="40" height="40" rx="4" fill="#1d1c18" />
                <rect x="16" y="16" width="28" height="28" rx="2" fill="white" />
                <rect x="22" y="22" width="16" height="16" rx="1" fill="#1d1c18" />

                {/* Finder Pattern Top-Right */}
                <rect x="110" y="10" width="40" height="40" rx="4" fill="#1d1c18" />
                <rect x="116" y="16" width="28" height="28" rx="2" fill="white" />
                <rect x="122" y="22" width="16" height="16" rx="1" fill="#1d1c18" />

                {/* Finder Pattern Bottom-Left */}
                <rect x="10" y="110" width="40" height="40" rx="4" fill="#1d1c18" />
                <rect x="16" y="116" width="28" height="28" rx="2" fill="white" />
                <rect x="22" y="122" width="16" height="16" rx="1" fill="#1d1c18" />

                {/* Timing patterns & simulated data matrix modules */}
                <rect x="56" y="22" width="6" height="6" />
                <rect x="68" y="22" width="6" height="6" />
                <rect x="80" y="22" width="6" height="6" />
                <rect x="92" y="22" width="6" height="6" />

                <rect x="22" y="56" width="6" height="6" />
                <rect x="22" y="68" width="6" height="6" />
                <rect x="22" y="80" width="6" height="6" />
                <rect x="22" y="92" width="6" height="6" />

                {/* Center data modules */}
                <rect x="56" y="56" width="12" height="12" rx="1" />
                <rect x="74" y="56" width="6" height="6" />
                <rect x="86" y="56" width="18" height="6" />
                <rect x="56" y="74" width="6" height="12" />
                <rect x="68" y="68" width="12" height="12" rx="1" />
                <rect x="86" y="68" width="6" height="6" />
                <rect x="98" y="68" width="12" height="18" />
                <rect x="116" y="56" width="12" height="6" />
                <rect x="134" y="56" width="16" height="6" />

                <rect x="56" y="92" width="18" height="6" />
                <rect x="80" y="86" width="12" height="12" rx="1" />
                <rect x="98" y="92" width="6" height="6" />
                <rect x="110" y="80" width="12" height="12" />
                <rect x="128" y="80" width="12" height="12" />

                <rect x="56" y="110" width="12" height="18" />
                <rect x="74" y="110" width="18" height="6" />
                <rect x="98" y="116" width="12" height="12" />
                <rect x="116" y="110" width="18" height="6" />
                <rect x="140" y="110" width="10" height="18" />

                <rect x="74" y="128" width="6" height="18" />
                <rect x="86" y="122" width="18" height="6" />
                <rect x="110" y="134" width="12" height="12" />
                <rect x="128" y="128" width="12" height="18" />

                {/* GPN Center Icon */}
                <rect x="68" y="70" width="24" height="20" rx="3" fill="#ba1a1a" />
                <text
                  x="80"
                  y="84"
                  fill="white"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  GPN
                </text>
              </svg>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[12px] font-semibold gap-1.5">
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Unduh QR</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-[#57423d]">
              <span className="material-symbols-outlined text-[14px] text-[#1F7A54]">
                verified
              </span>
              <span>Dicetak otomatis oleh Bank Indonesia</span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Details & Instructions */}
        <div className="md:col-span-7 space-y-4 sm:space-y-5">
          {/* Nominal Box */}
          <div className="bg-[#fef9f2] p-4 sm:p-5 rounded-2xl border border-[#dec0ba]/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-[#57423d] font-semibold">
              <span>TOTAL PEMBAYARAN TEPAT</span>
              <span className="text-[#9C6114] font-bold">Harus Sesuai Angka Unik</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <div className="font-['Manrope'] text-2xl sm:text-4xl font-extrabold text-[#7e210e] tracking-tight">
                  {formatRupiah(data.total)}
                </div>
                <div className="text-[11px] sm:text-[12px] text-[#8a716c] mt-0.5">
                  Termasuk kode unik verifikasi otomatis.
                </div>
              </div>

              <button
                type="button"
                onClick={copyNominal}
                className="inline-flex items-center gap-1.5 bg-[#ece7e1] hover:bg-[#e6e2db] text-[#1d1c18] px-3.5 sm:px-4 py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all cursor-pointer shadow-xs self-start sm:self-auto min-h-[38px]"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Salin Nominal</span>
              </button>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="space-y-2">
            <div className="text-[12px] sm:text-[13px] font-bold text-[#1d1c18]">
              Cara Pembayaran Melalui QRIS:
            </div>
            <ol className="text-[11.5px] sm:text-[12px] text-[#57423d] space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                Buka aplikasi perbankan (<strong>BCA Mobile, Livin Mandiri, BRImo, BNI</strong>) atau e-wallet (<strong>GoPay, OVO, DANA, ShopeePay</strong>).
              </li>
              <li>Pilih menu <strong>Scan / Bayar QRIS</strong> dan arahkan kamera ke kode QR.</li>
              <li>
                Pastikan nama merchant adalah <strong>{merchantName}</strong> dan nominal tepat <strong>{formatRupiah(data.total)}</strong>.
              </li>
              <li>Masukkan PIN transaksi Anda. Mutasi akan terdeteksi otomatis dalam 5-15 detik.</li>
            </ol>
          </div>

          {/* Action Row - Highly Responsive on Mobile */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isVerifying}
              className="flex-1 bg-[#1F7A54] hover:bg-[#165a3d] text-white py-3.5 px-5 rounded-xl font-['Manrope'] text-[13px] sm:text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.985] disabled:opacity-50 min-h-[48px]"
            >
              {isVerifying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Mutasi Kliring...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                  <span>Saya Sudah Bayar (Cek Mutasi)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="px-4 py-3 sm:py-3.5 bg-[#f2ede6] hover:bg-[#ece7e1] text-[#1d1c18] rounded-xl font-['Manrope'] text-[13px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#dec0ba]/40 shadow-xs min-h-[44px]"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Unduh QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
