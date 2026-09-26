import React, { useState } from 'react';
import { TransactionRecord } from '../types/ppob';

interface ResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: TransactionRecord;
  onSyncMutasi: () => void;
  showToast: (msg: string) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  isOpen,
  onClose,
  data,
  onSyncMutasi,
  showToast
}) => {
  const [complaintType, setComplaintType] = useState('token_not_received');
  const [userNote, setUserNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
      setIsSubmitting(false);
      setTicketCreated(ticketId);
      showToast(`Tiket Resolusi #${ticketId} berhasil diterbitkan.`);
    }, 900);
  };

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Halo Layanan 24/7 Agent Desk Hesolvian,\n\nSaya ingin menanyakan resolusi status transaksi:\nNo. Transaksi: ${data.id}\nLayanan: ${data.category} (${data.product})\nID Pelanggan: ${data.custId}\nStatus Saat Ini: ${data.statusLabel}\n\nMohon bantuannya untuk pengecekan rekonsiliasi server. Terima kasih.`
    );
    window.open(`https://wa.me/6281200000000?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#ece7e1] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f8f3ec] border-b border-[#ece7e1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7e210e] text-[22px]">
              support_agent
            </span>
            <div>
              <h3 className="font-['Newsreader'] text-xl font-bold text-[#1d1c18]">
                Pusat Resolusi Transaksi
              </h3>
              <p className="font-['Manrope'] text-[11px] text-[#57423d]">
                Tiket Rekonsiliasi &amp; Validasi Audit Ledger
              </p>
            </div>
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Diagnostic Checks Status Bar */}
          <div className="bg-[#fef9f2] rounded-2xl p-4 border border-[#dec0ba]/50 space-y-2">
            <div className="flex items-center justify-between text-[12px] font-bold text-[#1d1c18]">
              <span>DIAGNOSTIK SERVER &amp; MUTASI</span>
              <span className="text-[#1F7A54] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1F7A54] animate-ping" />
                Semua Node Online
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 bg-white rounded-lg border border-[#ece7e1] text-center">
                <div className="text-[#57423d]">Gateway Hash</div>
                <div className="font-bold text-[#1F7A54] mt-0.5">VALID (SHA256)</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ece7e1] text-center">
                <div className="text-[#57423d]">Biller Ping</div>
                <div className="font-bold text-[#1F7A54] mt-0.5">14ms Respon</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#ece7e1] text-center">
                <div className="text-[#57423d]">Bank Kliring</div>
                <div className="font-bold text-[#1F7A54] mt-0.5">TERHUBUNG</div>
              </div>
            </div>
          </div>

          {/* Quick Resync Mutasi Button */}
          <div className="p-4 bg-[#f8f3ec] rounded-2xl border border-[#ece7e1] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-['Manrope'] text-[13px] font-bold text-[#1d1c18]">
                Sinkronisasi Mutasi Ulang
              </h4>
              <p className="font-['Manrope'] text-[11px] text-[#57423d]">
                Panggil callback server provider untuk memeriksa status SN terkini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSyncMutasi();
                showToast('Sinkronisasi mutasi ledger ke provider sukses!');
              }}
              className="bg-[#9e3823] hover:bg-[#7e210e] text-white px-4 py-2 rounded-xl font-['Manrope'] text-[12px] font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Sinkron Ulang</span>
            </button>
          </div>

          {/* Resolution Ticket Form */}
          {ticketCreated ? (
            <div className="p-6 bg-[#E4F3EC] rounded-2xl border border-[#1F7A54]/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#1F7A54] text-white mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <h4 className="font-['Newsreader'] text-xl font-bold text-[#1d1c18]">
                Tiket Berhasil Diterbitkan!
              </h4>
              <p className="font-['Manrope'] text-[13px] text-[#57423d] max-w-sm mx-auto">
                Nomor Tiket Anda:{' '}
                <strong className="text-[#1d1c18] font-mono text-base">{ticketCreated}</strong>.
                Tim rekonsiliasi sedang memeriksa log ledger dan akan menyelesaikan dalam 5-15
                menit.
              </p>
              <button
                type="button"
                onClick={() => setTicketCreated(null)}
                className="mt-2 text-[12px] text-[#7e210e] font-bold hover:underline cursor-pointer"
              >
                Buat laporan baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <h4 className="font-['Manrope'] text-[14px] font-bold text-[#1d1c18]">
                Kirim Laporan Kendala Transaksi #{data.id}
              </h4>

              <div className="space-y-1">
                <label className="font-['Manrope'] text-[12px] font-semibold text-[#57423d]">
                  Jenis Kendala
                </label>
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="w-full bg-[#fef9f2] border border-[#ece7e1] rounded-xl px-3 py-2 text-[13px] font-medium text-[#1d1c18] outline-hidden focus:ring-2 focus:ring-[#9e3823]/30"
                >
                  <option value="token_not_received">SN / Token Listrik belum terbit</option>
                  <option value="qris_deducted_not_success">Saldo QRIS terpotong tapi status belum sukses</option>
                  <option value="wrong_meter_input">Salah input nomor meter / ID pelanggan</option>
                  <option value="kwh_not_added">Token sudah dimasukkan tapi kWh meter periksa/gagal</option>
                  <option value="other">Kendala Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-['Manrope'] text-[12px] font-semibold text-[#57423d]">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Ceritakan detail kendala atau jam mutasi pada aplikasi bank Anda..."
                  className="w-full bg-[#fef9f2] border border-[#ece7e1] rounded-xl p-3 text-[13px] text-[#1d1c18] outline-hidden focus:ring-2 focus:ring-[#9e3823]/30"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#7e210e] hover:bg-[#9e3823] text-white py-2.5 px-4 rounded-xl font-['Manrope'] text-[13px] font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Memproses Tiket...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Kirim Tiket Otomatis</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppContact}
                  className="bg-[#25D366] hover:bg-[#1EBE5B] text-white py-2.5 px-4 rounded-xl font-['Manrope'] text-[13px] font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>WhatsApp CS 24/7</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
