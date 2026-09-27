'use server';

import { describeDbError, supabaseAdmin } from '@/lib/supabase';
import { toDbPayload, toPublicRecord } from '@/lib/publicTransactions';
import type { TransactionRow } from '@/lib/types';
import type { TransactionRecord } from '@/types/ppob';

/**
 * Server action untuk halaman publik (Cek Transaksi).
 *
 * Tabel `transactions` tertutup untuk anon key (RLS tanpa policy), jadi semua
 * baca/tulis dilakukan di server memakai service_role. Input dari browser
 * dibersihkan di `toDbPayload` sebelum menyentuh database.
 */

export interface PublicLookupResult {
  ok: boolean;
  message?: string;
  records: TransactionRecord[];
}

export interface PublicWriteResult {
  ok: boolean;
  message?: string;
}

/** Cari pesanan asli dari Supabase berdasarkan nomor transaksi atau nomor pelanggan. */
export async function lookupTransactionAction(rawQuery: string): Promise<PublicLookupResult> {
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
  if (!query) {
    return { ok: false, message: 'Masukkan nomor transaksi atau nomor pelanggan.', records: [] };
  }

  const safe = query.replace(/[%,()*]/g, '').slice(0, 60);
  if (!safe) {
    return { ok: false, message: 'Kata kunci pencarian tidak valid.', records: [] };
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('transactions')
      .select('*')
      .or(`id.eq.${safe},customer_id.ilike.%${safe}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return { ok: false, message: describeDbError(error), records: [] };
    return { ok: true, records: (data ?? []).map((row) => toPublicRecord(row as TransactionRow)) };
  } catch (error) {
    return { ok: false, message: describeDbError(error), records: [] };
  }
}

/** Simpan pesanan hasil checkout pelanggan supaya jadi data asli & bisa dikelola admin. */
export async function savePublicTransactionAction(record: TransactionRecord): Promise<PublicWriteResult> {
  if (!record || typeof record.id !== 'string' || !record.id.trim()) {
    return { ok: false, message: 'Transaksi tidak valid.' };
  }

  const payload = toDbPayload(record);
  if (!payload.id) return { ok: false, message: 'ID transaksi kosong.' };

  try {
    const { error } = await supabaseAdmin().from('transactions').upsert(payload, { onConflict: 'id' });
    if (error) return { ok: false, message: describeDbError(error) };
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  return { ok: true };
}

/**
 * Ubah status pesanan dari sisi pelanggan.
 * Sengaja hanya mengizinkan transisi "processing" (konfirmasi bayar) dan
 * "success" (penyelesaian provider) — bukan sembarang nilai.
 */
export async function setPublicTransactionStatusAction(
  id: string,
  status: 'processing' | 'success'
): Promise<PublicWriteResult> {
  const trxId = typeof id === 'string' ? id.trim() : '';
  if (!trxId) return { ok: false, message: 'ID transaksi kosong.' };
  if (status !== 'processing' && status !== 'success') {
    return { ok: false, message: 'Status tidak dikenal.' };
  }

  try {
    const { error } = await supabaseAdmin().from('transactions').update({ status }).eq('id', trxId);
    if (error) return { ok: false, message: describeDbError(error) };
  } catch (error) {
    return { ok: false, message: describeDbError(error) };
  }

  return { ok: true };
}
