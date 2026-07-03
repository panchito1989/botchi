"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MESSAGES: Record<string, string> = {
  CODE_NOT_FOUND: "No encontramos ningún Botchi con ese código.",
  ALREADY_PAIRED: "Ese Botchi ya está vinculado a otra cuenta.",
  NOT_AUTHENTICATED: "Tu sesión expiró, vuelve a iniciar sesión.",
};

export async function claimDevice(_prev: unknown, formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Escribe el código de vinculación." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_device", { p_code: code });

  if (error) {
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k));
    return { error: key ? MESSAGES[key] : "No se pudo vincular el dispositivo." };
  }

  revalidatePath("/dashboard");
  redirect(`/botchi/${data}`);
}
