import React, { useState, useMemo } from 'react';
import { TransactionRecord } from '../types/ppob';
import { FAQ_CATEGORIES, FAQS_DATA, type FaqEntry } from '../data/faqData';

interface HelpPageProps {
  currentTrx?: TransactionRecord;
  onGoToCekTransaksi: (trxId?: string) => void;
  onOpenNewTransaction: () => void;
  showToast: (msg: string) => void;
  /** FAQ dari database (diatur di /admin/pusat-bantuan). Kosong = pakai data statis. */
  faqs?: FaqEntry[];
}

export const HelpPage: React.FC<HelpPageProps> = ({
  currentTrx,
  onGoToCekTransaksi,
  onOpenNewTransaction,
  showToast,
  faqs
}) => {
  const faqList = faqs && faqs.length > 0 ? faqs : FAQS_DATA;

  const [searchFaq, setSearchFaq] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Ticket form state
  const [trxIdInput, setTrxIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [issueType, setIssueType] = useState('token_not_received');
  const [issueNote, setIssueNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ id: string; time: string } | null>(null);

  // Accordion state for FAQs. Disimpan per pertanyaan, bukan per indeks, supaya
  // tidak salah buka saat daftar sedang difilter atau dicari.
  const [openFaqKey, setOpenFaqKey] = useState<string | null>(faqList[0]?.question ?? null);

  // Pill filter diturunkan dari kategori yang benar-benar ada di data.
  const faqCategoryOptions = useMemo(() => {
    const present = new Set(faqList.map((faq) => faq.category));
    const known = FAQ_CATEGORIES.filter((category) => present.has(category.id)).map((category) => ({
      id: category.id,
      label: category.label
    }));
    const unknown = [...present]
      .filter((id) => !FAQ_CATEGORIES.some((category) => category.id === id))
      .map((id) => ({ id, label: id }));
    return [...known, ...unknown];
  }, [faqList]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxIdInput.trim()) {
      showToast('Mohon masukkan Nomor Transaksi Anda!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
      setIsSubmitting(false);
      setTicketResult({
        id: generatedId,
        time:
          new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
          }) + ' WIB'
      });
      showToast(`Tiket Resolusi #${generatedId} berhasil diterbitkan!`);
    }, 850);
  };

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Halo CS Resmi Hesolvian Payment,\n\nSaya memerlukan bantuan terkait transaksi:\n- No. Transaksi: ${trxIdInput || currentTrx?.id || '-'}\n- ID Pelanggan: ${phoneInput || currentTrx?.custId || '-'}\n- Layanan: ${currentTrx ? `${currentTrx.category} (${currentTrx.product})` : '-'}\n- Kendala: ${issueType}\n\nMohon bantuannya untuk pengecekan status server. Terima kasih.`
    );
    window.open(`https://wa.me/6281200110022?text=${text}`, '_blank');
  };

  const filteredFaqs = faqList.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch =
      searchFaq === '' ||
      f.question.toLowerCase().includes(searchFaq.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchFaq.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] text-[#2C211D] animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. HERO HEADER SECTION */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-b from-[#F3EADF] via-[#FBF6EF] to-[#FBF6EF] border-b border-[#E8DDD2] pt-8 pb-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] text-[#8a716c] font-medium mb-4">
            <button
              type="button"
              onClick={() => onGoToCekTransaksi()}
              className="hover:text-[#B4432C] transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <span>/</span>
            <span className="text-[#2C211D] font-bold">Pusat Bantuan</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3.5">
              <div className="inline-flex items-center gap-2 bg-[#E4F3EC] text-[#1F7A54] px-3.5 py-1.5 rounded-full text-[12px] font-bold border border-[#1F7A54]/20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#1F7A54] animate-pulse" />
                <span>Bantuan Transaksi &amp; Customer Care</span>
              </div>

              <h1 className="font-['Newsreader'] text-3xl sm:text-5xl font-extrabold text-[#2C211D] tracking-tight leading-[1.15]">
                Transaksi Bermasalah? <br />
                <span className="text-[#B4432C]">Tenang, Kami Siap Membantu.</span>
              </h1>

              <p className="text-[14px] sm:text-[16px] text-[#6B5A53] max-w-2xl leading-relaxed font-['Manrope']">
                Laporkan kendala pulsa, token PLN, paket data, PDAM, QRIS, dan transaksi lainnya. Tim kami siap membantu memberikan solusi.
              </p>

              {/* In-page FAQ search box */}
              <div className="pt-2 max-w-xl">
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-[#9B8A82] text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchFaq}
                    onChange={(e) => setSearchFaq(e.target.value)}
                    placeholder="Cari solusi untuk kendala Anda..."
                    className="w-full bg-white border border-[#dec0ba] pl-11 pr-4 py-3.5 rounded-2xl text-[13px] sm:text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B4432C]/30 shadow-xs transition-all"
                  />
                  {searchFaq && (
                    <button
                      type="button"
                      onClick={() => setSearchFaq('')}
                      className="absolute right-3.5 text-[#8a716c] hover:text-[#2C211D] text-[12px] font-semibold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Health Node Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DDD2] shadow-[0_8px_30px_rgba(44,33,29,0.06)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD2]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#1F7A54] text-[20px]">
                      sensors
                    </span>
                    <span className="text-[13px] font-bold text-[#2C211D]">Status Sistem Live</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#1F7A54] bg-[#E4F3EC] px-2.5 py-0.5 rounded-full">
                    99.98% Normal
                  </span>
                </div>

                <div className="space-y-2.5 text-[12px]">
                  <div className="flex justify-between items-center p-2.5 bg-[#FBF6EF] rounded-xl">
                    <span className="text-[#6B5A53]">Biller Switching PLN &amp; Telco</span>
                    <span className="font-bold text-[#1F7A54] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A54]" /> Normal (14ms)
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-[#FBF6EF] rounded-xl">
                    <span className="text-[#6B5A53]">Kliring Bank QRIS &amp; Transfer Bank</span>
                    <span className="font-bold text-[#1F7A54] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A54]" /> Terhubung
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-[#FBF6EF] rounded-xl">
                    <span className="text-[#6B5A53]">Kecepatan Terbit Token</span>
                    <span className="font-bold text-[#2C211D]">Rata-rata 11 Detik</span>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href="https://wa.me/6281200110022"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#1F7A54] hover:bg-[#165a3d] text-white py-3 px-4 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Chat CS WhatsApp Langsung</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CHANNELS & TICKET RESOLUTION GRID */}
      {/* ======================================================== */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-14 space-y-12">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: WhatsApp */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-[#E8DDD2] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E4F3EC] text-[#1F7A54] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[26px]">chat</span>
              </div>
              <h3 className="text-lg font-bold text-[#2C211D]">WhatsApp Customer Care</h3>
              <p className="text-[12.5px] text-[#6B5A53] leading-relaxed">
                Butuh bantuan terkait transaksi atau pembayaran? Hubungi tim kami melalui WhatsApp untuk mendapatkan bantuan dengan cepat.
              </p>
              <div className="text-[14px] font-mono font-bold text-[#1F7A54]">
                +62 812-0011-0022
              </div>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppContact}
              className="w-full py-2.5 bg-[#E4F3EC] hover:bg-[#d5ede1] text-[#1F7A54] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Chat via WhatsApp</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Card 2: Lacak Status Transaksi */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-[#E8DDD2] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEAE5] text-[#B4432C] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[26px]">search_check</span>
              </div>
              <h3 className="text-lg font-bold text-[#2C211D]">Lacak Transaksi</h3>
              <p className="text-[12.5px] text-[#6B5A53] leading-relaxed">
                Cek status transaksi, riwayat pembayaran, dan token yang sudah dibeli dengan mudah melalui halaman pelacakan.
              </p>
              <div className="text-[12px] font-bold text-[#8a716c]">
                {currentTrx ? (
                  <>
                    Transaksi terakhir: <span className="font-mono text-[#2C211D]">{currentTrx.id}</span>
                  </>
                ) : (
                  <>Belum ada transaksi yang dilacak</>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onGoToCekTransaksi(currentTrx?.id)}
              className="w-full py-2.5 bg-[#FCEAE5] hover:bg-[#fad3c8] text-[#B4432C] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Lacak Transaksi</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Card 3: Layanan Email & Kantor */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-[#E8DDD2] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] text-[#D97706] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[26px]">mail</span>
              </div>
              <h3 className="text-lg font-bold text-[#2C211D]">Email Customer Care</h3>
              <p className="text-[12.5px] text-[#6B5A53] leading-relaxed">
                Untuk pertanyaan, kerja sama, atau kebutuhan bantuan yang membutuhkan penjelasan lebih lanjut, hubungi kami melalui email.
              </p>
              <div className="text-[13px] font-medium text-[#2C211D]">
                support@hesolvian.com
              </div>
            </div>

            <a
              href="mailto:support@hesolvian.com"
              className="w-full py-2.5 bg-[#FBF6EF] hover:bg-[#F3EADF] text-[#2C211D] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors border border-[#E8DDD2]"
            >
              <span>Kirim Email</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. DEDICATED FORM TIKET RESOLUSI PENGADUAN */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border border-[#E8DDD2] shadow-md overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#FBF6EF] via-white to-[#FBF6EF] border-b border-[#E8DDD2]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[#B4432C] text-[12px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                  <span>FORMULIR PENGADUAN TRANSAKSI</span>
                </div>
                <h2 className="font-['Newsreader'] text-2xl sm:text-3xl font-bold text-[#2C211D]">
                  Ajukan Pengaduan Transaksi
                </h2>
                <p className="text-[13px] text-[#6B5A53]">
                  Sampaikan kendala transaksi Anda. Tim kami akan memeriksa laporan dan membantu menyelesaikannya.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A54] animate-ping" />
                <span className="text-[12px] font-bold text-[#1F7A54]">
                  Estimasi penanganan: &lt; 15 menit
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {ticketResult ? (
              <div className="bg-[#E4F3EC] border border-[#1F7A54]/30 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#1F7A54] text-white flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">check</span>
                </div>

                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-[#1F7A54]">
                    Laporan Pengaduan Berhasil Dikirim!
                  </h3>
                  <p className="text-[13px] text-[#2C211D] leading-relaxed">
                    Nomor referensi pengaduan Anda adalah{' '}
                    <strong className="font-mono text-base bg-white px-2.5 py-0.5 rounded-lg border border-[#1F7A54]/30">
                      {ticketResult.id}
                    </strong>
                    . Diterbitkan pada {ticketResult.time}.
                  </p>
                  <p className="text-[12px] text-[#6B5A53]">
                    Tim kami sedang memeriksa status transaksi Anda. Tim Customer Care kami akan menghubungi nomor kontak Anda melalui WhatsApp.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleWhatsAppContact}
                    className="w-full sm:w-auto bg-[#1F7A54] hover:bg-[#165a3d] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Konfirmasi via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketResult(null)}
                    className="w-full sm:w-auto bg-white hover:bg-[#F3EADF] text-[#2C211D] border border-[#dec0ba] px-5 py-2.5 rounded-xl font-semibold text-[13px] cursor-pointer"
                  >
                    Ajukan Tiket Lain
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 1: Transaction ID */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#2C211D] flex items-center justify-between">
                      <span>Nomor Transaksi PPOB</span>
                      {currentTrx && (
                        <button
                          type="button"
                          onClick={() => setTrxIdInput(currentTrx.id)}
                          className="text-[11px] text-[#B4432C] hover:underline cursor-pointer font-semibold"
                        >
                          Gunakan transaksi terakhir ({currentTrx.id})
                        </button>
                      )}
                    </label>
                    <input
                      type="text"
                      value={trxIdInput}
                      onChange={(e) => setTrxIdInput(e.target.value)}
                      placeholder="Masukkan nomor transaksi"
                      required
                      className="w-full bg-[#FBF6EF] border border-[#dec0ba] rounded-xl px-4 py-2.5 text-[13px] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#B4432C]/30 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Field 2: Target Phone / Meter ID */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#2C211D]">
                      ID Pelanggan / Nomor HP Tujuan
                    </label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="Masukkan nomor HP atau ID pelanggan"
                      className="w-full bg-[#FBF6EF] border border-[#dec0ba] rounded-xl px-4 py-2.5 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#B4432C]/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 3: Issue Category */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#2C211D]">
                      Jenis Kendala
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full bg-[#FBF6EF] border border-[#dec0ba] rounded-xl px-4 py-2.5 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#B4432C]/30 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="token_not_received">Token PLN belum diterima</option>
                      <option value="pulsa_not_received">Pulsa belum masuk</option>
                      <option value="quota_not_received">Paket data belum masuk</option>
                      <option value="wallet_not_received">Saldo/e-wallet belum masuk</option>
                      <option value="trx_failed">Transaksi gagal</option>
                      <option value="qris_paid_unconfirmed">Pembayaran terpotong tetapi transaksi belum berhasil</option>
                      <option value="other">Kendala lainnya</option>
                    </select>
                  </div>

                  {/* Field 4: WhatsApp Contact */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#2C211D]">
                      Nomor WhatsApp untuk Update Status
                    </label>
                    <input
                      type="text"
                      placeholder="08xxxxxxxxxx"
                      className="w-full bg-[#FBF6EF] border border-[#dec0ba] rounded-xl px-4 py-2.5 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#B4432C]/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Field 5: Details / Notes */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#2C211D]">
                    Keterangan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                    placeholder="Jelaskan kendala yang Anda alami atau tambahkan informasi transaksi..."
                    className="w-full bg-[#FBF6EF] border border-[#dec0ba] rounded-xl p-3.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#B4432C]/30 focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Submit Row */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-[11.5px] text-[#6B5A53] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#1F7A54]">
                      verified_user
                    </span>
                    <span>Data Anda diproses secara aman dan hanya digunakan untuk membantu penyelesaian laporan transaksi.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#B4432C] hover:bg-[#8E3220] disabled:opacity-50 text-white font-bold text-[13.5px] px-7 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengirim Laporan...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span>Kirim Pengaduan →</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. PERTANYAAN PALING SERING DIAJUKAN (FAQ) */}
        {/* ======================================================== */}
        <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 min-w-0">
            <div className="min-w-0">
              <div className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#B4432C]">
                Pusat Informasi &amp; Solusi Cepat
              </div>
              <h2 className="font-['Newsreader'] text-2xl sm:text-3xl font-bold text-[#2C211D] leading-tight break-words mt-0.5">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>

            {/* Filter Pill - responsive horizontal scroll without visible scrollbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 pt-0.5 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
              {[{ id: 'all', label: 'Semua' }, ...faqCategoryOptions].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11.5px] sm:text-[12.5px] font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-[#B4432C] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F3EADF] text-[#6B5A53] border border-[#E8DDD2]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-2.5 sm:space-y-3 w-full min-w-0">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8 sm:py-10 bg-white rounded-2xl border border-[#E8DDD2] text-[#8a716c] text-[13px] px-4">
                Tidak ada pertanyaan yang sesuai dengan kata kunci pencarian Anda. Silakan hubungi Customer Care kami via WhatsApp.
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqKey === faq.question;
                return (
                  <div
                    key={faq.question}
                    className="w-full bg-white rounded-2xl border border-[#E8DDD2] overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqKey(isOpen ? null : faq.question)}
                      className="w-full p-3.5 sm:p-5 text-left flex items-start sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:bg-[#FBF6EF]/50 transition-colors select-none"
                    >
                      <span className="font-bold text-[13.5px] sm:text-[15px] text-[#2C211D] leading-snug sm:leading-normal pr-1 break-words">
                        {faq.question}
                      </span>
                      <span
                        className={`material-symbols-outlined text-[#B4432C] transition-transform duration-200 shrink-0 text-[20px] sm:text-[22px] mt-0.5 sm:mt-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 pt-1 text-[12.5px] sm:text-[13.5px] text-[#6B5A53] leading-relaxed border-t border-[#FBF6EF] animate-in fade-in duration-150 break-words">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. BOTTOM CALL TO ACTION BANNER */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-[#B4432C] via-[#943420] to-[#711700] rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-['Newsreader'] text-2xl sm:text-3xl font-bold">
              Butuh Transaksi PPOB Baru?
            </h3>
            <p className="text-[13px] sm:text-[14px] text-white/80 max-w-lg leading-relaxed">
              Nikmati pengisian pulsa, paket data hemat, token PLN, serta pembayaran tagihan dengan harga grosir dan jaminan mutasi instan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="w-full sm:w-auto bg-white hover:bg-[#FBF6EF] text-[#B4432C] px-6 py-3 rounded-xl font-bold text-[13.5px] transition-all cursor-pointer shadow-md active:scale-95"
            >
              Mulai Transaksi Baru
            </button>
            <button
              type="button"
              onClick={() => onGoToCekTransaksi()}
              className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/30 px-5 py-3 rounded-xl font-semibold text-[13.5px] transition-all cursor-pointer"
            >
              Lacak Transaksi
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
