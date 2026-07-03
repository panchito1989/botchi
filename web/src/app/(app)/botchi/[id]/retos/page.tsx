import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BotchiNav } from "@/components/botchi-nav";
import { Icon, cn } from "@/components/ui";
import { NuevoRetoForm } from "./nuevo-reto-form";
import {
  updateRetoStatus,
  incrementProgress,
  markPrizeDelivered,
} from "./actions";

type Reto = {
  id: string;
  titulo: string;
  meta_desc: string;
  meta_tipo: string;
  meta_target: number;
  meta_progreso: number;
  premio: string;
  status: string;
  fecha_inicio: string;
  fecha_fin: string;
  premio_entregado_at: string | null;
};

const BADGE: Record<string, string> = {
  propuesto: "bg-a-amber-bg text-a-amber",
  en_curso: "bg-a-teal-bg text-a-teal",
  logrado: "bg-a-green-bg text-a-green",
  no_logrado: "bg-canvas text-muted",
  cancelado: "bg-canvas text-muted",
  pausado: "bg-a-violet-bg text-a-violet",
};

const LABEL: Record<string, string> = {
  propuesto: "Propuesto",
  en_curso: "En curso",
  logrado: "¡Logrado!",
  no_logrado: "No logrado",
  cancelado: "Cancelado",
  pausado: "Pausado",
};

function daysLeft(fecha_fin: string) {
  const end = new Date(fecha_fin + "T23:59:59");
  return Math.max(
    0,
    Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
}

export default async function RetosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: device } = await supabase
    .from("devices")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!device) notFound();

  const { data: retos } = await supabase
    .from("retos")
    .select(
      "id, titulo, meta_desc, meta_tipo, meta_target, meta_progreso, premio, status, fecha_inicio, fecha_fin, premio_entregado_at"
    )
    .eq("device_id", id)
    .order("created_at", { ascending: false });

  const all = (retos ?? []) as Reto[];
  const activos = all.filter((r) =>
    ["propuesto", "en_curso", "pausado"].includes(r.status)
  );
  const historia = all.filter((r) =>
    ["logrado", "no_logrado", "cancelado"].includes(r.status)
  );

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <Icon name="arrowLeft" className="h-4 w-4" /> Todos mis Botchi
      </Link>
      <BotchiNav id={id} />

      <h1 className="mb-1 text-2xl font-bold tracking-tight text-ink">
        Retos
      </h1>
      <p className="mb-6 text-sm text-muted">
        Tú pones la meta y el premio. Botchi se lo propone, lo motiva a
        diario y celebra los micro-avances. La seguridad y el método siempre
        van por encima.
      </p>

      <NuevoRetoForm deviceId={id} />

      {activos.length === 0 && historia.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas text-muted">
            <Icon name="spark" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-ink">
            Aún no hay retos
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Crea el primero para que Botchi y tu hijo/a tengan una meta
            compartida esta semana.
          </p>
        </div>
      ) : (
        <>
          {activos.length > 0 && (
            <section className="space-y-4">
              {activos.map((r) => {
                const pct = Math.min(
                  100,
                  Math.round((r.meta_progreso / Math.max(1, r.meta_target)) * 100)
                );
                const left = daysLeft(r.fecha_fin);
                return (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-line bg-white p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-ink">
                            {r.titulo}
                          </h3>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              BADGE[r.status] ?? BADGE.propuesto
                            )}
                          >
                            {LABEL[r.status] ?? r.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                          {r.meta_desc}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted">
                        <p className="font-medium text-ink">
                          {left} día{left === 1 ? "" : "s"} restante
                          {left === 1 ? "" : "s"}
                        </p>
                        <p className="mt-0.5">vence {r.fecha_fin}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-end justify-between text-xs text-muted">
                        <span>
                          Avance:{" "}
                          <strong className="text-ink">
                            {r.meta_progreso}
                          </strong>{" "}
                          / {r.meta_target}
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas">
                        <div
                          className="h-full bg-brand transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <p className="mt-4 rounded-lg bg-a-amber-bg/40 px-3.5 py-2.5 text-sm text-ink">
                      🎁 Premio: <strong>{r.premio}</strong>
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {r.status === "propuesto" && (
                        <form action={updateRetoStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="device_id" value={id} />
                          <input type="hidden" name="status" value="en_curso" />
                          <button
                            type="submit"
                            className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-strong"
                          >
                            El niño aceptó
                          </button>
                        </form>
                      )}
                      {r.status === "en_curso" && (
                        <>
                          <form action={incrementProgress}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="device_id" value={id} />
                            <input type="hidden" name="delta" value="1" />
                            <button
                              type="submit"
                              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
                            >
                              +1 avance
                            </button>
                          </form>
                          <form action={updateRetoStatus}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="device_id" value={id} />
                            <input type="hidden" name="status" value="logrado" />
                            <button
                              type="submit"
                              className="rounded-full bg-a-green px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                            >
                              Marcar logrado
                            </button>
                          </form>
                        </>
                      )}
                      {(r.status === "propuesto" || r.status === "en_curso") && (
                        <form action={updateRetoStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="device_id" value={id} />
                          <input
                            type="hidden"
                            name="status"
                            value="cancelado"
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-muted hover:bg-canvas hover:text-ink"
                          >
                            Cancelar
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {historia.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                Historial
              </h2>
              <div className="space-y-3">
                {historia.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            BADGE[r.status]
                          )}
                        >
                          {LABEL[r.status]}
                        </span>
                        <p className="truncate text-sm font-medium text-ink">
                          {r.titulo}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {r.meta_progreso}/{r.meta_target} · 🎁 {r.premio}
                      </p>
                    </div>
                    {r.status === "logrado" &&
                      (r.premio_entregado_at ? (
                        <span className="text-xs text-a-green">
                          Premio entregado ✓
                        </span>
                      ) : (
                        <form action={markPrizeDelivered}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="device_id" value={id} />
                          <button
                            type="submit"
                            className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
                          >
                            Marcar premio entregado
                          </button>
                        </form>
                      ))}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
