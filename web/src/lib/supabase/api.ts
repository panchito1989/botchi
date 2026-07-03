import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/**
 * Stateless Supabase client for device-facing API routes.
 * No user session — the device authenticates with its device_token,
 * validated inside SECURITY DEFINER RPCs. Uses the public anon key only.
 */
export function createApiClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}
