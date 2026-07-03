import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BotchiNav } from "@/components/botchi-nav";
import { Icon } from "@/components/ui";
import { IdentityForm } from "./identity-form";

export default async function IdentityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: identity } = await supabase
    .from("botchi_identities")
    .select(
      "name, personality, mood, avatar_palette, voice, age_level, language, personalization"
    )
    .eq("device_id", id)
    .maybeSingle();

  if (!identity) notFound();

  const { data: tiers } = await supabase
    .from("subscription_tiers")
    .select("id, name")
    .order("sort_order");

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
        Identidad
      </h1>
      <p className="mb-6 text-sm text-muted">
        Dale personalidad a tu Botchi. Los cambios se envían al dispositivo por
        Wi-Fi la próxima vez que se conecte.
      </p>
      <IdentityForm deviceId={id} identity={identity} tiers={tiers ?? []} />
    </div>
  );
}
