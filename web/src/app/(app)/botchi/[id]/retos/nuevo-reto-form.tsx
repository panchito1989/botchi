"use client";

import { useActionState, useState } from "react";
import { createReto } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Field, SelectField, Icon } from "@/components/ui";

const TIPOS: [string, string][] = [
  ["libre", "Libre / mixto"],
  ["palabras", "Vocabulario / idioma"],
  ["lectura", "Lectura"],
  ["matematicas", "Matemáticas"],
  ["logica", "Lógica / programación"],
  ["ciencia", "Ciencia / curiosidad"],
];

const PLAZOS: [string, string][] = [
  ["7", "1 semana"],
  ["14", "2 semanas"],
  ["30", "1 mes"],
  ["60", "2 meses"],
];

export function NuevoRetoForm({ deviceId }: { deviceId: string }) {
  const [state, action] = useActionState(createReto, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="mb-7">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
        >
          <Icon name="plus" className="h-4 w-4 text-brand" />
          Crear nuevo reto
        </button>
        {state?.info && (
          <p className="mt-3 text-sm text-a-green">{state.info}</p>
        )}
      </div>
    );
  }

  return (
    <form
      action={action}
      className="mb-7 grid gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-2"
    >
      <input type="hidden" name="device_id" value={deviceId} />

      <div className="sm:col-span-2">
        <Field
          label="Título del reto"
          name="titulo"
          required
          maxLength={80}
          placeholder='Ej. "Misión palabras nuevas"'
        />
      </div>

      <div className="sm:col-span-2">
        <Field
          label="Meta concreta"
          name="meta_desc"
          required
          maxLength={400}
          placeholder='Ej. "Aprender 40 palabras nuevas en inglés"'
        />
      </div>

      <SelectField label="Área" name="meta_tipo" defaultValue="libre">
        {TIPOS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>

      <Field
        label="Cantidad a lograr"
        name="meta_target"
        type="number"
        min={1}
        max={100000}
        defaultValue={20}
        required
      />

      <SelectField label="Plazo" name="plazo_dias" defaultValue="14">
        {PLAZOS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>

      <Field
        label="Premio"
        name="premio"
        required
        maxLength={200}
        placeholder='Ej. "Una pizza juntos el viernes"'
      />

      <div className="sm:col-span-2">
        <p className="mb-3 rounded-lg bg-canvas px-3.5 py-2.5 text-xs text-muted">
          Botchi se lo propondrá en su próxima sesión. Si acepta, le ayudará
          con un plan, lo motivará a diario y celebrará micro-avances. Si no
          lo logra, jamás lo regaña — el método y la seguridad mandan sobre
          esto.
        </p>
        {state?.error && (
          <p className="mb-3 text-sm text-red-600">{state.error}</p>
        )}
        <div className="flex items-center gap-2">
          <SubmitButton>Crear reto</SubmitButton>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-muted hover:bg-canvas hover:text-ink"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}
