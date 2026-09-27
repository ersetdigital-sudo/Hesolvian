'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/adminAuth';
import { destroyCloudinaryAsset } from '@/lib/cloudinary';
import { describeDbError, supabaseAdmin } from '@/lib/supabase';
import type { ActionState, BankAccount, ContentStatus, PaymentSettings, TransactionStatus } from '@/lib/types';
import { DEFAULT_PAYMENT_SETTINGS } from '@/lib/types';

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

/** Kalau gambar diganti, aset lama ikut dibuang dari Cloudinary. */
async function syncImageAsset(previousPublicId: string | null) {
  if (previousPublicId) {
    await destroyCloudinaryAsset(previousPublicId).catch(() => ({ ok: false }));
  }
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
  const imagePublicId = optionalText(formData, 'image_public_id');
  const imageUrl = optionalText(formData, 'image_url');

  const payload = {
    category_id: categoryId,
    group_name: groupName,
    label,
    description: text(formData, 'description'),
    price,
    promo_price: promoPrice,
    is_variable: isVariable,
    image_url: imageUrl,
    image_public_id: imagePublicId,
    status: (text(formData, 'status', 'active') as ContentStatus) || 'active',
    sort_order: int(formData, 'sort_order')
  };

  try {
    if (id) {
      const { data: previous } = await supabaseAdmin()
        .from('products')
        .select('image_public_id')
        .eq('id', id)
        .maybeSingle();
      await syncImageAsset((previous?.image_public_id as string | null) ?? null);

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
    image_url: optionalText(formData, 'image_url'),
    image_public_id: optionalText(formData, 'image_public_id'),
    status: (text(formData, 'status', 'active') as ContentStatus) || 'active',
    sort_order: int(formData, 'sort_order')
  };

  try {
    if (id) {
      const { data: previous } = await supabaseAdmin()
        .from('flash_sales')
        .select('image_public_id')
        .eq('id', id)
        .maybeSingle();
      await syncImageAsset((previous?.image_public_id as string | null) ?? null);

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
 * ARTIKEL
 * ============================================================ */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export async function saveArticleAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  const id = text(formData, '_id') || undefined;
  const title = text(formData, 'title');
  if (!title) return { ok: false, message: 'Judul artikel wajib diisi.' };

  const status = (text(formData, 'status', 'draft') as 'draft' | 'published' | 'archived') || 'draft';

  const payload = {
    title,
    slug: text(formData, 'slug') || slugify(title),
    excerpt: text(formData, 'excerpt'),
    content: text(formData, 'content'),
    cover_image_url: optionalText(formData, 'cover_image_url'),
    cover_image_public_id: optionalText(formData, 'cover_image_public_id'),
    author: text(formData, 'author', 'Admin'),
    status,
    published_at: status === 'published' ? new Date().toISOString() : null
  };

  try {
    if (id) {
      const { data: previous } = await supabaseAdmin()
        .from('articles')
        .select('cover_image_public_id')
        .eq('id', id)
        .maybeSingle();
      await syncImageAsset((previous?.cover_image_public_id as string | null) ?? null);

      const { error } = await supabaseAdmin()
        .from('articles')
        .update({ ...payload, published_at: status === 'published' ? undefined : null })
        .eq('id', id);
      if (error) return { ok: false, message: describeDbError(error) };
    } else {
      const { error } = await supabaseAdmin().from('articles').insert(payload);
      if (error) return { ok: false, message: describeDbError(error) };
    }
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: id ? 'Artikel diperbarui.' : 'Artikel ditambahkan.' };
}

export async function deleteArticleAction(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Sesi admin habis. Silakan login ulang.' };
  }

  try {
    const { data: row } = await supabaseAdmin().from('articles').select('cover_image_public_id').eq('id', id).maybeSingle();
    const { error } = await supabaseAdmin().from('articles').delete().eq('id', id);
    if (error) return { ok: false, message: describeDbError(error) };

    if (row?.cover_image_public_id) {
      await destroyCloudinaryAsset(row.cover_image_public_id).catch(() => ({ ok: false }));
    }
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  revalidateEverything();
  return { ok: true, message: 'Artikel dihapus.' };
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
  const customerName = text(formData, 'customer_name');
  const productLabel = text(formData, 'product_label');

  if (!customerName) return { ok: false, message: 'Nama pelanggan wajib diisi.' };
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
    customer_name: customerName,
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
      merchantName: text(formData, 'qris_merchant_name', DEFAULT_PAYMENT_SETTINGS.qris.merchantName),
      nmid: text(formData, 'qris_nmid'),
      imageUrl: optionalText(formData, 'qris_image_url'),
      imagePublicId: optionalText(formData, 'qris_image_public_id')
    },
    transfer: {
      enabled: text(formData, 'transfer_enabled') === 'on',
      accounts: parseBankAccounts(formData)
    },
    va: {
      enabled: text(formData, 'va_enabled') === 'on',
      note: text(formData, 'va_note')
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

/** Hapus artikel melalui tombol yang butuh id dari FormData. */
export async function deleteArticleByFormAction(formData: FormData): Promise<void> {
  const id = text(formData, 'id');
  if (!id) return;
  await deleteArticleAction(id);
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
