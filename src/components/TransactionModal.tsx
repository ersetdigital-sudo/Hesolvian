import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES_DATA, CategoryData, NomItem } from '../data/categoriesData';
import { TransactionRecord, formatRupiah } from '../types/ppob';
import type { PaymentSettings } from '../lib/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId: string | null;
  /** Opsional: label nominal yang mau langsung dipilih (dipakai Flash Sale). */
  initialItemLabel?: string | null;
  /**
   * Opsional: nama grup/tab yang mau dibuka (dipakai Flash Sale kategori
   * gabungan seperti E-Wallet, di mana label "Top Up 50.000" ada di tiap dompet).
   */
  initialGroup?: string | null;
  /** Katalog PPOB yang sudah disatukan dengan data Supabase. */
  categories?: CategoryData[];
  /** Konfigurasi QRIS dari /admin/pembayaran (gambar, nama merchant, NMID). */
  payments?: PaymentSettings | null;
  onTransactionCreated: (trx: TransactionRecord) => void;
  onGoToTracker: (trxId: string) => void;
  showToast: (msg: string) => void;
}

// Utility operator detection
function detectOperator(number: string): { name: string; color: string; bg: string } | null {
  const clean = number.replace(/\D/g, '');
  if (clean.length < 4) return null;
  const prefix4 = clean.slice(0, 4);

  if (['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'].includes(prefix4)) {
    return { name: 'Telkomsel', color: '#E50914', bg: '#FDE8E8' };
  }
  if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix4)) {
    return { name: 'Indosat Ooredoo', color: '#B45309', bg: '#FEF3C7' };
  }
  if (['0817', '0818', '0819', '0859', '0877', '0878'].includes(prefix4)) {
    return { name: 'XL Axiata', color: '#004B9B', bg: '#E0F2FE' };
  }
  if (['0831', '0832', '0833', '0838'].includes(prefix4)) {
    return { name: 'AXIS', color: '#7E22CE', bg: '#F3E8FF' };
  }
  if (['0895', '0896', '0897', '0898', '0899'].includes(prefix4)) {
    return { name: 'Tri (3)', color: '#C2410C', bg: '#FFEDD5' };
  }
  if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].includes(prefix4)) {
    return { name: 'Smartfren', color: '#BE185D', bg: '#FCE7F3' };
  }
  return null;
}

type PayMethodId = 'qris' | 'transfer' | 'tunai';

interface PayMethodOption {
  id: PayMethodId;
  label: string;
  icon: string;
}

/**
 * Susun metode pembayaran yang boleh dipilih pelanggan berdasarkan pengaturan
 * /admin/pembayaran:
 * - QRIS tampil kalau `qris.enabled`.
 * - Transfer hanya tampil kalau aktif DAN minimal ada satu rekening.
 * - Tunai tampil kalau aktif.
 * Kalau admin belum mengatur apa pun, QRIS tetap jadi default (perilaku lama).
 */
function buildPayMethods(payments: PaymentSettings | null | undefined): PayMethodOption[] {
  const methods: PayMethodOption[] = [];

  if (payments ? payments.qris.enabled : true) {
    methods.push({ id: 'qris', label: 'QRIS', icon: 'qr_code_scanner' });
  }
  if (payments?.transfer.enabled && (payments.transfer.accounts?.length ?? 0) > 0) {
    methods.push({ id: 'transfer', label: 'Transfer Bank', icon: 'account_balance' });
  }
  if (payments?.tunai.enabled) {
    methods.push({ id: 'tunai', label: 'Tunai / Agen', icon: 'storefront' });
  }

  // Jaring pengaman: modal tidak pernah kosong tanpa metode pembayaran.
  if (methods.length === 0) {
    methods.push({ id: 'qris', label: 'QRIS', icon: 'qr_code_scanner' });
  }

  return methods;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialCategoryId,
  initialItemLabel,
  initialGroup,
  categories: availableCategories = CATEGORIES_DATA,
  payments = null,
  onTransactionCreated,
  onGoToTracker,
  showToast
}) => {
  const [catId, setCatId] = useState<string>('pulsa');
  const [groupIdx, setGroupIdx] = useState(0);
  const [selectedItem, setSelectedItem] = useState<NomItem | null>(null);
  const [targetNumber, setTargetNumber] = useState('');
  const [variableAmount, setVariableAmount] = useState<number>(0);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [trxRef, setTrxRef] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [errorTarget, setErrorTarget] = useState(false);
  const [errorItem, setErrorItem] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethodId>('qris');

  // Metode pembayaran yang ditawarkan, mengikuti pengaturan /admin/pembayaran.
  const payMethods = useMemo(() => buildPayMethods(payments), [payments]);

  // Sync with initial category whenever modal opens
  useEffect(() => {
    if (!initialCategoryId) return;

    setCatId(initialCategoryId);
    setTargetNumber('');
    setStep(1);
    setPayMethod('qris');
    setErrorTarget(false);
    setErrorItem(false);

    // Preselect nominal dari Flash Sale. Kalau label tidak ketemu di katalog,
    // modal tetap terbuka normal tanpa preselection.
    let nextGroupIdx = 0;
    let nextItem: NomItem | null = null;
    if (initialItemLabel) {
      const cat = availableCategories.find((c) => c.id === initialCategoryId);
      if (cat) {
        // Cocokkan grup dengan provider Flash Sale dulu — penting untuk
        // kategori gabungan (E-Wallet) yang labelnya sama di tiap dompet.
        const providerIdx = initialGroup
          ? cat.groups.findIndex(
              (g) => g.name.toLowerCase() === String(initialGroup).toLowerCase()
            )
          : -1;
        const scanOrder = [
          ...new Set([providerIdx, ...cat.groups.map((_, i) => i)].filter((i) => i >= 0))
        ];
        for (const g of scanOrder) {
          const found = cat.groups[g].items.find((it) => it.l === initialItemLabel);
          if (found) {
            nextGroupIdx = g;
            nextItem = found;
            break;
          }
        }
      }
    }

    setGroupIdx(nextGroupIdx);
    setSelectedItem(nextItem);
  }, [initialCategoryId, isOpen, initialItemLabel, initialGroup, availableCategories]);

  // QRIS Countdown Timer
  useEffect(() => {
    if (!isOpen || step !== 3 || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step, secondsLeft]);

  if (!isOpen) return null;

  const currentCategory: CategoryData =
    availableCategories.find((c) => c.id === catId) || availableCategories[0];
  const activeGroup = currentCategory.groups[groupIdx] || currentCategory.groups[0];
  // `payMethods` selalu berisi minimal satu entri, jadi index 0 aman.
  const activeMethod = payMethods.find((m) => m.id === payMethod) ?? payMethods[0];

  const detectedOp =
    currentCategory.id === 'pulsa' || currentCategory.id === 'data'
      ? detectOperator(targetNumber)
      : null;

  const amountOf = () => {
    if (!selectedItem) return 0;
    return selectedItem.variable
      ? Number(variableAmount || 0)
      : selectedItem.p - currentCategory.admin;
  };

  const totalOf = () => {
    return amountOf() + currentCategory.admin;
  };

  const handleNextToSummary = () => {
    const digits = targetNumber.replace(/\D/g, '');
    let valid = true;
    if (digits.length < 6) {
      setErrorTarget(true);
      valid = false;
    }
    if (!selectedItem) {
      setErrorItem(true);
      valid = false;
    }
    if (selectedItem?.variable && (!variableAmount || variableAmount < 10000)) {
      setErrorItem(true);
      valid = false;
    }
    if (!valid) return;

    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const newRef =
      'HSV' +
      d.getFullYear() +
      p(d.getMonth() + 1) +
      p(d.getDate()) +
      '-' +
      Math.floor(1000 + Math.random() * 9000);

    setTrxRef(newRef);
    setStep(2);
  };

  const handleConfirmPay = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(4);

      const now = new Date();
      // Labelnya "WIB", jadi jam & tanggalnya memang harus dikunci ke Asia/Jakarta,
      // bukan zona waktu perangkat pengguna.
      const timeStr =
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB';
      const dateStr = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
      });

      let tokenLabel = 'Nomor Referensi';
      let tokenCode = '';
      let tokenSub = 'Pembayaran berhasil diproses oleh sistem.';

      if (currentCategory.id === 'pln') {
        tokenLabel = '20 Digit Token Listrik PLN';
        const t1 = Math.floor(1000 + Math.random() * 9000);
        const t2 = Math.floor(1000 + Math.random() * 9000);
        const t3 = Math.floor(1000 + Math.random() * 9000);
        const t4 = Math.floor(1000 + Math.random() * 9000);
        const t5 = Math.floor(1000 + Math.random() * 9000);
        tokenCode = `${t1} ${t2} ${t3} ${t4} ${t5}`;
        tokenSub = 'Masukkan 20 digit angka ini ke meteran prabayar Anda lalu tekan ENTER.';
      } else if (currentCategory.id === 'pulsa' || currentCategory.id === 'data') {
        tokenLabel = 'Nomor Seri Operator (SN)';
        tokenCode = `SN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        tokenSub = 'Pulsa / paket data telah berhasil diisikan ke nomor tujuan.';
      } else if (currentCategory.id === 'pdam') {
        tokenLabel = 'Nomor Referensi Pelunasan PDAM';
        tokenCode = `LUNAS-PDAM-${Math.floor(1000000 + Math.random() * 9000000)}`;
        tokenSub = 'Tagihan PDAM periode berjalan telah terbayar lunas ke kas daerah.';
      } else {
        tokenLabel = 'Kode Verifikasi Mutasi';
        tokenCode = `TRX-OK-${Math.floor(10000000 + Math.random() * 90000000)}`;
        tokenSub = 'Pembayaran sah dan tercatat pada sistem loket PPOB.';
      }

      const newRecord: TransactionRecord = {
        id: trxRef,
        status: 'success',
        statusLabel: 'Berhasil / Selesai',
        badgeBg: 'bg-[#E4F3EC]',
        badgeColor: 'text-[#1F7A54]',
        accentBg: 'bg-[#1F7A54]',
        createdAt: dateStr,
        clearedAt: `${timeStr} (14 Detik)`,
        durationText: '14 Detik',
        stepActive: 4,
        stepProgressText: 'Lengkap (4 dari 4 Tahapan)',
        steps: [
          { step: 1, title: 'Pesanan Dibuat', subtitle: 'ID Transaksi tervalidasi', time: timeStr, status: 'completed', icon: 'receipt_long' },
          { step: 2, title: `Pembayaran ${activeMethod.label}`, subtitle: 'Konfirmasi pembayaran diterima', time: 'Baru saja', status: 'completed', icon: activeMethod.icon },
          { step: 3, title: `Routing Biller ${currentCategory.name}`, subtitle: 'Switching provider sukses', time: 'Baru saja', status: 'completed', icon: 'hub' },
          { step: 4, title: 'SN / Token Terbit', subtitle: 'Kuitansi sah diterbitkan', time: 'Baru saja', status: 'completed', icon: 'verified' },
        ],
        tokenLabel,
        tokenCode,
        tokenSub,
        hasCopyToken: true,
        category: currentCategory.name,
        categoryCode: currentCategory.id.toUpperCase(),
        product: selectedItem?.l || currentCategory.name,
        custId: targetNumber,
        custName: 'Pelanggan Hesolvian',
        tarif: 'Reguler / Prabayar',
        refCode: `REF-${currentCategory.id.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
        priceBase: amountOf(),
        adminFee: currentCategory.admin,
        discount: 0,
        total: totalOf(),
        method:
          activeMethod.id === 'qris'
            ? 'QRIS Dinamis 24 Jam'
            : activeMethod.id === 'transfer'
            ? 'Transfer Bank Manual'
            : 'Tunai di Agen Hesolvian',
        reconcileId: `#RC-${Math.floor(1000 + Math.random() * 9000)}-X`,
        billerName: 'Mitra Switching Nasional Host-to-Host'
      };

      onTransactionCreated(newRecord);
      showToast('Transaksi berhasil diproses!');
    }, 1200);
  };

  const timerMin = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const timerSec = String(secondsLeft % 60).padStart(2, '0');

  // Title for nominal selection section
  const nominalSectionTitle =
    currentCategory.id === 'pulsa'
      ? 'Pilih Nominal Pulsa'
      : currentCategory.id === 'data'
      ? 'Pilih Paket Data'
      : currentCategory.id === 'pln'
      ? 'Pilih Token Listrik'
      : currentCategory.id === 'pdam'
      ? 'Pilih Tagihan / Estimasi PDAM'
      : `Pilih Nominal ${currentCategory.name}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8DDD2] flex flex-col max-h-[92vh]">
        {/* ======================================================== */}
        {/* MODAL HEADER: DEDICATED TO SELECTED CATEGORY ONLY */}
        {/* ======================================================== */}
        <div className="px-5 sm:px-6 py-4 bg-[#FBF6EF] border-b border-[#E8DDD2] flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: currentCategory.iconColor }}
            >
              <span className="material-symbols-outlined text-[22px]">
                {currentCategory.iconName}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#2C211D] leading-tight truncate">
                {step === 1
                  ? currentCategory.name
                  : step === 2
                  ? 'Ringkasan Transaksi'
                  : step === 3
                  ? `Pembayaran ${activeMethod.label}`
                  : 'Status Transaksi'}
              </h3>
              <p className="text-[11.5px] sm:text-[12px] text-[#6B5A53] truncate mt-0.5">
                {step === 1
                  ? currentCategory.desc
                  : step === 2
                  ? 'Periksa kembali rincian pesanan Anda'
                  : step === 3
                  ? activeMethod.id === 'qris'
                    ? 'Scan kode QRIS melalui m-Banking atau E-Wallet'
                    : activeMethod.id === 'transfer'
                    ? 'Selesaikan transfer lalu konfirmasi pembayaran'
                    : 'Bayar tunai di agen mitra Hesolvian'
                  : 'Transaksi berhasil diselesaikan'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[#F3EADF] flex items-center justify-center text-[#6B5A53] transition-colors cursor-pointer shrink-0 ml-2"
            title="Tutup Modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* MODAL BODY (SCROLLABLE) */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: INPUT NOMOR & PILIH NOMINAL */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Field 1: Target Number Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] sm:text-[13px] font-bold text-[#2C211D]">
                    {currentCategory.field.label}
                  </label>
                  {detectedOp && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: detectedOp.bg,
                        color: detectedOp.color,
                        borderColor: detectedOp.color + '40'
                      }}
                    >
                      {detectedOp.name}
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#9B8A82] text-[20px]">
                    {currentCategory.id === 'pulsa' || currentCategory.id === 'data'
                      ? 'phone_iphone'
                      : currentCategory.id === 'pln'
                      ? 'electric_meter'
                      : currentCategory.id === 'pdam'
                      ? 'water_drop'
                      : 'credit_card'}
                  </span>
                  <input
                    type="tel"
                    value={targetNumber}
                    onChange={(e) => {
                      setTargetNumber(e.target.value);
                      setErrorTarget(false);
                    }}
                    placeholder={currentCategory.field.ph}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#dec0ba] bg-[#FBF6EF] text-[14px] sm:text-[15px] font-mono font-bold text-[#2C211D] outline-hidden focus:border-[#B4432C] focus:bg-white focus:ring-2 focus:ring-[#B4432C]/20 transition-all placeholder:text-[#9B8A82] placeholder:font-normal"
                  />
                </div>

                <div className="text-[11px] text-[#8a716c]">
                  {currentCategory.field.hint}
                </div>

                {errorTarget && (
                  <div className="text-[12px] font-bold text-[#B4432C] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>Nomor tujuan wajib diisi minimal 6 digit angka.</span>
                  </div>
                )}
              </div>

              {/* Internal Category Sub-group Tabs (only if category has internal groups like Prabayar vs Pascabayar) */}
              {currentCategory.groups.length > 1 && (
                <div className="flex gap-2 border-b border-[#F3EADF] pb-2 overflow-x-auto scrollbar-none">
                  {currentCategory.groups.map((gr, idx) => (
                    <button
                      key={gr.name}
                      type="button"
                      onClick={() => {
                        setGroupIdx(idx);
                        setSelectedItem(null);
                      }}
                      className={`text-[12px] font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        groupIdx === idx
                          ? 'bg-[#B4432C] text-white shadow-xs'
                          : 'bg-[#FBF6EF] text-[#6B5A53] hover:bg-[#F3EADF]'
                      }`}
                    >
                      {gr.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Field 2: Nominal Products Selection Grid */}
              <div className="space-y-2.5">
                <div className="text-[13px] sm:text-[14px] font-bold text-[#2C211D]">
                  {nominalSectionTitle}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeGroup.items.map((it) => {
                    const isSelected = selectedItem?.l === it.l;
                    return (
                      <button
                        key={it.l}
                        type="button"
                        onClick={() => {
                          setSelectedItem(it);
                          setErrorItem(false);
                        }}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white border-[#B4432C] ring-2 ring-[#B4432C]/40 shadow-sm'
                            : 'bg-[#FBF6EF] border-[#E8DDD2] hover:bg-white hover:border-[#dec0ba]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[13.5px] font-bold text-[#2C211D] leading-snug">
                              {it.l}
                            </div>
                            <div className="text-[11px] text-[#6B5A53] mt-0.5 leading-normal">
                              {it.d}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#B4432C] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                            </div>
                          )}
                        </div>

                        <div className="text-[13.5px] font-extrabold text-[#B4432C] mt-2.5 pt-2 border-t border-[#E8DDD2]/60">
                          {it.variable ? 'Sesuai Tagihan' : formatRupiah(it.p)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errorItem && (
                  <div className="text-[12px] font-bold text-[#B4432C] flex items-center gap-1 pt-1">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>Silakan pilih salah satu nominal terlebih dahulu.</span>
                  </div>
                )}
              </div>

              {/* Variable amount input for tagihan bulanan */}
              {selectedItem?.variable && (
                <div className="space-y-1.5 p-3.5 bg-[#FBF6EF] rounded-2xl border border-[#dec0ba]">
                  <label className="text-[12px] font-bold text-[#2C211D]">
                    Nominal Tagihan (Rp)
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="1000"
                    placeholder="Contoh: 150000"
                    value={variableAmount || ''}
                    onChange={(e) => setVariableAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#dec0ba] text-[14px] font-mono font-bold text-[#2C211D] outline-hidden focus:ring-2 focus:ring-[#B4432C]/20"
                  />
                  <div className="text-[10.5px] text-[#8a716c]">
                    Minimal pembayaran Rp10.000
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SUMMARY */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-[#FBF6EF] rounded-2xl p-4 sm:p-5 border border-[#E8DDD2] space-y-3 text-[13.5px]">
                <div className="flex justify-between items-center text-[#6B5A53]">
                  <span>Kategori Layanan</span>
                  <span className="font-bold text-[#2C211D]">{currentCategory.name}</span>
                </div>
                <div className="flex justify-between items-center text-[#6B5A53]">
                  <span>Produk / Nominal</span>
                  <span className="font-bold text-[#2C211D]">{selectedItem?.l}</span>
                </div>
                <div className="flex justify-between items-center text-[#6B5A53]">
                  <span>{currentCategory.field.label}</span>
                  <span className="font-mono font-bold text-[#2C211D]">{targetNumber}</span>
                </div>
                <div className="flex justify-between items-center text-[#6B5A53]">
                  <span>Kode Transaksi</span>
                  <span className="font-mono font-semibold text-[#8E3220]">{trxRef}</span>
                </div>

                <div className="border-t border-dashed border-[#E8DDD2] my-2" />

                <div className="flex justify-between items-center text-[#6B5A53]">
                  <span>Harga Pokok</span>
                  <span className="font-semibold text-[#2C211D]">{formatRupiah(amountOf())}</span>
                </div>
                <div className="flex justify-between items-center text-[#6B5A53]">
                  <span>Biaya Layanan &amp; Admin</span>
                  <span className="font-semibold text-[#2C211D]">
                    {currentCategory.admin ? formatRupiah(currentCategory.admin) : 'Gratis'}
                  </span>
                </div>

                <div className="border-t border-[#E8DDD2] pt-2 flex justify-between items-baseline">
                  <span className="font-bold text-[#2C211D] text-[15px]">Total Bayar</span>
                  <span className="font-extrabold text-2xl text-[#B4432C]">
                    {formatRupiah(totalOf())}
                  </span>
                </div>
              </div>

              {payMethods.length > 1 && (
                <div className="space-y-2.5">
                  <div className="text-[13px] sm:text-[14px] font-bold text-[#2C211D]">
                    Metode Pembayaran
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {payMethods.map((m) => {
                      const isSelected = activeMethod.id === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPayMethod(m.id)}
                          className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-white border-[#B4432C] ring-2 ring-[#B4432C]/40 shadow-sm'
                              : 'bg-[#FBF6EF] border-[#E8DDD2] hover:bg-white hover:border-[#dec0ba]'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#B4432C] text-white' : 'bg-[#F3EADF] text-[#6B5A53]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                          </span>
                          <span className="text-[12.5px] font-bold text-[#2C211D]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="text-[11.5px] text-[#6B5A53] text-center">
                Periksa kembali data nomor tujuan Anda. Pembayaran diverifikasi otomatis oleh sistem.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-[#F3EADF] hover:bg-[#E8DDD2] text-[#2C211D] rounded-xl font-bold text-[13px] transition-colors cursor-pointer min-h-[44px]"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#B4432C] hover:bg-[#8E3220] text-white py-3 px-4 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.985] cursor-pointer min-h-[44px]"
                >
                  <span>Bayar dengan {activeMethod.label}</span>
                  <span className="material-symbols-outlined text-[18px]">{activeMethod.icon}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHECKOUT PEMBAYARAN */}
          {step === 3 && (
            <div className="text-center space-y-4">
              {/* Pemilih metode pembayaran — pelanggan boleh ganti metode di sini. */}
              {payMethods.length > 1 && (
                <div className="space-y-2">
                  <div className="text-[12px] font-bold text-[#6B5A53] text-left">
                    Pilih Metode Pembayaran
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {payMethods.map((m) => {
                      const isSelected = activeMethod.id === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPayMethod(m.id)}
                          className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-white border-[#B4432C] ring-2 ring-[#B4432C]/40 shadow-sm'
                              : 'bg-[#FBF6EF] border-[#E8DDD2] hover:bg-white hover:border-[#dec0ba]'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#B4432C] text-white' : 'bg-[#F3EADF] text-[#6B5A53]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                          </span>
                          <span className="text-[12.5px] font-bold text-[#2C211D]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-[13px] text-[#6B5A53]">
                  {activeMethod.id === 'qris'
                    ? 'Pindai kode QRIS menggunakan m-Banking atau E-Wallet:'
                    : activeMethod.id === 'transfer'
                    ? 'Transfer tepat nominal ke rekening tujuan berikut:'
                    : 'Bayar tunai di agen mitra Hesolvian terdekat:'}
                </div>
                <div className="text-3xl font-extrabold text-[#B4432C] tracking-tight">
                  {formatRupiah(totalOf())}
                </div>

                {/* No. Pesanan ditampilkan jelas untuk semua metode. */}
                <div className="inline-flex items-center gap-2 bg-[#FBF6EF] border border-[#E8DDD2] rounded-xl px-3.5 py-2">
                  <span className="material-symbols-outlined text-[16px] text-[#B4432C]">
                    receipt_long
                  </span>
                  <span className="text-[12px] text-[#6B5A53]">No. Pesanan</span>
                  <span className="font-mono text-[12.5px] font-bold text-[#2C211D]">{trxRef}</span>
                </div>
              </div>

              {activeMethod.id === 'qris' && (
                <>
              {/* QR Box */}
              <div className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] mx-auto bg-white rounded-2xl border-2 border-[#E8DDD2] p-3 shadow-md flex flex-col items-center justify-center relative">
                {payments?.qris.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={payments.qris.imageUrl}
                    alt="Kode QRIS merchant"
                    loading="lazy"
                    className="h-full w-full rounded-lg bg-white object-contain"
                  />
                ) : (
                <svg viewBox="0 0 160 160" className="w-full h-full" fill="#2C211D">
                  <rect x="10" y="10" width="40" height="40" rx="3" fill="#2C211D" />
                  <rect x="16" y="16" width="28" height="28" rx="2" fill="white" />
                  <rect x="22" y="22" width="16" height="16" rx="1" fill="#2C211D" />

                  <rect x="110" y="10" width="40" height="40" rx="3" fill="#2C211D" />
                  <rect x="116" y="16" width="28" height="28" rx="2" fill="white" />
                  <rect x="122" y="22" width="16" height="16" rx="1" fill="#2C211D" />

                  <rect x="10" y="110" width="40" height="40" rx="3" fill="#2C211D" />
                  <rect x="16" y="116" width="28" height="28" rx="2" fill="white" />
                  <rect x="22" y="122" width="16" height="16" rx="1" fill="#2C211D" />

                  <rect x="56" y="22" width="6" height="6" />
                  <rect x="68" y="22" width="6" height="6" />
                  <rect x="80" y="22" width="6" height="6" />
                  <rect x="92" y="22" width="6" height="6" />
                  <rect x="56" y="56" width="12" height="12" rx="1" />
                  <rect x="74" y="56" width="6" height="6" />
                  <rect x="86" y="56" width="18" height="6" />
                  <rect x="68" y="68" width="12" height="12" rx="1" />
                  <rect x="86" y="68" width="6" height="6" />
                  <rect x="98" y="68" width="12" height="18" />
                  <rect x="116" y="56" width="12" height="6" />
                  <rect x="56" y="92" width="18" height="6" />
                  <rect x="80" y="86" width="12" height="12" rx="1" />
                  <rect x="98" y="92" width="6" height="6" />
                  <rect x="110" y="80" width="12" height="12" />
                  <rect x="56" y="110" width="12" height="18" />
                  <rect x="74" y="110" width="18" height="6" />
                  <rect x="98" y="116" width="12" height="12" />

                  <rect x="68" y="70" width="24" height="20" rx="3" fill="#B4432C" />
                  <text x="80" y="84" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">
                    GPN
                  </text>
                </svg>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#9A6B12] bg-[#FBF0D8] px-3.5 py-1.5 rounded-full border border-[#9A6B12]/20">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>
                  Sisa Waktu Bayar: <strong className="font-mono">{timerMin}:{timerSec}</strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                {['BCA', 'BRI', 'MANDIRI', 'BNI', 'GOPAY', 'OVO', 'DANA', 'SHOPEEPAY'].map(
                  (logo) => (
                    <span
                      key={logo}
                      className="text-[10px] font-bold text-[#6B5A53] bg-[#FBF6EF] px-2 py-1 rounded"
                    >
                      {logo}
                    </span>
                  )
                )}
              </div>
                </>
              )}

              {activeMethod.id === 'transfer' && payments && (
                <div className="space-y-2.5 text-left">
                  {payments.transfer.accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="bg-[#FBF6EF] border border-[#E8DDD2] rounded-2xl p-4 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-bold text-[#B4432C] uppercase tracking-wide">
                          {acc.bank}
                        </div>
                        <div className="text-[16px] font-mono font-extrabold text-[#2C211D] break-all">
                          {acc.accountNumber}
                        </div>
                        <div className="text-[12px] text-[#6B5A53]">a.n. {acc.accountName}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(acc.accountNumber);
                          showToast(`Nomor rekening ${acc.bank} disalin!`);
                        }}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#dec0ba] rounded-xl text-[12px] font-bold text-[#2C211D] hover:bg-[#F3EADF] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#B4432C]">
                          content_copy
                        </span>
                        <span>Salin</span>
                      </button>
                    </div>
                  ))}
                  <div className="text-[11.5px] text-[#6B5A53] text-center">
                    Setelah transfer, tekan &quot;Saya Sudah Bayar&quot; — admin akan memverifikasi mutasi masuk.
                  </div>
                </div>
              )}

              {activeMethod.id === 'tunai' && (
                <div className="space-y-3 text-left">
                  <div className="bg-[#FBF6EF] border border-[#E8DDD2] rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#2C211D]">
                      <span className="material-symbols-outlined text-[18px] text-[#B4432C]">
                        storefront
                      </span>
                      <span>Pembayaran di agen mitra</span>
                    </div>
                    <p className="text-[12.5px] text-[#6B5A53] leading-relaxed">
                      {payments?.tunai.note?.trim()
                        ? payments.tunai.note
                        : 'Bayar tunai di agen Hesolvian terdekat dengan menyebut kode transaksi di bawah.'}
                    </p>
                    <div className="flex items-center justify-between gap-2 bg-white border border-[#dec0ba]/60 rounded-xl px-3 py-2">
                      <span className="text-[12px] text-[#6B5A53]">Kode Transaksi</span>
                      <span className="font-mono font-bold text-[#2C211D]">{trxRef}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 bg-[#F3EADF] hover:bg-[#E8DDD2] text-[#2C211D] rounded-xl font-bold text-[13px] transition-colors cursor-pointer min-h-[44px]"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPay}
                  disabled={isVerifying}
                  className="flex-1 bg-[#1F7A54] hover:bg-[#165a3d] text-white py-3 px-4 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.985] cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {isVerifying ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Mutasi...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                      <span>Saya Sudah Bayar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E4F3EC] text-[#1F7A54] mx-auto flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>

              <div>
                <h4 className="text-2xl font-extrabold text-[#2C211D] tracking-tight">
                  Transaksi Berhasil!
                </h4>
                <p className="text-[13px] text-[#6B5A53] mt-1 max-w-sm mx-auto">
                  Pembayaran telah diverifikasi dan pesanan diteruskan secara instan ke server provider.
                </p>
              </div>

              {/* Receipt paper */}
              <div className="bg-[#FBF6EF] border border-dashed border-[#E8DDD2] rounded-2xl p-4 sm:p-5 text-left space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#6B5A53]">Kode Transaksi:</span>
                  <span className="font-mono font-bold text-[#2C211D]">{trxRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5A53]">Kategori:</span>
                  <span className="font-semibold text-[#2C211D]">{currentCategory.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5A53]">Produk:</span>
                  <span className="font-semibold text-[#2C211D]">{selectedItem?.l}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5A53]">{currentCategory.field.label}:</span>
                  <span className="font-mono font-bold text-[#2C211D]">{targetNumber}</span>
                </div>
                <div className="border-t border-dashed border-[#E8DDD2] my-1" />
                <div className="flex justify-between font-bold text-[14px]">
                  <span>Total Pembayaran:</span>
                  <span className="text-[#B4432C]">{formatRupiah(totalOf())}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToTracker(trxRef);
                  }}
                  className="flex-1 bg-[#B4432C] hover:bg-[#8E3220] text-white py-3 px-4 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[18px]">search_check</span>
                  <span>Lacak di Cek Transaksi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedItem(null);
                  }}
                  className="px-4 py-3 bg-[#F3EADF] hover:bg-[#E8DDD2] text-[#2C211D] rounded-xl font-bold text-[13px] transition-colors cursor-pointer min-h-[44px]"
                >
                  Transaksi Lagi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* STICKY BOTTOM ACTION BAR (STEP 1) - EASY REACH ON MOBILE */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#E8DDD2] sticky bottom-0 z-20 shrink-0 shadow-[0_-4px_16px_rgba(44,33,29,0.05)]">
            <button
              type="button"
              onClick={handleNextToSummary}
              className="w-full bg-[#B4432C] hover:bg-[#8E3220] text-white py-3.5 px-4 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.985] cursor-pointer min-h-[48px]"
            >
              <span>Lanjut ke Ringkasan</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
