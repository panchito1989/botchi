import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";

/**
 * Lead capture for the Founders Edition funnel.
 * Writes through the SECURITY DEFINER `crear_reserva` RPC so the
 * `reservas` table stays locked under RLS (no direct anon access).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const nombre = String(body?.nombre ?? "").trim().slice(0, 80);
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 160);
  const whatsapp = String(body?.whatsapp ?? "").trim().slice(0, 32);
  const hijo_edad = String(body?.hijo_edad ?? "").trim().slice(0, 32);
  const plan = String(body?.plan ?? "fundador").trim().slice(0, 40) || "fundador";
  const mensaje = String(body?.mensaje ?? "").trim().slice(0, 600);
  const source = String(body?.source ?? "precios").trim().slice(0, 40) || "precios";

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!nombre || !emailOk) {
    return NextResponse.json({ error: "DATOS_INVALIDOS" }, { status: 400 });
  }

  try {
    const supabase = createApiClient();
    const { error } = await supabase.rpc("crear_reserva", {
      p_nombre: nombre,
      p_email: email,
      p_whatsapp: whatsapp || undefined,
      p_hijo_edad: hijo_edad || undefined,
      p_plan: plan,
      p_mensaje: mensaje || undefined,
      p_source: source,
    });
    if (error) {
      return NextResponse.json({ error: "NO_GUARDADO" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "NO_GUARDADO" }, { status: 502 });
  }
}
