import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apoyar el proyecto Botchi",
  description:
    "Botchi lo construye Christian Fiesco para acercar a los niños a la IA y al estudio. Apoya el desarrollo con un depósito voluntario.",
  alternates: { canonical: "/apoyar" },
};

export default function ApoyarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
