-- Additive rollout: v13 rows remain writable until their first versioned save.
-- Once save_version > 0, stale and unversioned clients cannot overwrite the row.
alter table public.players add column if not exists save_version bigint not null default 0;

create or replace function public.players_version_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.save_version not in (0, 1) then
      raise exception 'Invalid initial save version' using errcode = '23514';
    end if;
  elsif old.save_version > 0 or new.save_version <> 0 then
    if new.save_version <> old.save_version + 1 then
      raise exception 'Save conflict: reload the cloud save' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.players_version_guard() from public, anon, authenticated;
drop trigger if exists players_version_guard_trg on public.players;
create trigger players_version_guard_trg before insert or update on public.players
for each row execute function public.players_version_guard();
