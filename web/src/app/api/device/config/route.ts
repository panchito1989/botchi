import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";

function tokenFrom(req: Request, body: { token?: string }) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return body.token;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = tokenFrom(req, body);
  if (!token)
    return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 401 });

  const supabase = createApiClient();
  const { data, error } = await supabase.rpc("device_config", {
    p_token: token,
  });

  if (error)
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });

  return NextResponse.json(data);
}
