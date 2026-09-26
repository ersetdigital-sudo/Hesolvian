import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES_DATA } from '../data/categoriesData';
import {
  FLASH_SALE_PRODUCTS,
  FlashSaleProduct,
  ResolvedSession,
  discountPercentOf,
  productState,
  resolveSessions,
  soldPercentOf
} from '../data/flashSaleData';
import { formatRupiah } from '../types/ppob';

interface FlashSaleSectionProps {
  /** Entri Flash Sale dari Supabase. Kalau tidak diisi, pakai data statis. */
  products?: FlashSaleProduct[];
  onSelectProduct: (product: FlashSaleProduct) => void;
}

type TabId = 'live' | 'upcoming';

/* ============================================================
 * COUNTDOWN
 * ============================================================ */
const CountdownUnit: React.FC<{ value: string }> = ({ value }) => (
  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#2C211D] text-white flex items-center justify-center font-mono font-extrabold text-[13px] sm:text-[14px] tabular-nums">
    {value}
  </span>
);

const Countdown: React.FC<{ target: Date | null; now: Date | null; label: string }> = ({
  target,
  now,
  label
}) => {
  let hh = '--';
  let mm = '--';
  let ss = '--';

  if (target && now) {
    const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
    hh = String(Math.floor(total / 3600)).padStart(2, '0');
    mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    ss = String(total % 60).padStart(2, '0');
  }

  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <span className="text-[10.5px] sm:text-[12px] font-bold text-white/85 whitespace-nowrap leading-tight">
        {label}
      </span>
      <div
        className="flex items-center gap-1"
        role="timer"
        aria-label={`${label} ${hh} jam ${mm} menit ${ss} detik`}
      >
        <CountdownUnit value={hh} />
        <span className="text-white/80 font-bold text-[13px]">:</span>
        <CountdownUnit value={mm} />
        <span className="text-white/80 font-bold text-[13px]">:</span>
        <CountdownUnit value={ss} />
      </div>
    </div>
  );
};

/* ============================================================
 * PRODUCT CARD
 * ============================================================ */
const ProductCard: React.FC<{
  product: FlashSaleProduct;
  session: ResolvedSession | null;
  onSelect: (p: FlashSaleProduct) => void;
}> = ({ product, session, onSelect }) => {
  const state = productState(product, session);
  const discount = discountPercentOf(product);
  const soldPct = soldPercentOf(product);
  const soldOut = state === 'sold_out';
  const isActive = state === 'active';
  const category = CATEGORIES_DATA.find((c) => c.id === product.categoryId);

  const ctaLabel =
    state === 'active'
      ? 'Beli Sekarang'
      : state === 'sold_out'
      ? 'Kuota Habis'
      : state === 'expired'
      ? 'Sesi Berakhir'
      : 'Segera Hadir';

  return (
    <article
      className={`snap-start shrink-0 w-[65%] sm:w-[38%] lg:w-[23%] xl:w-[18.5%] bg-white rounded-2xl border p-2.5 sm:p-3 flex flex-col transition-all ${
        isActive
          ? 'border-[#EFE3DA] shadow-[0_2px_10px_-4px_rgba(44,33,29,0.12)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(180,67,44,0.32)] hover:border-[#E2694A]'
          : 'border-[#EFE3DA] shadow-[0_1px_4px_rgba(44,33,29,0.05)]'
      }`}
    >
      {/* Media area (pengganti foto produk) + badge diskon pojok */}
      <div
        className={`relative w-full h-[86px] sm:h-[104px] rounded-xl flex items-center justify-center mb-2.5 overflow-hidden ${
          isActive ? '' : 'grayscale-[35%]'
        }`}
        style={{ backgroundColor: category?.iconBg ?? '#FBF6EF' }}
      >
        <span
          className="material-symbols-outlined text-[36px] sm:text-[44px]"
          style={{ color: category?.iconColor ?? '#6B5A53' }}
        >
          {category?.iconName ?? 'sell'}
        </span>

        <span
          className={`absolute top-0 right-0 text-[10.5px] sm:text-[11.5px] font-extrabold leading-none px-1.5 py-[5px] rounded-bl-xl tabular-nums ${
            isActive ? 'bg-[#FFD839] text-[#B4432C]' : 'bg-[#EFE3DA] text-[#8a716c]'
          }`}
        >
          -{discount}%
        </span>

        {!isActive && <span className="absolute inset-0 bg-white/50" />}
      </div>

      {/* Nama + provider */}
      <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#2C211D] leading-snug line-clamp-2 min-h-[33px]">
        {product.name}
      </h3>
      <div className="text-[10.5px] text-[#9B8A82] mt-0.5 leading-snug line-clamp-1">
        {product.provider}
      </div>

      {/* Harga promo = hierarki utama */}
      <div className="mt-2">
        <div
          className={`text-[17px] sm:text-[19px] font-extrabold tracking-tight leading-none ${
            isActive ? 'text-[#E2694A]' : 'text-[#8a716c]'
          }`}
        >
          {formatRupiah(product.promoPrice)}
        </div>
        <div className="text-[10.5px] text-[#9B8A82] line-through mt-1">
          {formatRupiah(product.normalPrice)}
        </div>
      </div>

      {/* Kuota promo (bukan stok fisik) */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between gap-2 text-[10px] mb-1">
          <span className="text-[#9B8A82] font-semibold whitespace-nowrap">Kuota promo</span>
          <span
            className={`font-extrabold tabular-nums whitespace-nowrap ${
              soldOut ? 'text-[#8a716c]' : isActive ? 'text-[#E2694A]' : 'text-[#9B8A82]'
            }`}
          >
            {soldOut ? 'Habis' : `${soldPct}%`}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#F7E7E0] overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${soldPct}%`,
              backgroundColor: soldOut ? '#C9BDB5' : isActive ? '#E2694A' : '#D8CBC2'
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        disabled={!isActive}
        onClick={() => isActive && onSelect(product)}
        aria-label={`${ctaLabel} — ${product.name}`}
        className={`mt-3 w-full min-h-[38px] rounded-xl text-[12px] font-bold flex items-center justify-center gap-1 transition-all px-2 ${
          isActive
            ? 'bg-[#B4432C] hover:bg-[#8E3220] text-white shadow-xs active:scale-[0.98] cursor-pointer'
            : 'bg-[#FBF6EF] text-[#9B8A82] border border-[#EFE3DA] cursor-not-allowed'
        }`}
      >
        <span className="truncate">{ctaLabel}</span>
      </button>
    </article>
  );
};

/* ============================================================
 * SECTION
 * ============================================================ */
export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products: allProducts = FLASH_SALE_PRODUCTS,
  onSelectProduct
}) => {
  // `now` sengaja null saat render pertama supaya HTML server & client sama.
  const [now, setNow] = useState<Date | null>(null);
  const [userTab, setUserTab] = useState<TabId | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const sessions = useMemo(() => resolveSessions(now), [now]);
  const liveSessions = sessions.filter((s) => s.state === 'active');
  const upcomingSessions = sessions.filter((s) => s.state === 'upcoming');

  const effectiveTab: TabId =
    userTab ?? (now === null ? 'upcoming' : liveSessions.length > 0 ? 'live' : 'upcoming');
  const visibleSessions = effectiveTab === 'live' ? liveSessions : upcomingSessions;

  const nextAvailableId = (liveSessions[0] ?? upcomingSessions[0])?.id ?? null;
  const selectedExpired =
    selectedSessionId !== null &&
    now !== null &&
    sessions.some((s) => s.id === selectedSessionId && s.state === 'expired');

  // Countdown habis -> pindah otomatis ke sesi berikutnya bila tersedia
  useEffect(() => {
    if (selectedExpired && nextAvailableId) {
      setSelectedSessionId(nextAvailableId);
      setUserTab(null);
    }
  }, [selectedExpired, nextAvailableId]);

  const sessionInView =
    visibleSessions.find((s) => s.id === selectedSessionId) ?? visibleSessions[0] ?? null;

  const products = sessionInView
    ? allProducts.filter((p) => p.sessionId === sessionInView.id)
    : [];

  const countdownTarget =
    sessionInView?.state === 'active'
      ? sessionInView.endsAt
      : sessionInView?.state === 'upcoming'
      ? sessionInView.startsAt
      : null;

  const countdownLabel =
    sessionInView?.state === 'active' ? 'Berakhir dalam' : 'Dimulai dalam';

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [products.length]);

  const scrollCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
  };

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'live', label: 'Sedang Berlangsung', count: liveSessions.length },
    { id: 'upcoming', label: 'Segera Hadir', count: upcomingSessions.length }
  ];

  const scrollRow =
    'flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

  /* Seluruh entri dihapus dari database -> sembunyikan section-nya. */
  if (allProducts.length === 0) return null;

  return (
    <section id="flash-sale-section" className="w-full bg-[#FBF6EF] py-10 sm:py-14">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* ============ HEADER BAR ============ */}
        <div className="rounded-2xl bg-gradient-to-r from-[#B4432C] via-[#C2492F] to-[#E2694A] px-3.5 sm:px-5 py-3.5 sm:py-4 shadow-[0_10px_28px_-12px_rgba(180,67,44,0.6)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#FFD839] text-[24px] sm:text-[26px] shrink-0">
                bolt
              </span>
              <h2 className="text-white text-[19px] sm:text-[24px] font-black italic tracking-tight leading-none whitespace-nowrap">
                FLASH SALE
              </h2>
            </div>

            {sessionInView ? (
              <Countdown target={countdownTarget} now={now} label={countdownLabel} />
            ) : (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-white/85">
                  schedule
                </span>
                <span className="text-[11.5px] font-bold text-white/85">
                  Belum ada sesi terjadwal
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-[12.5px] sm:text-[13.5px] text-[#6B5A53] mt-3 font-['Manrope']">
          Promo terbatas, harga spesial untuk waktu terbatas.
        </p>

        {/* ============ PILIHAN SESI ============ */}
        <div className="mt-5 mb-5">
          <div className={`${scrollRow} mb-3`}>
            {tabs.map((t) => {
              const isOn = effectiveTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setUserTab(t.id);
                    setSelectedSessionId(null);
                  }}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] sm:text-[12.5px] font-bold transition-all cursor-pointer ${
                    isOn
                      ? 'bg-[#B4432C] text-white shadow-[0_4px_12px_-4px_rgba(180,67,44,0.5)]'
                      : 'bg-white text-[#6B5A53] border border-[#EFE3DA] hover:text-[#2C211D] hover:bg-[#F3EADF]'
                  }`}
                >
                  <span className="whitespace-nowrap">{t.label}</span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full tabular-nums ${
                      isOn ? 'bg-white/25 text-white' : 'bg-[#F2EDE6] text-[#6B5A53]'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chip jam sesi */}
          {visibleSessions.length > 0 ? (
            <div className={scrollRow}>
              {visibleSessions.map((s) => {
                const isSelected = sessionInView?.id === s.id;
                const isLive = s.state === 'active';
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11.5px] sm:text-[12px] font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#FCEAE5] border-[#B4432C] text-[#B4432C]'
                        : 'bg-white border-[#EFE3DA] text-[#6B5A53] hover:text-[#2C211D]'
                    }`}
                  >
                    {isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A54] animate-pulse shrink-0" />
                    )}
                    <span className="material-symbols-outlined text-[14px] shrink-0">schedule</span>
                    <span className="whitespace-nowrap tabular-nums">
                      {s.startTime} - {s.endTime}
                    </span>
                    <span
                      className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                        isLive ? 'bg-[#1F7A54] text-white' : 'bg-[#F2EDE6] text-[#6B5A53]'
                      }`}
                    >
                      {isLive ? 'Berlangsung' : s.dayLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#EFE3DA] rounded-2xl px-4 py-3.5 text-[12.5px] text-[#9B8A82]">
              {effectiveTab === 'live'
                ? 'Tidak ada sesi yang sedang berlangsung saat ini.'
                : 'Belum ada sesi berikutnya yang terjadwal.'}
            </div>
          )}
        </div>

        {/* ============ NAVIGASI CAROUSEL (DESKTOP) ============ */}
        <div className="hidden lg:flex items-center justify-end gap-2 mb-3">
          <button
            type="button"
            onClick={() => scrollCards(-1)}
            disabled={!canLeft}
            aria-label="Produk sebelumnya"
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              canLeft
                ? 'bg-white border-[#EFE3DA] text-[#2C211D] hover:bg-[#FCEAE5] hover:border-[#B4432C] hover:text-[#B4432C] cursor-pointer'
                : 'bg-[#FBF6EF] border-[#EFE3DA]/70 text-[#C9BDB5] cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => scrollCards(1)}
            disabled={!canRight}
            aria-label="Produk berikutnya"
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              canRight
                ? 'bg-white border-[#EFE3DA] text-[#2C211D] hover:bg-[#FCEAE5] hover:border-[#B4432C] hover:text-[#B4432C] cursor-pointer'
                : 'bg-[#FBF6EF] border-[#EFE3DA]/70 text-[#C9BDB5] cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>

        {/* ============ PRODUK (HORIZONTAL SCROLL) ============ */}
        <div
          ref={scrollerRef}
          className="-mx-6 px-6 lg:mx-0 lg:px-0 flex gap-3 sm:gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory lg:snap-none scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.length > 0 ? (
            products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                session={sessionInView}
                onSelect={onSelectProduct}
              />
            ))
          ) : (
            <div className="w-full bg-white border border-[#EFE3DA] rounded-2xl px-4 py-6 text-center text-[12.5px] text-[#9B8A82]">
              Belum ada produk promo pada sesi ini.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
