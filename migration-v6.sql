-- Lito Lab · migración v6 (ejecutar en Supabase → SQL Editor → Run)
-- FEAT-018 privilegios reales para la cuenta admin · TECH-003 ranking validado en servidor.
--
-- Qué cambia:
--   1) `is_admin()`: una sola fuente de verdad sobre el rol, en el servidor.
--   2) El guard recorta en el ranking lo que el tiempo jugado no puede sostener (TECH-003).
--   3) Un admin puede leer la ficha de cualquier jugador y su partida, dar recursos y
--      conceder el rol. Todo por función `security definer` con comprobación de rol:
--      la API pública sigue sin poder tocar `is_admin` ni leer filas ajenas.

-- 1) Rol ------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_admin from public.players p where p.id = auth.uid()), false);
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 2) TECH-003: la puntuación pública no puede superar lo que el juego acreditado sostiene.
--    El tiempo que cuenta para el ranking ya no es el `stats.time` que manda el navegador
--    (falsificable de una tacada), sino un crédito que lleva el servidor: crece con el
--    reloj real, como mucho 15 min por guardado y 6 h por día natural. No se rechaza el
--    guardado —un falso positivo no debe costarle la partida a nadie—: se recorta lo que
--    se publica y se deja anotado. El `save` del jugador queda intacto.
--    Márgenes: el jugador más rápido medido va a ~30 s/zona, ~19 s/nivel y ~430 s/renacer;
--    aquí se admite el triple de velocidad (10 s/zona, 6 s/nivel, 120 s/renacer).
alter table public.players
  add column if not exists score_capped boolean not null default false,
  add column if not exists cheat_note text,
  add column if not exists played_credit numeric,
  add column if not exists credit_day date,
  add column if not exists credit_today numeric not null default 0;

-- Backfill: el histórico se da por bueno. Hay que desactivar el guard de versión
-- (FEAT-001), que exige que cada escritura suba `save_version`.
alter table public.players disable trigger players_version_guard_trg;
alter table public.players disable trigger players_guard_trg;
update public.players
   set played_credit = coalesce(played_credit, greatest(0, coalesce((save->'stats'->>'time')::numeric, 0)))
 where played_credit is null;
alter table public.players enable trigger players_guard_trg;
alter table public.players enable trigger players_version_guard_trg;

create or replace function public.players_guard() returns trigger language plpgsql as $$
declare
  declarado numeric; anterior numeric; delta numeric; real_s numeric; credito numeric;
  hoy date := current_date; usado numeric; cupo numeric := 21600; tope_guardado numeric := 900;
  z int; l int; r int;
begin
  new.max_zone := greatest(1, coalesce((new.save->>'maxZoneEver')::int, (new.save->>'maxZone')::int, 1));
  new.rebirths := greatest(0, coalesce((new.save->>'rebirths')::int, 0));
  new.level := greatest(1, coalesce((new.save->>'level')::int, 1));
  new.updated_at := now();
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then new.is_admin := false;
    else new.is_admin := coalesce(old.is_admin, false); end if;
  end if;
  if tg_op = 'UPDATE' and new.save is distinct from old.save then
    new.save_prev := old.save; new.prev_updated_at := old.updated_at;
  end if;

  declarado := greatest(0, coalesce((new.save->'stats'->>'time')::numeric, 0));

  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.played_credit := least(declarado, 300);
      new.credit_day := hoy; new.credit_today := new.played_credit;
    else
      anterior := greatest(0, coalesce((old.save->'stats'->>'time')::numeric, 0));
      delta := greatest(0, declarado - anterior);
      real_s := greatest(0, extract(epoch from (now() - old.updated_at)));
      usado := case when old.credit_day = hoy then coalesce(old.credit_today, 0) else 0 end;
      -- El juego sube su partida cada 30 s: un solo guardado nunca acredita una sesión
      -- entera, por mucho tiempo real que haya pasado desde el anterior.
      credito := least(delta, least(real_s, tope_guardado) + 90, greatest(0, cupo - usado));
      new.played_credit := coalesce(old.played_credit, anterior) + credito;
      new.credit_day := hoy; new.credit_today := usado + credito;
    end if;
  else
    new.played_credit := coalesce(new.played_credit, case when tg_op = 'UPDATE' then old.played_credit end, declarado);
  end if;

  new.score_capped := false; new.cheat_note := null;
  if current_user in ('authenticated', 'anon') and not coalesce(new.is_admin, false) then
    z := least(new.max_zone, 3 + floor(coalesce(new.played_credit, 0)/10));
    l := least(new.level, 3 + floor(coalesce(new.played_credit, 0)/6));
    r := least(new.rebirths, 1 + floor(coalesce(new.played_credit, 0)/120));
    if z < new.max_zone or l < new.level or r < new.rebirths then
      new.score_capped := true;
      new.cheat_note := format('recortado a zona %s, nivel %s, renaceres %s con %s s de juego acreditados',
                               z, l, r, round(coalesce(new.played_credit, 0)));
      new.max_zone := z; new.level := l; new.rebirths := r;
    end if;
  end if;
  new.score := new.max_zone*1000 + new.rebirths*250 + new.level;
  return new;
end $$;
drop trigger if exists players_guard_trg on public.players;
create trigger players_guard_trg before insert or update on public.players
  for each row execute function public.players_guard();

-- 3) FEAT-018: lectura de fichas ajenas, solo para admins ------------------
drop function if exists public.admin_players();
create function public.admin_players()
returns table (
  id uuid, name text, score bigint, max_zone int, rebirths int, level int,
  is_admin boolean, updated_at timestamptz, score_capped boolean, cheat_note text,
  gold numeric, souls numeric, tiempo numeric, credito numeric, kills numeric, clicks numeric,
  jefes numeric, oro_total numeric, objetos int, mascotas int, trofeos int
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.name, p.score, p.max_zone, p.rebirths, p.level,
         p.is_admin, p.updated_at, p.score_capped, p.cheat_note,
         (p.save->>'gold')::numeric, (p.save->>'souls')::numeric,
         (p.save->'stats'->>'time')::numeric, p.played_credit,
         (p.save->'stats'->>'kills')::numeric,
         (p.save->'stats'->>'clicks')::numeric, (p.save->'stats'->>'bosses')::numeric,
         (p.save->'stats'->>'gold')::numeric,
         jsonb_array_length(coalesce(p.save->'inv', '[]'::jsonb)),
         jsonb_array_length(coalesce(p.save->'pets', '[]'::jsonb)),
         jsonb_array_length(coalesce(p.save->'trophies', '[]'::jsonb))
  from public.players p
  where public.is_admin()
  order by p.score desc;
$$;
revoke all on function public.admin_players() from public, anon;
grant execute on function public.admin_players() to authenticated;

create or replace function public.admin_player_save(target uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when public.is_admin()
              then (select p.save from public.players p where p.id = target) end;
$$;
revoke all on function public.admin_player_save(uuid) from public, anon;
grant execute on function public.admin_player_save(uuid) to authenticated;

-- 4) FEAT-018: dar recursos a un jugador. Solo toca oro y almas del `save`; ni la zona
--    ni el nivel, para no falsear el ranking desde la administración. Sube `save_version`
--    para que la sesión del jugador detecte el cambio y recargue en vez de pisarlo.
create or replace function public.admin_grant(target uuid, oro numeric default 0, almas numeric default 0)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare fila public.players%rowtype; g numeric; a numeric;
begin
  if not public.is_admin() then raise exception 'solo administración'; end if;
  select * into fila from public.players where id = target;
  if not found then raise exception 'jugador no encontrado'; end if;
  g := greatest(0, coalesce((fila.save->>'gold')::numeric, 0) + coalesce(oro, 0));
  a := greatest(0, coalesce((fila.save->>'souls')::numeric, 0) + coalesce(almas, 0));
  update public.players
     set save = jsonb_set(jsonb_set(save, '{gold}', to_jsonb(g)), '{souls}', to_jsonb(a)),
         save_version = coalesce(save_version, 0) + 1
   where id = target;
  return jsonb_build_object('gold', g, 'souls', a);
end $$;
revoke all on function public.admin_grant(uuid, numeric, numeric) from public, anon;
grant execute on function public.admin_grant(uuid, numeric, numeric) to authenticated;

-- 5) FEAT-018: conceder o retirar el rol. Nadie puede retirárselo a sí mismo,
--    para que el proyecto no se quede sin ninguna cuenta de administración.
create or replace function public.admin_set_role(target uuid, valor boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'solo administración'; end if;
  if target = auth.uid() and valor is false then raise exception 'no puedes retirarte el rol a ti mismo'; end if;
  update public.players set is_admin = valor where id = target;
  if not found then raise exception 'jugador no encontrado'; end if;
  return valor;
end $$;
revoke all on function public.admin_set_role(uuid, boolean) from public, anon;
grant execute on function public.admin_set_role(uuid, boolean) to authenticated;
