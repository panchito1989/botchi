import Link from "next/link";
import type { Metadata } from "next";
import { Logo, Icon, LinkButton } from "@/components/ui";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Qué es Botchi, cómo enseña con el método socrático, para qué edades, seguridad y datos de niños, y en qué se diferencia de ChatGPT o una tablet.",
  alternates: { canonical: "/preguntas" },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Qué es Botchi?",
    a: "Botchi es un mentor educativo con inteligencia artificial para niños y jóvenes de 6 a 25+ años: un dispositivo físico tipo mascota, acompañado de una plataforma web para padres. En vez de dar respuestas, enseña a pensar.",
  },
  {
    q: "¿Cómo enseña Botchi?",
    a: "Con el método socrático (mayéutica): nunca da la respuesta directa ni definiciones de enciclopedia. Responde con una analogía cotidiana y una contrapregunta para que el niño deduzca la solución por sí mismo, guiándolo con pistas cada vez más fáciles hasta que lo logra.",
  },
  {
    q: "¿Para qué edades es?",
    a: "Para 6 años en adelante. Se adapta por niveles: Semilla (6–9), Constructor (10–14), Arquitecto (15–18) y Executive (19+). El tono y la dificultad cambian según la edad, siempre guiando al éxito.",
  },
  {
    q: "¿En qué se diferencia de ChatGPT o una tablet?",
    a: "ChatGPT y las apps dan la respuesta hecha; Botchi hace lo contrario: te lleva a descubrirla. No tiene pantallas adictivas, redes sociales ni publicidad. Es un dispositivo dedicado al aprendizaje por voz, con control de los padres.",
  },
  {
    q: "¿Es seguro para niños?",
    a: "Sí. El contenido es siempre apropiado para la edad, ante temas sensibles sugiere hablar con un adulto de confianza, y la IA está configurada para no salirse de su rol educativo. Sin publicidad ni rastreo de terceros.",
  },
  {
    q: "¿Qué datos recopila?",
    a: "Solo lo necesario para el aprendizaje: progreso, intereses y configuración que el padre define. Los padres controlan y pueden ver todo desde la plataforma. Consulta el Aviso de Privacidad para el detalle.",
  },
  {
    q: "¿Necesita internet?",
    a: "Sí. El dispositivo usa Wi-Fi para conversar con la IA en la nube y para recibir actualizaciones automáticas (OTA) que mejoran y amplían lo que sabe enseñar, sin cables.",
  },
  {
    q: "¿Quién está detrás de Botchi?",
    a: "Botchi lo crea Christian Fiesco, en México, con el objetivo de acercar a los niños a la IA y al estudio mediante la curiosidad. Puedes escribirle directo por WhatsApp desde la página de inicio.",
  },
];

export default function Preguntas() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Preguntas frecuentes
        </h1>
        <p className="mt-3 text-muted">
          Todo lo que un padre o madre quiere saber antes de darle un Botchi a
          su hijo.
        </p>

        <div className="mt-8 space-y-6">
          {FAQ.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-line p-6"
            >
              <h2 className="text-lg font-semibold text-ink">{f.q}</h2>
              <p className="mt-2 leading-relaxed text-muted">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href="/prueba" variant="cta">
            Prueba a Botchi
          </LinkButton>
          <LinkButton href="/signup" variant="secondary">
            Crear cuenta
          </LinkButton>
        </div>
      </main>
    </div>
  );
}
