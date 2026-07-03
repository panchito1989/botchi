"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo, Icon } from "@/components/ui";
import { SiteNav } from "@/components/site-nav";

const NU_CODE = "5101 2568 0488 9443";
const WA =
  "https://wa.me/525610669353?text=" +
  encodeURIComponent("Hola Christian, quiero apoyar el proyecto Botchi");

export default function Apoyar() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(NU_CODE.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <SiteNav />

      <main className="mx-auto max-w-xl px-5 py-12">
        <div className="rounded-3xl border border-line bg-white p-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-a-coral-bg text-a-coral">
            <Icon name="heart" className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
            Apoya el proyecto Botchi
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            ¡Hola! Soy <strong className="text-ink">Christian Fiesco</strong>.
            Botchi lo construyo con mucho cariño para acercar a los niños a la
            IA y al estudio. Si quieres impulsarlo, puedes hacer un depósito
            voluntario a mi cuenta Nu de débito 🟣.
          </p>

          <div className="mt-6 rounded-2xl border border-line bg-canvas p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Código de depósito · Cuenta Nu Débito
            </p>
            <p className="mt-2 select-all font-mono text-2xl font-bold tracking-wide text-ink">
              {NU_CODE}
            </p>
            <button
              onClick={copy}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
            >
              <Icon name={copied ? "check" : "plus"} className="h-4 w-4" />
              {copied ? "¡Copiado!" : "Copiar código"}
            </button>
          </div>

          <div className="mt-6 text-left">
            <p className="font-semibold text-ink">¿Cómo funciona?</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted">
              <li>
                Ve a una tienda con convenio Nu: Chedraui, Soriana, Finabien o
                tiendas de conveniencia.
              </li>
              <li>Dale al cajero el código y el monto del depósito.</li>
              <li>Recibiré una notificación cuando se complete. ¡Gracias! 💜</li>
            </ol>
          </div>

          <a
            href={WA}
            target="_blank"
            rel="noopener"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Escríbeme por WhatsApp
          </a>
          <p className="mt-3 text-xs text-muted">
            Aportación voluntaria de apoyo al desarrollo. No es una compra ni
            garantiza un producto o servicio.
          </p>
        </div>
      </main>
    </div>
  );
}
