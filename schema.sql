-- Ecos del Abismo · esquema para Supabase (SQL Editor → New query → Run)
create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  score bigint not null default 0,
  max_zone int not null default 1,
  rebirths int not null default 0,
  level int not null default 1,
  save jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists players_score_idx on public.players (score desc);
alter table public.players enable row level security;
drop policy if exists "ranking visible" on public.players;
create policy "ranking visible" on public.players for select to authenticated using (true);
drop policy if exists "crear propio" on public.players;
create policy "crear propio" on public.players for insert to authenticated with check (auth.uid() = id);
drop policy if exists "editar propio" on public.players;
create policy "editar propio" on public.players for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
