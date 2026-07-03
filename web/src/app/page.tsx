import Link from "next/link";
import { BotchiDevice } from "@/components/botchi-device";
import { SiteNav } from "@/components/site-nav";
import { Logo, LinkButton, Icon, cn } from "@/components/ui";

export const metadata = {
  title: "Botchi — Aprende sin sentir que estudias",
};

const PILLARS = [
  {
    icon: "adaptive" as const,
    fg: "text-a-teal",
    bg: "bg-a-teal-bg",
    title: "IA Adaptativa",
    text: "Detecta tus intereses y adapta su forma de enseñarte.",
  },
  {
    icon: "game" as const,
    fg: "text-a-violet",
    bg: "bg-a-violet-bg",
    title: "Aprendizaje Invisible",
    text: "Enseña idiomas, lógica y programación sin que lo notes.",
  },
  {
    icon: "growth" as const,
    fg: "text-a-green",
    bg: "bg-a-green-bg",
    title: "Evoluciona Contigo",
    text: "Nuevos módulos y habilidades por actualizaciones OTA.",
  },
  {
    icon: "bulb" as const,
    fg: "text-a-amber",
    bg: "bg-a-amber-bg",
    title: "Basado en la Curiosidad",
    text: "Usa lo que le apasiona como motor para enseñarle todo.",
  },
];

const TONE = {
  "a-teal": { bg: "bg-a-teal-bg", fg: "text-a-teal" },
  "a-violet": { bg: "bg-a-violet-bg", fg: "text-a-violet" },
  "a-green": { bg: "bg-a-green-bg", fg: "text-a-green" },
  "a-amber": { bg: "bg-a-amber-bg", fg: "text-a-amber" },
  "a-coral": { bg: "bg-a-coral-bg", fg: "text-a-coral" },
} as const;
type Tone = keyof typeof TONE;

const SPECS: [
  "display" | "mic" | "shield" | "battery" | "wifi" | "lock",
  Tone,
  string,
  string
][] = [
  ["display", "a-violet", 'Pantalla circular 1.28"', "Expresiones pixel-art emotivas."],
  ["mic", "a-violet", "Audio Premium I2S", "Micrófono + bocina para conversar."],
  ["shield", "a-teal", "Diseño ergonómico", "Suave, resistente y unisex."],
  ["battery", "a-amber", "Batería de larga duración", "Hasta 5 días. Carga USB-C."],
  ["wifi", "a-teal", "Conectividad Wi-Fi", "Actualizaciones OTA y nube."],
  ["lock", "a-coral", "Hecho para durar", "Materiales pensados para niños."],
];

const TIERS = [
  {
    name: "Nivel Semilla",
    age: "6 – 9 años",
    desc: "Juegos por voz, inglés pasivo, lógica y pensamiento computacional.",
    bg: "bg-a-green-bg",
    fg: "text-a-green",
    icon: "bulb" as const,
  },
  {
    name: "Nivel Constructor",
    age: "10 – 14 años",
    desc: "Programación por bloques avanzada y entrenamiento de IA.",
    bg: "bg-a-teal-bg",
    fg: "text-a-teal",
    icon: "code" as const,
  },
  {
    name: "Nivel Arquitecto",
    age: "15 – 18 años",
    desc: "Python, prompt engineering y copiloto de estudio avanzado.",
    bg: "bg-a-violet-bg",
    fg: "text-a-violet",
    icon: "adaptive" as const,
  },
  {
    name: "Botchi Executive",
    age: "19+ años",
    desc: "Productividad, análisis de datos e inglés corporativo.",
    bg: "bg-a-amber-bg",
    fg: "text-a-amber",
    icon: "spark" as const,
  },
];

const ARCH = [
  ["cpu", "Raspberry Pi Zero 2 W"],
  ["mic", "Audio I2S Premium"],
  ["cloud", "IA en la nube (LLMs)"],
  ["battery", "Batería LiPo USB-C"],
  ["refresh", "Actualizaciones OTA"],
] as const;

const TRUST = [
  ["noads", "Sin distracciones", "Sin redes sociales ni publicidad."],
  ["lock", "Seguro y privado", "Datos protegidos y control para padres."],
  ["spark", "Contenido premium", "Módulos exclusivos y actualizados."],
  ["heart", "Hecho en México", "Diseñado para inspirar a la próxima generación."],
] as const;

export default function Landing() {
  return (
    <div className="bg-white">
      {/* NAV */}
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-a-teal-bg/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-a-violet-bg/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Logo size="lg" tagline />
            <h1 className="mt-7 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[56px]">
              Aprende sin sentir
              <br />
              que{" "}
              <span className="text-brand">estudias.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Botchi convierte la curiosidad en conocimiento. Un dispositivo
              inteligente que evoluciona contigo desde la infancia hasta tu vida
              profesional.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/precios" variant="cta" size="lg">
                Ser Fundador
                <Icon name="arrowRight" className="h-4 w-4" />
              </LinkButton>
              <Link
                href="/prueba"
                className="rounded-full border border-line px-6 py-3 text-[15px] font-medium text-ink hover:bg-canvas"
              >
                Probar a Botchi
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted">
              Edición Fundadores · solo 50 lugares · sin pago para apartar
            </p>
          </div>

          <div className="flex justify-center">
            <div className="flex w-full max-w-sm items-center justify-center rounded-[2.5rem] bg-canvas py-10">
              <BotchiDevice color="arena" size={260} />
            </div>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section id="como" className="mx-auto max-w-6xl px-5 pb-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-3xl border border-line p-6"
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  p.bg,
                  p.fg
                )}
              >
                <Icon name={p.icon} className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PORQUÉ */}
      <section id="porque" className="border-y border-line bg-canvas">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-a-teal-bg px-3 py-1 text-xs font-semibold text-a-teal">
              Por qué existe Botchi
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              No es que no quieras enseñarles.
              <br />
              Es que el día no alcanza.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Muchos padres trabajan todo el día y no tienen las horas —ni
              siempre las herramientas— para sentarse a enseñar idiomas, lógica
              o programación en casa. Y aun así sueñan con una formación al
              nivel de los países de más alto rendimiento o de las mejores
              universidades del mundo.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink">
              Botchi pone ese mentor en sus manos: paciente, disponible siempre
              y diseñado para llevar a tu hijo paso a paso, sin presión.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              ["bulb", "Cuando no tienes tiempo", "Acompaña a tu hijo aunque tú estés trabajando."],
              ["spark", "Métodos de alto rendimiento", "Cálculo mental y lógica al estilo de Singapur y Japón."],
              ["adaptive", "Mentalidad de élite", "Razonamiento y liderazgo como en las grandes universidades."],
            ].map(([icon, t, d]) => (
              <div
                key={t}
                className="rounded-3xl border border-line bg-white p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-a-teal-bg text-a-teal">
                  <Icon name={icon as "bulb"} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN EVOLUTIVO */}
      <section id="plan" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Plan evolutivo
          </h2>
          <p className="mt-3 text-lg text-muted">
            Un compañero para cada etapa de tu vida.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={cn("rounded-3xl p-6", t.bg)}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl bg-white",
                  t.fg
                )}
              >
                <Icon name={t.icon} className="h-6 w-6" />
              </div>
              <h3 className={cn("mt-5 text-lg font-bold", t.fg)}>{t.name}</h3>
              <p className="text-sm font-medium text-ink/70">{t.age}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink/80">
                {t.desc}
              </p>
            </div>
          ))}

          <div className="rounded-3xl bg-ink p-6 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
              <Icon name="spark" className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-amber-300">
              Ediciones Premium VIP BLACK
            </h3>
            <p className="text-sm font-medium text-white/60">Premium</p>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Métodos de alto rendimiento Asiático y Estilo Harvard, para
              mentes que quieren lo mejor.
            </p>
          </div>
        </div>
      </section>

      {/* DISEÑO / TAMAÑO */}
      <section className="border-y border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
          <div className="flex justify-center">
            <BotchiDevice color="arena" size={240} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Tamaño perfecto para manos pequeñas
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Un solo modelo, cuidado al detalle. Ligero, ergonómico y unisex,
              pensado para acompañar a tu hijo todo el día.
            </p>
            <div className="mt-7 flex gap-8">
              {[
                ["97 mm", "alto"],
                ["72 mm", "ancho"],
                ["24 mm", "grosor"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-ink">{n}</p>
                  <p className="text-sm text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SPECS */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {SPECS.map(([icon, tone, title, text]) => (
            <div key={title} className="flex gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 flex-none items-center justify-center rounded-full",
                  TONE[tone].bg,
                  TONE[tone].fg
                )}
              >
                <Icon name={icon} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLATAFORMA */}
      <section id="plataforma" className="border-y border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-a-teal-bg px-3 py-1 text-xs font-semibold text-a-teal">
              Para padres
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Conectado a la plataforma
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Monitorea el progreso real desde la web: palabras aprendidas,
              áreas cognitivas e intereses detectados por la IA. Tú das
              identidad a su Botchi y activas módulos: llegan por Wi-Fi al
              instante.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/signup" variant="cta">
                Crear cuenta de padre
              </LinkButton>
              <LinkButton href="/login" variant="secondary">
                Ya tengo cuenta
              </LinkButton>
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["107", "palabras", "a-teal"],
                  ["5.2 h", "tiempo activo", "a-green"],
                  ["6", "áreas cognitivas", "a-violet"],
                  ["87%", "progreso semanal", "a-amber"],
                ] as [string, string, Tone][]
              ).map(([n, l, tone]) => (
                <div
                  key={l}
                  className="rounded-2xl border border-line p-5"
                >
                  <p className={cn("text-2xl font-bold", TONE[tone].fg)}>
                    {n}
                  </p>
                  <p className="mt-1 text-xs text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ARQUITECTURA */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-muted">
          Arquitectura tecnológica
        </h3>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {ARCH.map(([icon, label]) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-ink"
            >
              <Icon name={icon} className="h-4 w-4 text-brand" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="border-t border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(([icon, t, d]) => (
            <div key={t} className="flex gap-4">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-a-teal-bg text-a-teal">
                <Icon name={icon} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-ink">{t}</h3>
                <p className="text-sm text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDICIÓN FUNDADORES */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="overflow-hidden rounded-[2rem] border-2 border-brand/25 bg-gradient-to-br from-a-teal-bg via-white to-a-green-bg p-9 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-a-amber">
                <Icon name="spark" className="h-3.5 w-3.5" />
                Edición Fundadores · solo 50 familias
              </span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Sé de los primeros.
                <br />
                Y nunca pagues membresía.
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted">
                El dispositivo a precio de costo y la membresía{" "}
                <strong className="text-ink">gratis de por vida</strong>. Sin
                pago para apartar tu lugar: te confirmo personalmente.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <LinkButton href="/precios" variant="cta" size="lg">
                  Ser Fundador
                  <Icon name="arrowRight" className="h-4 w-4" />
                </LinkButton>
                <Link
                  href="/prueba"
                  className="rounded-full border border-line bg-white px-6 py-3 text-[15px] font-medium text-ink hover:bg-canvas"
                >
                  Probar a Botchi
                </Link>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-7 text-center shadow-sm">
              <p className="text-sm font-semibold text-a-teal">
                Dispositivo · pago único
              </p>
              <div className="mt-2 flex items-end justify-center gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-ink">
                  $1,500
                </span>
                <span className="pb-1 text-base text-muted line-through">
                  $2,490
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Precio de costo para Fundadores · MXN
              </p>
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-3xl font-extrabold text-a-green">$0</p>
                <p className="mt-1 text-sm font-medium text-ink/70">
                  Membresía, de por vida
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Preguntas frecuentes
        </h2>
        <div className="mt-8 space-y-4">
          {[
            [
              "¿Qué es Botchi?",
              "Un mentor educativo con IA para niños y jóvenes (6–25+): un dispositivo tipo mascota + plataforma para padres. En vez de dar respuestas, enseña a pensar.",
            ],
            [
              "¿Cómo enseña?",
              "Con el método socrático: nunca da la respuesta de enciclopedia. Responde con una analogía y una contrapregunta para que el niño la descubra solo.",
            ],
            [
              "¿En qué se diferencia de ChatGPT o una tablet?",
              "ChatGPT da la respuesta hecha; Botchi te lleva a descubrirla. Sin pantallas adictivas, sin redes, sin publicidad, con control de los padres.",
            ],
            [
              "¿Es seguro para niños?",
              "Sí: contenido apropiado por edad, redirige temas sensibles a un adulto de confianza, sin rastreo de terceros y con control parental.",
            ],
          ].map(([q, a]) => (
            <div
              key={q}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <h3 className="font-semibold text-ink">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/preguntas"
            className="text-sm font-medium text-brand hover:underline"
          >
            Ver todas las preguntas →
          </Link>
        </div>
      </section>

      {/* CONTACTO Y APOYO */}
      <section id="apoyo" className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            ¿Tienes dudas o quieres impulsar el proyecto?
          </h2>
          <p className="mt-3 text-muted">
            Botchi lo construye una persona. Escríbeme directo o apóyalo
            para que siga creciendo.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/525610669353?text=Hola%20Christian%2C%20tengo%20una%20duda%20sobre%20Botchi"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-[15px] font-semibold text-white transition hover:opacity-90"
            >
              Escríbeme por WhatsApp
            </a>
            <LinkButton href="/apoyar" variant="secondary" size="lg">
              <Icon name="heart" className="h-4 w-4" />
              Apoyar el proyecto
            </LinkButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">
              Hecho con cuidado en México. Diseñado para inspirar a la próxima
              generación.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
            <Link href="/precios" className="hover:text-ink">
              Precios · Fundadores
            </Link>
            <Link href="/privacidad" className="hover:text-ink">
              Aviso de Privacidad
            </Link>
            <Link href="/cookies" className="hover:text-ink">
              Cookies
            </Link>
            <Link href="/terminos" className="hover:text-ink">
              Términos
            </Link>
            <Link href="/metodo" className="hover:text-ink">
              El método
            </Link>
            <Link href="/comparativa" className="hover:text-ink">
              Comparativa
            </Link>
            <Link href="/sobre" className="hover:text-ink">
              Sobre Botchi
            </Link>
            <Link href="/seguridad-datos" className="hover:text-ink">
              Seguridad y datos
            </Link>
            <Link href="/preguntas" className="hover:text-ink">
              Preguntas
            </Link>
            <Link href="/login" className="hover:text-ink">
              Panel de padres
            </Link>
            <Link href="/apoyar" className="hover:text-ink">
              Apoyar
            </Link>
            <a
              href="https://wa.me/525610669353"
              target="_blank"
              rel="noopener"
              className="hover:text-ink"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <div className="border-t border-line px-5 py-5 text-center text-xs text-muted">
          © {new Date().getFullYear()} Botchi · Tus datos y los de tus hijos
          están protegidos. Sin publicidad ni rastreo de terceros.
        </div>
      </footer>
    </div>
  );
}
