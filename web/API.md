# Botchi — API del Dispositivo (OTA)

Esta API es la que consumirá el **firmware del Botchi** (Python en la Raspberry
Pi). Hoy no existe hardware: estos endpoints están listos y documentados para
cuando se conecte el dispositivo. La app web de padres NO usa esta API (usa
Supabase directo con sesión del padre).

Base URL (local): `http://localhost:3000`
Base URL (prod): `https://<tu-deploy>.vercel.app`

## Modelo de vinculación

1. En fábrica, cada Botchi se provisiona con dos valores:
   - `pairing_code` — código corto impreso en el empaque (ej. `BOT-A1B2C3`).
   - `device_token` — secreto largo guardado en el firmware. **Es la credencial
     del dispositivo**; nunca se muestra al padre.
2. El **padre** escribe el `pairing_code` en la web → su cuenta reclama el
   dispositivo (`devices.parent_id`).
3. El **dispositivo** se autentica siempre con `device_token` (header
   `Authorization: Bearer <token>` o campo `token` en el body).

## OTA: cómo evoluciona el Botchi

`devices.config_version` sube +1 automáticamente cada vez que el padre cambia
la identidad o los módulos. El firmware debe:

1. Llamar `POST /api/device/config` periódicamente (p. ej. cada arranque y cada
   N minutos).
2. Comparar `config_version` con el último aplicado.
3. Si cambió, aplicar la nueva `identity` + `modules` (¡eso es la evolución!).

---

## Endpoints

### `POST /api/device/config`
Devuelve la configuración completa del Botchi (identidad + módulos activos).
También actualiza `last_seen`.

Request:
```json
{ "token": "<device_token>" }
```

Response `200`:
```json
{
  "device_id": "uuid",
  "paired": true,
  "config_version": 4,
  "identity": {
    "name": "Robo",
    "personality": "curious",
    "mood": "happy",
    "avatar_palette": "mint",
    "voice": "soft",
    "age_level": "semilla",
    "language": "bilingual"
  },
  "modules": ["core_conversation", "bilingual_immersion"]
}
```
Errores: `401 { "error": "MISSING_TOKEN" | "INVALID_TOKEN" }`

### `POST /api/device/heartbeat`
Reporta que el dispositivo está vivo y su versión de firmware.

Request:
```json
{ "token": "<device_token>", "firmware": "1.0.3" }
```
Response `200`:
```json
{ "ok": true, "config_version": 4 }
```

### `POST /api/device/progress`
El dispositivo empuja telemetría de aprendizaje. `words/minutes/sessions` se
suman al total del día. `interests` y `heatmap` hacen upsert.

Request:
```json
{
  "token": "<device_token>",
  "words": 12,
  "minutes": 25,
  "sessions": 1,
  "interests": [{ "topic": "dinosaurios", "weight": 0.8 }],
  "heatmap": [{ "category": "Lógica", "score": 72 }]
}
```
Response `200`: `{ "ok": true }`

---

## Notas de seguridad

- Toda la lógica vive en funciones Postgres `SECURITY DEFINER` que validan el
  `device_token`. La API solo usa la llave pública (`anon`); no se necesita la
  `service_role` en el servidor.
- RLS garantiza que un padre solo ve/edita sus propios dispositivos.

## Provisionar dispositivos de prueba (sin hardware)

Para probar el flujo de vinculación sin un Botchi físico, inserta filas en
`devices` (Supabase SQL editor):

```sql
insert into public.devices (pairing_code, hardware_label)
values ('BOT-TEST01', 'Botchi Beta #1')
returning pairing_code, device_token;
```

El trigger crea automáticamente la identidad y el módulo base. Usa el
`pairing_code` en la web para vincularlo, y el `device_token` para probar la
API del dispositivo con `curl`/Postman.
