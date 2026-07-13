"use client";

import { useActionState } from "react";
import { updateIdentity } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Field, SelectField } from "@/components/ui";

type Personalization = {
  child_name?: string;
  favorite_topics?: string;
  focus_areas?: string;
  avoid_topics?: string;
  house_rules?: string;
  tone?: string;
};

type Identity = {
  name: string;
  personality: string;
  mood: string;
  avatar_palette: string;
  voice: string;
  age_level: string;
  language: string;
  personalization?: unknown;
};

const TONES = [
  ["equilibrado", "Equilibrado"],
  ["muy_jugueton", "Muy juguetón"],
  ["tranquilo", "Tranquilo y paciente"],
  ["retador", "Retador (lo empuja más)"],
  ["dulce", "Dulce y consentidor"],
];

type Tier = { id: string; name: string };

const PERSONALITIES = [
  ["curious", "Curioso"],
  ["playful", "Juguetón"],
  ["calm", "Tranquilo"],
  ["energetic", "Energético"],
  ["wise", "Sabio"],
];
const MOODS = [
  ["happy", "Feliz"],
  ["curious", "Curioso"],
  ["excited", "Emocionado"],
  ["calm", "Tranquilo"],
  ["sleepy", "Dormilón"],
];
const PALETTES = [
  ["default", "Clásico"],
  ["mint", "Menta"],
  ["sunset", "Atardecer"],
  ["ocean", "Océano"],
  ["candy", "Dulce"],
];
// Voces Piper reales instaladas en el dispositivo (firmware/botchi.py
// VOCES_PIPER). El cambio llega por OTA y se oye en el siguiente turno.
const VOICES = [
  ["default", "Mexicana — acento mexicano, la original"],
  ["espanola", "Española — más natural y rápida"],
];
const LANGUAGES = [
  ["es", "Español"],
  ["en", "Inglés"],
  ["bilingual", "Bilingüe"],
];

export function IdentityForm({
  deviceId,
  identity,
  tiers,
}: {
  deviceId: string;
  identity: Identity;
  tiers: Tier[];
}) {
  const [state, formAction] = useActionState(updateIdentity, null);
  const p = (identity.personalization ?? {}) as Personalization;

  return (
    <form
      action={formAction}
      className="grid gap-5 rounded-2xl border border-line bg-white p-7 sm:grid-cols-2"
    >
      <input type="hidden" name="device_id" value={deviceId} />

      <div className="sm:col-span-2">
        <Field
          label="Nombre del Botchi"
          name="name"
          defaultValue={identity.name}
          maxLength={24}
        />
      </div>

      <SelectField
        label="Personalidad"
        name="personality"
        defaultValue={identity.personality}
      >
        {PERSONALITIES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Estado de ánimo"
        name="mood"
        defaultValue={identity.mood}
      >
        {MOODS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Paleta de color"
        name="avatar_palette"
        defaultValue={identity.avatar_palette}
      >
        {PALETTES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>
      <SelectField label="Voz" name="voice" defaultValue={identity.voice}>
        {VOICES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Nivel de aprendizaje"
        name="age_level"
        defaultValue={identity.age_level}
      >
        {tiers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Idioma"
        name="language"
        defaultValue={identity.language}
      >
        {LANGUAGES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>

      <div className="sm:col-span-2 mt-2 border-t border-line pt-5">
        <h3 className="font-semibold text-ink">
          Personalización · cómo trata a tu hijo
        </h3>
        <p className="mt-1 text-sm text-muted">
          Esto ajusta el trato. La seguridad y el método de Botchi
          siempre van por encima de lo que escribas aquí.
        </p>
      </div>

      <Field
        label="¿Cómo quieres que llame a tu hijo?"
        name="child_name"
        defaultValue={p.child_name ?? ""}
        maxLength={24}
        placeholder="Ej. Sofi"
      />
      <SelectField label="Tono" name="tone" defaultValue={p.tone ?? "equilibrado"}>
        {TONES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </SelectField>
      <Field
        label="Temas que le encantan (gancho)"
        name="favorite_topics"
        defaultValue={p.favorite_topics ?? ""}
        maxLength={160}
        placeholder="dinosaurios, espacio, fútbol…"
      />
      <Field
        label="Áreas a reforzar"
        name="focus_areas"
        defaultValue={p.focus_areas ?? ""}
        maxLength={160}
        placeholder="inglés, lectura, matemáticas…"
      />
      <div className="sm:col-span-2">
        <Field
          label="Temas a evitar con cariño"
          name="avoid_topics"
          defaultValue={p.avoid_topics ?? ""}
          maxLength={200}
          placeholder="Ej. nada de juegos de azar"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Notas para Botchi (reglas de casa)
          </span>
          <textarea
            name="house_rules"
            defaultValue={p.house_rules ?? ""}
            maxLength={280}
            rows={3}
            placeholder="Ej. Anímalo con el inglés, le cuesta. Recuérdale ser amable."
            className="w-full resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </label>
      </div>

      <div className="sm:col-span-2">
        {state?.error && (
          <p className="mb-3 text-sm text-red-600">{state.error}</p>
        )}
        {state?.info && (
          <p className="mb-3 text-sm text-a-green">{state.info}</p>
        )}
        <SubmitButton>Guardar cambios</SubmitButton>
      </div>
    </form>
  );
}
