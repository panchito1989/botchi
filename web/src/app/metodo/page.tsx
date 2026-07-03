import Link from "next/link";
import type { Metadata } from "next";
import { Logo, Icon, LinkButton } from "@/components/ui";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "El método de Botchi: mayéutica para niños",
  description:
    "Cómo enseña Botchi: el método socrático (mayéutica). Por qué guiar con preguntas y analogías hace que el niño aprenda más que si le das la respuesta, con ejemplos reales.",
  alternates: { canonical: "/metodo" },
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "El método de Botchi: mayéutica para niños",
  about: "Método socrático aplicado al aprendizaje infantil con IA",
  inLanguage: "es-MX",
  author: { "@type": "Person", name: "Christian Fiesco" },
  publisher: {
    "@type": "Organization",
    name: "Botchi",
    url: "https://botchi-one.vercel.app",
  },
  description:
    "Explicación del método socrático (mayéutica) que usa Botchi para enseñar a niños y jóvenes, con ejemplos de diálogo.",
};

export default function Metodo() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <SiteNav />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          El método de Botchi: mayéutica para niños
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Botchi enseña con el <strong className="text-ink">método
          socrático</strong>, también llamado <strong className="text-ink">
          mayéutica</strong>: en lugar de dar la respuesta, hace preguntas y
          usa analogías para que el niño llegue a la respuesta por sí mismo.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          ¿Qué es la mayéutica?
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Es una técnica que viene de Sócrates: el maestro no transmite datos,
          ayuda a "dar a luz" el conocimiento que el alumno puede deducir. En
          la práctica significa responder a una pregunta con otra pregunta más
          sencilla, apoyada en algo que el niño ya conoce, hasta que él mismo
          descubre la idea.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          ¿Por qué funciona mejor que dar la respuesta?
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Cuando a un niño le das la respuesta, la olvida pronto. Cuando la
          descubre solo, la entiende y la recuerda, porque construyó el
          razonamiento. Además entrena algo más valioso que el dato: la
          capacidad de pensar, equivocarse sin miedo e intentar de nuevo. Eso
          es exactamente lo que necesitará frente a la inteligencia artificial
          y en cualquier carrera.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          Un ejemplo real de diálogo
        </h2>
        <div className="mt-3 space-y-2 rounded-2xl border border-line bg-canvas p-6 text-[15px] leading-relaxed text-ink">
          <p><strong>Niño:</strong> ¿Por qué flotan los barcos si son pesados?</p>
          <p>
            <strong>Botchi:</strong> Imagina un patito de hule en la bañera.
            Aunque lo empujes, no se queda en el fondo. ¿Por qué crees que
            sube?
          </p>
          <p><strong>Niño:</strong> ¿Porque es de plástico?</p>
          <p>
            <strong>Botchi:</strong> ¡Casi! Una canica también es chiquita y se
            hunde. La diferencia es lo que el patito tiene adentro. ¿Qué hay
            dentro del patito que no hay en la canica?
          </p>
          <p><strong>Niño:</strong> ¿Aire?</p>
          <p>
            <strong>Botchi:</strong> ¡Eso es! Y un barco, por más pesado que
            sea, tiene muchísimo espacio con aire por dentro. ¿Qué crees que
            pasaría si ese espacio se llenara de agua?
          </p>
        </div>
        <p className="mt-3 leading-relaxed text-muted">
          Fíjate en tres cosas: Botchi nunca soltó "los barcos flotan por la
          flotabilidad"; reaccionó a cada respuesta del niño; y lo llevó al
          éxito sin frustrarlo. Ese es el método, en cada conversación.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          Se adapta a la edad
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          El mismo método cambia de tono y profundidad por nivel: Semilla
          (6–9) con juego y analogías simples; Constructor (10–14) retando a
          experimentar; Arquitecto (15–18) exigiendo razonar a fondo; y
          Executive (19+) aplicado a la vida profesional. Siempre guiando, nunca
          dictando.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          ¿En qué se diferencia de ChatGPT?
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          ChatGPT y la mayoría de las apps están diseñadas para darte la
          respuesta lo más rápido posible. Botchi hace lo contrario a propósito:
          su trabajo es que el niño piense, no ahorrarle el pensamiento. Por eso
          es una herramienta de aprendizaje, no un atajo para la tarea.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href="/prueba" variant="cta">
            Pruébalo tú mismo
          </LinkButton>
          <LinkButton href="/preguntas" variant="secondary">
            Preguntas frecuentes
          </LinkButton>
        </div>
      </main>
    </div>
  );
}
