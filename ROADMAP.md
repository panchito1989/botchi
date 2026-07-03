# Botchi · Roadmap futuro

Documento vivo. Lo que NO se construye ahora porque hay que ejecutar primero la
beta de Fundadores, pero que está validado como dirección.

---

## 1. "Círculo de Botchi" — aprendizaje cooperativo entre amigos

**Origen de la idea:** la hija del fundador le contó a sus amigos sobre su
Botchi y preguntó si podían "hablar" entre ellos. Es la primera señal real
de un efecto de red orgánico.

### Por qué sí

- Efecto red real: cada Botchi vale más cuando los amigos también lo tienen.
- Viralidad gratuita: cada amigo aprobado = un padre nuevo en el funnel.
- Diferenciación única: ningún competidor (tablet, app, ChatGPT) ofrece
  aprendizaje cooperativo curado para niños.
- Encaja en la monetización: feature de **Premium Familiar / Élite**.
  Los Fundadores la conservan gratis (precio bloqueado).
- Retención: los niños se quedan donde están sus amigos.

### Por qué NO se construye como "chat entre niños"

- Convierte Botchi de "mentor educativo" a "plataforma de comunicación
  infantil" → otra categoría legal (LFPDPPP en MX, COPPA-equiv. internacional).
- Bullying / exclusión / groserías entre niños — la BLINDAJE protege contra
  la IA, NO contra humanos.
- Riesgo de depredadores si hay "agregar amigos" libre. Una sola historia
  mala termina el proyecto.
- Rompe la promesa que hoy está en la landing: **"sin redes sociales, sin
  distracciones"** — uno de los argumentos de venta más fuertes con los padres.
- Moderación = carga operativa que un fundador solo no escala.

### Diseño aprobado (cómo SÍ se va a construir)

Se llamará **"Círculo de Botchi"** y NO será un chat. Reglas no negociables:

1. **Doble consentimiento parental.** Para que dos Botchis se conecten, los
   dos papás aprueban desde su panel. Cero descubrimiento de usuarios, cero
   búsqueda, cero matching aleatorio. Como intercambiar el WhatsApp en
   persona.
2. **La IA es el intermediario — nunca pasa audio crudo entre niños.**
   - **Retos cooperativos**: mismo desafío mayéutico lanzado a un grupo;
     cada Botchi guía a su niño; al final celebra el logro conjunto
     ("Sofi y tú resolvieron el reto de fracciones").
   - **Mini-notas mediadas por IA**: el niño graba un mensaje → Botchi
     escucha → resume → el Botchi del amigo lee el resumen con su propia
     voz. El audio original NUNCA llega al otro niño. Esto mata bullying y
     riesgo de groserías de un solo golpe.
   - **Logros compartidos opt-in**: "Mateo aprendió 5 palabras nuevas".
   - **"Tarea juntos"**: ambos padres opt-in → mismo tema en paralelo →
     celebración conjunta al terminar.
3. **Asíncrono, no en vivo.** Nada de presencia ("Sofi está en línea").
   Reglas de horario por padre (ej. solo 4–7 pm).
4. **El padre lo ve todo**: lista de conexiones, resúmenes de cada
   interacción, botón de reporte y kill-switch por amigo.

Así sigue siendo "sin redes sociales" — porque técnicamente NO lo es:
es aprendizaje cooperativo curado por padres, mediado por IA.

### Cuándo se lanza

**No antes** de tener ~20–30 Fundadores con dispositivo en mano y funcionando.
Secuencia:

1. Entregar Fundadores + estabilizar firmware/OTA.
2. Piloto privado del **"reto compartido"** con 2 familias que se conozcan
   (idealmente las hijas del fundador con amigas suyas).
3. Si funciona, ampliar a "logros compartidos" y luego a "mini-notas
   mediadas".
4. Empaquetar como feature de Premium Familiar cuando se active el cobro de
   membresía para clientes nuevos. Fundadores: incluido sin cargo.

### Componentes técnicos (boceto, no para hoy)

- DB: tabla `friendships(device_a, device_b, status, approved_by_a, approved_by_b)`
  con doble opt-in obligatorio.
- DB: tabla `shared_challenges(id, group, challenge_id, status)` y
  `challenge_results(device_id, challenge_id, payload)`.
- Pipeline de "nota mediada": ASR → resumen LLM → TTS en la voz del Botchi
  receptor. Nunca se almacena ni se transmite el audio original.
- Panel padre: pestaña "Círculo" con conexiones, logs, reporte y kill-switch.
- Reglas de horario y límites de mensajes/día configurables por padre.

---

## 2. Interacción del dispositivo final — palabra mágica "Botchi" (modelo Alexa)

**Decisión del fundador (confirmada):** el Botchi final NO tendrá teclado ni
botón. Funciona **literal como Alexa**: el niño dice **"Botchi"**, le da una
instrucción, se calla, y Botchi responde.

Hoy (modo pruebas) se usan ENTER #1 / ENTER #2 desde SSH. Eso es SOLO para el
desarrollo — no es el producto final.

### El flujo final (sin teclado, sin botón)

1. **Reposo escuchando** — un detector de palabra clave corre siempre en el
   Pi, escuchando SOLO la palabra "Botchi" (no envía nada a internet hasta
   que se activa).
2. **"Botchi"** → despierta: la cara pasa a "listening", quizá un sonidito.
3. El niño da su instrucción.
4. **Detección de silencio (VAD)** — cuando el niño se calla ~1.5–2 s, corta
   solo.
5. Botchi piensa (Gemini) y responde (voz Piper + boca animada).
6. Vuelve a reposo escuchando "Botchi".

### Componentes (boceto, no para hoy)

- **Wake word**: motor local de keyword spotting. Opciones: **openWakeWord**
  (open source, gratis, permite entrenar la palabra "Botchi") o **Picovoice
  Porcupine** (capa gratis). Corre en el Pi, bajo CPU; el audio NO sale del
  dispositivo hasta que se activa → respeta privacidad.
- **Firmware**: `esperar_turno` (hoy ENTER/botón) se reemplaza por el bucle de
  wake word; `grabar` usa VAD-stop (cortar al silencio) en vez del ENTER #2.
  El modo manual actual queda como respaldo de desarrollo (`BOTCHI_MANUAL_STOP`).
- **Respaldo táctil**: el display Waveshare 1.28 YA trae panel táctil (pines
  `TP_SDA/TP_SCL/TP_INT/TP_RST`, hoy sin conectar). Cablearlos = "tocar a
  Botchi" como alternativa para despertarlo. Hardware ya disponible, gratis.

### Prerrequisito honesto: mejorar el micrófono

El INMP441 actual capta MUY débil (pico crudo ~2.3 %). Tanto el wake word como
el VAD necesitan una señal decente. Antes de este módulo hay que mejorar la
captación: posición del micrófono, ganancia, o un micro mejor. Es la causa por
la que el VAD automático falló en pruebas y se usó control manual (2 ENTER).

### Cuándo

Parte de la **fase del dispositivo autónomo** (junto con el arranque automático
por systemd). No antes de estabilizar la beta de Fundadores.

---

## 3. Otros pendientes registrados (para no olvidar)

- **Ajuste de precio real del dispositivo** en `/precios` cuando el fundador
  confirme el costo de BOM + ensamblado + envío. Hoy: $1,500 placeholder
  (normal $2,490).
- **Dominio propio** (ej. `botchi.mx`) y migración de `botchi-one.vercel.app`.
- **Activar cobro de membresía** cuando haya producto entregado y feedback:
  flip `MONETIZATION_ENABLED` en `web/src/lib/access.ts` + integrar Stripe.
  Los Fundadores quedan exentos de por vida.
- **Footprint externo de marca** (LinkedIn Company Page, Product Hunt,
  YouTube demo, Wikidata, Crunchbase) — ver `BRAND-PLAN.md`.
