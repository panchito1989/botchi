import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";

/**
 * Protección de los endpoints públicos que cuestan dinero (Gemini,
 * ElevenLabs) o que escriben en la DB sin sesión (`/api/reservar`).
 *
 * Dos capas:
 *  1. Contador en memoria del proceso — gratis, atrapa el bucle ingenuo
 *     que cae siempre en la misma instancia serverless.
 *  2. Contador en Postgres (`rate_limit_hit`) — atómico y compartido
 *     entre instancias. Es el que de verdad pone el techo.
 *
 * Ante un fallo de infraestructura (Supabase caído o lento) la capa 2
 * deja pasar. Es deliberado: una caída de la DB no debe tumbar el demo
 * para todos, y un atacante no puede provocarla a voluntad. El techo de
 * gasto real vive además en las consolas de Gemini/ElevenLabs.
 */

export type Rule = {
  /** Espacio de nombres del contador, ej. "demo:burst". */
  bucket: string;
  /** A quién se le cuenta: una IP, un token, o "all" para el tope global. */
  subject: string;
  /** Golpes permitidos por ventana. */
  limit: number;
  /** Ancho de la ventana en segundos. */
  windowSeconds: number;
};

export const DAY_SECONDS = 86_400;

const DB_TIMEOUT_MS = 800;
const MEMORY_MAX_KEYS = 5_000;

/** Lee un entero positivo del entorno, con respaldo si no está o es basura. */
export function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

/** IP del cliente tal como la ve el proxy de Vercel. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function hostOf(value: string): string | null {
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function extraOrigins(): string[] {
  const out: string[] = [];
  for (const entry of (process.env.ALLOWED_ORIGINS ?? "").split(",")) {
    const trimmed = entry.trim();
    if (trimmed) out.push(trimmed);
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) out.push(site);
  if (process.env.NODE_ENV !== "production") out.push("http://localhost:3000");
  return out;
}

/**
 * ¿La petición viene de nuestra propia página?
 *
 * Los navegadores mandan `Origin` en todo POST de `fetch`, incluso del
 * mismo origen. Un `Origin` ausente o ajeno significa que quien llama no
 * es nuestro front — típicamente curl o un script. Comparar contra el
 * `Host` de la petición hace que esto funcione en cualquier preview de
 * Vercel sin configurar nada; `ALLOWED_ORIGINS` es para el día que el
 * dominio propio y el de la app difieran.
 *
 * Ojo: NO usar en los endpoints `/api/device/*` — el Pi no manda Origin.
 * Esos se autentican con `device_token`.
 */
export function isOwnOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const originHost = hostOf(origin);
  if (!originHost) return false;
  if (originHost === req.headers.get("host")) return true;
  return extraOrigins().some((allowed) => hostOf(allowed) === originHost);
}

// --- Capa 1: memoria del proceso -------------------------------------

const memory = new Map<string, number>();

function sweepMemory() {
  // Las llaves llevan el índice de ventana, así que las viejas quedan
  // huérfanas. Vaciar de golpe al pasarse es tosco pero acotado: en el
  // peor caso se reinician contadores y manda la capa de Postgres.
  if (memory.size > MEMORY_MAX_KEYS) memory.clear();
}

function memoryAllows(rule: Rule, now: number): boolean {
  const slot = Math.floor(now / (rule.windowSeconds * 1000));
  const key = `${rule.bucket}|${rule.subject}|${slot}`;
  const hits = (memory.get(key) ?? 0) + 1;
  memory.set(key, hits);
  sweepMemory();
  return hits <= rule.limit;
}

// --- Capa 2: Postgres -------------------------------------------------

async function dbAllows(rule: Rule): Promise<boolean> {
  try {
    const supabase = createApiClient();
    const { data, error } = await Promise.race([
      supabase.rpc("rate_limit_hit", {
        p_bucket: rule.bucket,
        p_subject: rule.subject,
        p_window_seconds: rule.windowSeconds,
        p_max: rule.limit,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), DB_TIMEOUT_MS)
      ),
    ]);
    if (error) return true; // falla abierto, ver comentario de arriba
    return data !== false;
  } catch {
    return true;
  }
}

/**
 * Cuenta un golpe contra cada regla y dice si la petición pasa.
 * Basta que una regla se pase de límite para negar.
 *
 * La capa de memoria corre primero y corta en seco: si ya se pasó, no
 * pagamos ningún viaje a la DB. Las reglas que sí llegan a Postgres van
 * en paralelo — son independientes, y en serie costaban ~250 ms cada una
 * (0.8 s por mensaje del niño, medido en producción).
 *
 * Consecuencia del paralelo: una petición negada por una regla igual
 * suma un golpe en las otras. Eso hace el tope global algo conservador,
 * nunca laxo, así que se prefiere a pagar la latencia.
 */
export async function underLimit(rules: Rule[]): Promise<boolean> {
  const now = Date.now();
  for (const rule of rules) {
    if (!memoryAllows(rule, now)) return false;
  }
  const results = await Promise.all(rules.map(dbAllows));
  return results.every(Boolean);
}

// --- Respuestas -------------------------------------------------------

export function forbiddenOrigin() {
  return NextResponse.json({ error: "FORBIDDEN_ORIGIN" }, { status: 403 });
}

/**
 * 429 con `Retry-After`. `extra` deja añadir campos que el cliente ya
 * sabe leer — el demo pinta `reply`, así que el niño ve una frase en
 * personaje en vez de un error crudo.
 */
export function tooManyRequests(
  retryAfterSeconds: number,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json(
    { error: "RATE_LIMITED", ...extra },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
