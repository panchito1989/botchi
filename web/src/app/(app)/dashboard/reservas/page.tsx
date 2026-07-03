import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui";
import { marcarReserva } from "./actions";

type Reserva = {
  id: string;
  created_at: string;
  nombre: string;
  email: string;
  whatsapp: string | null;
  hijo_edad: string | null;
  plan: string;
  mensaje: string | null;
  source: string;
  status: string;
};

const BADGE: Record<string, string> = {
  nuevo: "bg-a-teal-bg text-a-teal",
  contactado: "bg-a-amber-bg text-a-amber",
  cerrado: "bg-a-green-bg text-a-green",
  descartado: "bg-canvas text-muted",
};

const ACCIONES: [string, string][] = [
  ["contactado", "Contactado"],
  ["cerrado", "Cerrado"],
  ["descartado", "Descartar"],
  ["nuevo", "Reabrir"],
];

function waLink(num: string) {
  const d = num.replace(/\D/g, "");
  const full = d.length === 10 ? `52${d}` : d;
  return `https://wa.me/${full}`;
}

export default async function ReservasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("listar_reservas");

  // RPC raises NO_AUTORIZADO for non-admins → keep the page invisible.
  if (error) notFound();

  const reservas = (Array.isArray(data) ? data : []) as Reserva[];
  const nuevas = reservas.filter((r) => r.status === "nuevo").length;

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <Icon name="arrowLeft" className="h-4 w-4" /> Volver al panel
      </Link>

      <div className="mb-6 mt-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Reservas de Fundador
          </h1>
          <p className="mt-1 text-sm text-muted">
            {reservas.length} en total · {nuevas} sin contactar
          </p>
        </div>
      </div>

      {reservas.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas text-muted">
            <Icon name="mail" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-ink">
            Aún no hay reservas
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Cuando alguien aparte su lugar en{" "}
            <span className="font-medium text-ink">/precios</span> aparecerá
            aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservas.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink">{r.nombre}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                        BADGE[r.status] ?? BADGE.nuevo
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    <a
                      href={`mailto:${r.email}`}
                      className="hover:text-ink hover:underline"
                    >
                      {r.email}
                    </a>
                    {r.hijo_edad ? ` · hijo/a: ${r.hijo_edad}` : ""}
                  </p>
                </div>
                <div className="text-right text-xs text-muted">
                  <p>
                    {new Date(r.created_at).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="mt-0.5">vía {r.source}</p>
                </div>
              </div>

              {r.mensaje && (
                <p className="mt-3 rounded-lg bg-canvas px-3.5 py-2.5 text-sm text-ink/80">
                  “{r.mensaje}”
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {r.whatsapp && (
                  <a
                    href={waLink(r.whatsapp)}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    WhatsApp {r.whatsapp}
                  </a>
                )}
                {ACCIONES.filter(([s]) => s !== r.status).map(([s, label]) => (
                  <form key={s} action={marcarReserva}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-muted transition hover:bg-canvas hover:text-ink"
                    >
                      {label}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
