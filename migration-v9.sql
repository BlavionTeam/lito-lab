-- Lito Lab · migración v9 (ejecutar en Supabase → SQL Editor → Run)
-- FEAT-025 (#10): recuperar la cuenta sin el PIN.
--
-- El juego no pide correo, así que no hay a dónde mandar un enlace de recuperación. En su
-- lugar, cada cuenta guarda un código de rescate de un solo uso: el servidor conserva solo
-- su hash bcrypt —nunca el código—, y quien lo presente puede fijar un PIN nuevo.
alter table public.players
  add column if not exists rescue_hash text,
  add column if not exists rescue_set_at timestamptz,
  add column if not exists rescue_used_at timestamptz;

-- El dueño de la cuenta guarda (o renueva) su código. Renovarlo invalida el anterior.
create or replace function public.set_rescue_code(codigo text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'sin sesión'; end if;
  if codigo is null or length(codigo) < 12 then raise exception 'código demasiado corto'; end if;
  update public.players
     set rescue_hash = extensions.crypt(codigo, extensions.gen_salt('bf')),
         rescue_set_at = now(), rescue_used_at = null
   where id = auth.uid();
  if not found then raise exception 'jugador no encontrado'; end if;
  return true;
end $$;
revoke all on function public.set_rescue_code(text) from public, anon;
grant execute on function public.set_rescue_code(text) to authenticated;

-- Canjear: nombre + código correcto → PIN nuevo. Va sin sesión, porque quien lo usa es
-- justo quien no puede entrar. La respuesta es la misma tanto si el nombre no existe como
-- si el código no cuadra, para no confirmar qué jugadores hay registrados, y ambos casos
-- tardan lo mismo.
create or replace function public.rescue_account(jugador text, codigo text, nuevo_pin text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare fila public.players%rowtype;
begin
  if jugador is null or codigo is null or nuevo_pin is null then return false; end if;
  if length(nuevo_pin) < 6 then raise exception 'el PIN nuevo necesita 6 caracteres o más'; end if;
  select * into fila from public.players p where p.name = jugador and p.rescue_hash is not null limit 1;
  if not found then
    perform pg_sleep(0.4);
    return false;
  end if;
  if fila.rescue_hash <> extensions.crypt(codigo, fila.rescue_hash) then
    perform pg_sleep(0.4);
    return false;
  end if;
  update auth.users
     set encrypted_password = extensions.crypt(nuevo_pin, extensions.gen_salt('bf')),
         updated_at = now()
   where id = fila.id;
  -- Un código sirve una vez: quien recupere la cuenta tendrá que guardar uno nuevo.
  update public.players set rescue_hash = null, rescue_used_at = now() where id = fila.id;
  return true;
end $$;
revoke all on function public.rescue_account(text, text, text) from public, anon;
grant execute on function public.rescue_account(text, text, text) to anon, authenticated;
