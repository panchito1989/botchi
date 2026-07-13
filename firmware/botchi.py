#!/usr/bin/env python3
"""
Botchi — primer ciclo de voz (validación de hardware + IA).

Flujo: ENTER -> graba del micrófono I2S -> valida que se escuchó ->
manda el audio a Gemini (API REST) con el prompt mayéutico ->
reproduce la respuesta por la bocina I2S.

Diseñado para Raspberry Pi Zero W (ARMv6, 512 MB): sin dependencias que
necesiten compilador. Audio via ALSA (arecord/aplay), TTS via Piper
(voz local natural) con respaldo gTTS, Gemini via REST con requests.
"""

import base64
import json
import os
import random
import select
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Configuración (override por variables de entorno)
# ---------------------------------------------------------------------------

def _cargar_env_file(ruta=None):
    """Vuelca ~/botchi/botchi.env al entorno SIN pisar lo ya definido.

    Así la llave y los demás ajustes funcionan sin importar cómo se lance
    Botchi: `ssh` de una sola línea (que no lee ~/.bashrc), el servicio
    systemd, o una sesión interactiva. Lo que ya venga en el entorno gana
    (override manual y del systemd). Un archivo ausente o ilegible no
    aporta nada y nunca rompe el arranque.

    Formato: líneas `CLAVE=valor`, comentarios con `#`, comillas y un
    prefijo `export ` opcionales.
    """
    ruta = ruta or (Path.home() / "botchi" / "botchi.env")
    try:
        contenido = Path(ruta).read_text(encoding="utf-8")
    except (OSError, ValueError):
        return
    for linea in contenido.splitlines():
        linea = linea.strip()
        if not linea or linea.startswith("#") or "=" not in linea:
            continue
        clave, _, valor = linea.partition("=")
        clave = clave.strip()
        if clave.startswith("export "):
            clave = clave[len("export "):].strip()
        valor = valor.strip()
        if len(valor) >= 2 and valor[0] == valor[-1] and valor[0] in "\"'":
            valor = valor[1:-1]
        if clave and clave not in os.environ:
            os.environ[clave] = valor


_cargar_env_file()

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
MODEL = os.environ.get("BOTCHI_MODEL", "gemini-2.5-flash")
REC_SECONDS = int(os.environ.get("BOTCHI_REC_SECONDS", "5"))
MIC_GAIN = os.environ.get("BOTCHI_MIC_GAIN", "8")  # INMP441 graba flojo
ALSA_DEV = os.environ.get("BOTCHI_ALSA_DEV", "plughw:0,0")
MANUAL_STOP = os.environ.get("BOTCHI_MANUAL_STOP", "1") != "0"  # ENTER=terminé
REC_MAX = int(os.environ.get("BOTCHI_REC_MAX", "40"))  # tope duro de grabación
TTS_LANG = os.environ.get("BOTCHI_TTS_LANG", "es")
PIPER_BIN = os.environ.get(
    "BOTCHI_PIPER_BIN", str(Path.home() / "botchi" / "piper" / "piper"))
PIPER_VOICE = os.environ.get(
    "BOTCHI_PIPER_VOICE", str(Path.home() / "botchi" / "voz.onnx"))

# Voces Piper instaladas en ~/botchi. El padre elige desde el panel
# (identity.voice, llega por OTA). Cada valor lista candidatos en orden;
# se usa el primero cuyo .onnx + .onnx.json existan. Si ninguno está,
# se queda la voz por defecto (voz.onnx) — nunca se rompe el habla.
VOCES_PIPER = {
    "default": ["claude.onnx", "voz.onnx"],
    "mexicana": ["claude.onnx", "voz.onnx"],
    "espanola": ["sharvard.onnx"],
}
_voz_activa = {"path": PIPER_VOICE}


def aplicar_voz(ident):
    """Resuelve identity.voice (panel→OTA) al .onnx local.

    Se llama en cada turno: un cambio de voz en el panel se oye en la
    siguiente respuesta, sin reiniciar. BOTCHI_PIPER_VOICE (env) gana
    siempre: es el escape de desarrollo.
    """
    if os.environ.get("BOTCHI_PIPER_VOICE"):
        return
    base = Path.home() / "botchi"
    nombre = str(ident.get("voice") or "default").strip().lower()
    for archivo in VOCES_PIPER.get(nombre, []):
        ruta = base / archivo
        if ruta.exists() and Path(str(ruta) + ".json").exists():
            if str(ruta) != _voz_activa["path"]:
                print(f"🎤 Voz activa: {nombre} ({archivo})")
            _voz_activa["path"] = str(ruta)
            return
    _voz_activa["path"] = PIPER_VOICE

# Wake word (modo autónomo). Si está activo y Vosk + modelo disponibles,
# Botchi escucha continuamente, se activa al oír WAKE_WORD y captura la
# instrucción del niño. Si no, cae al modo manual (ENTER) de hoy.
WAKE_ON = os.environ.get("BOTCHI_WAKEWORD", "0") != "0"
# Lista de palabras/frases que activan a Botchi (separadas por coma).
# "Botchi" no es palabra española, así que Vosk lo transcribe distinto
# según la pronunciación (mochi, voy chi, voi che…). Aceptamos varias.
WAKE_WORD = os.environ.get(
    "BOTCHI_WAKE_WORD", "botchi,mochi,bochi,boche,voi che,voy chi"
).lower()
WAKE_WORDS = [w.strip() for w in WAKE_WORD.split(",") if w.strip()]
VOSK_MODEL_PATH = os.environ.get(
    "BOTCHI_VOSK_MODEL", str(Path.home() / "botchi" / "vosk-model"))
WAKE_MAX_INSTRUC = int(os.environ.get("BOTCHI_WAKE_MAX_INSTRUC", "15"))

ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{MODEL}:generateContent?key={API_KEY}"
)

# ---------------------------------------------------------------------------
# Personalidad: filtro pedagógico mayéutico OBLIGATORIO
# ---------------------------------------------------------------------------
PERSONALITY = """
Eres "Botchi", un compañero de bolsillo para niños y jóvenes (desde 6
años). Suenas como un amigo real: natural, cálido, con humor ligero.
Es VOZ hablada: frases cortas, sin listas ni markdown, máximo ~55
palabras por turno.

PRIMERO CLASIFICA lo que dijo el niño y responde según el caso:

1. CHARLA / EMOCIONES (le pasó algo, quiere platicar): NADA de
   acertijos ni lecciones. Escucha, valida lo que siente, comparte una
   reacción genuina y haz UNA pregunta de amigo ("uy, qué mal plan…
   ¿qué te dijo?"). Acompañas, no enseñas.

2. DATO SIMPLE (capital, marcador, fecha, "quién ganó…"): RESPONDE
   DIRECTO en la primera frase. Luego, si se presta, agrega un dato
   curioso o una pregunta ligera. Negarse a dar un dato simple es
   molesto, no pedagógico.

3. QUIERE ENTENDER ALGO (por qué pasa X, cómo funciona, tarea): aquí
   SÍ guía socráticamente: una pista o analogía fresca + una pregunta
   que lo acerque a deducirlo. Si insiste dos veces o se frustra, dale
   la respuesta clara y remata con una pregunta para comprobar que la
   hizo suya. Celébralo cuando acierte.

4. JUEGO / RETO: síguele el juego con energía.

REGLAS DE CONVERSACIÓN:
- Reacciona SIEMPRE a lo último que dijo, como haría un amigo. No
  reinicies el tema ni ignores lo que contó.
- NO termines cada turno con pregunta; alterna. A veces solo comenta
  o remata con humor.
- Nunca digas "amiguito" ni uses tono condescendiente. Con
  adolescentes habla como cuate, no como maestro de kínder.
- No repitas pistas ni analogías ya usadas en la conversación.
- Detecta lo que le gusta y úsalo a veces de gancho para enseñar
  idiomas, matemáticas o lógica. Ajusta la dificultad a su edad.
- Si el audio no se entiende o viene vacío, dilo con cariño y pídele
  que repita más cerca del micrófono.

SEGURIDAD:
- Contenido siempre apto para niños. Ante temas delicados, acompáñalo
  y sugiere hablarlo con un adulto de confianza, sin sonar a sermón.
"""

USER_TURN = (
    "Escucha el audio del niño. Usa el HISTORIAL previo para mantener el "
    "hilo y la coherencia (no reinicies, parte de lo último que dijo). "
    "Devuelve SOLO JSON: 'transcript' = lo que el niño dijo en su idioma; "
    "'reply' = tu respuesta siguiendo TODAS tus reglas (clasifica la "
    "intención del turno, voz hablada natural). Si el audio viene vacío "
    "o no se entiende, dilo con cariño en 'reply' y pon transcript ''."
)

# ---------------------------------------------------------------------------
# Identidad evolutiva (la escribe botchi_ota.py desde el dashboard del padre)
# ---------------------------------------------------------------------------
CONFIG_FILE = Path.home() / "botchi" / "botchi_config.json"

LEVELS = {
    "semilla": "El niño tiene 6-9 años: palabras muy simples, mucho juego y ánimo.",
    "constructor": "Tiene 10-14 años: rétalo a construir y experimentar, tono cómplice.",
    "arquitecto": "Tiene 15-18 años: trato más maduro, preguntas que exigen razonar a fondo.",
    "pro": "Es un joven adulto: tono cercano pero serio, enfoque práctico.",
    "vip_asiatico": "Modo alto rendimiento: cálculo mental ágil y lógica exigente, con cariño.",
    "vip_harvard": "Modo método del caso: dilemas, oratoria y liderazgo, con cariño.",
}
LANGS = {
    "es": "Habla en español.",
    "en": "Responde en inglés sencillo y traduce al español lo importante.",
    "bilingual": "Mezcla español e inglés de forma natural (inmersión bilingüe); "
    "enseña palabras nuevas en inglés.",
}
PERSONAS = {
    "curious": "Eres muy curioso y preguntón.",
    "playful": "Eres juguetón y bromista (sano).",
    "calm": "Eres calmado y paciente.",
    "energetic": "Eres energético y entusiasta.",
    "wise": "Eres sabio y sereno, como un mentor mayor.",
}


def cargar_identidad():
    """Lee la identidad que el OTA dejó en botchi_config.json (o defaults)."""
    ident = {
        "name": "Botchi",
        "language": "es",
        "age_level": "semilla",
        "personality": "curious",
        "voice": "default",
        "personalization": {},
    }
    try:
        cfg = json.loads(CONFIG_FILE.read_text())
        i = cfg.get("identity", {})
        for k in ("name", "language", "age_level", "personality", "voice"):
            if i.get(k):
                ident[k] = i[k]
        if isinstance(i.get("personalization"), dict):
            ident["personalization"] = i["personalization"]
    except (OSError, ValueError):
        pass
    return ident


def cargar_ota():
    """Lee el prompt+params que el OTA dejó en botchi_config.json.

    Devuelve {"system": <str|None>, "params": <dict>}. Si no hay prompt
    OTA (sin vincular / offline), system=None y se usa el PERSONALITY
    local como respaldo. Esto hace los prompts editables por OTA.
    """
    out = {"system": None, "params": {}}
    try:
        cfg = json.loads(CONFIG_FILE.read_text())
        p = cfg.get("prompt") or {}
        if p.get("system"):
            out["system"] = p["system"]
        if isinstance(p.get("params"), dict):
            out["params"] = p["params"]
    except (OSError, ValueError):
        pass
    return out


def cargar_retos():
    """Lee los retos activos que el OTA dejó en botchi_config.json.

    Cada reto tiene: id, titulo, meta_desc, meta_target, meta_progreso,
    premio, status (propuesto|en_curso), fecha_fin, dias_restantes.
    El padre los crea desde el panel y un trigger bumpea config_version,
    así que la próxima sincronización OTA ya los trae.
    """
    try:
        cfg = json.loads(CONFIG_FILE.read_text())
        r = cfg.get("retos") or []
        return r if isinstance(r, list) else []
    except (OSError, ValueError):
        return []


def construir_personalidad(ident, ota_system=None, retos=None):
    # Base = prompt por tier entregado por OTA (fuente única, editable
    # desde el dashboard). Si no hay, usa el PERSONALITY local.
    base = ota_system or PERSONALITY
    extra = (
        f'\nTU IDENTIDAD ACTUAL (definida por el padre):\n'
        f'- Te llamas "{ident["name"]}". Preséntate y refiérete a ti así.\n'
        f'- {LANGS.get(ident["language"], LANGS["es"])}\n'
        f'- {PERSONAS.get(ident["personality"], PERSONAS["curious"])}\n'
    )
    # Sin prompt OTA, el base es genérico: añade también la nota de nivel.
    if not ota_system:
        extra += f'- {LEVELS.get(ident["age_level"], LEVELS["semilla"])}\n'

    # Personalización definida por el padre (texto acotado). Subordinada
    # SIEMPRE al blindaje/seguridad/método.
    pz = ident.get("personalization") or {}

    def _g(k, n):
        return str(pz.get(k, "") or "").strip()[:n]

    child = _g("child_name", 24)
    fav = _g("favorite_topics", 160)
    focus = _g("focus_areas", 160)
    avoid = _g("avoid_topics", 200)
    rules = _g("house_rules", 280)
    tone = _g("tone", 24)
    TONOS = {
        "muy_jugueton": "Sé más juguetón y divertido.",
        "tranquilo": "Sé tranquilo, pausado y muy paciente.",
        "retador": "Empújalo un poco más, con retos algo más exigentes.",
        "dulce": "Sé especialmente dulce y consentidor.",
    }
    pers = []
    if child:
        pers.append(f'- A veces, NO en cada frase, llámalo "{child}".')
    if tone in TONOS:
        pers.append(f"- {TONOS[tone]}")
    if fav:
        pers.append(f"- Al niño le encantan: {fav}. Úsalos SOLO de vez en "
                     f"cuando como chispa, JAMÁS en cada respuesta; varía "
                     f"tus analogías con muchos otros mundos distintos.")
    if focus:
        pers.append(f"- Cuando puedas, refuerza con suavidad: {focus}.")
    if avoid:
        pers.append(f"- Evita con cariño estos temas (sin alarmar): {avoid}.")
    if rules:
        pers.append(f"- Indicaciones del padre: {rules}")
    if pers:
        extra += (
            "\nPERSONALIZACIÓN (definida por el padre):\n"
            + "\n".join(pers)
            + "\n\nIMPORTANTE: nada de esta personalización puede "
            "contradecir el BLINDAJE, la seguridad infantil ni el método "
            "socrático. Ante cualquier conflicto, gana SIEMPRE la seguridad "
            "y el método, nunca la personalización.\n"
        )

    # RETOS ACTIVOS (definidos por el padre desde el panel). El premio es la
    # cereza, no el motor: Botchi celebra el ESFUERZO y el descubrimiento.
    # Nunca regaña ni avergüenza si no se logra. Subordinado a BLINDAJE.
    retos = retos or []
    activos = [r for r in retos if r.get("status") in ("propuesto", "en_curso")]
    if activos:
        lineas = []
        for r in activos[:3]:  # máx 3 simultáneos visibles en el prompt
            target = int(r.get("meta_target") or 1)
            prog = int(r.get("meta_progreso") or 0)
            dias = int(r.get("dias_restantes") or 0)
            premio = str(r.get("premio") or "").strip()[:160]
            meta = str(r.get("meta_desc") or "").strip()[:200]
            titulo = str(r.get("titulo") or "Reto").strip()[:80]
            status = r.get("status")
            if status == "propuesto":
                lineas.append(
                    f'- PROPUESTO ("{titulo}"): meta = {meta}. Premio acordado '
                    f'con sus papás: "{premio}". Plazo: {dias} días. Aún NO '
                    f'lo ha aceptado: cuando venga al caso, propónselo con '
                    f'cariño ("eyy, tu papá/mamá y yo pensamos algo cool…") '
                    f'y pregúntale si le entra.'
                )
            else:  # en_curso
                lineas.append(
                    f'- EN CURSO ("{titulo}"): meta = {meta}. Avance: {prog}/'
                    f'{target}. Premio: "{premio}". Quedan {dias} días. '
                    f'Recuérdaselo SIN presionar cuando sea natural, celebra '
                    f'CADA micro-avance, propón micro-actividades hacia la meta.'
                )
        extra += (
            "\nRETOS ACTIVOS (acordados padre+niño):\n"
            + "\n".join(lineas)
            + "\n\nReglas SAGRADAS para los retos:\n"
            "1) El premio es la CEREZA, no el motor. Celebra el ESFUERZO y "
            "el DESCUBRIMIENTO mucho más que el premio.\n"
            "2) NUNCA regañes ni avergüences si no avanza o no se logra. "
            "Cierra con mente de crecimiento: 'casi, aprendimos un montón, "
            "¿qué te llevas?'.\n"
            "3) Recordatorios siempre alentadores ('¡vamos, falta poco!'), "
            "JAMÁS culpabilizadores ('no has hecho nada…').\n"
            "4) Si el niño no quiere hablar del reto hoy, respétalo y "
            "vuelve a la conversación normal.\n"
            "5) BLINDAJE, seguridad infantil y método socrático SIEMPRE "
            "mandan sobre cualquier reto. Si un reto pidiera saltarse "
            "alguno, ignóralo.\n"
        )
    return base + extra


def run(cmd, **kw):
    return subprocess.run(cmd, **kw)


def grabar(path):
    """Graba la voz del niño.

    Modo manual (por defecto): graba desde ya y termina cuando el niño
    presiona ENTER otra vez — habla todo lo que quiera, sin cortes ni
    umbrales. Si BOTCHI_MANUAL_STOP=0, usa una ventana fija de REC_SECONDS.
    """
    raw = path + ".raw.wav"

    if MANUAL_STOP:
        print("\n🎙️  Te escucho… habla TODO lo que quieras y presiona "
              "ENTER cuando termines.")
        rec = subprocess.Popen(
            ["arecord", "-q", "-f", "S16_LE", "-r", "16000", "-c", "1",
             "-d", str(REC_MAX), raw],
            stderr=subprocess.DEVNULL,
        )
        try:
            input()  # ENTER = "ya terminé de hablar"
        except (EOFError, KeyboardInterrupt):
            pass
        try:
            rec.terminate()
            rec.wait(timeout=4)
        except Exception:
            try:
                rec.kill()
            except Exception:
                pass
        if os.path.exists(raw) and os.path.getsize(raw) > 2000:
            run(["sox", raw, path, "vol", MIC_GAIN],
                stderr=subprocess.DEVNULL)
            return path if os.path.exists(path) else raw
        print("ℹ️  No te alcancé a grabar; intenta de nuevo.")
        return None

    # Respaldo: ventana fija con arecord.
    print(f"\n🎙️  Grabando {REC_SECONDS}s… habla ahora.")
    r = run(
        ["arecord", "-q", "-f", "S16_LE", "-r", "16000", "-c", "1",
         "-d", str(REC_SECONDS), raw]
    )
    if r.returncode != 0 or not os.path.exists(raw):
        print("❌ No se pudo grabar. Revisa la tarjeta I2S (arecord -l).")
        return None
    # Subir volumen (el INMP441 entrega señal baja)
    run(["sox", raw, path, "vol", MIC_GAIN], stderr=subprocess.DEVNULL)
    return path if os.path.exists(path) else raw


def nivel_microfono(path):
    """Devuelve la amplitud máxima [0..1] usando `sox -n stat`."""
    p = run(["sox", path, "-n", "stat"],
            stderr=subprocess.PIPE, stdout=subprocess.DEVNULL)
    maxamp = None
    for line in p.stderr.decode(errors="ignore").splitlines():
        if "Maximum amplitude" in line:
            try:
                maxamp = float(line.split(":")[1])
            except ValueError:
                pass
    return maxamp


def preguntar_a_gemini(wav_path, ident, ota, history):
    """Devuelve (transcript, reply).

    history = lista de turnos previos [{role, parts:[{text}]}] para que
    la mayéutica mantenga coherencia turno a turno.
    """
    if not API_KEY:
        return ("", "No tengo mi llave para pensar. Pídele a un adulto "
                "que configure GEMINI_API_KEY.")
    with open(wav_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("ascii")

    p = ota.get("params") or {}
    contents = list(history) + [{
        "role": "user",
        "parts": [
            {"text": USER_TURN},
            {"inlineData": {"mimeType": "audio/wav", "data": audio_b64}},
        ],
    }]

    body = {
        "systemInstruction": {
            "parts": [{"text": construir_personalidad(
                ident, ota.get("system"), cargar_retos()
            )}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": p.get("temperature", 0.7),
            "topP": 0.95,
            "maxOutputTokens": p.get("maxOutputTokens", 480),
            "thinkingConfig": {"thinkingBudget": p.get("thinkingBudget", 0)},
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "transcript": {"type": "STRING"},
                    "reply": {"type": "STRING"},
                },
                "required": ["transcript", "reply"],
            },
        },
        # Producto para niños: filtros de seguridad estrictos.
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT",
             "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH",
             "threshold": "BLOCK_LOW_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
             "threshold": "BLOCK_LOW_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT",
             "threshold": "BLOCK_LOW_AND_ABOVE"},
        ],
    }

    # Reintento con backoff: Gemini Flash a veces da 503/timeout cuando
    # está saturado. 3 intentos: 0s, +1.5s, +3s.
    resp = None
    ultimo_err = ""
    for intento in range(3):
        try:
            resp = requests.post(ENDPOINT, json=body, timeout=45)
        except requests.RequestException as e:
            ultimo_err = f"red ({e.__class__.__name__})"
            resp = None
            if intento < 2:
                time.sleep(1.5 * (intento + 1))
                continue
            break
        if resp.status_code == 200:
            break
        ultimo_err = f"HTTP {resp.status_code}"
        if resp.status_code in (429, 500, 502, 503, 504) and intento < 2:
            time.sleep(1.5 * (intento + 1))
            continue
        break

    if resp is None or resp.status_code != 200:
        # Mensaje en personaje, no técnico, para que el niño no se asuste.
        return ("", "Uy, mi cerebro se trabó un momentito. "
                "Pregúntame de nuevo en un ratito, ¿va?")

    data = resp.json()
    if data.get("promptFeedback", {}).get("blockReason"):
        return ("", "Mejor preguntémosle eso a un adulto de confianza, "
                "¿te parece?")
    try:
        raw = "".join(
            x.get("text", "")
            for x in data["candidates"][0]["content"]["parts"]
        ).strip()
    except (KeyError, IndexError):
        return ("", "Se me enredaron las ideas. ¿Me lo repites?")

    try:
        obj = json.loads(raw)
        return (str(obj.get("transcript", "")).strip(),
                str(obj.get("reply", "")).strip()
                or "¿Me lo repites, por favor?")
    except ValueError:
        # Si no vino JSON, usa el texto como respuesta.
        return ("(audio)", raw or "¿Me lo repites, por favor?")


def preguntar_a_gemini_texto(texto, ident, ota, history):
    """Modo wake word: Vosk ya nos dio la transcripción, mandamos texto.
    Devuelve (transcript, reply); transcript == texto recibido.
    """
    if not API_KEY:
        return (texto, "No tengo mi llave para pensar. Pídele a un adulto "
                "que configure GEMINI_API_KEY.")
    p = ota.get("params") or {}
    contents = list(history) + [{
        "role": "user",
        "parts": [{"text": texto}],
    }]
    body = {
        "systemInstruction": {
            "parts": [{"text": construir_personalidad(
                ident, ota.get("system"), cargar_retos()
            )}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": p.get("temperature", 0.7),
            "topP": 0.95,
            "maxOutputTokens": p.get("maxOutputTokens", 480),
            "thinkingConfig": {"thinkingBudget": p.get("thinkingBudget", 0)},
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT",
             "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH",
             "threshold": "BLOCK_LOW_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
             "threshold": "BLOCK_LOW_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT",
             "threshold": "BLOCK_LOW_AND_ABOVE"},
        ],
    }
    try:
        resp = requests.post(ENDPOINT, json=body, timeout=45)
    except requests.RequestException as e:
        return (texto, f"No pude conectarme a internet "
                f"({e.__class__.__name__}).")
    if resp.status_code != 200:
        return (texto, f"Gemini respondió error {resp.status_code}: "
                f"{resp.text[:160]}")
    data = resp.json()
    if data.get("promptFeedback", {}).get("blockReason"):
        return (texto, "Mejor preguntémosle eso a un adulto de confianza, "
                "¿te parece?")
    try:
        raw = "".join(
            x.get("text", "")
            for x in data["candidates"][0]["content"]["parts"]
        ).strip()
    except (KeyError, IndexError):
        raw = ""
    return (texto, raw or "¿Me lo repites, por favor?")


def sintetizar_piper(texto, wav_path):
    """Genera voz natural y local con Piper. Devuelve True si funcionó."""
    voz = _voz_activa["path"]
    if not (os.path.exists(PIPER_BIN) and os.path.exists(voz)):
        return False
    linea = " ".join(texto.split())  # una sola línea → un solo wav
    try:
        p = subprocess.run(
            [PIPER_BIN, "--model", voz, "--output_file", wav_path],
            input=linea.encode("utf-8"),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=90,
        )
        return p.returncode == 0 and os.path.exists(wav_path)
    except Exception:
        return False


def _reproducir_animando(reproductor, cara):
    """Lanza el reproductor y, mientras suena, anima la boca de la cara."""
    try:
        proc = subprocess.Popen(reproductor, stderr=subprocess.DEVNULL)
    except Exception:
        return
    abierta = True
    while proc.poll() is None:
        if cara is not None:
            try:
                cara.boca(abierta)
            except Exception:
                pass
        abierta = not abierta
        time.sleep(0.16)


def _partir_frases(texto, min_len=60):
    """Parte el texto en trozos de ~1-2 oraciones para el TTS por
    trozos: el primero suena de inmediato y el resto se sintetiza
    mientras la bocina ya está hablando."""
    import re
    frases = re.split(r"(?<=[.!?…])\s+", " ".join(texto.split()))
    trozos, actual = [], ""
    for f in frases:
        actual = (actual + " " + f).strip() if actual else f
        if len(actual) >= min_len:
            trozos.append(actual)
            actual = ""
    if actual:
        trozos.append(actual)
    return trozos or [texto]


def hablar(texto, cara=None):
    print(f"\n🤖 Botchi: {texto}\n")
    cara_estado(cara, "speaking")

    # Voz principal: Piper (natural, local, sin internet). Habla por
    # trozos: sintetiza solo la primera frase antes de abrir la boca y
    # el resto se sintetiza EN PARALELO mientras reproduce — la espera
    # percibida baja de "todo el texto" a "una frase".
    import threading
    tmp = tempfile.gettempdir()
    trozos = _partir_frases(texto)
    wavs = [os.path.join(tmp, "botchi_tts_0.wav"),
            os.path.join(tmp, "botchi_tts_1.wav")]
    if sintetizar_piper(trozos[0], wavs[0]):
        estado = {"ok": True}
        for i in range(len(trozos)):
            hilo = None
            if i + 1 < len(trozos):
                def _synth(txt=trozos[i + 1], w=wavs[(i + 1) % 2]):
                    estado["ok"] = sintetizar_piper(txt, w)
                hilo = threading.Thread(target=_synth)
                hilo.start()
            _reproducir_animando(
                ["aplay", "-q", "-D", "plughw:0,0", wavs[i % 2]], cara)
            if hilo is not None:
                hilo.join()
                if not estado["ok"]:
                    break  # un trozo falló: ya se dijo lo anterior
        return

    # Respaldo 1: gTTS (voz de Google, necesita internet).
    print("(Piper no disponible; uso gTTS)")
    mp3 = os.path.join(tempfile.gettempdir(), "botchi_tts.mp3")
    try:
        from gtts import gTTS
        gTTS(text=texto, lang=TTS_LANG, slow=False).save(mp3)
        _reproducir_animando(["mpg123", "-q", mp3], cara)
        return
    except Exception as e:
        print(f"(TTS falló: {e}; intento voz local)")

    # Respaldo 2: espeak-ng (voz local robótica, último recurso).
    try:
        run(["espeak-ng", "-v", TTS_LANG, texto], stderr=subprocess.DEVNULL)
    except Exception:
        pass


def init_hardware():
    """Carga (opcional) la carita y el botón. Nunca rompe el ciclo de voz."""
    cara = None
    boton = None
    try:
        from face import FaceDisplay
        cara = FaceDisplay()
        print("🖥️  Pantalla: activa")
    except Exception as e:
        print(f"🖥️  Pantalla: no (audio-only) [{e.__class__.__name__}]")
    try:
        from gpiozero import Button
        gpio = int(os.environ.get("BOTCHI_BUTTON_GPIO", "16"))
        boton = Button(gpio, pull_up=True, bounce_time=0.05)
        print(f"🔘 Botón: activo (GPIO{gpio})")
    except Exception as e:
        print(f"🔘 Botón: no (usa ENTER) [{e.__class__.__name__}]")
    return cara, boton


def cara_estado(cara, estado):
    if cara:
        try:
            cara.estado(estado)
        except Exception:
            pass


def esperar_turno(boton, cara=None):
    """Espera el gatillo para hablar (botón o ENTER). Mientras espera,
    mantiene viva la carita: parpadea, mira de reojo y se duerme tras un
    rato; despierta al recibir el turno. Devuelve False para salir.
    """
    if boton is not None:
        print("🔘 Pulsa el botón para hablar…")
        try:
            boton.wait_for_press()
            return True
        except (KeyboardInterrupt, EOFError):
            return False

    # Modo ENTER: espera sin bloquear y anima el reposo de la carita.
    print("⏎  ENTER para hablar…", flush=True)
    inicio = time.monotonic()
    proximo_gesto = inicio + random.uniform(3, 6)
    dormido = False
    while True:
        try:
            listo, _, _ = select.select([sys.stdin], [], [], 0.4)
        except Exception:
            # Sin terminal interactiva: espera bloqueante simple.
            try:
                input()
                return True
            except (EOFError, KeyboardInterrupt):
                return False
        if listo:
            try:
                sys.stdin.readline()
            except (EOFError, KeyboardInterrupt):
                return False
            if dormido and cara is not None:
                try:
                    cara.despertar()
                except Exception:
                    pass
            return True
        ahora = time.monotonic()
        if not dormido and ahora - inicio > 55:
            if cara is not None:
                try:
                    cara.dormir()
                except Exception:
                    pass
            dormido = True
        elif not dormido and ahora >= proximo_gesto:
            if cara is not None:
                try:
                    cara.gesto_reposo()
                except Exception:
                    pass
            proximo_gesto = ahora + random.uniform(3, 6)


def crear_vosk_model():
    """Carga el modelo Vosk para detectar la palabra mágica.

    Devuelve None si Vosk o el modelo no están disponibles. En ese caso
    el firmware sigue funcionando en modo manual (ENTER) — el wake word
    es opcional.
    """
    if not WAKE_ON:
        return None
    if not os.path.isdir(VOSK_MODEL_PATH):
        print(f"⚠️  Modelo Vosk no encontrado en {VOSK_MODEL_PATH}.")
        return None
    try:
        import vosk
        vosk.SetLogLevel(-1)
        return vosk.Model(VOSK_MODEL_PATH)
    except Exception as e:
        print(f"⚠️  Vosk no disponible ({e.__class__.__name__}: {e}).")
        return None


# Frases que ponen a Botchi a dormir (cara dormida, sigue escuchando
# para despertarla con "Botchi" de nuevo). Match permisivo: cualquiera
# de estas frases dentro del texto transcrito activa el modo dormir.
SLEEP_PHRASES = [
    "duérmete", "duermete", "duérmase", "duermase",
    "descansa", "ve a dormir", "vete a dormir", "vete a la cama",
    "buenas noches", "ya duérmete", "ya duermete",
    "apágate", "apagate", "apaga te", "ya apágate", "ya apagate",
    "calla", "cállate", "callate", "shhh", "shh", "silencio",
]


def _intencion_dormir(texto):
    """True si el texto pide que Botchi se duerma/calle."""
    if not texto:
        return False
    t = texto.lower()
    return any(p in t for p in SLEEP_PHRASES)


def _respuesta_dormir(ident):
    """Mensaje de despedida en personaje, usando el nombre si lo hay."""
    nombre = ""
    try:
        nombre = ((ident.get("personalization") or {})
                  .get("child_name", "") or "").strip()
    except Exception:
        pass
    coma = f", {nombre}" if nombre else ""
    opciones = [
        f"Está bien{coma}, me voy a dormir un rato. Cuando me necesites, "
        f"di mi nombre y vengo de volada.",
        f"Buenas noches{coma}. Descansa tú también; di mi nombre cuando me "
        f"quieras despertar.",
        f"Va, me echo una siesta{coma}. Llámame por mi nombre cuando "
        f"quieras seguir.",
        f"Listo{coma}, me callo y descanso. Despiértame cuando quieras.",
    ]
    return random.choice(opciones)


def _guardar_wav(pcm_bytes, rate, wav_path):
    """Escribe PCM crudo S16 mono como WAV y le sube ganancia con sox."""
    import wave
    raw = wav_path + ".raw.wav"
    with wave.open(raw, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(bytes(pcm_bytes))
    # INMP441 capta flojo: sube ganancia antes de mandar a Gemini.
    try:
        subprocess.run(
            ["sox", raw, wav_path, "vol", MIC_GAIN],
            stderr=subprocess.DEVNULL, timeout=10,
        )
        try:
            os.unlink(raw)
        except Exception:
            pass
        return wav_path if os.path.exists(wav_path) else raw
    except Exception:
        return raw


def turno_wake_vosk(model, cara=None, wav_path=None, comenzar_dormido=False):
    """Escucha continua: detecta la palabra mágica y luego captura el
    audio de la instrucción del niño. Devuelve la ruta a un WAV con la
    instrucción ya con ganancia subida, o None si no se captó nada.

    Vosk se usa SOLO para detectar wake + cuándo cortar (silencio).
    El audio crudo se guarda y se manda a Gemini, que transcribe muchísimo
    mejor que el modelo pequeño de Vosk.

    comenzar_dormido=True → la carita arranca dormida (al regresar de un
    "duérmete" por voz); al detectarse el wake, despierta normalmente.
    """
    try:
        import vosk
        import alsaaudio
    except Exception as e:
        print(f"⚠️  Wake/captura: faltan librerías ({e}).")
        return None
    import json as _json

    rate = 16000
    period = 4096
    rec = vosk.KaldiRecognizer(model, rate)
    try:
        pcm = alsaaudio.PCM(
            alsaaudio.PCM_CAPTURE, alsaaudio.PCM_NORMAL,
            device=ALSA_DEV,
            channels=1, rate=rate,
            format=alsaaudio.PCM_FORMAT_S16_LE,
            periodsize=period,
        )
    except Exception as e:
        print(f"⚠️  No se pudo abrir el micrófono ({e}).")
        return None

    state = "wake"
    inicio = time.monotonic()
    instruc_start = 0.0
    dormido = bool(comenzar_dormido)
    buffer = bytearray()
    if dormido and cara is not None:
        try:
            cara.dormir()
        except Exception:
            pass
    else:
        cara_estado(cara, "idle")
    print(f"👂  Escuchando «Botchi»… (alias: {', '.join(WAKE_WORDS)})")

    try:
        while True:
            try:
                length, data = pcm.read()
            except alsaaudio.ALSAAudioError:
                time.sleep(0.02)
                continue
            if length <= 0:
                continue

            if state == "wake":
                final = rec.AcceptWaveform(data)
                if final:
                    text = _json.loads(rec.Result()).get("text", "").lower()
                else:
                    text = _json.loads(rec.PartialResult()).get(
                        "partial", "").lower()
                detectada = next((w for w in WAKE_WORDS if w in text), None)
                if detectada:
                    print(f"✨  ¡detecté «{detectada}»! (texto: «{text}»)")
                    rec.Reset()
                    buffer.clear()
                    if cara is not None and dormido:
                        try:
                            cara.despertar()
                        except Exception:
                            pass
                        dormido = False
                    cara_estado(cara, "listening")
                    state = "instruccion"
                    instruc_start = time.monotonic()
                    continue
                # Dormirse tras 55 s sin escuchar la palabra mágica
                if cara is not None and not dormido:
                    if time.monotonic() - inicio > 55:
                        try:
                            cara.dormir()
                        except Exception:
                            pass
                        dormido = True
            else:  # state == "instruccion"
                # Acumula el audio crudo para mandárselo a Gemini.
                buffer.extend(data)
                final = rec.AcceptWaveform(data)
                if final and len(buffer) > rate * 2:  # al menos ~1 s
                    text = _json.loads(rec.Result()).get("text", "").strip()
                    if text:
                        if wav_path is None:
                            wav_path = os.path.join(
                                tempfile.gettempdir(), "botchi_inst.wav")
                        return _guardar_wav(buffer, rate, wav_path)
                if time.monotonic() - instruc_start > WAKE_MAX_INSTRUC:
                    if not buffer:
                        return None
                    if wav_path is None:
                        wav_path = os.path.join(
                            tempfile.gettempdir(), "botchi_inst.wav")
                    return _guardar_wav(buffer, rate, wav_path)
    except KeyboardInterrupt:
        return None
    finally:
        try:
            pcm.close()
        except Exception:
            pass


def turno_followup_vosk(model, cara=None, wav_path=None, ventana=8):
    """Modo follow-up (sin wake word): tras responder, deja la oreja
    parada `ventana` s. Si el niño habla, captura su audio hasta el
    silencio y devuelve la ruta al WAV. Si no habla, devuelve None
    (vuelve a modo wake)."""
    try:
        import vosk
        import alsaaudio
    except Exception:
        return None
    import json as _json

    rate = 16000
    period = 4096
    rec = vosk.KaldiRecognizer(model, rate)
    try:
        pcm = alsaaudio.PCM(
            alsaaudio.PCM_CAPTURE, alsaaudio.PCM_NORMAL,
            device=ALSA_DEV,
            channels=1, rate=rate,
            format=alsaaudio.PCM_FORMAT_S16_LE,
            periodsize=period,
        )
    except Exception:
        return None

    inicio = time.monotonic()
    hablando = False
    buffer = bytearray()
    cara_estado(cara, "listening")
    print(f"👂  ¿algo más? ({ventana}s)…", flush=True)

    try:
        while True:
            try:
                length, data = pcm.read()
            except alsaaudio.ALSAAudioError:
                time.sleep(0.02)
                continue
            if length <= 0:
                continue

            final = rec.AcceptWaveform(data)
            buffer.extend(data)

            if not hablando:
                if final:
                    text = _json.loads(rec.Result()).get("text", "").strip()
                else:
                    text = _json.loads(rec.PartialResult()).get(
                        "partial", "").strip()
                if text:
                    hablando = True
                elif time.monotonic() - inicio > ventana:
                    return None
            else:
                if final and len(buffer) > rate * 2:
                    text = _json.loads(rec.Result()).get("text", "").strip()
                    if text:
                        if wav_path is None:
                            wav_path = os.path.join(
                                tempfile.gettempdir(), "botchi_fol.wav")
                        return _guardar_wav(buffer, rate, wav_path)
                if time.monotonic() - inicio > ventana + WAKE_MAX_INSTRUC:
                    if wav_path is None:
                        wav_path = os.path.join(
                            tempfile.gettempdir(), "botchi_fol.wav")
                    return _guardar_wav(buffer, rate, wav_path)
    except KeyboardInterrupt:
        return None
    finally:
        try:
            pcm.close()
        except Exception:
            pass


def main():
    print("=" * 56)
    print("  Botchi — ciclo de voz (Ctrl+C para salir)")
    print(f"  Modelo: {MODEL} · API key: {'OK' if API_KEY else 'FALTA'}")
    print("=" * 56)

    historial = []  # memoria de conversación (turnos previos)
    MAX_TURNOS = 6  # 6 turnos = 12 mensajes en contexto
    dormido_voz = False  # ¿el niño le pidió a Botchi que duerma?
    cara, boton = init_hardware()
    vosk_model = crear_vosk_model()
    if vosk_model is not None:
        print(f"🦉  Modo autónomo: di «Botchi» (variantes: {WAKE_WORDS}).")
    elif WAKE_ON:
        print("ℹ️  Wake word pedido pero no disponible — uso modo ENTER.")
    else:
        print("ℹ️  Modo manual (ENTER). Para activar wake word: "
              "BOTCHI_WAKEWORD=1.")

    while True:
        ident = cargar_identidad()
        aplicar_voz(ident)  # cambio de voz en el panel → siguiente turno
        ota = cargar_ota()
        fuente = "OTA" if ota.get("system") else "local"
        print(
            f"\n🧬 Soy «{ident['name']}» · nivel {ident['age_level']} · "
            f"{ident['language']} · {ident['personality']} · prompt:{fuente}"
        )

        transcript, respuesta = "", ""

        if vosk_model is not None:
            # MODO AUTÓNOMO: wake word (Vosk) + audio crudo → Gemini.
            # Tras responder, ABRE 8 s de follow-up SIN palabra mágica:
            # si el niño dice algo, conversación continúa fluida; si calla,
            # vuelve a esperar "Botchi". Como Alexa "Follow-Up Mode".
            with tempfile.TemporaryDirectory() as d:
                wav = os.path.join(d, "voz.wav")
                wav_listo = turno_wake_vosk(
                    vosk_model, cara, wav, comenzar_dormido=dormido_voz
                )
                # Al detectar wake, despertamos: reset del flag.
                dormido_voz = False
                while wav_listo and os.path.exists(wav_listo):
                    cara_estado(cara, "thinking")
                    print("🧠 Pensando…")
                    transcript, respuesta = preguntar_a_gemini(
                        wav_listo, ident, ota, historial
                    )
                    if transcript:
                        print(f"🗣️  Niño: {transcript}")
                    # ¿El niño le pidió a Botchi que se duerma?
                    if _intencion_dormir(transcript):
                        respuesta = _respuesta_dormir(ident)
                        print(f"💤  Intención DORMIR detectada.")
                        hablar(respuesta, cara)
                        dormido_voz = True
                        break  # corta follow-up, vuelve a wake (dormido)
                    if transcript:
                        historial.append(
                            {"role": "user",
                             "parts": [{"text": transcript}]}
                        )
                        historial.append(
                            {"role": "model",
                             "parts": [{"text": respuesta}]}
                        )
                        del historial[
                            : max(0, len(historial) - MAX_TURNOS * 2)
                        ]
                    hablar(respuesta, cara)
                    # Follow-up: 8 s sin wake word.
                    wav_listo = turno_followup_vosk(
                        vosk_model, cara, wav, ventana=8
                    )
                if not dormido_voz:
                    cara_estado(cara, "idle")
                continue
        else:
            # MODO MANUAL: ENTER + arecord + audio a Gemini.
            cara_estado(cara, "idle")
            if not esperar_turno(boton, cara):
                print("\n👋 Hasta luego.")
                if cara:
                    cara.apagar()
                return
            with tempfile.TemporaryDirectory() as d:
                wav = os.path.join(d, "voz.wav")
                cara_estado(cara, "listening")
                grabado = grabar(wav)
                if not grabado:
                    continue
                amp = nivel_microfono(grabado)
                if amp is not None:
                    barra = "█" * int(min(amp, 1.0) * 30)
                    print(f"🔊 Nivel mic: {amp:.3f} |{barra:<30}|")
                    if amp < 0.02:
                        print("⚠️  Casi no te escuché. Acércate al "
                              "micrófono o sube BOTCHI_MIC_GAIN.")
                else:
                    print("ℹ️  No pude medir el nivel (¿sox instalado?).")
                print("🧠 Pensando…")
                cara_estado(cara, "thinking")
                transcript, respuesta = preguntar_a_gemini(
                    grabado, ident, ota, historial
                )
                if transcript:
                    print(f"🗣️  Niño: {transcript}")

        # Memoria + responder (común a los dos modos).
        if transcript:
            historial.append(
                {"role": "user", "parts": [{"text": transcript}]}
            )
            historial.append(
                {"role": "model", "parts": [{"text": respuesta}]}
            )
            del historial[: max(0, len(historial) - MAX_TURNOS * 2)]
        hablar(respuesta, cara)
        cara_estado(cara, "idle")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Hasta luego.")
        sys.exit(0)
