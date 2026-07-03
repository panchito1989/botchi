import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BotchiNav } from "@/components/botchi-nav";
import { Icon } from "@/components/ui";
import { SeedButton } from "./seed-button";

export default async function ProgressPage({
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

  const [{ data: progress }, { data: heatmap }, { data: interests }] =
    await Promise.all([
      supabase
        .from("learning_progress")
        .select("date, words_learned, minutes_active, sessions")
        .eq("device_id", id)
        .order("date", { ascending: true })
        .limit(14),
      supabase
        .from("cognitive_heatmap")
        .select("category, score")
        .eq("device_id", id)
        .order("date", { ascending: false })
        .limit(12),
      supabase
        .from("device_interests")
        .select("topic, weight")
        .eq("device_id", id)
        .order("weight", { ascending: false }),
    ]);

  const totalWords = progress?.reduce((s, p) => s + p.words_learned, 0) ?? 0;
  const totalMinutes =
    progress?.reduce((s, p) => s + p.minutes_active, 0) ?? 0;
  const totalSessions = progress?.reduce((s, p) => s + p.sessions, 0) ?? 0;
  const maxWords = Math.max(
    1,
    ...(progress?.map((p) => p.words_learned) ?? [1])
  );

  const heatMap = new Map<string, number>();
  heatmap?.forEach((h) => {
    if (!heatMap.has(h.category)) heatMap.set(h.category, Number(h.score));
  });

  const hasData = (progress?.length ?? 0) > 0;

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <Icon name="arrowLeft" className="h-4 w-4" /> Todos mis Botchi
      </Link>
      <BotchiNav id={id} />

      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Progreso
          </h1>
          <p className="mt-1 text-sm text-muted">
            Lo que tu hijo está aprendiendo con su Botchi.
          </p>
        </div>
        <SeedButton deviceId={id} />
      </div>

      {!hasData ? (
        <div className="rounded-2xl border border-line bg-white p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas text-muted">
            <Icon name="chart" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-ink">
            Aún no hay datos
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Cuando tu Botchi se use, aquí verás palabras aprendidas, mapa
            cognitivo e intereses. Mientras, puedes cargar datos de ejemplo.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              ["Palabras aprendidas", totalWords, "text-a-teal"],
              ["Minutos activos", totalMinutes, "text-a-green"],
              ["Sesiones", totalSessions, "text-a-violet"],
            ].map(([label, value, color]) => (
              <div
                key={label as string}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="mt-1 text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <h3 className="mb-5 font-semibold text-ink">
              Palabras aprendidas por día
            </h3>
            <div className="flex h-44 gap-2">
              {progress?.map((p) => (
                <div
                  key={p.date}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-brand"
                      style={{
                        height: `${Math.max(
                          4,
                          (p.words_learned / maxWords) * 100
                        )}%`,
                      }}
                      title={`${p.words_learned} palabras`}
                    />
                  </div>
                  <span className="text-[10px] text-muted">
                    {new Date(p.date).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <h3 className="mb-5 font-semibold text-ink">
              Mapa de calor cognitivo
            </h3>
            <div className="space-y-4">
              {[...heatMap.entries()].map(([cat, score]) => (
                <div key={cat}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-ink">{cat}</span>
                    <span className="text-muted">{score}/100</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-canvas">
                    <div
                      className="h-2.5 rounded-full bg-brand"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <h3 className="mb-4 font-semibold text-ink">
              Intereses detectados por la IA
            </h3>
            {interests && interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((t) => (
                  <span
                    key={t.topic}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-ink"
                  >
                    {t.topic}{" "}
                    <span className="text-muted">
                      {Math.round(Number(t.weight) * 100)}%
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Aún sin intereses detectados.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
