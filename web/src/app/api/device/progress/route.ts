import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : body.token;
  if (!token)
    return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 401 });

  const supabase = createApiClient();
  const { data, error } = await supabase.rpc("device_push_progress", {
    p_token: token,
    p_words: Number(body.words ?? 0),
    p_minutes: Number(body.minutes ?? 0),
    p_sessions: Number(body.sessions ?? 0),
    p_interests: body.interests ?? [],
    p_heatmap: body.heatmap ?? [],
  });

  if (error)
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });

  return NextResponse.json(data);
}
