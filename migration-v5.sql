-- Lito Lab · migración v5 (ejecutar en Supabase → SQL Editor → Run)
-- TECH-004 cuenta admin invisible en el ranking · FEAT-008 puesto real del jugador.

-- 1) Rol admin. La columna la escribe solo el servidor: la API pública no tiene
--    privilegio sobre ella y, si lo recuperase, el guard vuelve a fijar el valor.
alter table public.players add column if not exists is_admin boolean not null default false;
revoke insert (is_admin), update (is_admin) on public.players from authenticated, anon;

create or replace function public.players_guard() returns trigger language plpgsql as $$
begin
  new.max_zone := greatest(1, coalesce((new.save->>'maxZoneEver')::int, (new.save->>'maxZone')::int, 1));
  new.rebirths := greatest(0, coalesce((new.save->>'rebirths')::int, 0));
  new.level := greatest(1, coalesce((new.save->>'level')::int, 1));
  new.score := new.max_zone*1000 + new.rebirths*250 + new.level;
  new.updated_at := now();
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then new.is_admin := false;
    else new.is_admin := coalesce(old.is_admin, false); end if;
  end if;
  if tg_op = 'UPDATE' and new.save is distinct from old.save then
    new.save_prev := old.save; new.prev_updated_at := old.updated_at;
  end if;
  return new;
end $$;

-- 2) El ranking público no muestra cuentas admin.
create or replace view public.ranking as
  select name, score, max_zone, rebirths, level from public.players where not is_admin;
grant select on public.ranking to authenticated;

-- 3) Puesto real del jugador aunque no entre en el top visible.
--    Cuenta solo rivales no admin; un admin no compite y recibe posición nula.
create or replace function public.my_rank()
returns table (posicion int, total int, puntuacion bigint)
language sql stable security definer set search_path = '' as $$
  with me as (select p.score, p.is_admin from public.players p where p.id = auth.uid())
  select
    case when coalesce((select is_admin from me), true) then null
         else (select count(*)::int + 1 from public.players q
               where not q.is_admin and q.score > (select score from me)) end,
    (select count(*)::int from public.players q where not q.is_admin),
    (select score from me);
$$;
revoke all on function public.my_rank() from public, anon;
grant execute on function public.my_rank() to authenticated;

-- 4) Marcar una cuenta como admin (solo desde el SQL Editor, nunca desde el juego):
--    update public.players set is_admin = true where name = '<nombre>';
