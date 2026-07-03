import Link from "next/link";
import type { Metadata } from "next";
import { Logo, Icon, LinkButton, cn } from "@/components/ui";
import { SiteNav } from "@/components/site-nav";
import { ReservaForm } from "./reserva-form";

export const metadata: Metadata = {
  title: "Precios y Edición Fundadores",
  description:
    "Edición Fundadores de Botchi: el dispositivo a precio de costo y la membresía gratis de por vida para las primeras 50 familias. Aparta tu lugar sin pago.",
  alternates: { canonical: "/precios" },
};

const SITE = "https://botchi-one.vercel.app";

const OFFER_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Offer",
  name: "Botchi — Edición Fundadores",
  description:
    "Dispositivo Botchi a precio de costo para las primeras 50 familias, con membresía Fundador gratis de por vida (precio bloqueado).",
  price: "1500",
  priceCurrency: "MXN",
  availability: "https://schema.org/LimitedAvailability",
  url: `${SITE}/precios`,
  areaServed: "MX",
  itemOffered: { "@type": "Product", name: "Botchi", brand: "Botchi" },
  seller: { "@type": "Organization", name: "Botchi" },
};

const INCLUYE = [
  "El dispositivo Botchi (un solo modelo, listo para usar).",
  "Mentor con IA y método socrático, por niveles según la edad.",
  "Panel web para padres: progreso, intereses y personalización.",
  "Actualizaciones OTA: evoluciona por Wi-Fi, sin comprar nada nuevo.",
  "Membresía Fundador GRATIS de por vida — precio bloqueado para siempre.",
  "Línea directa por WhatsApp con el creador.",
];

const FUTURO = [
  ["Familiar", "$149 / mes", "Todos los módulos base, panel y OTA."],
  ["Élite", "$299 / mes", "Métodos VIP Asiático y estilo Harvard."],
];

const PASOS = [
  ["Apartas tu lugar", "Sin pago. Dejas tus datos y reservas uno de los 50 cupos."],
  ["Te confirmo personalmente", "Te escribo por WhatsApp para coordinar tu Botchi."],
  ["Recibes y evoluciona", "Lo usas, das feedback y conservas tu trato de Fundador para siempre."],
];

const FAQ: [string, string][] = [
  [
    "¿Tengo que pagar ahora?",
    "No. Hoy solo apartas tu lugar de Fundador. Te confirmo personalmente por WhatsApp el dispositivo y el siguiente paso. Validamos primero que sea para ti.",
  ],
  [
    "¿Por qué el dispositivo no es gratis?",
    "Honestidad: Botchi lo construye una sola persona, sin inversionistas. Cobrar el costo del hardware permite que el proyecto exista y que quien lo recibe realmente lo use. La membresía —que es el corazón del producto— sí es gratis de por vida para Fundadores.",
  ],
  [
    "¿La membresía me va a subir de precio después?",
    "A ti no. Los Fundadores tienen precio bloqueado de por vida. Cuando se active el cobro, será solo para clientes nuevos.",
  ],
  [
    "¿Qué gano por ser Fundador?",
    "Dispositivo a precio de costo, membresía gratis para siempre, atención directa conmigo y voz en cómo evoluciona Botchi. A cambio te pido feedback honesto.",
  ],
  [
    "¿Cuándo lo recibo?",
    "Estamos en beta con familias reales. Al apartar tu lugar te doy el tiempo estimado real por WhatsApp, sin promesas que no pueda cumplir.",
  ],
];

export default function Precios() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(OFFER_JSONLD) }}
      />

      {/* NAV */}
      <SiteNav />

      <main className="mx-auto max-w-5xl px-5 py-14">
        {/* HERO */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-a-amber-bg px-3 py-1 text-xs font-semibold text-a-amber">
            <Icon name="spark" className="h-3.5 w-3.5" />
            Edición Fundadores · solo 50 familias
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Sé de los primeros en
            <br />
            tener un <span className="text-brand">Botchi.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Botchi está en beta con familias reales. Abrimos{" "}
            <strong className="text-ink">50 lugares de Fundador</strong>: el
            dispositivo a precio de costo y la membresía{" "}
            <strong className="text-ink">gratis de por vida</strong>.
          </p>
        </div>

        {/* OFFER CARD */}
        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border-2 border-brand/30">
          <div className="bg-gradient-to-br from-a-teal-bg to-a-green-bg px-7 py-8 sm:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-a-teal">
                  Dispositivo Botchi · pago único
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-5xl font-extrabold tracking-tight text-ink">
                    $1,500
                  </span>
                  <span className="pb-1 text-lg text-muted line-through">
                    $2,490
                  </span>
                  <span className="pb-1.5 text-sm font-medium text-muted">
                    MXN
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/70">
                  Precio de costo para Fundadores
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 px-5 py-3 text-center">
                <p className="text-2xl font-extrabold text-a-green">$0</p>
                <p className="text-xs font-medium text-ink/70">
                  Membresía
                  <br />
                  de por vida
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white px-7 py-7 sm:px-10">
            <ul className="grid gap-3 sm:grid-cols-2">
              {INCLUYE.map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-ink">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-a-green-bg text-a-green">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <LinkButton href="#reservar" variant="cta" size="lg">
                Apartar mi lugar
                <Icon name="arrowRight" className="h-4 w-4" />
              </LinkButton>
              <Link
                href="/prueba"
                className="rounded-full border border-line px-6 py-3 text-[15px] font-medium text-ink hover:bg-canvas"
              >
                Primero quiero probarlo
              </Link>
            </div>
          </div>
        </div>

        {/* CÓMO FUNCIONA LA RESERVA */}
        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {PASOS.map(([t, d], i) => (
            <div key={t} className="rounded-3xl border border-line p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-a-teal-bg text-sm font-bold text-a-teal">
                {i + 1}
              </div>
              <h3 className="mt-4 font-semibold text-ink">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>

        {/* POR QUÉ ASÍ (honestidad) */}
        <div className="mt-16 rounded-3xl border border-line bg-canvas p-8 sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            Por qué esta oferta y no &ldquo;todo gratis&rdquo;
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Botchi lo construye una persona, sin inversionistas. Regalar el
            dispositivo no haría sostenible el proyecto y atraería a quien no lo
            va a usar. Cobrar el <strong className="text-ink">costo</strong> del
            hardware mantiene a Botchi vivo y asegura que llegue a familias que
            de verdad lo quieren. Lo valioso —el mentor con IA, el panel y la
            evolución por actualizaciones— te lo doy{" "}
            <strong className="text-ink">gratis de por vida</strong> por confiar
            primero. Es un trato justo para los dos.
          </p>
        </div>

        {/* PLANES FUTUROS (anclaje de valor) */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Lo que costará después
            </h2>
            <p className="mt-3 text-muted">
              Cuando termine la beta, las nuevas familias pagarán membresía.
              Como Fundador, esto{" "}
              <strong className="text-ink">nunca</strong> te aplica.
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
            {FUTURO.map(([n, p, d]) => (
              <div
                key={n}
                className="rounded-3xl border border-line p-6 opacity-80"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink">{n}</h3>
                  <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-muted">
                    Próximamente
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-ink">{p}</p>
                <p className="mt-2 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RESERVA */}
        <div id="reservar" className="mt-20 scroll-mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-a-teal-bg px-3 py-1 text-xs font-semibold text-a-teal">
              Aparta tu lugar
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
              Reserva tu Botchi de Fundador
            </h2>
            <p className="mt-3 text-muted">
              Sin pago ahora. Apartas uno de los 50 lugares y te confirmo
              personalmente.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            <ReservaForm source="precios" />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-ink">
            Preguntas sobre la compra
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-4">
            {FAQ.map(([q, a]) => (
              <div
                key={q}
                className={cn(
                  "rounded-2xl border border-line bg-white p-6"
                )}
              >
                <h3 className="font-semibold text-ink">{q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="https://wa.me/525610669353?text=Hola%20Christian%2C%20tengo%20una%20duda%20sobre%20la%20Edici%C3%B3n%20Fundadores%20de%20Botchi"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-[15px] font-semibold text-white transition hover:opacity-90"
            >
              ¿Otra duda? Escríbeme por WhatsApp
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} Botchi · Hecho en México · Sin
          publicidad ni rastreo de terceros.
        </div>
      </footer>
    </div>
  );
}
