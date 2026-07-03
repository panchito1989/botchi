import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta de padre",
  description:
    "Crea tu cuenta para vincular el Botchi de tus hijos, darle identidad y acompañar su progreso de aprendizaje.",
  alternates: { canonical: "/signup" },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
