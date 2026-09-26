import React from 'react';
import { TransactionRecord, formatRupiah } from '../types/ppob';
import { downloadReceiptImage, printReceipt } from '../utils/receiptDownloader';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: TransactionRecord;
  showToast?: (msg: string) => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
  showToast
}) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    if (showToast) {
      showToast('Membuka dialog cetak printer / PDF...');
    }
    printReceipt(data, () => {
      if (showToast) {
        showToast('Dokumen struk siap dicetak.');
      }
    });
  };

  const handleDownload = () => {
    try {
      downloadReceiptImage(data);
      if (showToast) {
        showToast('Gambar struk resmi berhasil diunduh!');
      }
    } catch {
      if (showToast) {
        showToast('Gagal mengunduh gambar struk.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#ece7e1] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#f8f3ec] border-b border-[#ece7e1] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#7e210e] text-[22px]">receipt_long</span>
            <h3 className="text-[17px] font-bold text-[#1d1c18]">
              Kuitansi / Struk Pembayaran Sah
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

        {/* Modal Printable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4" id="printable-receipt">
          <div className="border border-dashed border-[#8a716c] p-4 sm:p-6 rounded-2xl bg-[#fef9f2] font-mono text-[12px] space-y-3">
            {/* Store brand */}
            <div className="text-center pb-3 border-b border-dashed border-[#8a716c]/40">
              <div className="text-base sm:text-lg font-bold text-[#7e210e] tracking-tight">
                PT HESOLVIAN PEMBAYARAN NUSANTARA
              </div>
              <div className="text-[11px] text-[#57423d]">LOKET RESMI PPOB & MULTIASET TRANSAKSI</div>
              <div className="text-[10px] text-[#8a716c]">SETTLEMENT GATEWAY SERVER ID: 103.14.88.21</div>
            </div>

            {/* Trx metadata */}
            <div className="space-y-1 text-[#1d1c18]">
              <div className="flex justify-between">
                <span>NO. TRANSAKSI:</span>
                <span className="font-bold">{data.id}</span>
              </div>
              <div className="flex justify-between">
                <span>TANGGAL / WAKTU:</span>
                <span>{data.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span className="font-bold text-[#1F7A54]">{data.statusLabel.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>RECONCILE CODE:</span>
                <span>{data.reconcileId}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-[#8a716c]/40 my-2" />

            {/* Customer Details */}
            <div className="space-y-1 text-[#1d1c18]">
              <div className="flex justify-between">
                <span>ID PELANGGAN:</span>
                <span className="font-bold">{data.custId}</span>
              </div>
              <div className="flex justify-between">
                <span>NAMA:</span>
                <span>{data.custName}</span>
              </div>
              <div className="flex justify-between">
                <span>PRODUK:</span>
                <span>{data.product}</span>
              </div>
              <div className="flex justify-between">
                <span>TARIF/DAYA:</span>
                <span>{data.tarif}</span>
              </div>
              <div className="flex justify-between">
                <span>REF BILLER:</span>
                <span>{data.refCode}</span>
              </div>
            </div>

            {/* Special Token Display if applicable */}
            {data.tokenCode && (
              <div className="p-3 bg-[#e6e2db]/50 rounded-xl my-3 text-center border border-[#dec0ba]">
                <div className="text-[10px] uppercase font-bold text-[#7e210e]">
                  {data.tokenLabel}
                </div>
                <div className="text-[16px] sm:text-[18px] font-extrabold tracking-widest text-[#1d1c18] my-1 break-all">
                  {data.tokenCode}
                </div>
                <div className="text-[10px] text-[#57423d]">{data.tokenSub}</div>
              </div>
            )}

            <div className="border-t border-dashed border-[#8a716c]/40 my-2" />

            {/* Price breakdown */}
            <div className="space-y-1 text-[#1d1c18]">
              <div className="flex justify-between">
                <span>HARGA POKOK:</span>
                <span>{formatRupiah(data.priceBase)}</span>
              </div>
              <div className="flex justify-between">
                <span>BIAYA ADMIN:</span>
                <span>{formatRupiah(data.adminFee)}</span>
              </div>
              {data.discount > 0 && (
                <div className="flex justify-between text-[#7e210e]">
                  <span>DISKON PROMO:</span>
                  <span>-{formatRupiah(data.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[14px] pt-1 border-t border-[#8a716c]/30">
                <span>TOTAL BAYAR:</span>
                <span className="text-[#7e210e]">{formatRupiah(data.total)}</span>
              </div>
            </div>

            {/* Footer security note */}
            <div className="text-center pt-3 border-t border-dashed border-[#8a716c]/40 space-y-1 text-[10px] text-[#57423d]">
              <div>STRUK INI ADALAH BUKTI PEMBAYARAN YANG SAH</div>
              <div>Terima kasih atas kepercayaan Anda menggunakan Hesolvian PPOB.</div>
            </div>
          </div>
        </div>

        {/* Modal Actions - Fully Responsive on Mobile */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#f8f3ec] border-t border-[#ece7e1] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 no-print">
          <button
            type="button"
            onClick={onClose}
            className="sm:order-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#57423d] hover:bg-[#ece7e1] transition-colors cursor-pointer text-center"
          >
            Tutup
          </button>
          
          {/* REAL WORKING DOWNLOAD STRUK BUTTON */}
          <button
            type="button"
            onClick={handleDownload}
            className="sm:order-2 bg-[#1F7A54] hover:bg-[#165a3d] text-white px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[42px]"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Unduh Struk (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="sm:order-3 bg-[#7e210e] hover:bg-[#9e3823] text-white px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[42px]"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
