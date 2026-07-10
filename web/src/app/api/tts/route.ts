import { NextResponse } from "next/server";
import {
  DAY_SECONDS,
  clientIp,
  envInt,
  forbiddenOrigin,
  isOwnOrigin,
  tooManyRequests,
  underLimit,
} from "@/lib/rate-limit";

// ElevenLabs TTS. Voz y modelo configurables por env (sin redeploy de
// código). Default: voz "Sarah" (cálida) + modelo multilingüe v2.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

// ElevenLabs cobra por carácter y la cuota se agota rápido: topes más
// apretados que los del demo. Si se pasa, el front cae solo a la voz del
// navegador (`!r.ok` → fallbackSpeak), así que el demo no se rompe.
function ttsRules(ip: string) {
  return [
    { bucket: "tts:burst", subject: ip, limit: 10, windowSeconds: 60 },
    {
      bucket: "tts:daily",
      subject: ip,
      limit: envInt("TTS_DAILY_PER_IP", 60),
      windowSeconds: DAY_SECONDS,
    },
    {
      bucket: "tts:global",
      subject: "all",
      limit: envInt("TTS_DAILY_GLOBAL", 1000),
      windowSeconds: DAY_SECONDS,
    },
  ];
}

export async function POST(req: Request) {
  if (!isOwnOrigin(req)) return forbiddenOrigin();

  const body = await req.json().catch(() => ({}));
  const text = String(body?.text ?? "").slice(0, 800).trim();
  if (!text) return NextResponse.json({ error: "EMPTY" }, { status: 400 });

  if (!(await underLimit(ttsRules(clientIp(req))))) {
    return tooManyRequests(60);
  }

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    // Sin key: la página usa la voz del navegador (no se rompe).
    return NextResponse.json({ error: "NO_TTS_KEY" }, { status: 503 });
  }

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!r.ok) {
      const detail = (await r.text()).slice(0, 250);
      return NextResponse.json(
        { error: "TTS_FAILED", detail },
        { status: 502 }
      );
    }
    const audio = Buffer.from(await r.arrayBuffer());
    if (audio.length < 200) {
      return NextResponse.json({ error: "NO_AUDIO" }, { status: 502 });
    }
    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "TTS_ERROR" }, { status: 502 });
  }
}
