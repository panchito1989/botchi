/**
 * Supabase connection config.
 *
 * These two values are PUBLIC by design: the URL and the publishable/anon key
 * are meant to ship in the browser bundle — data is protected by Row Level
 * Security, and the only secret (service_role) is never used here. Env vars
 * override the defaults so other environments can point elsewhere.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://sjfdrbavqfntsqtquooo.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_C2gm54SdrSpyUgVk6EOSdQ_vTnSfkdc";
