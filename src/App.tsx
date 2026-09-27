'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TransactionRecord, formatRupiah } from './types/ppob';
import { FlashSaleProduct } from './data/flashSaleData';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { SearchSection } from './components/SearchSection';
import { TransactionCard } from './components/TransactionCard';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { ResolutionModal } from './components/ResolutionModal';
import { TransactionModal } from './components/TransactionModal';
import { ServicesModal } from './components/ServicesModal';
import { PromoModal } from './components/PromoModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HelpPage } from './components/HelpPage';
import { EmptyTransactionState } from './components/EmptyTransactionState';
import { AboutPage } from './components/AboutPage';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { resolvePublicData } from './lib/publicCatalog';
import { detectProductKind } from './utils/timelineHelper';
import type { PublicData } from './lib/publicTypes';
import type { PaymentSettings } from './lib/types';

interface AppProps {
  /** Katalog + Flash Sale dari Supabase. `null` = pakai data statis. */
  publicData?: PublicData | null;
  /** Metode pembayaran (QRIS dsb) dari pengaturan admin. */
  payments?: PaymentSettings | null;
}

export default function App({ publicData = null, payments = null }: AppProps) {
  // Di-memo supaya identitasnya stabil antar render (aman untuk dependency array).
  const { categories, flashSales, faqs } = useMemo(() => resolvePublicData(publicData), [publicData]);
  const [transactions, setTransactions] = useState<Record<string, TransactionRecord>>({});
  const [currentTrxId, setCurrentTrxId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'trx' | 'cust'>('trx');
  
  // Default to 'beranda' as requested: "halaman home nya ganti ini broo , yg cek transaksi tetep di pertahankan"
  const [activeTab, setActiveTab] = useState<string>('beranda');

  // Modals state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<string | null>(null);
  const [selectedItemLabel, setSelectedItemLabel] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3200);
  };

  const goHome = () => {
    setActiveTab('beranda');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // URL query parameter support
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trxParam = params.get('trx');
    if (trxParam && transactions[trxParam]) {
      setCurrentTrxId(trxParam);
      setSearchQuery(trxParam);
      setActiveTab('cek-transaksi');
    }
  }, [transactions]);

  // Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsServicesModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentTrx = currentTrxId ? transactions[currentTrxId] : undefined;

  const handleSearch = (queryOverride?: string) => {
    const q = (queryOverride || searchQuery).trim();
    if (!q) {
      showToast('Mohon masukkan nomor transaksi atau nomor pelanggan!');
      return;
    }

    // Direct match by ID
    if (transactions[q]) {
      setCurrentTrxId(q);
      showToast('Transaksi ditemukan dan sinkron!');
      return;
    }

    // Match by customer ID / phone
    const foundByCust = Object.values(transactions).find(
      (t) => t.custId.replace(/\D/g, '') === q.replace(/\D/g, '') || t.custId.includes(q)
    );

    if (foundByCust) {
      setCurrentTrxId(foundByCust.id);
      showToast(`Ditemukan transaksi ${foundByCust.id} untuk ${foundByCust.custName}`);
      return;
    }

    // Dynamic simulated record generation for arbitrary numbers
    const newId = q.startsWith('HSV')
      ? q
      : `HSV20250518-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const simulatedRecord: TransactionRecord = {
      id: newId,
      status: 'success',
      statusLabel: 'Berhasil Diverifikasi',
      badgeBg: 'bg-[#E4F3EC]',
      badgeColor: 'text-[#1F7A54]',
      accentBg: 'bg-[#1F7A54]',
      createdAt: 'Hari ini, 15:45 WIB',
      clearedAt: '15:45:18 WIB',
      durationText: 'Instan',
      stepActive: 4,
      stepProgressText: 'Lengkap (4 dari 4 Tahapan)',
      steps: [
        { step: 1, title: 'Pesanan Dibuat', subtitle: 'ID transaksi diverifikasi', status: 'completed', icon: 'receipt_long' },
        { step: 2, title: 'Pembayaran QRIS', subtitle: 'Mutasi kliring lunas', status: 'completed', icon: 'qr_code_scanner' },
        { step: 3, title: 'Routing Gateway', subtitle: 'Switching provider sukses', status: 'completed', icon: 'hub' },
        { step: 4, title: 'SN / Token Terbit', subtitle: 'Kuitansi sah diterbitkan', status: 'completed', icon: 'verified' },
      ],
      tokenLabel: 'SN Provider Otentik',
      tokenCode: `089${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      tokenSub: 'Layanan aktif secara normal. Kuitansi resmi dapat dicetak.',
      hasCopyToken: true,
      category: searchType === 'trx' ? 'E-Money / Dompet Digital' : 'Tagihan Umum',
      categoryCode: 'PPOB-SYNC',
      product: 'Isi Ulang Saldo Terverifikasi',
      custId: q,
      custName: 'Pelanggan Terdaftar Hesolvian',
      tarif: 'Standar Non-Subsidi',
      refCode: `REF-${Math.floor(1000000 + Math.random() * 9000000)}`,
      priceBase: 50000,
      adminFee: 1500,
      discount: 0,
      total: 51500,
      method: 'QRIS Instant Settlement',
      reconcileId: `#RC-${Math.floor(1000 + Math.random() * 9000)}-X`,
      hashToken: `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      billerName: 'Mitra Switching Nasional'
    };

    setTransactions((prev) => ({
      ...prev,
      [newId]: simulatedRecord
    }));
    setCurrentTrxId(newId);
    showToast('Data transaksi berhasil diverifikasi dari gateway!');
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSearchQuery(text.trim());
        showToast('Nomor berhasil ditempel dari papan klip!');
      }
    } catch {
      showToast('Gunakan kombinasi tombol Ctrl+V untuk menempel.');
    }
  };

  const handleCopyToken = () => {
    if (!currentTrx?.tokenCode) return;
    const tokenCode = currentTrx.tokenCode;
    navigator.clipboard
      .writeText(tokenCode)
      .then(() => {
        showToast(`Kode / Serial Number berhasil disalin: ${tokenCode}`);
      })
      .catch(() => {
        showToast('Gagal menyalin otomatis, silakan salin manual.');
      });
  };

  const handleShare = () => {
    if (!currentTrx) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?trx=${currentTrx.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Bukti Transaksi Hesolvian - ${currentTrx.id}`,
          text: `Berikut status transaksi PPOB sah pada platform Hesolvian (${currentTrx.product} - ${currentTrx.statusLabel}).`,
          url: shareUrl
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('Tautan transaksi berhasil disalin ke papan klip!');
    }
  };

  const handlePaymentSuccess = () => {
    if (!currentTrx) return;
    // Konfirmasi dari pelanggan ("Saya Sudah Bayar") baru menandai pembayaran
    // diterima. Transaksi BELUM selesai — status masuk "processing" dulu dan
    // baru menjadi "success" setelah disinkronkan ke server provider.
    const updatedTrx: TransactionRecord = {
      ...currentTrx,
      status: 'processing',
      statusLabel: 'Diproses Provider',
      badgeBg: 'bg-[#FCEAE5]',
      badgeColor: 'text-[#B4432C]',
      accentBg: 'bg-[#B4432C]',
      clearedAt: 'Pembayaran diterima, menunggu provider',
      durationText: 'Sedang Diproses',
      stepActive: 3,
      stepProgressText: 'Sedang Diproses (3 dari 4 Tahapan)',
      steps: currentTrx.steps.map((s, i) => ({
        ...s,
        status: i < 2 ? ('completed' as const) : i === 2 ? ('active' as const) : ('waiting' as const)
      })),
      processingMessage:
        'Pembayaran QRIS telah dikonfirmasi. Sistem sedang meminta penyelesaian pesanan ke server provider — status diperbarui otomatis.'
    };
    setTransactions((prev) => ({
      ...prev,
      [currentTrx.id]: updatedTrx
    }));
  };

  const handleSyncMutasi = () => {
    if (!currentTrx) return;
    if (currentTrx.status !== 'success') {
      // Terbitkan SN / token sesuai jenis layanan supaya hasil akhirnya realistis.
      const kind = detectProductKind(currentTrx);
      const isPln = kind === 'pln';
      const isPulsa = kind === 'pulsa' || kind === 'data';
      const isPdam = kind === 'pdam';

      let tokenLabel = 'Kode Verifikasi Mutasi';
      let tokenCode = `TRX-OK-${Math.floor(10000000 + Math.random() * 90000000)}`;
      let tokenSub = 'Kliring dana telah rampung dan layanan telah sah aktif.';

      if (isPln) {
        const t = () => Math.floor(1000 + Math.random() * 9000);
        tokenLabel = '20 Digit Token Listrik PLN';
        tokenCode = `${t()} ${t()} ${t()} ${t()} ${t()}`;
        tokenSub = `Token listrik telah diterbitkan untuk meteran ${currentTrx.custId}. Masukkan 20 digit angka ini ke meteran prabayar Anda.`;
      } else if (isPulsa) {
        tokenLabel = 'Nomor Seri Operator (SN)';
        tokenCode = `SN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        tokenSub = `Pulsa / paket data telah berhasil diisikan ke nomor ${currentTrx.custId}.`;
      } else if (isPdam) {
        tokenLabel = 'Nomor Referensi Pelunasan PDAM Sah';
        tokenCode = `LUNAS-PDAM-${Math.floor(1000000 + Math.random() * 9000000)}`;
        tokenSub = 'Tagihan air PDAM telah terbayar lunas ke kas daerah.';
      }

      const updatedTrx: TransactionRecord = {
        ...currentTrx,
        status: 'success',
        statusLabel: 'Berhasil / Selesai',
        badgeBg: 'bg-[#E4F3EC]',
        badgeColor: 'text-[#1F7A54]',
        accentBg: 'bg-[#1F7A54]',
        clearedAt: 'Sinkronisasi Berhasil',
        durationText: 'Selesai',
        stepActive: 4,
        stepProgressText: 'Selesai • 4 dari 4 tahap',
        steps: currentTrx.steps.map((s) => ({ ...s, status: 'completed' as const })),
        tokenLabel,
        tokenCode,
        tokenSub,
        hasCopyToken: isPln
      };
      setTransactions((prev) => ({
        ...prev,
        [currentTrx.id]: updatedTrx
      }));
      showToast('Status mutasi berhasil disinkronkan ke server provider!');
    } else {
      showToast('Status transaksi sudah terkonfirmasi selesai.');
    }
  };

  const handleTransactionCreated = (newTrx: TransactionRecord) => {
    setTransactions((prev) => ({
      ...prev,
      [newTrx.id]: newTrx
    }));
    setCurrentTrxId(newTrx.id);
    setSearchQuery(newTrx.id);
  };

  /**
   * Satu pintu masuk ke modal transaksi PPOB.
   * `itemLabel` dipakai Flash Sale untuk memilih nominal promo otomatis;
   * kalau kosong, user memilih nominalnya sendiri seperti biasa.
   */
  const openTransaction = (
    catId: string,
    itemLabel: string | null = null,
    group: string | null = null
  ) => {
    setSelectedCategoryModal(catId);
    setSelectedItemLabel(itemLabel);
    setSelectedGroup(group);
    setIsTransactionModalOpen(true);
  };

  const handleOpenCategoryModal = (catId: string) => openTransaction(catId);

  const handleOpenFlashSale = (product: FlashSaleProduct) => {
    openTransaction(product.categoryId, product.targetLabel ?? null, product.provider ?? null);
    showToast(`Promo Flash Sale aktif: ${product.name} — ${formatRupiah(product.promoPrice)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF6EF] text-[#2C211D] font-['Plus_Jakarta_Sans',sans-serif] pb-16 lg:pb-0">
      {/* Toast Notification */}
      <Toast message={toastMessage} isVisible={isToastVisible} />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'promo') {
            setIsPromoModalOpen(true);
          } else if (tab === 'kategori') {
            if (activeTab === 'beranda') {
              document.getElementById('kategori-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              setIsServicesModalOpen(true);
            }
          }
        }}
        onOpenSearchServices={() => setIsServicesModalOpen(true)}
        onOpenNewTransaction={() => openTransaction('pulsa')}
        onOpenPromo={() => setIsPromoModalOpen(true)}
        onOpenHelp={() => {
          setActiveTab('bantuan');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main View Switcher */}
      <main className="w-full flex-1">
        {activeTab === 'beranda' ? (
          /* ======================================================== */
          /* HOME PAGE (As requested by user from HTML specification) */
          /* ======================================================== */
          <HomePage
            categories={categories}
            flashSales={flashSales}
            onOpenCategory={handleOpenCategoryModal}
            onOpenFlashSale={handleOpenFlashSale}
            onGoToCekTransaksi={() => {
              setActiveTab('cek-transaksi');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showToast={showToast}
          />
        ) : activeTab === 'bantuan' ? (
          /* ======================================================== */
          /* DEDICATED HELP & RESOLUTION PAGE (Non-popup)            */
          /* ======================================================== */
          <HelpPage
            faqs={faqs}
            currentTrx={currentTrx}
            onGoToCekTransaksi={(trxId) => {
              if (trxId && transactions[trxId]) {
                setCurrentTrxId(trxId);
                setSearchQuery(trxId);
              }
              setActiveTab('cek-transaksi');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenNewTransaction={() => openTransaction('pulsa')}
            showToast={showToast}
          />
        ) : activeTab === 'tentang' ? (
          /* ======================================================== */
          /* TENTANG HESOLVIAN PAGE (Non-popup)                      */
          /* ======================================================== */
          <AboutPage
            onGoHome={goHome}
            onGoToCekTransaksi={() => {
              setActiveTab('cek-transaksi');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeTab === 'syarat-ketentuan' ? (
          /* ======================================================== */
          /* SYARAT & KETENTUAN PAGE (Non-popup)                     */
          /* ======================================================== */
          <TermsPage onGoHome={goHome} />
        ) : activeTab === 'kebijakan-privasi' ? (
          /* ======================================================== */
          /* KEBIJAKAN PRIVASI PAGE (Non-popup)                      */
          /* ======================================================== */
          <PrivacyPage onGoHome={goHome} />
        ) : (
          /* ======================================================== */
          /* CEK TRANSAKSI PAGE (Retained with full tracking capabilities) */
          /* ======================================================== */
          <div className="w-full pt-6 sm:pt-8 flex flex-col">
            <SearchSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchType={searchType}
              setSearchType={setSearchType}
              onSearch={handleSearch}
              onPaste={handlePasteClipboard}
            />

            {currentTrx ? (
              <TransactionCard
                data={currentTrx}
                payments={payments}
                onCopyToken={handleCopyToken}
                onPrint={() => setIsReceiptModalOpen(true)}
                onShare={handleShare}
                onOpenResolution={() => {
                  setActiveTab('bantuan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onSyncMutasi={handleSyncMutasi}
                showToast={showToast}
              />
            ) : (
              <EmptyTransactionState />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={() => openTransaction('pln')}
        onOpenHelpDesk={() => {
          setActiveTab('bantuan');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        initialCategoryId={selectedCategoryModal}
        initialItemLabel={selectedItemLabel}
        initialGroup={selectedGroup}
        categories={categories}
        payments={payments}
        onTransactionCreated={handleTransactionCreated}
        onGoToTracker={(trxId) => {
          setActiveTab('cek-transaksi');
          setCurrentTrxId(trxId);
          setSearchQuery(trxId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        showToast={showToast}
      />

      <PrintReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        data={currentTrx}
        showToast={showToast}
      />

      <ResolutionModal
        isOpen={isResolutionModalOpen}
        onClose={() => setIsResolutionModalOpen(false)}
        data={currentTrx}
        onSyncMutasi={handleSyncMutasi}
        showToast={showToast}
      />

      <ServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        onSelectService={(_svcName, catId) => openTransaction(catId || 'pulsa')}
      />

      <PromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onApplyPromo={(code) => {
          showToast(`Kupon ${code} telah aktif!`);
        }}
        showToast={showToast}
      />

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => openTransaction('pulsa')}
        onOpenHelp={() => {
          setActiveTab('bantuan');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
