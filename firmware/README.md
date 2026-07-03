# Botchi — Firmware (Raspberry Pi Zero 2 W)

Guía completa, sin saltarse pasos, desde la MicroSD hasta el primer
ciclo de voz: **el niño habla → Gemini razona con método mayéutico →
el Botchi responde por la bocina**.

> Hardware real: **Pi Zero 2 W** (quad-core Cortex-A53, 512 MB) ·
> **Waveshare 1.28" Touch LCD** (GC9A01) · INMP441 (mic I2S) ·
> MAX98357A + bocina 3W (amp I2S) ·
> **módulo de carga+boost LX-LCBST** + LiPo 3.7V (USB-C).
>
> La Zero 2 W es ~5× más rápida que la Zero W original y tiene wheels
> de Python precompilados (armv7/arm64): adiós a los problemas de
> compilación. Mantenemos el enfoque REST igualmente por ser más
> ligero en 512 MB (ver Paso 4).

---

## Paso 0 — Cableado (DIAGRAMA para tus placas)

> ⚠️ **Reglas de oro (léelas):**
> 1. **Nunca** metas 5V a un pin de 3.3V (mic e INMP441/pantalla VCC = 3.3V).
> 2. La Pi se alimenta de **una sola** fuente: o el LX-LCBST, o el USB de
>    la Pi. Nunca las dos a la vez.
> 3. El backlight de la pantalla (`LCD_BL`) **NO** va a GPIO18: ese pin es
>    el reloj I2S del audio. Lo dejamos en 3.3V (encendido fijo).
> 4. Comprueba que tu Pi tenga **header de 40 pines soldado**. Si las fotos
>    muestran solo los agujeros, hay que soldarlo antes de nada.

Hay más consumidores de 3.3V/GND que pines iguales en la Pi: usa una
**mini protoboard** como riel de 3.3V, 5V y GND, y de ahí reparte.

### A) Energía — LX-LCBST (carga + boost 5V)

| LX-LCBST | Va a |
|---|---|
| `B+`  | LiPo **+** (rojo) |
| `B-`  | LiPo **−** (negro) |
| `VO+` | Riel **5V** → Pi **pin 2** (5V) |
| `VO-` | Riel **GND** → Pi **pin 6** (GND) |
| USB-C | Cargador (carga la batería) |

`IN+/IN-` se quedan **sin usar** (la carga entra por el USB-C).

### B) Pantalla Waveshare 1.28" (SPI0)

| Pantalla | Pi (pin físico) | GPIO |
|---|---|---|
| `VCC`     | 3.3V (riel)  | — |
| `GND`     | GND (riel)   | — |
| `MOSI`    | pin 19       | GPIO10 |
| `SCLK`    | pin 23       | GPIO11 |
| `LCD_CS`  | pin 24       | GPIO8 (CE0) |
| `LCD_DC`  | pin 18       | GPIO24 |
| `LCD_RST` | pin 22       | GPIO25 |
| `LCD_BL`  | 3.3V (riel)  | — (encendido fijo) |
| `MISO`    | — sin conectar (la GC9A01 solo recibe) |
| `TP_*`    | — sin conectar (táctil = fase futura) |

### C) Micrófono INMP441 (I2S entrada)

| INMP441 | Pi (pin) | GPIO |
|---|---|---|
| `VDD` | 3.3V (riel) | — |
| `GND` | GND (riel)  | — |
| `SCK` | pin 12 | GPIO18 (BCLK) |
| `WS`  | pin 35 | GPIO19 (LRCLK) |
| `SD`  | pin 38 | GPIO20 (datos IN) |
| `L/R` | GND (riel) | — (canal izquierdo) |

### D) Amplificador MAX98357A (I2S salida)

| MAX98357A | Pi (pin) | GPIO |
|---|---|---|
| `Vin`  | pin 4 (5V) | — |
| `GND`  | GND (riel) | — |
| `BCLK` | pin 12 | GPIO18 (comparte con mic SCK) |
| `LRC`  | pin 35 | GPIO19 (comparte con mic WS) |
| `DIN`  | pin 40 | GPIO21 (datos OUT) |
| `GAIN` | sin conectar (9 dB por defecto) |
| `SD`   | sin conectar (amp activo, mezcla mono) |
| `+ / -`| a la **bocina** 3W (+ y −) |

El bus I2S es full-duplex: mic y amp **comparten** BCLK (GPIO18) y
LRC/WS (GPIO19); el dato del mic entra por GPIO20 y el del amp sale por
GPIO21. Es correcto que esos dos relojes vayan a ambas placas.

> 🖼️ Diagrama visual: `wiring_diagram.png` / `wiring_diagram.svg` en esta
> misma carpeta (ábrelos con doble clic o en el navegador).

### Paso 0.1 — Armar los rieles en la mini protoboard

Una protoboard trae a los lados dos líneas largas (una marcada **+** y
otra **−**); todo lo que pinches en una misma línea queda conectado
entre sí. Crearemos 3 buses:

- **Lado A, línea + = RIEL 5V**
- **Lado B, línea + = RIEL 3.3V**
- **Las dos líneas − = RIEL GND** (une las dos líneas − con un cable
  para tener una sola masa común; la masa común es obligatoria).

Orden de armado (primero energía, luego señales):

1. **LX-LCBST `VO+` → RIEL 5V** · **`VO−` → RIEL GND**.
   `B+/B−` a la LiPo. Aún **no** conectes USB-C.
2. Cable **Pi pin 2 → RIEL 5V** y **Pi pin 6 → RIEL GND**
   (así se alimenta la Pi). ⚠️ No conectes a la vez el USB de la Pi.
3. Cable **Pi pin 1 (3V3) → RIEL 3.3V**.
4. Del **RIEL 3.3V** salen 3 cables: LCD `VCC`, LCD `LCD_BL`,
   INMP441 `VDD`.
5. Del **RIEL GND** salen: LCD `GND`, INMP441 `GND`, INMP441 `L/R`,
   MAX98357A `GND`.
6. **MAX98357A `Vin`**: cable directo a **Pi pin 4 (5V)** (o al RIEL 5V).
7. **Señales = cable directo Pi→módulo, NO pasan por rieles:**
   I2S (pin12, 35, 38, 40) y SPI de la pantalla (pin19, 23, 24, 18, 22)
   tal cual el diagrama.
8. Revisa todo dos veces. Recién entonces conecta el USB-C del LX-LCBST.

Consejo: cables de señal cortos y del mismo color por función (sigue la
leyenda del diagrama) para depurar fácil.

---

## Paso 1 — Preparar la MicroSD (Raspberry Pi Imager)

1. Instala **Raspberry Pi Imager** (raspberrypi.com/software) en tu PC.
2. Abre Imager:
   - **Dispositivo:** Raspberry Pi Zero 2 W.
   - **Sistema Operativo:** `Raspberry Pi OS (other)` →
     **`Raspberry Pi OS Lite (32-bit)`**.
     - La Zero 2 W soporta 64-bit, pero con 512 MB de RAM el **32-bit
       consume menos memoria**; lo usamos por eso (y porque ya trae
       wheels armv7 para todo lo que necesitamos).
     - "Lite" = sin escritorio (headless, más rápido en 512 MB).
   - **Almacenamiento:** tu MicroSD.
3. Pulsa **Siguiente**. Cuando pregunte *“¿Aplicar ajustes de
   personalización del SO?”* → **Editar ajustes**:
   - Pestaña **General:**
     - **Hostname:** `botchi`
     - **Habilitar nombre de usuario y contraseña:** usuario `botchi`,
       contraseña (elígela y anótala — la usarás en SSH).
     - **Configurar LAN inalámbrica:**
       - SSID y contraseña de tu Wi-Fi.
       - ⚠️ **La Pi Zero 2 W solo ve Wi-Fi de 2.4 GHz**, NO 5 GHz. Si tu
         red es doble banda, conéctala a la de 2.4 GHz (a veces se llama
         “…-2G”). Este es el error nº1 de principiantes.
       - **País de LAN inalámbrica: `MX`** (sin país la Wi-Fi no enciende).
     - **Ajustes regionales:** zona horaria `America/Mexico_City`,
       teclado `es`.
   - Pestaña **Servicios:** marca **Habilitar SSH** → **Usar contraseña
     para autenticar**.
   - Pestaña **Opciones:** deja lo predeterminado.
   - **Guardar** → **Sí** (aplicar ajustes) → **Sí** (confirmar borrado).
     Espera a que escriba y verifique (~5–10 min).
4. Al terminar, **expulsa** la SD del PC e insértala en la Pi (contactos
   dorados hacia la placa, hasta el fondo).

---

## Paso 1.5 — Primer arranque (SOLO SD + corriente, sin módulos)

> 🔑 Regla de oro: para el primer arranque **no conectes nada más**: ni
> pantalla, ni mic, ni amplificador, ni la batería/LX-LCBST. Solo la SD y
> una fuente de 5V conocida. Primero que arranque y entre por SSH; el
> hardware se cablea después (Paso 3+).

La Pi Zero 2 W tiene **dos micro-USB**:
- El del borde, marcado **PWR IN** → **aquí va la corriente**.
- El de en medio (**USB**) → datos/OTG, NO lo uses para alimentar.

1. Con un **cargador de celular 5V** y un cable micro-USB, conecta el
   puerto **PWR IN**. (Un cargador de 5V/1A o más; un puerto USB de PC
   también sirve para esta prueba.)
2. El LED verde parpadea: está arrancando. El **primer** arranque tarda
   **2–3 min** (expande el sistema y se conecta al Wi-Fi). No lo
   desconectes durante ese tiempo.
3. No necesitas monitor ni teclado: es *headless*, entras por red (SSH).

(Más adelante, cuando todo funcione, se cambia esta fuente por el
LX-LCBST + batería del Paso 0.)

---

## Paso 2 — Conexión por SSH (headless)

Desde tu PC, en la **misma red Wi-Fi** (en Windows abre **PowerShell** o
**Windows Terminal**; en Mac/Linux, la Terminal):

```bash
ssh botchi@botchi.local
```

- Primera vez: pregunta *“Are you sure… (yes/no)”* → escribe `yes`.
  Luego pide la contraseña que pusiste en Imager (al teclearla no se ve
  nada, es normal).
- **Si `botchi.local` no resuelve** (típico en Windows): entra a tu
  router (192.168.1.1 / 192.168.0.1) → lista de dispositivos → copia la
  IP del equipo `botchi` y usa `ssh botchi@<IP>` (ej. `ssh botchi@192.168.1.50`).
- **Si “Connection refused / no route”**: la Pi aún arranca (espera 1
  min más) o el Wi-Fi no conectó (revisa que pusiste red **2.4 GHz** y
  país `MX` en Imager; si no, re-graba la SD).

Actualiza el sistema:

```bash
sudo apt update && sudo apt full-upgrade -y
```

---

## Paso 3 — Activar I2S (audio) y SPI (pantalla)

Edita el `config.txt` (en Bookworm está en `/boot/firmware/`):

```bash
sudo nano /boot/firmware/config.txt
```

Añade al final (o usa el archivo `config.txt.snippet` de esta carpeta):

```ini
# --- Botchi ---
dtparam=spi=on
dtparam=i2s=on
# Audio onboard fuera para no chocar con I2S
dtparam=audio=off
# Soundcard I2S que da MIC-IN + AMP-OUT a la vez (INMP441 + MAX98357A)
dtoverlay=googlevoicehat-soundcard
```

Guarda (Ctrl+O, Enter, Ctrl+X) y reinicia:

```bash
sudo reboot
```

Reconecta por SSH y verifica que el sistema vea la tarjeta I2S:

```bash
aplay -l      # debe listar: snd_rpi_googlevoicehat_soundcard (playback)
arecord -l    # debe listar la misma tarjeta (capture)
ls /dev/spidev0.*   # spidev0.0 y spidev0.1 = SPI activo
```

### Audio por defecto → la tarjeta I2S

Copia el `asound.conf` de esta carpeta a `/etc/asound.conf`:

```bash
sudo cp asound.conf /etc/asound.conf
```

(Si tu tarjeta no es `card 0`, ajusta el número según `aplay -l`.)

### Probar el HARDWARE antes del código

Bocina (debes oír ruido blanco):

```bash
speaker-test -t wav -c 2 -l 1
```

Micrófono (graba 5 s y reprodúcelo; di algo):

```bash
arecord -f S16_LE -r 16000 -c 1 -d 5 /tmp/mic.wav
aplay /tmp/mic.wav
```

Si la grabación está muy baja (el INMP441 graba flojo), súbele volumen:

```bash
sox /tmp/mic.wav /tmp/mic_loud.wav vol 8 ; aplay /tmp/mic_loud.wav
```

---

## Paso 4 — Librerías de software

```bash
sudo apt install -y python3-venv python3-pip git alsa-utils sox \
  libsox-fmt-all mpg123 python3-requests python3-numpy python3-spidev \
  python3-pil python3-rpi.gpio python3-gpiozero python3-lgpio
```

Entorno virtual (Bookworm exige venv; `--system-site-packages` reusa el
numpy/spidev/pillow de apt: en la Zero 2 W pip también podría
compilarlos, pero apt es instantáneo y ahorra RAM):

```bash
mkdir -p ~/botchi && cd ~/botchi
# copia aquí botchi.py, requirements.txt, display_test.py
python3 -m venv --system-site-packages .venv
source .venv/bin/activate
pip install -r requirements.txt        # gTTS (puro Python, sin compilar)
```

> Por qué REST y no el SDK oficial: en la Zero 2 W el SDK **sí** instala
> (ya hay wheels armv7), pero arrastra `pydantic`, `httpx`, etc. — más
> RAM y arranque más lento en una placa de 512 MB. La **API REST con
> `requests`** hace exactamente lo mismo con una fracción del peso, así
> que la mantenemos a propósito.

### API Key de Gemini

Consíguela en aistudio.google.com/apikey y déjala como variable de
entorno (añádela también a `~/.bashrc` para que persista):

```bash
echo 'export GEMINI_API_KEY="TU_API_KEY"' >> ~/.bashrc
source ~/.bashrc
```

---

## Paso 5 — Ejecutar el primer ciclo de voz

```bash
cd ~/botchi && source .venv/bin/activate
python botchi.py
```

- Pulsa **ENTER**, habla 5 segundos (una pregunta, p. ej. *“¿por qué el
  cielo es azul?”*).
- El script: graba → mide el nivel del micrófono (valida que “te
  escuchó”) → manda el audio a Gemini con el prompt mayéutico → Gemini
  responde con analogías y contrapreguntas → se reproduce por la bocina.
- `Ctrl+C` para salir.

---

## Paso 6 (opcional) — Probar la pantalla GC9A01

```bash
python display_test.py
```

Debe mostrar un círculo de color y texto. Si falla, revisa SPI
(`ls /dev/spidev0.*`) y el cableado DC/RES/CS.

---

## Paso 7 — Conectar al dashboard del padre (OTA)

Esto **no necesita hardware** — es solo red. La Pi se conecta a
`https://botchi-one.vercel.app`, se reporta "en línea" y recibe los
cambios que el padre hace en la web (nombre, módulos…) sin cables.

1. Guarda el **device_token** de esta Pi (es su credencial secreta). En
   la Pi:
   ```bash
   mkdir -p ~/botchi
   echo '{"device_token": "PEGA_AQUI_TU_TOKEN"}' > ~/botchi/device.json
   ```
   (o `export BOTCHI_DEVICE_TOKEN="..."` en `~/.bashrc`).
2. Copia `botchi_ota.py` a `~/botchi/` y pruébalo una vez:
   ```bash
   cd ~/botchi && python3 botchi_ota.py --once
   ```
   Verás algo como:
   `✓ en línea · vinculado: NO · config v2 · 'Botchi' · módulos: core_conversation`
3. **Vincula la Pi a tu cuenta:** entra a `https://botchi-one.vercel.app`,
   inicia sesión y usa el **código de vinculación** de esta Pi. Vuelve a
   correr `--once`: ahora dirá `vinculado: SÍ`.
4. Déjalo corriendo en bucle (sondea cada 60 s):
   ```bash
   python3 botchi_ota.py
   ```
   Cambia el nombre o activa un módulo en la web → en segundos la Pi
   imprime `🆕 EVOLUCIONÉ: vX → vY`. Eso es el OTA funcionando.
5. La config aplicada queda en `~/botchi/botchi_config.json`. **`botchi.py`
   ya lo lee en cada turno**: el Botchi se presenta con su nombre, ajusta
   el idioma (es/en/bilingüe), el nivel por edad y la personalidad que el
   padre definió en la web. Cambias algo en el dashboard → el OTA actualiza
   el JSON → la siguiente pregunta el dispositivo ya "evolucionó".

---

## Paso 8 — Arranque automático (systemd)

Para que el cliente OTA inicie solo al encender la Pi y se reinicie si se
cae el Wi-Fi. Crea el servicio (un solo comando, lo escribe directo, sin
scp):

Una sola línea (pegar heredocs por SSH en Windows se corrompe):

```bash
printf '[Unit]\nDescription=Botchi OTA client\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=simple\nUser=botchi\nWorkingDirectory=/home/botchi/botchi\nExecStart=/usr/bin/python3 /home/botchi/botchi/botchi_ota.py\nRestart=always\nRestartSec=10\n\n[Install]\nWantedBy=multi-user.target\n' | sudo tee /etc/systemd/system/botchi-ota.service
```

Actívalo:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now botchi-ota.service
```

Comprobar / ver el log en vivo:

```bash
systemctl status botchi-ota --no-pager
journalctl -u botchi-ota -f      # Ctrl+C para salir del log
```

Desde ahora, cada vez que enciendas la Pi, el OTA arranca solo y mantiene
`botchi_config.json` al día. (Para detenerlo: `sudo systemctl disable
--now botchi-ota.service`.)

---

## Solución de problemas

| Síntoma | Causa / arreglo |
|---|---|
| `aplay -l` no muestra la tarjeta | Revisa `config.txt`, reinicia. Prueba `dtoverlay=hifiberry-dac` (solo salida) para aislar. |
| No graba nada | INMP441 a **3.3V**, L/R a GND, SD→pin38. Sube `vol` con `sox`. |
| Gemini responde error 400/403 | API key inválida o sin `GEMINI_API_KEY` exportada. |
| Respuesta lenta | Casi todo es red (subir audio + Gemini + bajar voz). Clips de 5 s y `gemini-2.5-flash`. La Zero 2 W procesa local rápido. |
| Gemini `429 limit: 0` | Ese modelo no tiene free tier en tu cuenta/región. Usa `gemini-2.5-flash` (no `gemini-2.0-flash`). |
| `botchi.local` no resuelve | Usa la IP del router o instala Bonjour (Windows). |
| OTA: `Token inválido` | El `device_token` no coincide. Revisa `~/botchi/device.json`. |
| OTA: siempre `vinculado: NO` | Falta vincular el código en `botchi-one.vercel.app` con tu sesión iniciada. |
| OTA: `sin red` | La Pi sin internet (Wi-Fi 2.4 GHz) o el sitio caído. |

## Paso 9 — Botón físico + carita (opcional, ya en código)

`botchi.py` detecta solo (sin romperse si no están):

- **Carita animada** (`face.py`): si la pantalla GC9A01 está cableada
  (Paso 0), muestra estados — idle/parpadeo, escuchando, pensando,
  hablando. Pruébala sola: `python3 face.py`.
- **Botón "pulsa para hablar"**: conecta un push-button entre
  **GPIO16 (pin 36)** y un **GND** (pin 34). Sin botón, sigue usando
  ENTER por SSH. Cambia el pin con `BOTCHI_BUTTON_GPIO=NN`.

No requieren configuración: al correr `botchi.py` imprime si detectó
pantalla y botón; si no, sigue en modo audio + ENTER.

---

Siguiente fase: enclosure/3D, gestión de batería, y afinar la carita
pixel-art. La base de software ya está completa.
