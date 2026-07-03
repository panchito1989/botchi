"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const s = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export async function updateIdentity(_prev: unknown, formData: FormData) {
  const deviceId = String(formData.get("device_id") ?? "");
  const supabase = await createClient();

  // Personalización (definida por el padre). Cada cambio dispara el
  // bump de config_version → OTA al dispositivo.
  const personalization = {
    child_name: s(formData.get("child_name"), 24),
    favorite_topics: s(formData.get("favorite_topics"), 160),
    focus_areas: s(formData.get("focus_areas"), 160),
    avoid_topics: s(formData.get("avoid_topics"), 200),
    house_rules: s(formData.get("house_rules"), 280),
    tone: s(formData.get("tone"), 24) || "equilibrado",
  };

  const { error } = await supabase
    .from("botchi_identities")
    .update({
      name: String(formData.get("name") ?? "Botchi").trim() || "Botchi",
      personality: String(formData.get("personality") ?? "curious"),
      mood: String(formData.get("mood") ?? "happy"),
      avatar_palette: String(formData.get("avatar_palette") ?? "default"),
      voice: String(formData.get("voice") ?? "default"),
      age_level: String(formData.get("age_level") ?? "semilla"),
      language: String(formData.get("language") ?? "es"),
      personalization,
      updated_at: new Date().toISOString(),
    })
    .eq("device_id", deviceId);

  if (error) return { error: "No se pudieron guardar los cambios." };

  revalidatePath(`/botchi/${deviceId}`, "layout");
  return { info: "Identidad actualizada. Tu Botchi se sincronizará por Wi-Fi." };
}
