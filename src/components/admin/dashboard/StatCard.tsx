import { formatPercent } from '@/lib/format';

interface StatCardProps {
  label: string;
  value: string;
  delta: number | null;
  deltaCaption: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

/**
 * Kartu statistik: label, nilai besar, dan badge perubahan dibanding periode
 * pembanding. Kalau tidak ada data pembanding, badge ditampilkan netral
 * alih-alih memalsukan angka.
 */
export default function StatCard({
  label,
  value,
  delta,
  deltaCaption,
  icon,
  iconColor,
  iconBg
}: StatCardProps) {
  const isUp = delta !== null && delta > 0;
  const isFlat = delta !== null && delta === 0;
  const tone = isFlat
    ? 'bg-[#f5f5f4] text-[#57534e]'
    : isUp
      ? 'bg-[#dcfce7] text-[#166534]'
      : 'bg-[#fee2e2] text-[#991b1b]';

  return (
    <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_2px_rgba(29,28,24,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-semibold text-[#78716c]">{label}</p>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <span className="material-symbols-outlined text-[19px]" style={{ color: iconColor }}>
            {icon}
          </span>
        </span>
      </div>

      <p className="mt-3 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#1d1c18]">{value}</p>

      <div className="mt-3.5 flex items-center gap-2">
        {delta === null ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f4] px-2 py-1 text-[11px] font-bold text-[#78716c]">
            <span className="material-symbols-outlined text-[13px]">remove</span>
            Belum ada pembanding
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${tone}`}>
            <span className="material-symbols-outlined text-[13px]">{isUp ? 'trending_up' : isFlat ? 'trending_flat' : 'trending_down'}</span>
            {`${delta > 0 ? '+' : ''}${formatPercent(delta, 1)}`}
          </span>
        )}
        <span className="text-[11px] text-[#a8a29e]">{deltaCaption}</span>
      </div>
    </div>
  );
}
