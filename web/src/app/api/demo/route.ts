import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";
import {
  DAY_SECONDS,
  clientIp,
  envInt,
  forbiddenOrigin,
  isOwnOrigin,
  tooManyRequests,
  underLimit,
} from "@/lib/rate-limit";

// Resilience fallback if the DB prompt can't be read.
const FALLBACK_PROMPT = `
Eres "Botchi", compañero de bolsillo para niños y jóvenes. Suenas como
un amigo real: natural, cálido, con humor ligero. Frases cortas, sin
listas ni markdown, máximo ~55 palabras.

PRIMERO CLASIFICA el turno y responde según el caso:
1. CHARLA/EMOCIONES: nada de acertijos ni lecciones. Valida lo que
   siente, reacciona genuino y haz UNA pregunta de amigo. Acompañas.
2. DATO SIMPLE (capital, marcador, "quién ganó…"): RESPONDE DIRECTO en
   la primera frase; luego un dato curioso o pregunta ligera si se
   presta. Negarse a dar un dato simple es molesto, no pedagógico.
3. QUIERE ENTENDER ALGO (por qué/cómo funciona/tarea): aquí SÍ guía
   socráticamente: pista o analogía fresca + una pregunta que lo
   acerque. Si insiste dos veces o se frustra, da la respuesta clara y
   comprueba con una pregunta que la hizo suya. Celebra el acierto.
4. JUEGO/RETO: síguele el juego con energía.

Reacciona SIEMPRE a lo último que dijo, mantén UN solo hilo, no
repitas pistas ni analogías. NO termines cada turno con pregunta;
alterna. Nada de "amiguito" ni tono condescendiente. Apto para niños;
temas delicados → acompaña y sugiere un adulto de confianza.
`.trim();

// Si Gemini parpadea, NUNCA inventamos una respuesta de otro tema.
// Damos un mensaje en personaje que pide repetir (sin fingir saber).
const HOLDING = [
  "¡Estoy pensando en muchísimas cosas a la vez! Dame un momentito y pregúntame otra vez, ¿va? 😊",
  "Uf, mi cerebro está a tope ahorita. Respira conmigo y vuelve a preguntarme en un ratito.",
  "Necesito un respiro chiquito para pensarlo bien. Pregúntame de nuevo en un momento, ¿sí?",
];

function holding(seed: string) {
  const i =
    Math.abs([...seed].reduce((a, c) => a + c.charCodeAt(0), 0)) %
    HOLDING.length;
  return HOLDING[i];
}

type Turn = { role: "user" | "model"; text: string };
type Params = {
  temperature?: number;
  maxOutputTokens?: number;
  thinkingBudget?: number;
};

// Per-instance cache: the tier prompt changes rarely; avoid paying a
// DB round-trip (or a dead-DB stall) on every message.
const profileCache = new Map<
  string,
  { value: { system: string; params: Params }; at: number }
>();
const PROFILE_TTL_MS = 5 * 60_000;
const PROFILE_TIMEOUT_MS = 1500;

async function loadProfile(
  level: string
): Promise<{ system: string; params: Params }> {
  const cached = profileCache.get(level);
  if (cached && Date.now() - cached.at < PROFILE_TTL_MS) return cached.value;
  try {
    const supabase = createApiClient();
    // If Supabase is slow or unreachable, don't hold the child's
    // reply hostage: give up quickly and use the fallback prompt.
    const { data } = await Promise.race([
      supabase
        .from("prompt_profiles")
        .select("system_prompt, params")
        .eq("tier_id", level)
        .maybeSingle(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), PROFILE_TIMEOUT_MS)
      ),
    ]);
    if (data?.system_prompt) {
      const value = {
        system: data.system_prompt,
        params: (data.params as Params) ?? {},
      };
      profileCache.set(level, { value, at: Date.now() });
      return value;
    }
  } catch {
    /* fall through */
  }
  // Negative cache (short): while the DB is down, don't pay the
  // timeout again on every message.
  const value = { system: FALLBACK_PROMPT, params: {} };
  profileCache.set(level, {
    value,
    at: Date.now() - PROFILE_TTL_MS + 30_000,
  });
  return value;
}

type GeminiResult =
  | { kind: "ok"; reply: string }
  | { kind: "blocked" }
  | { kind: "fail" };

async function callGemini(
  key: string,
  system: string,
  contents: unknown,
  params: Params
): Promise<GeminiResult> {
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: {
            temperature: params.temperature ?? 0.7,
            topP: 0.95,
            maxOutputTokens: params.maxOutputTokens ?? 480,
            thinkingConfig: { thinkingBudget: params.thinkingBudget ?? 0 },
          },
          // Producto para niños: filtros de seguridad estrictos.
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
          ],
        }),
      }
    );
    if (!r.ok) return { kind: "fail" };
    const data = await r.json();
    if (data?.promptFeedback?.blockReason) return { kind: "blocked" };
    const reply = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p?.text ?? "")
      .join("")
      .trim();
    return reply ? { kind: "ok", reply } : { kind: "fail" };
  } catch {
    return { kind: "fail" };
  }
}

// Cada mensaje cuesta una llamada a Gemini. El tope global es el freno
// de mano: aunque alguien rote IPs, el gasto del día tiene techo.
function demoRules(ip: string) {
  return [
    { bucket: "demo:burst", subject: ip, limit: 20, windowSeconds: 60 },
    {
      bucket: "demo:daily",
      subject: ip,
      limit: envInt("DEMO_DAILY_PER_IP", 200),
      windowSeconds: DAY_SECONDS,
    },
    {
      bucket: "demo:global",
      subject: "all",
      limit: envInt("DEMO_DAILY_GLOBAL", 3000),
      windowSeconds: DAY_SECONDS,
    },
  ];
}

export async function POST(req: Request) {
  if (!isOwnOrigin(req)) return forbiddenOrigin();

  const body = await req.json().catch(() => ({}));
  const message = String(body?.message ?? "").slice(0, 500).trim();
  const history: Turn[] = Array.isArray(body?.history)
    ? body.history.slice(-10)
    : [];
  const VALID = ["semilla", "constructor", "arquitecto", "pro"];
  const level = VALID.includes(String(body?.level))
    ? String(body.level)
    : "semilla";

  if (!message) {
    return NextResponse.json({ error: "EMPTY" }, { status: 400 });
  }

  if (!(await underLimit(demoRules(clientIp(req))))) {
    // El front pinta `reply`: mejor una frase en personaje que un error.
    return tooManyRequests(60, {
      reply:
        "¡Uf, hoy platiqué muchísimo y necesito descansar tantito! Vuelve a buscarme en un ratito, ¿va? 😊",
      mode: "retry",
    });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ reply: holding(message), mode: "retry" });
  }

  const { system, params } = await loadProfile(level);
  const contents = [
    ...history.map((t) => ({
      role: t.role === "model" ? "model" : "user",
      parts: [{ text: String(t.text).slice(0, 600) }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  // Reintento una vez: los fallos de Gemini suelen ser parpadeos
  // (límite de ritmo) que se recuperan al segundo intento.
  let res = await callGemini(key, system, contents, params);
  if (res.kind === "fail") {
    await new Promise((r) => setTimeout(r, 700));
    res = await callGemini(key, system, contents, params);
  }

  if (res.kind === "ok") {
    return NextResponse.json({ reply: res.reply, mode: "ai" });
  }
  if (res.kind === "blocked") {
    return NextResponse.json({
      reply:
        "Mejor preguntémosle eso a un adulto de confianza, ¿te parece? ¿Qué otra cosa te gustaría aprender?",
      mode: "ai",
    });
  }
  // Sigue fallando: mensaje honesto en personaje, NUNCA un tema random.
  return NextResponse.json({ reply: holding(message), mode: "retry" });
}
