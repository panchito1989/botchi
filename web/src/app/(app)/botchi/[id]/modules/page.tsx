import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BotchiNav } from "@/components/botchi-nav";
import { Icon, cn } from "@/components/ui";
import { MONETIZATION_ENABLED } from "@/lib/access";
import { toggleModule } from "./actions";

export default async function ModulesPage({
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

  const [{ data: modules }, { data: deviceModules }] = await Promise.all([
    supabase
      .from("learning_modules")
      .select("id, name, description, is_premium, min_tier")
      .order("sort_order"),
    supabase
      .from("device_modules")
      .select("module_id, enabled")
      .eq("device_id", id),
  ]);

  const enabledSet = new Set(
    deviceModules?.filter((m) => m.enabled).map((m) => m.module_id)
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
        Módulos de aprendizaje
      </h1>
      <p className="mb-6 text-sm text-muted">
        Activa o desactiva las capas de conocimiento de tu Botchi. Los cambios
        se envían al dispositivo por Wi-Fi.
      </p>

      {!MONETIZATION_ENABLED && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-muted">
          <Icon name="check" className="mt-0.5 h-4 w-4 flex-none text-a-green" />
          <span>
            Fase beta: <strong className="text-ink">todos los módulos
            son gratuitos</strong>, incluidos los premium. Los precios ya están
            en el sistema para activarse en el futuro.
          </span>
        </div>
      )}

      <div className="space-y-3">
        {modules?.map((m) => {
          const isOn = enabledSet.has(m.id);
          const isCore = m.id === "core_conversation";
          return (
            <div
              key={m.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink">{m.name}</h3>
                  {m.is_premium && (
                    <span className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-muted">
                      Premium
                    </span>
                  )}
                  {isCore && (
                    <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                      Base
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{m.description}</p>
              </div>

              <form action={toggleModule}>
                <input type="hidden" name="device_id" value={id} />
                <input type="hidden" name="module_id" value={m.id} />
                <input
                  type="hidden"
                  name="enable"
                  value={(!isOn).toString()}
                />
                <button
                  disabled={isCore && isOn}
                  className={cn(
                    "w-24 rounded-full px-3 py-2 text-sm font-medium transition disabled:opacity-50",
                    isOn
                      ? "bg-brand text-white hover:bg-brand-strong"
                      : "border border-line text-ink hover:bg-canvas"
                  )}
                >
                  {isOn ? "Activado" : "Activar"}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
