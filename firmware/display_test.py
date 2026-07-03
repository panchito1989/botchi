#!/usr/bin/env python3
"""
Prueba mínima de la pantalla redonda GC9A01 (240x240, SPI).

Driver autocontenido: solo usa spidev + RPi.GPIO + PIL (todo desde apt,
sin compilar nada en ARMv6). Cableado:
  SCL->pin23  SDA->pin19  RES->pin22(GPIO25)  DC->pin18(GPIO24)
  CS->pin24(SPI0 CE0)  VCC->3V3  GND->GND
Si la pantalla queda negra pero no hay error: conecta el pin BL del
módulo a 3.3V (la retroiluminación no está cableada).
"""

import time

import numpy as np
import spidev
import RPi.GPIO as GPIO
from PIL import Image, ImageDraw, ImageFont

DC_PIN = 24      # BCM (pin físico 18)
RST_PIN = 25     # BCM (pin físico 22)
W = H = 240

spi = spidev.SpiDev()
spi.open(0, 0)            # bus 0, CE0
spi.max_speed_hz = 24_000_000
spi.mode = 0

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(DC_PIN, GPIO.OUT)
GPIO.setup(RST_PIN, GPIO.OUT)


def cmd(c):
    GPIO.output(DC_PIN, 0)
    spi.writebytes([c])


def data(d):
    GPIO.output(DC_PIN, 1)
    if isinstance(d, int):
        d = [d]
    for i in range(0, len(d), 4096):
        spi.writebytes(list(d[i:i + 4096]))


def reset():
    GPIO.output(RST_PIN, 1); time.sleep(0.05)
    GPIO.output(RST_PIN, 0); time.sleep(0.05)
    GPIO.output(RST_PIN, 1); time.sleep(0.12)


INIT = [
    (0xEF, []), (0xEB, [0x14]), (0xFE, []), (0xEF, []),
    (0xEB, [0x14]), (0x84, [0x40]), (0x85, [0xFF]), (0x86, [0xFF]),
    (0x87, [0xFF]), (0x88, [0x0A]), (0x89, [0x21]), (0x8A, [0x00]),
    (0x8B, [0x80]), (0x8C, [0x01]), (0x8D, [0x01]), (0x8E, [0xFF]),
    (0x8F, [0xFF]), (0xB6, [0x00, 0x20]), (0x36, [0x08]),
    (0x3A, [0x05]),  # 16-bit RGB565
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


def init():
    reset()
    for c, d in INIT:
        cmd(c)
        if d:
            data(d)
        if d is None:
            time.sleep(0.12)
    time.sleep(0.05)


def show(img):
    cmd(0x2A); data([0x00, 0x00, 0x00, W - 1])
    cmd(0x2B); data([0x00, 0x00, 0x00, H - 1])
    cmd(0x2C)
    arr = np.array(img.convert("RGB"), dtype=np.uint16)
    r = (arr[..., 0] >> 3) << 11
    g = (arr[..., 1] >> 2) << 5
    b = arr[..., 2] >> 3
    rgb = (r | g | b).astype(">u2").tobytes()
    GPIO.output(DC_PIN, 1)
    for i in range(0, len(rgb), 4096):
        spi.writebytes(list(rgb[i:i + 4096]))


def main():
    print("Inicializando GC9A01…")
    init()
    img = Image.new("RGB", (W, H), (16, 18, 28))
    d = ImageDraw.Draw(img)
    d.ellipse((10, 10, 230, 230), outline=(20, 184, 166), width=6)
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except OSError:
        font = ImageFont.load_default()
    d.text((58, 95), "Botchi", fill=(255, 255, 255), font=font)
    d.text((52, 135), "pantalla OK", fill=(20, 184, 166), font=font)
    show(img)
    print("✅ Si ves el círculo y el texto, la pantalla funciona.")
    time.sleep(8)
    GPIO.cleanup()


if __name__ == "__main__":
    main()
