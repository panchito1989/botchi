"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ESTADOS = ["nuevo", "contactado", "cerrado", "descartado"];

export async function marcarReserva(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !ESTADOS.includes(status)) return;

  const supabase = await createClient();
  await supabase.rpc("marcar_reserva", { p_id: id, p_status: status });
  revalidatePath("/dashboard/reservas");
}
