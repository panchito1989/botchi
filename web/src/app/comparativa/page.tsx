import Link from "next/link";
import type { Metadata } from "next";
import { Logo, Icon, LinkButton } from "@/components/ui";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Botchi vs. tablets, apps y ChatGPT",
  description:
    "Comparativa honesta: en qué se diferencia Botchi de una tablet educativa, de las apps de tareas y de usar ChatGPT directo con un niño.",
  alternates: { canonical: "/comparativa" },
};

const ROWS: [string, string, string, string, string][] = [
  // criterio, Botchi, Tablet, App educativa, ChatGPT directo
  ["Qué hace con la duda", "Te guía a descubrir la respuesta", "Depende de la app", "Suele darte ejercicios", "Te da la respuesta hecha"],
  ["Pantalla / adicción", "Sin pantalla adictiva (voz)", "Alto riesgo", "Riesgo medio", "Riesgo medio-alto"],
  ["Publicidad / rastreo", "Ninguno", "Frecuente", "Frecuente", "Según el servicio"],
  ["Se adapta a la edad", "Sí, por niveles", "Limitado", "Parcial", "No, sin control"],
  ["Control de los padres", "Panel dedicado", "Variable", "Variable", "Casi nulo"],
  ["Pensado para niños", "Sí, de origen", "No siempre", "A veces", "No"],
  ["Enseña a pensar", "Es su objetivo", "Rara vez", "A veces", "Te lo resuelve"],
];

export default function Comparativa() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <main className="mx-auto max-w-4xl px-5 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Botchi vs. tablets, apps y ChatGPT
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Comparativa honesta para padres. Cada herramienta sirve para algo;
          Botchi resuelve un problema concreto: que el niño{" "}
          <strong className="text-ink">aprenda a pensar</strong>, no que le
          resuelvan la tarea.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="py-3 pr-3 font-semibold text-ink">Criterio</th>
                <th className="py-3 px-3 font-semibold text-brand">Botchi</th>
                <th className="py-3 px-3 font-semibold text-ink">Tablet</th>
                <th className="py-3 px-3 font-semibold text-ink">App educativa</th>
                <th className="py-3 px-3 font-semibold text-ink">ChatGPT directo</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r[0]} className="border-b border-line align-top">
                  <td className="py-3 pr-3 font-medium text-ink">{r[0]}</td>
                  <td className="py-3 px-3 text-ink">{r[1]}</td>
                  <td className="py-3 px-3 text-muted">{r[2]}</td>
                  <td className="py-3 px-3 text-muted">{r[3]}</td>
                  <td className="py-3 px-3 text-muted">{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold text-ink">
          ¿Cuándo NO necesitas un Botchi?
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Seamos honestos: si tu hijo ya tiene quien se siente con él a hacerle
          preguntas y guiarlo todos los días, no necesitas un dispositivo.
          Botchi es para cuando ese tiempo o esas herramientas no alcanzan —que
          es la mayoría de los casos— y quieres que igual tenga un mentor
          paciente que lo lleve al razonamiento.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">
          La diferencia de fondo
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Las tablets y la IA general están optimizadas para entretener o para
          darte la respuesta rápido. Botchi está optimizado para lo contrario:
          que el niño se quede pensando un poco más, equivoque, intente y
          descubra. Esa fricción —bien dosificada— es justamente donde ocurre
          el aprendizaje.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href="/prueba" variant="cta">
            Prueba a Botchi
          </LinkButton>
          <LinkButton href="/metodo" variant="secondary">
            Cómo enseña
          </LinkButton>
        </div>
      </main>
    </div>
  );
}
