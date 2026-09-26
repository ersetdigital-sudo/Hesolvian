import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/site';

/**
 * Kartu berbagi 1200×630 yang digenerate otomatis (tanpa aset gambar manual).
 * Dipakai untuk `og:image` sekaligus `twitter:image`.
 */

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SERVICES = ['Pulsa', 'Paket Data', 'Token PLN', 'PDAM', 'BPJS', 'Internet', 'E-Wallet'];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FBF6EF',
          padding: '64px 72px',
          fontFamily: 'sans-serif'
        }}
      >
        {/* Blok brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              backgroundColor: '#B4432C',
              color: '#FBF6EF',
              fontSize: '42px',
              fontWeight: 700
            }}
          >
            H
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '22px', letterSpacing: '4px', color: '#8a716c' }}>
              {SITE_TAGLINE.toUpperCase()}
            </span>
            <span style={{ fontSize: '38px', fontWeight: 700, color: '#2C211D' }}>{SITE_NAME}</span>
          </div>
        </div>

        {/* Judul utama */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <span style={{ fontSize: '66px', fontWeight: 700, lineHeight: 1.1, color: '#2C211D' }}>
            Loket Digital PPOB
          </span>
          <span style={{ fontSize: '30px', fontWeight: 700, color: '#B4432C' }}>
            Transaksi Mudah, Tagihan Beres.
          </span>
          <span style={{ fontSize: '24px', lineHeight: 1.45, color: '#6B5A53', maxWidth: '940px' }}>
            {SITE_DESCRIPTION}
          </span>
        </div>

        {/* Deretan layanan */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {SERVICES.map((service) => (
            <div
              key={service}
              style={{
                display: 'flex',
                borderRadius: '999px',
                border: '2px solid #E8DDD2',
                backgroundColor: '#ffffff',
                padding: '10px 22px',
                fontSize: '22px',
                fontWeight: 600,
                color: '#6B5A53'
              }}
            >
              {service}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
