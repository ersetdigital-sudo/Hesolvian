'use client';

import { useEffect, useRef, useState } from 'react';
import {
  IMAGE_ACCEPT_ATTRIBUTE,
  MAX_IMAGE_BYTES,
  formatFileSize,
  optimizedImageUrl,
  validateImageFile
} from '@/lib/imageRules';

/**
 * ============================================================
 * IMAGE UPLOAD (Cloudinary, signed)
 * ============================================================
 * - File dikirim LANGSUNG dari browser ke Cloudinary (tidak lewat server kita).
 * - Tanda tangan dibuat server lewat /api/cloudinary/sign; api_secret tidak
 *   pernah sampai ke browser.
 * - URL asli (`secure_url`) + `public_id` disimpan ke dua hidden input, jadi
 *   komponen ini bisa dipakai di dalam <form> biasa yang submit ke server action.
 * - Gambar lama dihapus dari Cloudinary begitu gambar baru berhasil diunggah.
 */

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export interface ImageUploadProps {
  /** Nama hidden input untuk URL gambar (disimpan ke kolom image_url). */
  urlField: string;
  /** Nama hidden input untuk public_id Cloudinary. */
  publicIdField: string;
  initialUrl?: string | null;
  initialPublicId?: string | null;
  /** Sub-folder Cloudinary, mis. 'produk' atau 'artikel'. */
  folder?: string;
  label?: string;
  hint?: string;
  ratio?: 'square' | 'wide' | 'banner';
  previewWidth?: number;
}

const RATIO_CLASS: Record<NonNullable<ImageUploadProps['ratio']>, string> = {
  square: 'aspect-square',
  wide: 'aspect-[16/10]',
  banner: 'aspect-[3/1]'
};

interface SignResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  uploadPreset: string;
  signature: string;
  uploadUrl: string;
  error?: string;
}

interface UploadResponse {
  public_id: string;
  secure_url: string;
  error?: { message?: string };
}

/** Upload memakai XHR supaya progres bisa ditampilkan (fetch tidak bisa). */
function uploadWithProgress(
  sign: SignResponse,
  file: File,
  onProgress: (percent: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sign.apiKey);
    form.append('timestamp', String(sign.timestamp));
    form.append('upload_preset', sign.uploadPreset);
    form.append('folder', sign.folder);
    form.append('signature', sign.signature);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', sign.uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText) as UploadResponse;
        if (xhr.status >= 200 && xhr.status < 300 && payload.public_id) resolve(payload);
        else reject(new Error(payload.error?.message ?? `Cloudinary menolak unggahan (${xhr.status}).`));
      } catch {
        reject(new Error('Jawaban Cloudinary tidak bisa dibaca.'));
      }
    };

    xhr.onerror = () => reject(new Error('Koneksi ke Cloudinary gagal.'));
    xhr.send(form);
  });
}

export default function ImageUpload({
  urlField,
  publicIdField,
  initialUrl = null,
  initialPublicId = null,
  folder = 'umum',
  label = 'Gambar',
  hint,
  ratio = 'wide',
  previewWidth = 800
}: ImageUploadProps) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [publicId, setPublicId] = useState<string | null>(initialPublicId);
  const [previewSrc, setPreviewSrc] = useState<string | null>(initialUrl);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Bersihkan object URL supaya tidak bocor memori.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function releaseObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setLocalPreview(null);
  }

  async function deleteRemote(assetId: string | null) {
    if (!assetId) return;
    try {
      await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: assetId })
      });
    } catch {
      // Kegagalan hapus aset lama tidak boleh menggagalkan penyimpanan data.
    }
  }

  async function handleFile(file: File) {
    setError(null);
    setInfo(null);

    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.message);
      setStatus('error');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    releaseObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setLocalPreview(objectUrl);
    setStatus('uploading');
    setProgress(0);

    const previousPublicId = publicId;

    try {
      const signResponse = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder })
      });

      if (!signResponse.ok) {
        const payload = (await signResponse.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? 'Gagal meminta tanda tangan unggah. Coba login ulang.');
      }

      const sign = (await signResponse.json()) as SignResponse;
      const result = await uploadWithProgress(sign, file, setProgress);

      const optimized = optimizedImageUrl(sign.cloudName, result.public_id, { width: previewWidth }) ?? result.secure_url;

      setUrl(optimized);
      setPublicId(result.public_id);
      setPreviewSrc(optimized);
      releaseObjectUrl();
      setStatus('done');
      setInfo(`${file.name} (${formatFileSize(file.size)}) berhasil diunggah.`);

      // Ganti gambar = buang aset lama supaya kuota Cloudinary tidak menumpuk.
      if (previousPublicId && previousPublicId !== result.public_id) {
        await deleteRemote(previousPublicId);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unggahan gagal.');
      setStatus('error');
      releaseObjectUrl();
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemove() {
    const removeId = publicId;
    setUrl(null);
    setPublicId(null);
    setPreviewSrc(null);
    setError(null);
    setInfo('Gambar dihapus. Simpan perubahan untuk menerapkan.');
    setStatus('idle');
    releaseObjectUrl();
    await deleteRemote(removeId);
  }

  const shown = localPreview ?? previewSrc;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[13px] font-semibold text-[#1d1c18]">{label}</label>
        <span className="text-[11px] font-medium text-[#8a716c]">
          JPG/PNG/WEBP • maks {formatFileSize(MAX_IMAGE_BYTES)}
        </span>
      </div>

      {/* Nilai yang benar-benar dikirim ke server */}
      <input type="hidden" name={urlField} value={url ?? ''} />
      <input type="hidden" name={publicIdField} value={publicId ?? ''} />

      <div
        className={`relative overflow-hidden rounded-xl border border-dashed ${
          status === 'error' ? 'border-[#ba1a1a] bg-[#ffdad6]/40' : 'border-[#dec0ba] bg-[#f8f3ec]'
        }`}
      >
        <div className={`${RATIO_CLASS[ratio]} w-full`}>
          {shown ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={shown}
              alt="Pratinjau gambar"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
              <span className="material-symbols-outlined text-[34px] text-[#c9a79f]">image</span>
              <p className="text-[12px] font-medium text-[#8a716c]">Belum ada gambar</p>
            </div>
          )}
        </div>

        {status === 'uploading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1d1c18]/65 backdrop-blur-[2px]">
            <p className="text-[12px] font-semibold text-white">Mengunggah… {progress}%</p>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-[#ffd839] transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {status === 'done' && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#166534]">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            Tersimpan di Cloudinary
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'uploading'}
          className="inline-flex items-center gap-2 rounded-lg border border-[#dec0ba] bg-white px-3 py-2 text-[12px] font-semibold text-[#7e210e] transition hover:bg-[#f8f3ec] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[17px]">{shown ? 'swap_horiz' : 'upload'}</span>
          {status === 'uploading' ? 'Mengunggah…' : shown ? 'Ganti gambar' : 'Pilih gambar'}
        </button>

        {shown && status !== 'uploading' && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-[12px] font-semibold text-[#ba1a1a] transition hover:bg-[#ffdad6]/50"
          >
            <span className="material-symbols-outlined text-[17px]">delete</span>
            Hapus
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {hint && !error && !info && <p className="text-[11px] leading-relaxed text-[#8a716c]">{hint}</p>}
      {info && !error && (
        <p className="text-[11px] font-medium leading-relaxed text-[#166534]">{info}</p>
      )}
      {error && (
        <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-[11px] font-medium leading-relaxed text-[#93000a]">{error}</p>
      )}
    </div>
  );
}
