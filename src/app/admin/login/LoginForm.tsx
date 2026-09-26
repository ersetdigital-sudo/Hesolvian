'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-[12.5px] font-semibold text-[#1d1c18]">
          Password admin
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-[#e7e5e4] bg-white px-3.5 py-3 text-[14px] text-[#1d1c18] outline-none transition placeholder:text-[#a8a29e] focus:border-[#E2694A] focus:ring-2 focus:ring-[#E2694A]/20"
        />
      </div>

      {state && !state.ok && (
        <p role="alert" className="rounded-lg bg-[#fef2f2] px-3.5 py-2.5 text-[12.5px] font-medium text-[#991b1b]">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1d1c18] px-4 py-3 text-[13.5px] font-semibold text-white transition hover:bg-[#32302c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Memeriksa…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">login</span>
            Masuk ke panel
          </>
        )}
      </button>
    </form>
  );
}
