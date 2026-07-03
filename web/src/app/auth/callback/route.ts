import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase Auth callback (PKCE).
 * Email links from password reset (and future magic-link/OAuth) point here
 * with a `code` query param. We exchange it for a session, then redirect
 * to `next` (defaults to /dashboard).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=callback", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/recuperar?error=expirado", url.origin)
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
