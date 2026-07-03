import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prueba a Botchi — habla con el mentor IA",
  description:
    "Prueba gratis al mentor IA de Botchi: háblale y te responde con voz, guiándote con el método socrático (analogía + pregunta), sin darte la respuesta.",
  alternates: { canonical: "/prueba" },
  openGraph: {
    title: "Prueba a Botchi — habla con el mentor IA",
    description:
      "Demo de voz interactivo: Botchi enseña con el método socrático, sin dar respuestas de enciclopedia.",
    url: "/prueba",
  },
};

export default function PruebaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
