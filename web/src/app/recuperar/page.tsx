"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Logo, Field } from "@/components/ui";

export default function RecuperarPage() {
  const [state, action] = useActionState(requestPasswordReset, null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Logo />
          <p className="mt-3 text-sm text-muted">Recuperar contraseña</p>
        </div>

        <form
          action={action}
          className="space-y-5 rounded-2xl border border-line bg-white p-7 shadow-sm"
        >
          <p className="text-sm text-muted">
            Escribe el correo con el que entras al panel y te enviaremos un
            enlace seguro para crear una nueva contraseña.
          </p>
          <Field
            label="Correo"
            name="email"
            type="email"
            required
            autoComplete="email"
          />

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state?.info && (
            <p className="text-sm text-a-green">{state.info}</p>
          )}

          <SubmitButton className="w-full">Enviar enlace</SubmitButton>
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
