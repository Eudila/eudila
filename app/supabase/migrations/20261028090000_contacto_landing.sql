-- SPDX-License-Identifier: AGPL-3.0-only
begin;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  email text not null check (char_length(email) between 3 and 200),
  organization text not null default '' check (char_length(organization) <= 160),
  message text not null check (char_length(btrim(message)) between 20 and 3000),
  interest text check (interest in ('Piloto como psicólogo', 'Inversión', 'Otra consulta'))
);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from public, anon, authenticated, service_role;
grant insert on public.contact_messages to service_role;

create table public.contact_rate_limits (
  key text primary key check (key ~ '^[a-f0-9]{64}$'),
  attempts integer not null check (attempts between 1 and 6),
  reset_at timestamptz not null
);
create index contact_rate_limits_reset_idx on public.contact_rate_limits (reset_at);
alter table public.contact_rate_limits enable row level security;
revoke all on public.contact_rate_limits from public, anon, authenticated, service_role;

create function public.consumir_limite_contacto(p_key text)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_now timestamptz := clock_timestamp();
  bucket public.contact_rate_limits;
begin
  delete from public.contact_rate_limits where reset_at <= v_now;
  insert into public.contact_rate_limits as limits (key, attempts, reset_at)
    values (p_key, 1, v_now + interval '15 minutes')
    on conflict (key) do update set attempts = least(limits.attempts + 1, 6)
    returning * into bucket;
  if bucket.attempts > 5 then
    return greatest(1, ceil(extract(epoch from bucket.reset_at - v_now))::integer);
  end if;
  return 0;
end;
$$;
revoke all on function public.consumir_limite_contacto(text) from public, anon, authenticated;
grant execute on function public.consumir_limite_contacto(text) to service_role;
notify pgrst, 'reload schema';
commit;
