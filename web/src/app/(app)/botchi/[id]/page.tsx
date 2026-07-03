import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BotchiNav } from "@/components/botchi-nav";
import { BotchiMascot } from "@/components/botchi-mascot";
import { Icon } from "@/components/ui";

export default async function BotchiOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: device } = await supabase
    .from("devices")
    .select(
      "id, hardware_label, firmware_version, config_version, last_seen, paired_at, pairing_code, botchi_identities(name, personality, mood, age_level, language)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!device) notFound();

  const identity = Array.isArray(device.botchi_identities)
    ? device.botchi_identities[0]
    : device.botchi_identities;

  const { data: tier } = await supabase
    .from("subscription_tiers")
    .select("name")
    .eq("id", identity?.age_level ?? "semilla")
    .maybeSingle();

  const stats = [
    ["Estado", device.paired_at ? "Vinculado" : "Sin vincular"],
    [
      "Última conexión",
      device.last_seen
        ? new Date(device.last_seen).toLocaleString("es-MX")
        : "Nunca",
    ],
    ["Firmware", device.firmware_version ?? "—"],
    ["Idioma", identity?.language ?? "es"],
    ["Versión config (OTA)", `v${device.config_version}`],
    ["Código", device.pairing_code],
  ];

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <Icon name="arrowLeft" className="h-4 w-4" /> Todos mis Botchi
      </Link>
      <BotchiNav id={id} />

      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-canvas">
          <BotchiMascot size={80} />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            {identity?.name ?? "Botchi"}
          </h1>
          <p className="mt-1 text-muted">
            Personalidad: {identity?.personality} · Nivel: {tier?.name}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {stats.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-line bg-white p-4"
              >
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-1 font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
