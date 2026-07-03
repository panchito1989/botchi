"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Logo, Field } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction] = useActionState(signIn, null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Logo />
          <p className="mt-3 text-sm text-muted">
            Entra al panel de padres
          </p>
        </div>

        <form
          action={formAction}
          className="space-y-5 rounded-2xl border border-line bg-white p-7 shadow-sm"
        >
          <Field label="Correo" name="email" type="email" required />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            required
          />

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <SubmitButton className="w-full">Iniciar sesión</SubmitButton>

          <p className="text-center text-sm">
            <Link
              href="/recuperar"
              className="text-muted hover:text-ink"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="font-medium text-brand hover:underline">
            Crear cuenta
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/" className="text-muted hover:text-ink">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
