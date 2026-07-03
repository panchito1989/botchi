import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar al panel de padres",
  description:
    "Inicia sesión en el panel de padres de Botchi para personalizar el dispositivo y ver el progreso de tus hijos.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
