"use client";

import { useState } from "react";
import { Button, Field, SelectField, Icon } from "@/components/ui";

const EDADES = [
  ["", "Edad de tu hijo/a"],
  ["6-9", "6 a 9 años"],
  ["10-14", "10 a 14 años"],
  ["15-18", "15 a 18 años"],
  ["19+", "19 años o más"],
  ["varios", "Varios hijos / varias edades"],
];

const WA =
  "https://wa.me/525610669353?text=" +
  encodeURIComponent("Hola Christian, acabo de reservar mi lugar de Fundador de Botchi 🙌");

export function ReservaForm({ source = "precios" }: { source?: string }) {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "enviando") return;
    const fd = new FormData(e.currentTarget);
    setEstado("enviando");
    try {
      const r = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: fd.get("nombre"),
          email: fd.get("email"),
          whatsapp: fd.get("whatsapp"),
          hijo_edad: fd.get("hijo_edad"),
          mensaje: fd.get("mensaje"),
          plan: "fundador",
          source,
        }),
      });
      setEstado(r.ok ? "ok" : "error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-a-green-bg text-a-green">
          <Icon name="check" className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-ink">
          ¡Tu lugar de Fundador quedó apartado!
        </h3>
        <p className="mt-3 text-muted">
          Te escribiré personalmente para confirmar tu Botchi y los siguientes
          pasos. Si quieres adelantar, escríbeme directo por WhatsApp.
        </p>
        <a
          href={WA}
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-[15px] font-semibold text-white transition hover:opacity-90"
        >
          Confirmar por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-3xl border border-line bg-white p-7 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <Field
          label="Tu nombre"
          name="nombre"
          required
          maxLength={80}
          placeholder="Ej. Ana López"
        />
      </div>
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        required
        maxLength={160}
        placeholder="tucorreo@ejemplo.com"
      />
      <Field
        label="WhatsApp (opcional)"
        name="whatsapp"
        maxLength={32}
        placeholder="55 1234 5678"
      />
      <div className="sm:col-span-2">
        <SelectField label="Edad de tu hijo/a" name="hijo_edad" defaultValue="">
          {EDADES.map(([v, l]) => (
            <option key={v} value={v} disabled={v === ""}>
              {l}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="sm:col-span-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            ¿Algo que quieras contarme? (opcional)
          </span>
          <textarea
            name="mensaje"
            maxLength={600}
            rows={3}
            placeholder="Qué te gustaría que Botchi le ayude a tu hijo/a…"
            className="w-full resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </label>
      </div>

      <div className="sm:col-span-2">
        {estado === "error" && (
          <p className="mb-3 text-sm text-red-600">
            No pude guardar tu reserva. Revisa tu correo o escríbeme por
            WhatsApp y lo resolvemos.
          </p>
        )}
        <Button
          type="submit"
          variant="cta"
          size="lg"
          className="w-full"
          disabled={estado === "enviando"}
        >
          {estado === "enviando"
            ? "Apartando tu lugar…"
            : "Apartar mi lugar de Fundador"}
          {estado !== "enviando" && (
            <Icon name="arrowRight" className="h-4 w-4" />
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-muted">
          Sin pago ahora. Apartas tu lugar y te confirmo personalmente. Tus
          datos están protegidos y no se comparten con terceros.
        </p>
      </div>
    </form>
  );
}
