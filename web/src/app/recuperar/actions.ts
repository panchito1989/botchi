"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function origin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("host") || "botchi-one.vercel.app";
  return `${proto}://${host}`;
}

export async function requestPasswordReset(
  _prev: unknown,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Correo inválido." };
  }

  const supabase = await createClient();
  const base = await origin();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${base}/auth/callback?next=/recuperar/nueva`,
  });

  // Same response whether or not the email exists — avoids account enumeration.
  return {
    info: "Si esa cuenta existe, te enviamos un correo con instrucciones. Revisa tu bandeja (y la carpeta de spam).",
  };
}

export async function updatePassword(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Mínimo 8 caracteres." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "Tu enlace expiró o no es válido. Solicita uno nuevo desde el formulario.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "No se pudo actualizar la contraseña. Intenta de nuevo." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
