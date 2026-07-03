#!/usr/bin/env python3
"""
Botchi — cliente OTA (conexión al dashboard del padre).

Qué hace, en bucle:
  1. heartbeat  -> avisa al servidor que esta Pi está viva (+ firmware).
  2. config     -> pregunta identidad + módulos + config_version.
  3. si config_version subió (el padre cambió algo en la web) -> aplica
     la nueva config localmente y lo anuncia ("evolucioné").

No necesita hardware: es solo red. Funciona contra el sitio real
(https://botchi-one.vercel.app). Pesa casi nada (requests + stdlib).

Credencial: el `device_token` (secreto). Se lee de la variable de
entorno BOTCHI_DEVICE_TOKEN o de ~/botchi/device.json.
"""

import argparse
import json
import os
import socket
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

FIRMWARE_VERSION = "0.1.0-ota"
DEFAULT_API_BASE = "https://botchi-one.vercel.app"
HOME = Path.home() / "botchi"
DEVICE_FILE = HOME / "device.json"
STATE_FILE = HOME / "botchi_config.json"


def load_settings():
    """Token + api_base desde env o ~/botchi/device.json."""
    token = os.environ.get("BOTCHI_DEVICE_TOKEN", "").strip()
    api_base = os.environ.get("BOTCHI_API_BASE", "").strip()

    if (not token or not api_base) and DEVICE_FILE.exists():
        try:
            d = json.loads(DEVICE_FILE.read_text())
            token = token or d.get("device_token", "").strip()
            api_base = api_base or d.get("api_base", "").strip()
        except (ValueError, OSError):
            pass

    api_base = (api_base or DEFAULT_API_BASE).rstrip("/")
    poll = int(os.environ.get("BOTCHI_POLL_SECONDS", "60"))
    return token, api_base, poll


def ts():
    return datetime.now().strftime("%H:%M:%S")


def api_post(api_base, path, payload):
    """Devuelve (ok: bool, data: dict|None, err: str|None)."""
    try:
        r = requests.post(f"{api_base}{path}", json=payload, timeout=30)
    except requests.RequestException as e:
        return False, None, f"sin red ({e.__class__.__name__})"
    if r.status_code != 200:
        try:
            msg = r.json().get("error", r.text[:120])
        except ValueError:
            msg = r.text[:120]
        return False, None, f"HTTP {r.status_code}: {msg}"
    try:
        return True, r.json(), None
    except ValueError:
        return False, None, "respuesta no-JSON"


def read_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except (ValueError, OSError):
            pass
    return {}


def write_state(cfg):
    HOME.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(cfg, indent=2, ensure_ascii=False))


def announce_change(old, new):
    print("\n  ┌─────────────────────────────────────────────")
    print(f"  │ 🆕 EVOLUCIONÉ: v{old.get('config_version', '?')} "
          f"→ v{new['config_version']}")
    oi, ni = old.get("identity", {}), new.get("identity", {})
    for k in ("name", "personality", "voice", "language", "age_level"):
        if oi.get(k) != ni.get(k):
            print(f"  │   {k}: {oi.get(k, '—')} → {ni.get(k)}")
    if old.get("modules") != new.get("modules"):
        print(f"  │   módulos: {', '.join(new.get('modules', []))}")
    print("  └─────────────────────────────────────────────\n")


def cycle(api_base, token, state):
    """Un ciclo: heartbeat + config. Devuelve el nuevo state."""
    ok, hb, err = api_post(api_base, "/api/device/heartbeat",
                           {"token": token, "firmware": FIRMWARE_VERSION})
    if not ok:
        if err and ("INVALID_TOKEN" in err or "HTTP 401" in err):
            print(f"[{ts()}] ❌ Token inválido. Revisa BOTCHI_DEVICE_TOKEN.")
            return state, "fatal"
        print(f"[{ts()}] ⚠  {err} — reintento en el próximo ciclo.")
        return state, "retry"

    ok, cfg, err = api_post(api_base, "/api/device/config",
                            {"token": token})
    if not ok:
        print(f"[{ts()}] ⚠  config: {err}")
        return state, "retry"

    paired = cfg.get("paired")
    ident = cfg.get("identity", {})
    mods = ", ".join(cfg.get("modules", [])) or "—"
    cv = cfg.get("config_version")

    print(f"[{ts()}] ✓ en línea · vinculado: "
          f"{'SÍ' if paired else 'NO'} · config v{cv} · "
          f"'{ident.get('name', '?')}' · módulos: {mods}")

    if not paired:
        print("           ↳ Aún no vinculado. Entra a "
              f"{api_base}, inicia sesión y vincula este Botchi "
              "con su código de vinculación.")

    if state.get("config_version") != cv:
        if state:
            announce_change(state, cfg)
        else:
            print(f"           ↳ Config inicial guardada (v{cv}).")
        write_state(cfg)
        state = cfg

    return state, "ok"


def main():
    # Salida UTF-8 robusta (la Pi ya es UTF-8; protege otras consolas).
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    ap = argparse.ArgumentParser(description="Botchi OTA client")
    ap.add_argument("--once", action="store_true",
                    help="un solo ciclo y salir (para pruebas)")
    args = ap.parse_args()

    token, api_base, poll = load_settings()
    print("=" * 56)
    print("  Botchi — cliente OTA")
    print(f"  Equipo: {socket.gethostname()} · firmware {FIRMWARE_VERSION}")
    print(f"  Servidor: {api_base}")
    print(f"  Token: {'OK' if token else 'FALTA'} · "
          f"sondeo cada {poll}s")
    print("=" * 56)

    if not token:
        print("\n❌ No hay device_token.\n"
              "   Opción A:  export BOTCHI_DEVICE_TOKEN=\"<tu_token>\"\n"
              f"   Opción B:  crea {DEVICE_FILE} con "
              '{"device_token": "<tu_token>"}\n')
        sys.exit(1)

    state = read_state()

    if args.once:
        cycle(api_base, token, state)
        return

    while True:
        try:
            state, status = cycle(api_base, token, state)
            if status == "fatal":
                sys.exit(1)
            time.sleep(poll)
        except KeyboardInterrupt:
            print("\n👋 OTA detenido.")
            return


if __name__ == "__main__":
    main()
