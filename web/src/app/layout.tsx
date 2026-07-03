import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/cookie-consent";
import { StructuredData } from "@/components/structured-data";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const SITE = "https://botchi-one.vercel.app";
const DESC =
  "Botchi es un mentor educativo con IA para niños y jóvenes: enseña con el método socrático (no da la respuesta, la hace descubrir), con una plataforma para padres. Hecho en México.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Botchi — Aprende sin sentir que estudias",
    template: "%s · Botchi",
  },
  description: DESC,
  applicationName: "Botchi",
  authors: [{ name: "Christian Fiesco" }],
  creator: "Christian Fiesco",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Botchi",
    title: "Botchi — Aprende sin sentir que estudias",
    description: DESC,
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "Botchi — Aprende sin sentir que estudias",
    description: DESC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-ink">
        <StructuredData />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
