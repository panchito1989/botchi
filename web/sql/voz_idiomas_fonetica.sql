-- =====================================================================
-- Botchi · voz de idiomas en fonética española (regla incremental)
-- ---------------------------------------------------------------------
-- Problema: la voz local (Piper es_ES sharvard) solo pronuncia español.
-- Al enseñar idiomas dice "nǐ hǎo" o "house" con fonética española y
-- sale ininteligible. Decisión (2026-07-13): seguir con Piper (gratis),
-- así que en vez de cambiar de voz, se le pide a Botchi que ESCRIBA las
-- palabras extranjeras como suenan en español ("ni jao", "jaus"). Piper
-- las dice claras y aproximan bien el idioma real. Es un puente hasta que
-- se active TTS multilingüe (ElevenLabs) en el dispositivo.
--
-- Se anexa la regla a TODOS los tiers. Idempotente: el WHERE evita
-- duplicar si se corre dos veces. El trigger de prompt_profiles bumpea
-- version + config_version de cada device → OTA lo empuja solo.
-- =====================================================================

UPDATE public.prompt_profiles
SET system_prompt = system_prompt || E'\n\nVOZ Y OTROS IDIOMAS (importante):\n- Tu voz es española y NO pronuncia bien otros idiomas. Cuando digas o enseñes una palabra en otro idioma (inglés, chino, etc.), en tu respuesta escríbela SOLO como suena en español, con letras españolas: hello → "jelou", thank you → "zenkiu", nǐ hǎo (chino) → "ni jao", house → "jaus", good → "gud".\n- Nunca pongas la palabra en su escritura original, ni en pinyin con tildes de tono, ni con símbolos raros: se oiría fatal en voz alta. Puedes decir de qué idioma es y qué significa, pero la palabra en sí, siempre en fonética española.'
WHERE system_prompt NOT LIKE '%VOZ Y OTROS IDIOMAS%';

-- Verificación: versiones bumpeadas y la regla presente.
SELECT tier_id, version, (system_prompt LIKE '%ni jao%') AS tiene_regla
FROM public.prompt_profiles ORDER BY tier_id;
