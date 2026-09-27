'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/adminAuth';
import { destroyCloudinaryAsset } from '@/lib/cloudinary';
import { describeDbError, supabaseAdmin } from '@/lib/supabase';
import type { ActionState, BankAccount, ContentStatus, PaymentSettings, TransactionStatus } from '@/lib/types';

/**
 * Semua mutasi panel admin.
 *
 * Berjalan di server, jadi service_role key tidak pernah masuk bundle browser.
 * Setiap action wajib memanggil `requireAdmin()` agar endpoint server action
 * tidak bisa dipanggil langsung oleh pengunjung situs.
 */

/* ============================================================
 * Helper
 * ============================================================ */

function text(formData: FormData, key: string, fallback = ''): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : fallback;
}

function optionalText(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  return value === '' ? null : value;
}

function int(formData: FormData, key: string, fallback = 0): number {
  const value = Number(text(formData, key));
  return Number.isFinite(value) ? Math.trunc(value) : fallback;
}

function optionalInt(formData: FormData, key: string): number | null {
  const value = text(formData, key);
  if (value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

/** Segarkan cache halaman publik & panel setelah data berubah. */
function revalidateEverything() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin');
}

/* ============================================================
 * PRODUK
 * ============================================================ */

export async function saveProductAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  const id = text(formData, '_id') || undefined;
  const label = text(formData, 'label');
  const categoryId = text(formData, 'category_id');
  const groupName = text(formData, 'group_name', 'Umum');

  if (!label) return { ok: false, message: 'Nama nominal wajib diisi.' };
  if (!categoryId) return { ok: false, message: 'Kategori wajib dipilih.' };

  const isVariable = text(formData, 'is_variable') === 'on';
  const price = isVariable ? 0 : int(formData, 'price');
  const promoPrice = optionalInt(formData, 'promo_price');

  // Gambar produk sengaja tidak diatur dari panel: field unggahnya sudah dibuang
  // dan tidak ada komponen publik yang menampilkan gambar produk. Kolom
  // `image_url` / `image_public_id` dibiarkan di database dan tidak ikut di-update.
  const payload = {
    category_id: categoryId,
    group_name: groupName,
    label,
    description: text(formData, 'description'),
    price,
    promo_price: promoPrice,
    is_variable: isVariable,
    status: (text(formData, 'status', 'active') as ContentStatus) || 'active',
    sort_order: int(formData, 'sort_order')
  };

  try {
    if (id) {
      const { error } = await supabaseAdmin().from('products').update(payload).eq('id', id);
      if (error) return { ok: false, message: describeDbError(error) };
    } else {
      const { error } = await supabaseAdmin().from('products').insert(payload);
      if (error) return { ok: false, message: describeDbError(error) };
    }
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: id ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.' };
}

export async function deleteProductAction(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  try {
    const { data: row } = await supabaseAdmin().from('products').select('image_public_id').eq('id', id).maybeSingle();
    const { error } = await supabaseAdmin().from('products').delete().eq('id', id);
    if (error) return { ok: false, message: describeDbError(error) };

    if (row?.image_public_id) await destroyCloudinaryAsset(row.image_public_id).catch(() => ({ ok: false }));
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: 'Produk berhasil dihapus.' };
}

/* ============================================================
 * FLASH SALE
 * ============================================================ */

export async function saveFlashSaleAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  const id = text(formData, '_id') || undefined;
  const name = text(formData, 'name');
  const categoryId = text(formData, 'category_id');
  if (!name) return { ok: false, message: 'Nama produk promo wajib diisi.' };
  if (!categoryId) return { ok: false, message: 'Kategori wajib dipilih.' };

  // Gambar promo tidak diatur dari panel: field unggahnya sudah dibuang dan tidak
  // ada komponen publik yang menampilkan gambar Flash Sale. Kolom `image_url` /
  // `image_public_id` dibiarkan di database dan tidak ikut di-update.
  const payload = {
    name,
    provider: text(formData, 'provider'),
    category_id: categoryId,
    target_label: optionalText(formData, 'target_label'),
    normal_price: int(formData, 'normal_price'),
    promo_price: int(formData, 'promo_price'),
    discount_percent: optionalInt(formData, 'discount_percent'),
    quota: Math.max(0, int(formData, 'quota')),
    sold: Math.max(0, int(formData, 'sold')),
    session_id: text(formData, 'session_id', 'flash-11'),
    session_start: text(formData, 'session_start', '11:00'),
    session_end: text(formData, 'session_end', '13:00'),
    status: (text(formData, 'status', 'active') as ContentStatus) || 'active',
    sort_order: int(formData, 'sort_order')
  };

  try {
    if (id) {
      const { error } = await supabaseAdmin().from('flash_sales').update(payload).eq('id', id);
      if (error) return { ok: false, message: describeDbError(error) };
    } else {
      const { error } = await supabaseAdmin().from('flash_sales').insert(payload);
      if (error) return { ok: false, message: describeDbError(error) };
    }
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: id ? 'Entri Flash Sale diperbarui.' : 'Entri Flash Sale ditambahkan.' };
}

export async function deleteFlashSaleAction(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  try {
    const { data: row } = await supabaseAdmin().from('flash_sales').select('image_public_id').eq('id', id).maybeSingle();
    const { error } = await supabaseAdmin().from('flash_sales').delete().eq('id', id);
    if (error) return { ok: false, message: describeDbError(error) };

    if (row?.image_public_id) await destroyCloudinaryAsset(row.image_public_id).catch(() => ({ ok: false }));
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: 'Entri Flash Sale dihapus.' };
}

/* ============================================================
 * PUSAT BANTUAN (FAQ)
 * ============================================================ */

export async function saveFaqAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  const id = text(formData, '_id') || undefined;
  const question = text(formData, 'question');
  if (!question) return { ok: false, message: 'Pertanyaan wajib diisi.' };

  const payload = {
    category: text(formData, 'category', 'umum') || 'umum',
    question,
    answer: text(formData, 'answer'),
    is_published: text(formData, 'is_published') === 'on',
    sort_order: int(formData, 'sort_order')
  };

  try {
    if (id) {
      const { error } = await supabaseAdmin().from('faqs').update(payload).eq('id', id);
      if (error) return { ok: false, message: describeDbError(error) };
    } else {
      const { error } = await supabaseAdmin().from('faqs').insert(payload);
      if (error) return { ok: false, message: describeDbError(error) };
    }
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: id ? 'FAQ diperbarui.' : 'FAQ ditambahkan.' };
}

export async function deleteFaqAction(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  try {
    const { error } = await supabaseAdmin().from('faqs').delete().eq('id', id);
    if (error) return { ok: false, message: describeDbError(error) };
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: 'FAQ dihapus.' };
}

/* ============================================================
 * TRANSAKSI (entri manual)
 * ============================================================ */

export async function createTransactionAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  const customerId = text(formData, 'customer_id');
  const productLabel = text(formData, 'product_label');

  if (!productLabel) return { ok: false, message: 'Produk wajib diisi.' };

  const unitPrice = Math.max(0, int(formData, 'unit_price'));
  const qty = Math.max(1, int(formData, 'qty', 1));
  const adminFee = Math.max(0, int(formData, 'admin_fee'));
  const discount = Math.max(0, int(formData, 'discount'));
  const total = unitPrice * qty + adminFee - discount;

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.floor(1000 + Math.random() * 9000);

  const payload = {
    id: `HSV${stamp}-${suffix}`,
    customer_id: customerId,
    category_id: text(formData, 'category_id', 'pulsa'),
    product_label: productLabel,
    status: (text(formData, 'status', 'success') as TransactionStatus) || 'success',
    qty,
    unit_price: unitPrice,
    admin_fee: adminFee,
    discount,
    total,
    method: text(formData, 'method', 'QRIS')
  };

  try {
    const { error } = await supabaseAdmin().from('transactions').insert(payload);
    if (error) return { ok: false, message: describeDbError(error) };
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: `Transaksi ${payload.id} tercatat.` };
}

export async function updateTransactionAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  const id = text(formData, '_id');
  if (!id) return { ok: false, message: 'ID pesanan tidak ditemukan.' };

  const productLabel = text(formData, 'product_label');
  if (!productLabel) return { ok: false, message: 'Produk wajib diisi.' };

  const qty = Math.max(1, int(formData, 'qty', 1));
  const unitPrice = Math.max(0, int(formData, 'unit_price'));
  const adminFee = Math.max(0, int(formData, 'admin_fee'));
  const discount = Math.max(0, int(formData, 'discount'));

  const payload = {
    customer_id: text(formData, 'customer_id'),
    category_id: text(formData, 'category_id', 'pulsa'),
    product_label: productLabel,
    status: (text(formData, 'status', 'success') as TransactionStatus) || 'success',
    qty,
    unit_price: unitPrice,
    admin_fee: adminFee,
    discount,
    total: unitPrice * qty + adminFee - discount,
    method: text(formData, 'method', 'QRIS')
  };

  try {
    const { error } = await supabaseAdmin().from('transactions').update(payload).eq('id', id);
    if (error) return { ok: false, message: describeDbError(error) };
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: `Pesanan ${id} berhasil diperbarui.` };
}

/** Ubah status pesanan dari tabel Manajemen Pesanan tanpa membuka halaman. */
export async function setTransactionStatusAction(
  id: string,
  status: TransactionStatus
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  const trxId = String(id ?? '').trim();
  if (!trxId) return { ok: false, message: 'ID pesanan tidak ditemukan.' };

  const allowed: TransactionStatus[] = ['pending', 'processing', 'success', 'failed'];
  if (!allowed.includes(status)) return { ok: false, message: 'Status tidak dikenal.' };

  try {
    const { error } = await supabaseAdmin().from('transactions').update({ status }).eq('id', trxId);
    if (error) return { ok: false, message: describeDbError(error) };
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  const label = { pending: 'Menunggu', processing: 'Diproses', success: 'Berhasil', failed: 'Gagal' }[status];
  return { ok: true, message: `Status ${trxId} kini "${label}".` };
}

export async function deleteTransactionAction(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  try {
    const { error } = await supabaseAdmin().from('transactions').delete().eq('id', id);
    if (error) return { ok: false, message: describeDbError(error) };
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: 'Transaksi dihapus.' };
}

/* ============================================================
 * PENGATURAN SITUS
 * ============================================================ */

export async function saveSettingsAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  // Hanya identitas minimum + kontak yang tersimpan. Logo, favicon, tagline,
  // dan metadata SEO adalah konstanta di src/lib/site.ts.
  const brand = {
    name: text(formData, 'name', 'Hesolvian')
  };

  const contact = {
    email: text(formData, 'email'),
    phone: text(formData, 'phone'),
    whatsapp: text(formData, 'whatsapp'),
    address: text(formData, 'address')
  };

  try {
    const client = supabaseAdmin();
    const { error } = await client
      .from('site_settings')
      .upsert(
        [
          { key: 'brand', value: brand, updated_at: new Date().toISOString() },
          { key: 'contact', value: contact, updated_at: new Date().toISOString() }
        ],
        { onConflict: 'key' }
      );
    if (error) return { ok: false, message: describeDbError(error) };
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: 'Pengaturan situs disimpan.' };
}

/* ============================================================
 * METODE PEMBAYARAN
 * ============================================================ */

/**
 * Baca daftar rekening dari hidden input JSON yang diisi `BankAccountsEditor`.
 * Baris yang masih kosong dibuang supaya tidak tersimpan sebagai sampah.
 */
function parseBankAccounts(formData: FormData): BankAccount[] {
  const raw = text(formData, 'banks_json');
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((entry, index) => {
      const row = (entry ?? {}) as Record<string, unknown>;
      return {
        id: typeof row.id === 'string' && row.id ? row.id : `bank-${index + 1}`,
        bank: typeof row.bank === 'string' ? row.bank.trim() : '',
        accountNumber: typeof row.accountNumber === 'string' ? row.accountNumber.trim() : '',
        accountName: typeof row.accountName === 'string' ? row.accountName.trim() : ''
      };
    })
    .filter((row) => row.bank || row.accountNumber || row.accountName);
}

/**
 * Simpan konfigurasi metode pembayaran.
 *
 * Gambar QRIS ditangani `ImageUpload` (upload langsung ke Cloudinary + hapus
 * aset lama lewat /api/cloudinary/delete), jadi di sini cukup menyimpan URL dan
 * public_id hasilnya. Aset sengaja TIDAK dihapus lagi dari server supaya gambar
 * yang tidak diganti tidak ikut terbuang.
 */
export async function savePaymentSettingsAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  const settings: PaymentSettings = {
    qris: {
      enabled: text(formData, 'qris_enabled') === 'on',
      imageUrl: optionalText(formData, 'qris_image_url'),
      imagePublicId: optionalText(formData, 'qris_image_public_id')
    },
    transfer: {
      enabled: text(formData, 'transfer_enabled') === 'on',
      accounts: parseBankAccounts(formData)
    },
    tunai: {
      enabled: text(formData, 'tunai_enabled') === 'on',
      note: text(formData, 'tunai_note')
    }
  };

  try {
    const { error } = await supabaseAdmin()
      .from('site_settings')
      .upsert(
        { key: 'payments', value: settings, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    if (error) return { ok: false, message: describeDbError(error) };
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: 'Metode pembayaran disimpan.' };
}

/** Hapus FAQ melalui tombol yang butuh id dari FormData. */
export async function deleteFaqByFormAction(formData: FormData): Promise<void> {
  const id = text(formData, 'id');
  if (!id) return;
  await deleteFaqAction(id);
}

/** Hapus produk melalui tombol yang butuh id dari FormData. */
export async function deleteProductByFormAction(formData: FormData): Promise<void> {
  const id = text(formData, 'id');
  if (!id) return;
  await deleteProductAction(id);
}

/** Hapus entri flash sale melalui tombol. */
export async function deleteFlashSaleByFormAction(formData: FormData): Promise<void> {
  const id = text(formData, 'id');
  if (!id) return;
  await deleteFlashSaleAction(id);
}
