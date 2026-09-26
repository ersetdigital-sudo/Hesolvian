import React from 'react';

export interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface LegalPageShellProps {
  eyebrow: string;
  icon: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
  onGoHome: () => void;
}

export const LegalPageShell: React.FC<LegalPageShellProps> = ({
  eyebrow,
  icon,
  title,
  description,
  updatedAt,
  sections,
  onGoHome
}) => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] text-[#2C211D] animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* HERO HEADER */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-b from-[#F3EADF] via-[#FBF6EF] to-[#FBF6EF] border-b border-[#E8DDD2] pt-8 pb-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] text-[#8a716c] font-medium mb-4">
            <button
              type="button"
              onClick={onGoHome}
              className="hover:text-[#B4432C] transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <span>/</span>
            <span className="text-[#2C211D] font-bold">{title}</span>
          </div>

          <div className="max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 bg-[#FCEAE5] text-[#B4432C] px-3.5 py-1.5 rounded-full text-[12px] font-bold border border-[#F5A896]/40 shadow-xs">
              <span className="material-symbols-outlined text-[16px]">{icon}</span>
              <span>{eyebrow}</span>
            </div>

            <h1 className="font-['Newsreader'] text-3xl sm:text-5xl font-extrabold text-[#2C211D] tracking-tight leading-[1.15]">
              {title}
            </h1>

            <p className="text-[14px] sm:text-[16px] text-[#6B5A53] leading-relaxed font-['Manrope']">
              {description}
            </p>

            <div className="inline-flex items-center gap-2 text-[11.5px] font-bold text-[#6B5A53] bg-white px-3 py-1.5 rounded-full border border-[#E8DDD2]">
              <span className="material-symbols-outlined text-[15px] text-[#1F7A54]">schedule</span>
              <span>Terakhir diperbarui: {updatedAt}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* DOCUMENT BODY + TABLE OF CONTENTS */}
      {/* ======================================================== */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl border border-[#E8DDD2] p-5 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9B8A82] mb-3.5">
                Daftar Isi
              </div>
              <ol className="space-y-1">
                {sections.map((s, idx) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(s.id)}
                      className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-[12.5px] text-[#6B5A53] hover:text-[#B4432C] hover:bg-[#FBF6EF] transition-colors cursor-pointer"
                    >
                      <span className="font-mono text-[11px] font-bold text-[#B4432C] shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="leading-snug">{s.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          {/* Sections */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {sections.map((s, idx) => (
              <article
                key={s.id}
                id={s.id}
                className="bg-white rounded-2xl border border-[#E8DDD2] p-5 sm:p-7 shadow-xs scroll-mt-28"
              >
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FCEAE5] text-[#B4432C] flex items-center justify-center font-mono font-extrabold text-[13px] shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h2 className="font-['Newsreader'] text-xl sm:text-2xl font-bold text-[#2C211D] leading-snug pt-1">
                    {s.title}
                  </h2>
                </div>

                {s.paragraphs?.map((p) => (
                  <p
                    key={p.slice(0, 40)}
                    className="text-[13px] sm:text-[13.5px] text-[#6B5A53] leading-relaxed font-['Manrope'] mb-3"
                  >
                    {p}
                  </p>
                ))}

                {s.bullets && s.bullets.length > 0 && (
                  <ul className="space-y-2 mt-1">
                    {s.bullets.map((b) => (
                      <li key={b.slice(0, 40)} className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[17px] text-[#1F7A54] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span className="text-[13px] sm:text-[13.5px] text-[#6B5A53] leading-relaxed font-['Manrope']">
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            {/* Contact strip */}
            <div className="bg-[#FBF6EF] rounded-2xl border border-[#E8DDD2] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[13.5px] font-bold text-[#2C211D]">
                  Ada pertanyaan tentang dokumen ini?
                </div>
                <p className="text-[12.5px] text-[#6B5A53] leading-relaxed">
                  Hubungi Customer Care Hesolvian, kami siap membantu 24 jam.
                </p>
              </div>
              <a
                href="mailto:cs@hesolvian.com"
                className="shrink-0 inline-flex items-center justify-center gap-2 bg-[#B4432C] hover:bg-[#8E3220] text-white px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all active:scale-95 shadow-xs"
              >
                <span className="material-symbols-outlined text-[17px]">mail</span>
                <span>Hubungi Kami</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
