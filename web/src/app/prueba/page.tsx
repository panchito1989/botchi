"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo, Icon, cn } from "@/components/ui";
import { SiteNav } from "@/components/site-nav";
import { BotchiMascot } from "@/components/botchi-mascot";

type Turn = { role: "user" | "model"; text: string };
type Status = "idle" | "listening" | "thinking" | "speaking";

const LEVELS = [
  { id: "semilla", label: "Semilla · 6-9" },
  { id: "constructor", label: "Constructor · 10-14" },
  { id: "arquitecto", label: "Arquitecto · 15-18" },
];

const GREETING =
  "¡Hola! Soy Botchi. Presiona el botón y pregúntame lo que quieras: no te doy la respuesta, te ayudo a descubrirla.";

export default function Prueba() {
  const [status, setStatus] = useState<Status>("idle");
  const [supported, setSupported] = useState(true);
  const [level, setLevel] = useState("semilla");
  const [turns, setTurns] = useState<Turn[]>([
    { role: "model", text: GREETING },
  ]);
  const [input, setInput] = useState("");

  const recRef = useRef<any>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  // Refs to avoid stale closures (speech recognition binds once on mount).
  const levelRef = useRef(level);
  levelRef.current = level;
  const askRef = useRef<(t: string) => void>(() => {});
  const historyRef = useRef<Turn[]>([]); // model memory (sync, accurate)
  // Web Audio: unlocked on the user's tap so TTS plays (no robotic fallback).
  const audioCtxRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<AudioBufferSourceNode | null>(null);
  const statusRef = useRef<Status>("idle");
  statusRef.current = status;

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const load = () => {
      voicesRef.current = synth.getVoices();
    };
    load();
    synth.onvoiceschanged = load;
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = "es-MX";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) askRef.current(text);
    };
    rec.onerror = () => setStatus("idle");
    rec.onend = () =>
      setStatus((s) => (s === "listening" ? "idle" : s));
    recRef.current = rec;
  }, []);

  function pickVoice(): SpeechSynthesisVoice | undefined {
    const es = voicesRef.current.filter((v) =>
      v.lang?.toLowerCase().startsWith("es")
    );
    if (es.length === 0) return undefined;
    return (
      es.find((v) => /female|mujer/i.test(v.name)) ||
      es.find((v) => /google/i.test(v.name)) ||
      es[0]
    );
  }

  function scrollDown() {
    requestAnimationFrame(() =>
      logRef.current?.scrollTo({
        top: logRef.current.scrollHeight,
        behavior: "smooth",
      })
    );
  }

  function unlockAudio() {
    try {
      const Ctx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      if (audioCtxRef.current.state === "suspended") {
        void audioCtxRef.current.resume();
      }
    } catch {
      /* ignore */
    }
  }

  function stopSpeaking() {
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    try {
      srcRef.current?.stop();
    } catch {}
    srcRef.current = null;
  }

  // Primary: play Gemini neural voice through the unlocked AudioContext.
  async function speak(text: string) {
    setStatus("speaking");
    const ctx = audioCtxRef.current;
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!r.ok || !ctx) throw new Error("tts");
      const buf = await ctx.decodeAudioData(await r.arrayBuffer());
      stopSpeaking();
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.onended = () => {
        if (srcRef.current === src) srcRef.current = null;
        setStatus("idle");
      };
      srcRef.current = src;
      src.start();
    } catch {
      fallbackSpeak(text); // only if the neural voice truly failed
    }
  }

  function fallbackSpeak(text: string) {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-MX";
      u.pitch = 1.5;
      u.rate = 1.04;
      const v = pickVoice();
      if (v) {
        u.voice = v;
        u.lang = v.lang;
      }
      u.onend = () => setStatus("idle");
      u.onerror = () => setStatus("idle");
      setStatus("speaking");
      synth.speak(u);
    } catch {
      setStatus("idle");
    }
  }

  async function ask(text: string) {
    const msg = text.trim();
    if (!msg || statusRef.current === "thinking") return;
    setStatus("thinking");
    setTurns((t) => [...t, { role: "user", text: msg }]);
    setInput("");
    scrollDown();
    try {
      const history = historyRef.current.slice(-10);
      const r = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, level: levelRef.current }),
      });
      const data = await r.json();
      const reply = data.reply ?? "Mmm, ¿me lo repites?";
      historyRef.current.push(
        { role: "user", text: msg },
        { role: "model", text: reply }
      );
      if (historyRef.current.length > 12)
        historyRef.current = historyRef.current.slice(-12);
      setTurns((t) => [...t, { role: "model", text: reply }]);
      scrollDown();
      speak(reply);
    } catch {
      setTurns((t) => [
        ...t,
        { role: "model", text: "Ups, me quedé sin señal. ¿Probamos otra vez?" },
      ]);
      setStatus("idle");
    }
  }
  askRef.current = ask;

  function tapButton() {
    unlockAudio(); // must run inside the user gesture
    if (status === "speaking") {
      stopSpeaking();
      setStatus("idle");
      return;
    }
    if (status === "listening") {
      recRef.current?.stop();
      setStatus("idle");
      return;
    }
    if (status === "thinking") return;
    if (!recRef.current) return;
    try {
      stopSpeaking();
      recRef.current.start();
      setStatus("listening");
    } catch {
      setStatus("idle");
    }
  }

  const ring =
    status === "listening"
      ? "ring-8 ring-a-teal/40 animate-pulse"
      : status === "thinking"
        ? "ring-8 ring-a-amber/40 animate-pulse"
        : status === "speaking"
          ? "ring-8 ring-a-violet/40 animate-pulse"
          : "ring-2 ring-line";

  const hint =
    status === "listening"
      ? "Te escucho… habla ahora"
      : status === "thinking"
        ? "Pensando…"
        : status === "speaking"
          ? "Botchi está hablando (toca para parar)"
          : "Toca a Botchi y pregúntale algo";

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteNav />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-6">
        <h1 className="text-xl font-bold text-ink">Prueba a Botchi</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Háblale como lo haría tu hijo. Botchi escucha y responde con voz.
        </p>

        <div className="mt-5 flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                level === l.id
                  ? "border-brand bg-a-teal-bg text-a-teal"
                  : "border-line bg-white text-muted hover:text-ink"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          onClick={tapButton}
          className={cn(
            "mt-7 flex h-44 w-44 items-center justify-center rounded-full bg-white transition",
            ring
          )}
          aria-label="Hablar con Botchi"
        >
          <BotchiMascot
            size={110}
            mode={
              status === "speaking"
                ? "speaking"
                : status === "thinking"
                  ? "thinking"
                  : "idle"
            }
          />
        </button>
        <p className="mt-4 h-5 text-sm font-medium text-ink">{hint}</p>

        {!supported && (
          <p className="mt-2 max-w-sm text-center text-xs text-a-coral">
            Tu navegador no permite voz. Usa <strong>Chrome</strong> (PC o
            Android) para hablarle, o escríbele abajo.
          </p>
        )}

        <div
          ref={logRef}
          className="mt-6 w-full flex-1 space-y-3 overflow-y-auto rounded-2xl border border-line bg-white p-4"
          style={{ minHeight: "26vh", maxHeight: "38vh" }}
        >
          {turns.map((t, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                t.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                  t.role === "user"
                    ? "bg-brand text-white"
                    : "bg-canvas text-ink"
                )}
              >
                {t.text}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="mt-3 flex w-full gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="…o escríbele aquí"
            maxLength={500}
            className="flex-1 rounded-full border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          <button
            type="submit"
            disabled={status === "thinking" || !input.trim()}
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 font-medium text-white transition hover:bg-brand-strong disabled:opacity-50"
          >
            <Icon name="arrowRight" className="h-5 w-5" />
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-muted">
          Si el micrófono te entiende mal, escríbele — el dispositivo físico
          oye mucho mejor que el navegador.
        </p>

        <p className="mt-2 text-center text-xs text-muted">
          Demostración. Así conversa el dispositivo físico —{" "}
          <Link href="/signup" className="text-brand hover:underline">
            crea tu cuenta
          </Link>{" "}
          para acompañar el progreso real.
        </p>

        <section className="mt-12 w-full border-t border-line pt-8 text-left">
          <h2 className="text-lg font-bold text-ink">
            Cómo funciona este demo
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Botchi usa el <strong>método socrático (mayéutica)</strong>: no te
            da la respuesta ni una definición de enciclopedia. Responde con una
            analogía cercana y una contrapregunta, y te guía con pistas cada
            vez más fáciles hasta que tú mismo llegas a la respuesta. Mantiene
            el hilo de la conversación, así que puedes responderle y seguir
            profundizando.
          </p>
          <h3 className="mt-5 font-semibold text-ink">
            Ejemplo de una conversación real
          </h3>
          <div className="mt-2 space-y-1 text-[15px] leading-relaxed text-muted">
            <p><strong>Niño:</strong> ¿por qué flotan los barcos?</p>
            <p>
              <strong>Botchi:</strong> Imagina un patito de hule en la
              bañera. ¿Por qué no se va al fondo?
            </p>
            <p><strong>Niño:</strong> ¿porque es ligero?</p>
            <p>
              <strong>Botchi:</strong> ¡Casi! Y un barco es pesadísimo… pero
              tiene mucho espacio hueco por dentro. ¿Qué crees que hace ese
              hueco con aire?
            </p>
          </div>
          <h3 className="mt-5 font-semibold text-ink">Qué observar</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Fíjate cómo nunca suelta la respuesta, reacciona a lo que el niño
            acaba de decir y lo lleva al éxito sin frustrarlo. El dispositivo
            físico hace esto por voz, se adapta a la edad de tu hijo y los
            padres ajustan todo desde la plataforma.
          </p>
        </section>
      </main>
    </div>
  );
}
