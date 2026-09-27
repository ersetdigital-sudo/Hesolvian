'use client';

import { useState } from 'react';
import { Field, TextInput, buttonClass } from '@/components/admin/ui';
import type { BankAccount } from '@/lib/types';

/**
 * Editor daftar rekening bank dengan baris dinamis.
 *
 * Karena server action hanya bisa membaca satu nilai per `name`, seluruh baris
 * diserialisasi ke hidden input `banks_json`. Server memvalidasi & menyaring
 * baris kosong di `parseBankAccounts` (lihat actions.ts).
 */
function blankAccount(): BankAccount {
  return {
    id: `bank-${Math.random().toString(36).slice(2, 9)}`,
    bank: '',
    accountNumber: '',
    accountName: ''
  };
}

export default function BankAccountsEditor({ initialAccounts }: { initialAccounts: BankAccount[] }) {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);

  function patchAccount(id: string, patch: Partial<BankAccount>) {
    setAccounts((prev) => prev.map((account) => (account.id === id ? { ...account, ...patch } : account)));
  }

  function removeAccount(id: string) {
    setAccounts((prev) => prev.filter((account) => account.id !== id));
  }

  function addAccount() {
    setAccounts((prev) => [...prev, blankAccount()]);
  }

  return (
    <div className="space-y-3">
      {/* Nilai yang benar-benar dikirim ke server action. */}
      <input type="hidden" name="banks_json" value={JSON.stringify(accounts)} />

      {accounts.length === 0 && (
        <p className="rounded-lg border border-dashed border-[#e7e5e4] bg-[#fafaf9] px-4 py-6 text-center text-[12.5px] text-[#78716c]">
          Belum ada rekening. Klik &ldquo;Tambah rekening&rdquo; untuk menambahkan tujuan transfer.
        </p>
      )}

      {accounts.map((account, index) => (
        <div key={account.id} className="rounded-xl border border-[#f0efed] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[11.5px] font-bold uppercase tracking-wide text-[#a8a29e]">
              Rekening {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeAccount(account.id)}
              className={buttonClass('danger', 'sm')}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Hapus
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Nama bank" htmlFor={`bank-name-${account.id}`}>
              <TextInput
                id={`bank-name-${account.id}`}
                value={account.bank}
                onChange={(event) => patchAccount(account.id, { bank: event.target.value })}
                placeholder="BCA"
              />
            </Field>

            <Field label="Nomor rekening" htmlFor={`bank-number-${account.id}`}>
              <TextInput
                id={`bank-number-${account.id}`}
                value={account.accountNumber}
                onChange={(event) => patchAccount(account.id, { accountNumber: event.target.value })}
                placeholder="1234567890"
              />
            </Field>

            <Field label="Atas nama" htmlFor={`bank-holder-${account.id}`}>
              <TextInput
                id={`bank-holder-${account.id}`}
                value={account.accountName}
                onChange={(event) => patchAccount(account.id, { accountName: event.target.value })}
                placeholder="PT Hesolvian Nusantara"
              />
            </Field>
          </div>
        </div>
      ))}

      <button type="button" onClick={addAccount} className={buttonClass('outline', 'sm')}>
        <span className="material-symbols-outlined text-[17px]">add</span>
        Tambah rekening
      </button>
    </div>
  );
}
