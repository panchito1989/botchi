"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo, LinkButton, Icon, cn } from "@/components/ui";

type Item = [href: string, label: string, hint: string];

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "El producto",
    items: [
      ["/#porque", "Por qué Botchi", "El problema que resuelve"],
      ["/#como", "Cómo funciona", "Los 4 pilares"],
      ["/#plan", "Plan por edad", "De los 6 a los 25+ años"],
      ["/metodo", "El método socrático", "Cómo enseña a pensar"],
      ["/comparativa", "Botchi vs. alternativas", "Tablet, apps, ChatGPT"],
    ],
  },
  {
    label: "Para padres",
    items: [
      ["/#plataforma", "El panel de padres", "Progreso y personalización"],
      ["/seguridad-datos", "Seguridad y datos", "Privacidad y blindaje de la IA"],
      ["/preguntas", "Preguntas frecuentes", "Las dudas más comunes"],
      ["/sobre", "Sobre el proyecto", "Quién está detrás de Botchi"],
    ],
  },
];

function NavLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  // Plain anchors for in-page sections, Link for real routes.
  if (href.includes("#")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function SiteNav() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobile(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />

        {/* Desktop */}
        <div className="hidden items-center gap-7 text-sm lg:flex">
          {GROUPS.map((g) => (
            <div key={g.label} className="group relative">
              <button
                className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
                aria-haspopup="true"
              >
                {g.label}
                <Icon
                  name="chevronDown"
                  className="h-3.5 w-3.5 transition-transform group-hover:rotate-180"
                />
              </button>
              {/* pt-3 bridges the gap so hover doesn't drop */}
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="w-72 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-lg shadow-ink/5">
                  {g.items.map(([href, label, hint]) => (
                    <NavLink
                      key={href}
                      href={href}
                      className="block rounded-xl px-3.5 py-2.5 transition-colors hover:bg-canvas"
                    >
                      <span className="block text-[14px] font-medium text-ink">
                        {label}
                      </span>
                      <span className="block text-xs text-muted">{hint}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/precios"
            className="font-medium text-ink transition-colors hover:text-brand"
          >
            Precios
          </Link>
          <Link
            href="/prueba"
            className="font-medium text-brand hover:underline"
          >
            Probar a Botchi
          </Link>
        </div>

        {/* Right actions (desktop) */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/login"
            className="px-3 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Entrar
          </Link>
          <LinkButton href="/precios" variant="cta" size="sm">
            Quiero mi Botchi
          </LinkButton>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-canvas lg:hidden"
          onClick={() => setMobile((v) => !v)}
          aria-label={mobile ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobile}
        >
          <Icon name={mobile ? "close" : "menu"} className="h-6 w-6" />
        </button>
      </nav>

      {/* Mobile panel */}
      {mobile && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 top-[65px] z-40 bg-ink/20"
            onClick={() => setMobile(false)}
          />
          <div className="relative z-50 max-h-[calc(100vh-65px)] overflow-y-auto border-t border-line bg-white px-5 py-5">
            {GROUPS.map((g) => (
              <div key={g.label} className="mb-5">
                <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted">
                  {g.label}
                </p>
                {g.items.map(([href, label, hint]) => (
                  <NavLink
                    key={href}
                    href={href}
                    onClick={() => setMobile(false)}
                    className="block rounded-xl px-3 py-2.5 hover:bg-canvas"
                  >
                    <span className="block text-[15px] font-medium text-ink">
                      {label}
                    </span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </NavLink>
                ))}
              </div>
            ))}

            <div className="mb-5">
              <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted">
                Empezar
              </p>
              <Link
                href="/precios"
                onClick={() => setMobile(false)}
                className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-canvas"
              >
                Precios y Edición Fundadores
              </Link>
              <Link
                href="/prueba"
                onClick={() => setMobile(false)}
                className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-brand hover:bg-canvas"
              >
                Probar a Botchi
              </Link>
              <Link
                href="/login"
                onClick={() => setMobile(false)}
                className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-canvas"
              >
                Entrar a mi cuenta
              </Link>
            </div>

            <LinkButton
              href="/precios"
              variant="cta"
              size="lg"
              className={cn("w-full")}
            >
              Quiero mi Botchi
            </LinkButton>
          </div>
        </div>
      )}
    </header>
  );
}
