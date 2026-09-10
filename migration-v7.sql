-- Lito Lab · migración v7 (ejecutar en Supabase → SQL Editor → Run)
-- FEAT-021: ficha pública de un jugador del ranking. Solo datos de escaparate: nada de
-- oro, almas, inventario ni credenciales, y las cuentas de administración no se exponen.
create or replace function public.player_card(nombre text)
returns table (
  name text, score bigint, max_zone int, rebirths int, level int,
  tiempo numeric, kills numeric, jefes numeric, trofeos int, especies int,
  score_capped boolean, updated_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select p.name, p.score, p.max_zone, p.rebirths, p.level,
         (p.save->'stats'->>'time')::numeric,
         (p.save->'stats'->>'kills')::numeric,
         (p.save->'stats'->>'bosses')::numeric,
         jsonb_array_length(coalesce(p.save->'trophies', '[]'::jsonb)),
         (select count(distinct e->>'sp')::int from jsonb_array_elements(coalesce(p.save->'pets', '[]'::jsonb)) e),
         p.score_capped, p.updated_at
  from public.players p
  where p.name = nombre and not p.is_admin
  order by p.score desc
  limit 1;
$$;
revoke all on function public.player_card(text) from public, anon;
grant execute on function public.player_card(text) to authenticated;
