-- =====================================================================
-- Botchi · rate limiting para los endpoints públicos
-- ---------------------------------------------------------------------
-- Problema que resuelve: /api/demo (Gemini), /api/tts (ElevenLabs) y
-- /api/reservar no tenían límite. Cualquiera con `curl` podía vaciar la
-- cuota de las APIs de paga o llenar la tabla `reservas` de basura.
--
-- Diseño: ventana fija. Una fila por (bucket, sujeto, ventana). El
-- INSERT ... ON CONFLICT DO UPDATE es atómico, así que dos peticiones
-- simultáneas no pueden saltarse el conteo.
--
-- La tabla vive bajo RLS SIN políticas: `anon` no la puede leer ni
-- escribir directo. El único acceso es por esta función SECURITY
-- DEFINER, igual que `crear_reserva` y `device_config`.
--
-- Cómo aplicar: correr este archivo en el SQL editor de Supabase
-- (proyecto botchi). Es idempotente.
-- =====================================================================

create table if not exists public.rate_limit_hits (
  bucket       text        not null,
  subject      text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (bucket, subject, window_start)
);

alter table public.rate_limit_hits enable row level security;
-- Sin políticas a propósito: nadie toca esta tabla salvo el RPC de abajo.

-- Para el barrido de ventanas viejas.
create index if not exists rate_limit_hits_window_idx
  on public.rate_limit_hits (window_start);

-- ---------------------------------------------------------------------
-- rate_limit_hit: cuenta un golpe y dice si sigue dentro del límite.
-- Devuelve true = permitido, false = pasado del límite.
-- ---------------------------------------------------------------------
create or replace function public.rate_limit_hit(
  p_bucket         text,
  p_subject        text,
  p_window_seconds integer,
  p_max            integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subject text;
  v_window  timestamptz;
  v_hits    integer;
begin
  -- Parámetros absurdos => negar. Nunca fallar abierto aquí dentro.
  if p_window_seconds is null or p_window_seconds <= 0
     or p_max is null or p_max <= 0
     or p_bucket is null or p_subject is null then
    return false;
  end if;

  v_subject := left(p_subject, 100);

  -- Inicio de la ventana fija actual: floor(epoch / ancho) * ancho.
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limit_hits (bucket, subject, window_start, hits)
  values (p_bucket, v_subject, v_window, 1)
  on conflict (bucket, subject, window_start)
  do update set hits = public.rate_limit_hits.hits + 1
  returning hits into v_hits;

  -- Barrido oportunista (~1 de cada 100 llamadas) para que la tabla no
  -- crezca sin fin. Un cron de pg_cron sería más limpio; esto no
  -- necesita extensiones.
  if random() < 0.01 then
    delete from public.rate_limit_hits
    where window_start < now() - interval '2 days';
  end if;

  return v_hits <= p_max;
end;
$$;

revoke all on function public.rate_limit_hit(text, text, integer, integer) from public;
grant execute on function public.rate_limit_hit(text, text, integer, integer)
  to anon, authenticated;

-- Verificación rápida: dos golpes con máximo 1 => true, luego false.
-- select public.rate_limit_hit('test', 'x', 60, 1);  -- t
-- select public.rate_limit_hit('test', 'x', 60, 1);  -- f
