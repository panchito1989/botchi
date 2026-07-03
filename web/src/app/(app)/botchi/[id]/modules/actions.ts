"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleModule(formData: FormData) {
  const deviceId = String(formData.get("device_id") ?? "");
  const moduleId = String(formData.get("module_id") ?? "");
  const enable = String(formData.get("enable") ?? "") === "true";

  const supabase = await createClient();

  await supabase.from("device_modules").upsert(
    {
      device_id: deviceId,
      module_id: moduleId,
      enabled: enable,
      enabled_at: new Date().toISOString(),
    },
    { onConflict: "device_id,module_id" }
  );

  revalidatePath(`/botchi/${deviceId}/modules`);
}
