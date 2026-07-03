import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton, Icon } from "@/components/ui";
import { BotchiMascot } from "@/components/botchi-mascot";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: devices } = await supabase
    .from("devices")
    .select(
      "id, hardware_label, last_seen, paired_at, botchi_identities(name, mood, age_level)"
    )
    .order("created_at", { ascending: true });

  const { data: isAdmin } = await supabase.rpc("es_admin");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Tus Botchi
          </h1>
          <p className="mt-1 text-sm text-muted">
            Personaliza y acompaña el aprendizaje de tus hijos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <LinkButton href="/dashboard/reservas" size="sm" variant="secondary">
              <Icon name="mail" className="h-4 w-4" />
              Reservas
            </LinkButton>
          )}
          <LinkButton href="/dashboard/pair" size="sm">
            <Icon name="plus" className="h-4 w-4" />
            Vincular
          </LinkButton>
        </div>
      </div>

      {!devices || devices.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas text-muted">
            <Icon name="plus" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-ink">
            Aún no tienes ningún Botchi
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Toma el código que viene con tu dispositivo y agrégalo a tu cuenta.
          </p>
          <div className="mt-6 flex justify-center">
            <LinkButton href="/dashboard/pair">
              Vincular mi primer Botchi
            </LinkButton>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((d) => {
            const identity = Array.isArray(d.botchi_identities)
              ? d.botchi_identities[0]
              : d.botchi_identities;
            return (
              <Link
                key={d.id}
                href={`/botchi/${d.id}`}
                className="group rounded-2xl border border-line bg-white p-6 transition hover:border-brand/40 hover:shadow-sm"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
                  <BotchiMascot size={44} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">
                  {identity?.name ?? "Botchi"}
                </h3>
                <p className="text-sm text-muted">
                  {d.hardware_label ?? "Dispositivo Botchi"}
                </p>
                <p className="mt-3 text-xs text-muted">
                  {d.last_seen
                    ? `Última conexión: ${new Date(
                        d.last_seen
                      ).toLocaleString("es-MX")}`
                    : "Nunca se ha conectado"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
