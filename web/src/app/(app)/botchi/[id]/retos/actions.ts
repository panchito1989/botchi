"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const s = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export async function createReto(_prev: unknown, formData: FormData) {
  const device_id = String(formData.get("device_id") ?? "");
  const titulo = s(formData.get("titulo"), 80);
  const meta_desc = s(formData.get("meta_desc"), 400);
  const meta_tipo = s(formData.get("meta_tipo"), 24) || "libre";
  const meta_target = Math.max(
    1,
    Math.min(100000, Number(formData.get("meta_target") ?? 1) || 1)
  );
  const plazo_dias = Math.max(
    1,
    Math.min(365, Number(formData.get("plazo_dias") ?? 14) || 14)
  );
  const premio = s(formData.get("premio"), 200);

  if (!titulo || !meta_desc || !premio) {
    return { error: "Completa el reto, la meta y el premio." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("crear_reto", {
    p_device_id: device_id,
    p_titulo: titulo,
    p_meta_desc: meta_desc,
    p_meta_tipo: meta_tipo,
    p_meta_target: meta_target,
    p_plazo_dias: plazo_dias,
    p_premio: premio,
  });

  if (error) return { error: "No se pudo crear el reto. Intenta de nuevo." };

  revalidatePath(`/botchi/${device_id}/retos`);
  return { info: "Reto creado. La próxima vez que Botchi se conecte se lo propondrá." };
}

export async function updateRetoStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const device_id = String(formData.get("device_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const supabase = await createClient();
  await supabase.rpc("actualizar_reto_status", { p_id: id, p_status: status });
  revalidatePath(`/botchi/${device_id}/retos`);
}

export async function incrementProgress(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const device_id = String(formData.get("device_id") ?? "");
  const delta = Number(formData.get("delta") ?? 1) || 1;
  const supabase = await createClient();
  await supabase.rpc("incrementar_progreso_reto", { p_id: id, p_delta: delta });
  revalidatePath(`/botchi/${device_id}/retos`);
}

export async function markPrizeDelivered(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const device_id = String(formData.get("device_id") ?? "");
  const supabase = await createClient();
  await supabase.rpc("marcar_premio_entregado", { p_id: id });
  revalidatePath(`/botchi/${device_id}/retos`);
}
