-- Lito Lab · migración v4 (ejecutar en Supabase → SQL Editor → Run)
-- 1) Snapshot del guardado anterior + puntuación calculada en servidor
alter table public.players add column if not exists save_prev jsonb, add column if not exists prev_updated_at timestamptz;
create or replace function public.players_guard() returns trigger language plpgsql as $$
begin
  new.max_zone := greatest(1, coalesce((new.save->>'maxZoneEver')::int, (new.save->>'maxZone')::int, 1));
  new.rebirths := greatest(0, coalesce((new.save->>'rebirths')::int, 0));
  new.level := greatest(1, coalesce((new.save->>'level')::int, 1));
  new.score := new.max_zone*1000 + new.rebirths*250 + new.level;
  new.updated_at := now();
  if tg_op = 'UPDATE' and new.save is distinct from old.save then
    new.save_prev := old.save; new.prev_updated_at := old.updated_at;
  end if;
  return new;
end $$;
drop trigger if exists players_guard_trg on public.players;
create trigger players_guard_trg before insert or update on public.players for each row execute function public.players_guard();
-- 2) Ranking público sin exponer el guardado; cada jugador solo lee su propia fila de players
create or replace view public.ranking as select name, score, max_zone, rebirths, level from public.players;
grant select on public.ranking to authenticated;
drop policy if exists "ranking visible" on public.players;
drop policy if exists "leer propio" on public.players;
create policy "leer propio" on public.players for select to authenticated using (auth.uid() = id);
