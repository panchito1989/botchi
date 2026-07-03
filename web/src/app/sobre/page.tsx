import Link from "next/link";
import type { Metadata } from "next";
import { Logo, Icon, LinkButton } from "@/components/ui";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Sobre Botchi y Christian Fiesco",
  description:
    "Quién está detrás de Botchi: Christian Fiesco, un padre en México construyendo un mentor con IA para acercar a los niños al estudio mediante la curiosidad.",
  alternates: { canonical: "/sobre" },
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Christian Fiesco",
  jobTitle: "Fundador y creador de Botchi",
  worksFor: { "@type": "Organization", name: "Botchi" },
  knowsAbout: [
    "Educación con inteligencia artificial",
    "Método socrático (mayéutica)",
    "Aprendizaje infantil",
    "Hardware educativo",
  ],
  nationality: "Mexicana",
  description:
    "Padre y creador de Botchi, un dispositivo mentor con IA que enseña a niños y jóvenes con el método socrático.",
};

export default function Sobre() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <SiteNav />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Sobre Botchi
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Botchi no lo hace una gran corporación. Lo construye{" "}
          <strong className="text-ink">Christian Fiesco</strong>, un padre en
          México, con una idea simple: que cualquier niño pueda tener a su lado
          un mentor que lo haga pensar —no que le dé la respuesta— sin importar
          cuánto tiempo o recursos tengan sus papás.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">Por qué existe</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Muchos padres trabajan todo el día y no tienen las horas —ni siempre
          las herramientas— para sentarse a enseñar idiomas, lógica o
          programación en casa. Y aun así sueñan con que sus hijos accedan a una
          formación al nivel de los países de más alto rendimiento o de las
          mejores universidades del mundo. Botchi nace para poner ese mentor en
          sus manos: paciente, disponible siempre y diseñado para guiar al niño
          paso a paso, sin que sienta que está estudiando.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          Construido y probado con niños reales
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Botchi se desarrolla de forma honesta y abierta: cada parte —el
          dispositivo, la IA mayéutica, la plataforma para padres— se prueba con
          niños reales antes de darla por buena. No prometemos magia: prometemos
          un sistema que mejora con la evidencia y se actualiza solo, por
          Wi-Fi, a medida que aprende a enseñar mejor.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">En qué creemos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>
            <strong className="text-ink">Enseñar a pensar, no a memorizar.</strong>{" "}
            La IA nunca da la respuesta de enciclopedia; guía con analogías y
            preguntas hasta que el niño la descubre.
          </li>
          <li>
            <strong className="text-ink">La curiosidad como motor.</strong>{" "}
            Partimos de lo que le apasiona a cada niño para llevarlo a idiomas,
            lógica, matemáticas y ciencia.
          </li>
          <li>
            <strong className="text-ink">Sin pantallas adictivas.</strong> Sin
            redes sociales, sin publicidad, sin rastreo de terceros. Los padres
            tienen el control.
          </li>
          <li>
            <strong className="text-ink">Honestidad.</strong> Decimos lo que
            funciona y lo que todavía no. Esto es un proyecto en construcción,
            no una promesa vacía.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-ink">Contacto directo</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Puedes escribirle directamente a Christian por WhatsApp al{" "}
          <a
            href="https://wa.me/525610669353"
            target="_blank"
            rel="noopener"
            className="text-brand hover:underline"
          >
            +52 56 1066 9353
          </a>{" "}
          para dudas, ideas o para apoyar el proyecto.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href="/prueba" variant="cta">
            Prueba a Botchi
          </LinkButton>
          <LinkButton href="/apoyar" variant="secondary">
            <Icon name="heart" className="h-4 w-4" />
            Apoyar el proyecto
          </LinkButton>
        </div>
      </main>
    </div>
  );
}
