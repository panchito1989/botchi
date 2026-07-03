"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Logo, Field } from "@/components/ui";

export default function SignupPage() {
  const [state, formAction] = useActionState(signUp, null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-4 text-xl font-bold text-ink">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-muted">
            Administra y acompaña el aprendizaje de tus hijos
          </p>
        </div>

        <form
          action={formAction}
          className="space-y-5 rounded-2xl border border-line bg-white p-7 shadow-sm"
        >
          <Field label="Tu nombre" name="full_name" type="text" required />
          <Field label="Correo" name="email" type="email" required />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            required
            minLength={6}
            hint="Mínimo 6 caracteres."
          />

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state?.info && (
            <p className="text-sm text-a-green">{state.info}</p>
          )}

          <SubmitButton className="w-full">Crear cuenta</SubmitButton>

          <p className="text-center text-xs text-muted">
            Al crear tu cuenta aceptas los{" "}
            <Link href="/terminos" className="text-brand hover:underline">
              Términos
            </Link>{" "}
            y el{" "}
            <Link href="/privacidad" className="text-brand hover:underline">
              Aviso de Privacidad
            </Link>
            .
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
