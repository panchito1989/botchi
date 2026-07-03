"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { Logo, Field } from "@/components/ui";

export default function NuevaContrasenaPage() {
  const [state, action] = useActionState(updatePassword, null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Logo />
          <p className="mt-3 text-sm text-muted">Crea tu nueva contraseña</p>
        </div>

        <form
          action={action}
          className="space-y-5 rounded-2xl border border-line bg-white p-7 shadow-sm"
        >
          <Field
            label="Nueva contraseña"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            hint="Mínimo 8 caracteres."
          />

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <SubmitButton className="w-full">Guardar contraseña</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-muted hover:text-ink">
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
