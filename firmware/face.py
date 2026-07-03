#!/usr/bin/env python3
"""
Botchi — carita animada en la pantalla redonda GC9A01 (240x240, SPI).

Uso desde botchi.py (opcional, tolerante a fallos):

    from face import FaceDisplay
    cara = FaceDisplay()          # si algo falla, lanza excepción → ignórala
    cara.estado("listening")      # idle | listening | thinking | speaking

No requiere nada que se compile en ARMv7: spidev + RPi.GPIO + PIL + numpy
(todo desde apt). Driver autocontenido (mismo init que display_test.py).
Cableado: SCL→pin23 SDA→pin19 RES→pin22(GPIO25) DC→pin18(GPIO24)
CS→pin24(CE0) BL→3.3V.
"""

import random
import time

import numpy as np
import spidev
import RPi.GPIO as GPIO
from PIL import Image, ImageDraw

DC_PIN, RST_PIN, W, H = 24, 25, 240, 240

# Colores por estado (fondo, "piel" de la cara)
THEME = {
    "idle":      ((12, 18, 28), (20, 184, 166)),
    "listening": ((10, 30, 28), (45, 212, 191)),
    "thinking":  ((30, 24, 8),  (224, 162, 51)),
    "speaking":  ((26, 14, 36), (139, 124, 200)),
    "sleep":     ((6, 8, 16),   (33, 92, 96)),
}

_INIT = [
    (0xEF, []), (0xEB, [0x14]), (0xFE, []), (0xEF, []), (0xEB, [0x14]),
    (0x84, [0x40]), (0x85, [0xFF]), (0x86, [0xFF]), (0x87, [0xFF]),
    (0x88, [0x0A]), (0x89, [0x21]), (0x8A, [0x00]), (0x8B, [0x80]),
    (0x8C, [0x01]), (0x8D, [0x01]), (0x8E, [0xFF]), (0x8F, [0xFF]),
    (0xB6, [0x00, 0x20]), (0x36, [0x08]), (0x3A, [0x05]),
    (0x90, [0x08, 0x08, 0x08, 0x08]), (0xBD, [0x06]), (0xBC, [0x00]),
    (0xFF, [0x60, 0x01, 0x04]), (0xC3, [0x13]), (0xC4, [0x13]),
    (0xC9, [0x22]), (0xBE, [0x11]), (0xE1, [0x10, 0x0E]),
    (0xDF, [0x21, 0x0C, 0x02]),
    (0xF0, [0x45, 0x09, 0x08, 0x08, 0x26, 0x2A]),
    (0xF1, [0x43, 0x70, 0x72, 0x36, 0x37, 0x6F]),
    (0xF2, [0x45, 0x09, 0x08, 0x08, 0x26, 0x2A]),
    (0xF3, [0x43, 0x70, 0x72, 0x36, 0x37, 0x6F]),
    (0xED, [0x1B, 0x0B]), (0xAE, [0x77]), (0xCD, [0x63]),
    (0x70, [0x07, 0x07, 0x04, 0x0E, 0x0F, 0x09, 0x07, 0x08, 0x03]),
    (0xE8, [0x34]),
    (0x62, [0x18, 0x0D, 0x71, 0xED, 0x70, 0x70, 0x18, 0x0F, 0x71, 0xEF,
            0x70, 0x70]),
    (0x63, [0x18, 0x11, 0x71, 0xF1, 0x70, 0x70, 0x18, 0x13, 0x71, 0xF3,
            0x70, 0x70]),
    (0x64, [0x28, 0x29, 0xF1, 0x01, 0xF1, 0x00, 0x07]),
    (0x66, [0x3C, 0x00, 0xCD, 0x67, 0x45, 0x45, 0x10, 0x00, 0x00, 0x00]),
    (0x67, [0x00, 0x3C, 0x00, 0x00, 0x00, 0x01, 0x54, 0x10, 0x32, 0x98]),
    (0x74, [0x10, 0x85, 0x80, 0x00, 0x00, 0x4E, 0x00]),
    (0x98, [0x3E, 0x07]), (0x35, []), (0x21, []),
    (0x11, None), (0x29, None),
]


class FaceDisplay:
    def __init__(self):
        self.spi = spidev.SpiDev()
        self.spi.open(0, 0)
        self.spi.max_speed_hz = 24_000_000
        self.spi.mode = 0
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        GPIO.setup(DC_PIN, GPIO.OUT)
        GPIO.setup(RST_PIN, GPIO.OUT)
        self._reset()
        for c, d in _INIT:
            self._cmd(c)
            if d:
                self._data(d)
            if d is None:
                time.sleep(0.12)
        time.sleep(0.05)
        self._last = None
        self._blink = False
        self.estado("idle")

    def _cmd(self, c):
        GPIO.output(DC_PIN, 0)
        self.spi.writebytes([c])

    def _data(self, d):
        GPIO.output(DC_PIN, 1)
        d = [d] if isinstance(d, int) else d
        for i in range(0, len(d), 4096):
            self.spi.writebytes(list(d[i:i + 4096]))

    def _reset(self):
        for v, t in ((1, 0.05), (0, 0.05), (1, 0.12)):
            GPIO.output(RST_PIN, v)
            time.sleep(t)

    def _push(self, img):
        self._cmd(0x2A); self._data([0, 0, 0, W - 1])
        self._cmd(0x2B); self._data([0, 0, 0, H - 1])
        self._cmd(0x2C)
        a = np.array(img.convert("RGB"), dtype=np.uint16)
        rgb = (((a[..., 0] >> 3) << 11) | ((a[..., 1] >> 2) << 5) |
               (a[..., 2] >> 3)).astype(">u2").tobytes()
        GPIO.output(DC_PIN, 1)
        for i in range(0, len(rgb), 4096):
            self.spi.writebytes(list(rgb[i:i + 4096]))

    def _push_region(self, img, x0, y0):
        """Envía una sub-imagen a la ventana (x0,y0)..(x0+w-1,y0+h-1).

        Permite redibujar solo un trozo de la pantalla (rápido).
        """
        w, h = img.size
        x1, y1 = x0 + w - 1, y0 + h - 1
        self._cmd(0x2A); self._data([x0 >> 8, x0 & 0xFF, x1 >> 8, x1 & 0xFF])
        self._cmd(0x2B); self._data([y0 >> 8, y0 & 0xFF, y1 >> 8, y1 & 0xFF])
        self._cmd(0x2C)
        a = np.array(img.convert("RGB"), dtype=np.uint16)
        rgb = (((a[..., 0] >> 3) << 11) | ((a[..., 1] >> 2) << 5) |
               (a[..., 2] >> 3)).astype(">u2").tobytes()
        GPIO.output(DC_PIN, 1)
        for i in range(0, len(rgb), 4096):
            self.spi.writebytes(list(rgb[i:i + 4096]))

    def boca(self, abierta):
        """Redibuja SOLO la boca para animar el habla (rápido, sin parpadeo).

        Llamar en bucle mientras Botchi reproduce su voz, alternando
        abierta=True/False, para que la boca se mueva con el audio.
        """
        skin = THEME["speaking"][1]
        img = Image.new("RGB", (48, 44), skin)
        d = ImageDraw.Draw(img)
        if abierta:
            d.ellipse((8, 6, 40, 38), fill=(15, 25, 25))
        else:
            d.ellipse((12, 19, 36, 29), fill=(15, 25, 25))
        self._push_region(img, 96, 144)

    def estado(self, state, mirada=0):
        """Dibuja la cara para el estado dado.

        mirada: corrimiento del brillo de los ojos (-6 izq .. 6 der) para
        que en reposo Botchi parezca mirar alrededor.
        """
        if state not in THEME:
            state = "idle"
        bg, skin = THEME[state]
        img = Image.new("RGB", (W, H), bg)
        d = ImageDraw.Draw(img)
        d.ellipse((30, 30, 210, 210), fill=skin)
        # antenas
        d.rectangle((112, 14, 120, 36), fill=skin)
        d.ellipse((104, 4, 128, 28), fill=skin)
        # ojos
        if state == "thinking":
            d.arc((78, 92, 110, 124), 200, 340, fill=(15, 25, 25), width=8)
            d.arc((130, 92, 162, 124), 200, 340, fill=(15, 25, 25), width=8)
        elif state == "sleep":
            # ojos cerrados (arcos suaves) — Botchi dormido
            d.arc((80, 102, 108, 126), 20, 160, fill=(15, 25, 25), width=7)
            d.arc((132, 102, 160, 126), 20, 160, fill=(15, 25, 25), width=7)
        elif self._blink and state == "idle":
            d.rectangle((80, 108, 108, 114), fill=(15, 25, 25))
            d.rectangle((132, 108, 160, 114), fill=(15, 25, 25))
        else:
            d.ellipse((80, 92, 108, 124), fill=(15, 25, 25))
            d.ellipse((132, 92, 160, 124), fill=(15, 25, 25))
            mx = max(-6, min(6, int(mirada)))
            d.ellipse((86 + mx, 98, 94 + mx, 106), fill=(255, 255, 255))
            d.ellipse((138 + mx, 98, 146 + mx, 106), fill=(255, 255, 255))
        # cachetes
        d.ellipse((66, 132, 92, 150), fill=(251, 113, 133))
        d.ellipse((148, 132, 174, 150), fill=(251, 113, 133))
        # boca por estado
        if state == "speaking":
            d.ellipse((104, 150, 136, 182), fill=(15, 25, 25))
        elif state == "listening":
            d.ellipse((110, 156, 130, 176), fill=(15, 25, 25))
        else:  # idle / thinking / sleep → sonrisa
            d.arc((96, 140, 144, 180), 20, 160, fill=(15, 25, 25), width=8)
        # "z z z" cuando duerme
        if state == "sleep":
            for zx, zy, zs in ((148, 64, 9), (164, 46, 12), (182, 24, 15)):
                d.line([(zx, zy), (zx + zs, zy),
                        (zx, zy + zs), (zx + zs, zy + zs)],
                       fill=(120, 200, 220), width=3)
        self._push(img)
        self._last = state

    def latido(self):
        """Parpadeo sutil en idle. Llama de vez en cuando."""
        if self._last == "idle":
            self._blink = True
            self.estado("idle")
            time.sleep(0.12)
            self._blink = False
            self.estado("idle")

    def dormir(self):
        """Botchi se duerme: ojos cerrados y 'z z z'."""
        self.estado("sleep")

    def despertar(self):
        """De dormido a despierto, con un parpadeo."""
        self.estado("sleep")
        time.sleep(0.12)
        self._blink = True
        self.estado("idle")
        time.sleep(0.12)
        self._blink = False
        self.estado("idle")

    def gesto_reposo(self):
        """Un gesto de 'estoy vivo' mientras espera: parpadea o mira de
        reojo. Llamar de vez en cuando durante el reposo."""
        if self._last not in ("idle", None):
            return
        g = random.choice(("parpadeo", "parpadeo", "izq", "der"))
        if g == "parpadeo":
            self.latido()
        else:
            self.estado("idle", mirada=-6 if g == "izq" else 6)
            time.sleep(0.7)
            self.estado("idle", mirada=0)

    def apagar(self):
        try:
            GPIO.cleanup()
        except Exception:
            pass


if __name__ == "__main__":
    f = FaceDisplay()
    for s in ("idle", "listening", "thinking", "speaking", "idle"):
        print("estado:", s)
        f.estado(s)
        time.sleep(2)
    print("prueba de habla (boca animada)…")
    f.estado("speaking")
    for i in range(14):
        f.boca(i % 2 == 0)
        time.sleep(0.16)
    print("prueba de reposo (gestos + dormir + despertar)…")
    f.estado("idle")
    for _ in range(4):
        time.sleep(1.3)
        f.gesto_reposo()
    f.dormir()
    time.sleep(3)
    f.despertar()
    time.sleep(1)
    f.apagar()
