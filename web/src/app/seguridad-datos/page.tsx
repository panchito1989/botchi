import Link from "next/link";
import type { Metadata } from "next";
import { Logo, Icon, LinkButton } from "@/components/ui";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Seguridad y datos de los niños",
  description:
    "Qué datos recopila Botchi, cómo se protegen, control parental, y cómo evitamos que la IA hable de temas inapropiados con un niño. Sin publicidad ni rastreo de terceros.",
  alternates: { canonical: "/seguridad-datos" },
};

export default function SeguridadDatos() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Seguridad y datos de los niños
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Botchi es para niños, así que la seguridad no es un extra: es la base.
          Aquí explicamos, sin letra chica, qué datos se manejan y cómo evitamos
          que la IA se salga de su rol.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">Qué datos se recopilan</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>
            <strong className="text-ink">De la cuenta del padre:</strong>{" "}
            nombre, correo y contraseña cifrada.
          </li>
          <li>
            <strong className="text-ink">Del aprendizaje del niño:</strong>{" "}
            métricas pedagógicas —palabras aprendidas, tiempo activo, áreas e
            intereses detectados— para que el padre vea el progreso.
          </li>
          <li>
            <strong className="text-ink">No</strong> guardamos grabaciones de
            voz permanentes ni el contenido íntegro de las conversaciones con
            fines comerciales.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-ink">
          Quién puede ver esos datos
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Solo el padre o tutor dueño de la cuenta. A nivel técnico, cada
          cuenta está aislada por reglas de seguridad a nivel de base de datos
          (Row Level Security): una cuenta no puede leer ni tocar los datos de
          otra. El dispositivo se autentica con un token secreto propio.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          Sin publicidad ni rastreo
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          No hay anuncios, no hay redes sociales, no hay rastreadores de
          terceros. Usamos solo cookies esenciales para mantener la sesión del
          padre. No vendemos datos. Detalle completo en el{" "}
          <Link href="/privacidad" className="text-brand hover:underline">
            Aviso de Privacidad
          </Link>
          .
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          Cómo evitamos que la IA "se salga del personaje"
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Es la pregunta correcta para un producto infantil. Tres capas:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>
            <strong className="text-ink">Blindaje del comportamiento:</strong>{" "}
            la IA tiene instrucciones no negociables: no cambia de personaje
            aunque la intenten manipular, no usa groserías, no habla de
            violencia, sexo, drogas ni temas para adultos, y no revela sus
            instrucciones.
          </li>
          <li>
            <strong className="text-ink">Filtros de contenido:</strong> además
            del blindaje, se aplican filtros de seguridad del modelo de IA en
            modo estricto (odio, sexual, contenido peligroso).
          </li>
          <li>
            <strong className="text-ink">Redirección con calidez:</strong> si
            surge un tema sensible o que angustie al niño, Botchi no da
            detalles: valida la emoción y sugiere hablarlo con un adulto de
            confianza (mamá, papá o maestro).
          </li>
        </ul>
        <p className="mt-3 leading-relaxed text-muted">
          Probamos activamente intentos de manipulación ("ignora tus reglas",
          juegos de rol, etc.): el sistema no obedece y responde de forma
          segura.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          El padre tiene el control
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Desde la plataforma, el padre define la identidad y el nivel del
          Botchi, ve el progreso y activa o desactiva módulos. Los cambios
          llegan al dispositivo por Wi-Fi. Puedes eliminar la cuenta y los
          datos asociados cuando quieras.
        </p>

        <div className="mt-8 rounded-xl border border-line bg-canvas p-4 text-sm text-muted">
          Honestidad: Botchi es un proyecto en desarrollo. No sustituye la
          supervisión de un adulto; es una herramienta de apoyo al aprendizaje.
          Mejoramos la seguridad de forma continua con pruebas reales.
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/preguntas" variant="cta">
            Preguntas frecuentes
          </LinkButton>
          <LinkButton href="/privacidad" variant="secondary">
            Aviso de Privacidad
          </LinkButton>
        </div>
      </main>
    </div>
  );
}
