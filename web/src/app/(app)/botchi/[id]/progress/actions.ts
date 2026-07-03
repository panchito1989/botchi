"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Demo-only: fabricates sample telemetry so parents can preview the dashboard
 * before real hardware exists. Real data arrives via /api/device/progress.
 * Runs through a SECURITY DEFINER RPC because parents have no direct write
 * access to the real telemetry tables (device-only by design).
 */
export async function seedSampleData(deviceId: string) {
  const supabase = await createClient();
  await supabase.rpc("seed_demo_progress", { p_device_id: deviceId });
  revalidatePath(`/botchi/${deviceId}/progress`);
}
