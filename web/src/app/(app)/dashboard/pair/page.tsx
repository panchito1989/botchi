"use client";

import Link from "next/link";
import { useActionState } from "react";
import { claimDevice } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Icon } from "@/components/ui";

export default function PairPage() {
  const [state, formAction] = useActionState(claimDevice, null);

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <Icon name="arrowLeft" className="h-4 w-4" /> Volver
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
        Vincular un Botchi
      </h1>
      <p className="mt-2 text-sm text-muted">
        Cada dispositivo trae un código único impreso en su empaque. Escríbelo
        aquí para agregarlo a tu cuenta.
      </p>

      <form
        action={formAction}
        className="mt-7 space-y-5 rounded-2xl border border-line bg-white p-7"
      >
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Código de vinculación
          </span>
          <input
            name="code"
            type="text"
            required
            autoFocus
            placeholder="BOT-XXXXXX"
            className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-center font-mono text-lg uppercase tracking-[0.3em] text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </label>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <SubmitButton className="w-full">Vincular</SubmitButton>
      </form>
    </div>
  );
}
