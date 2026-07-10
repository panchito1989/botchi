import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";
import {
  DAY_SECONDS,
  clientIp,
  forbiddenOrigin,
  isOwnOrigin,
  tooManyRequests,
  underLimit,
} from "@/lib/rate-limit";

// Un padre real llena el formulario una vez, quizá dos si se equivoca.
// Todo lo demás es spam.
function reservaRules(ip: string) {
  return [
    { bucket: "reservar:burst", subject: ip, limit: 3, windowSeconds: 60 },
    { bucket: "reservar:daily", subject: ip, limit: 10, windowSeconds: DAY_SECONDS },
  ];
}

/**
 * Lead capture for the Founders Edition funnel.
 * Writes through the SECURITY DEFINER `crear_reserva` RPC so the
 * `reservas` table stays locked under RLS (no direct anon access).
 */
export async function POST(req: Request) {
  if (!isOwnOrigin(req)) return forbiddenOrigin();

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

  if (!(await underLimit(reservaRules(clientIp(req))))) {
    return tooManyRequests(60);
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
