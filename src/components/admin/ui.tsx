import type { ReactNode } from 'react';
import type { ContentStatus } from '@/lib/types';

/* ============================================================
 * Kartu & judul bagian
 * ============================================================ */

export function AdminCard({
  children,
  className = '',
  padded = true
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_2px_rgba(29,28,24,0.04)] ${
        padded ? 'p-5 sm:p-6' : ''
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-[17px] font-bold leading-tight tracking-[-0.01em] text-[#1d1c18]">{title}</h2>
        {subtitle && <p className="mt-1 text-[12.5px] leading-relaxed text-[#78716c]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#1d1c18]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-[#78716c]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ============================================================
 * Form
 * ============================================================ */

const FIELD_BASE =
  'w-full rounded-lg border border-[#e7e5e4] bg-white px-3 py-2.5 text-[13px] text-[#1d1c18] outline-none transition placeholder:text-[#a8a29e] focus:border-[#E2694A] focus:ring-2 focus:ring-[#E2694A]/20 disabled:bg-[#f5f5f4] disabled:text-[#a8a29e]';

export function Field({
  label,
  htmlFor,
  hint,
  optional,
  children
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-[12.5px] font-semibold text-[#1d1c18]">
        {label}
        {optional && <span className="text-[11px] font-medium text-[#a8a29e]">opsional</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-[#8a716c]">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD_BASE} ${props.className ?? ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${FIELD_BASE} min-h-[96px] resize-y ${props.className ?? ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${FIELD_BASE} cursor-pointer ${props.className ?? ''}`} />;
}

export function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] text-[#1d1c18]">
      <input
        {...props}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#d6d3d1] accent-[#E2694A]"
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

/* ============================================================
 * Tombol
 * ============================================================ */

const BUTTON_VARIANTS = {
  primary: 'bg-[#1d1c18] text-white hover:bg-[#32302c]',
  brand: 'bg-[#E2694A] text-white hover:bg-[#d05a3c]',
  outline: 'border border-[#e7e5e4] bg-white text-[#1d1c18] hover:bg-[#fafaf9]',
  ghost: 'text-[#57534e] hover:bg-[#f5f5f4]',
  danger: 'border border-[#fecaca] bg-white text-[#b91c1c] hover:bg-[#fef2f2]'
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function buttonClass(variant: ButtonVariant = 'primary', size: 'sm' | 'md' = 'md'): string {
  const sizing = size === 'sm' ? 'px-3 py-2 text-[12px]' : 'px-4 py-2.5 text-[13px]';
  return `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${sizing} ${BUTTON_VARIANTS[variant]}`;
}

export function LinkButton({
  href,
  children,
  variant = 'primary',
  size = 'md'
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}) {
  return (
    <a href={href} className={buttonClass(variant, size)}>
      {children}
    </a>
  );
}

/* ============================================================
 * Indikator status
 * ============================================================ */

const CONTENT_STATUS_STYLE: Record<ContentStatus, string> = {
  active: 'bg-[#dcfce7] text-[#166534]',
  draft: 'bg-[#fef3c7] text-[#92400e]',
  archived: 'bg-[#f5f5f4] text-[#57534e]'
};

export function ContentStatusPill({ status }: { status: ContentStatus }) {
  const label = status === 'active' ? 'Aktif' : status === 'draft' ? 'Draf' : 'Arsip';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${CONTENT_STATUS_STYLE[status]}`}>
      {label}
    </span>
  );
}

const TRANSACTION_STATUS_STYLE: Record<string, { className: string; label: string }> = {
  success: { className: 'bg-[#dcfce7] text-[#166534]', label: 'Berhasil' },
  pending: { className: 'bg-[#fef3c7] text-[#92400e]', label: 'Menunggu' },
  processing: { className: 'bg-[#dbeafe] text-[#1e40af]', label: 'Diproses' },
  failed: { className: 'bg-[#fee2e2] text-[#991b1b]', label: 'Gagal' }
};

export function TransactionStatusPill({ status }: { status: string }) {
  const style = TRANSACTION_STATUS_STYLE[status] ?? { className: 'bg-[#f5f5f4] text-[#57534e]', label: status };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${style.className}`}>
      {style.label}
    </span>
  );
}

/* ============================================================
 * Lain-lain
 * ============================================================ */

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#e7e5e4] bg-[#fafaf9] px-6 py-12 text-center">
      <span className="material-symbols-outlined text-[38px] text-[#d6d3d1]">{icon}</span>
      <p className="text-[14px] font-semibold text-[#1d1c18]">{title}</p>
      {description && <p className="max-w-md text-[12.5px] leading-relaxed text-[#78716c]">{description}</p>}
      {action}
    </div>
  );
}

export function Alert({ tone = 'info', children }: { tone?: 'info' | 'success' | 'danger'; children: ReactNode }) {
  const styles = {
    info: 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]',
    success: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
    danger: 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
  } as const;

  return <div className={`rounded-lg border px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed ${styles[tone]}`}>{children}</div>;
}
