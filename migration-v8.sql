-- Lito Lab · migración v8 (ejecutar en Supabase → SQL Editor → Run)
-- TECH-001 (auditoría de seguridad y rendimiento del backend).
--
--   1) `players_guard` corría con `search_path` mutable: una función o tabla creada en un
--      esquema por delante podía suplantar a las del sistema dentro del trigger. Se fija
--      a vacío; el cuerpo ya calificaba todo lo que usa.
--   2) Las tres políticas RLS evaluaban `auth.uid()` una vez por fila. Envolverlo en un
--      subselect lo deja en una sola evaluación por consulta.
--
-- Lo que la auditoría revisó y deja como está, a propósito:
--   · La vista `ranking` es SECURITY DEFINER: es lo que permite que el ranking se vea sin
--     abrir el resto de la tabla. Solo expone nombre, puntuación, zona, renaceres y nivel.
--   · Las funciones `admin_*` las puede llamar cualquier usuario autenticado, y todas
--     comprueban el rol por dentro: sin rol devuelven cero filas o error.
--   · Supabase avisa de que la protección de contraseñas filtradas está desactivada. El
--     juego usa un PIN numérico; activarla rechazaría PINs comunes y dejaría fuera a
--     jugadores. Queda como decisión de producto, no como descuido.

create or replace function public.players_guard() returns trigger
language plpgsql
set search_path = ''
as $$
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

drop policy if exists "leer propio" on public.players;
create policy "leer propio" on public.players for select to authenticated
  using ((select auth.uid()) = id);
drop policy if exists "crear propio" on public.players;
create policy "crear propio" on public.players for insert to authenticated
  with check ((select auth.uid()) = id);
drop policy if exists "editar propio" on public.players;
create policy "editar propio" on public.players for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
