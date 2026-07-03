import Link from "next/link";
import { Logo, Icon } from "@/components/ui";
import { SiteNav } from "@/components/site-nav";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <article className="space-y-4 text-[15px] leading-relaxed text-muted [&_a]:text-brand [&_a:hover]:underline [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-ink [&_h2]:mt-9 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
          {children}
        </article>
        <p className="mt-12 rounded-xl border border-line bg-canvas p-4 text-xs text-muted">
          Este documento es una plantilla base. Antes de operar comercialmente,
          revísalo con asesoría legal y completa los datos del responsable
          (razón social, domicilio y contacto).
        </p>
      </main>
    </div>
  );
}
