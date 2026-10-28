-- SPDX-License-Identifier: AGPL-3.0-only
begin;
create table public.registros (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recorded_at timestamptz not null check (isfinite(recorded_at)),
  type text not null check (type in ('mañana', 'tarde', 'noche', 'libre')),
  mood smallint not null check (mood between 1 and 7),
  emotion_id uuid not null references public.emociones(id)
);
create index registros_user_date_idx on public.registros (user_id, recorded_at, id);
create index registros_emotion_idx on public.registros (emotion_id);
alter table public.registros enable row level security;
revoke all on public.registros from anon, authenticated;
grant select, insert on public.registros to authenticated;
create policy "Read own records" on public.registros for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Create own records" on public.registros for insert to authenticated
  with check ((select auth.uid()) = user_id);

create table public.registro_factores (
  record_id uuid not null references public.registros(id) on delete cascade,
  factor_id uuid not null references public.factores_vida(id),
  primary key (record_id, factor_id)
);
create index registro_factores_factor_idx on public.registro_factores (factor_id);
alter table public.registro_factores enable row level security;
revoke all on public.registro_factores from anon, authenticated;
grant select, insert on public.registro_factores to authenticated;
create policy "Read own record factors" on public.registro_factores for select to authenticated
  using (exists (select 1 from public.registros where id = record_id and user_id = (select auth.uid())));
create policy "Create own record factors" on public.registro_factores for insert to authenticated
  with check (exists (select 1 from public.registros where id = record_id and user_id = (select auth.uid())));

create function public.guardar_registro(
  p_user_id uuid,
  p_id uuid,
  p_recorded_at timestamptz,
  p_type text,
  p_mood smallint,
  p_emotion_id uuid,
  p_factor_ids uuid[]
) returns void language plpgsql security invoker set search_path = '' as $$
declare
  inserted_id uuid;
begin
  if p_user_id is distinct from (select auth.uid()) then
    raise exception 'La sesión cambió durante el guardado.' using errcode = '42501';
  end if;
  if p_factor_ids is null then
    raise exception 'Los factores deben ser una lista.' using errcode = '22004';
  end if;
  insert into public.registros (id, recorded_at, type, mood, emotion_id)
    values (p_id, p_recorded_at, p_type, p_mood, p_emotion_id)
    on conflict (id) do nothing returning id into inserted_id;
  if inserted_id is null then
    if not exists (select 1 from public.registros where id = p_id and user_id = (select auth.uid())) then
      raise exception 'Registro no disponible.' using errcode = '42501';
    end if;
    return;
  end if;
  insert into public.registro_factores (record_id, factor_id)
    select p_id, unnest(p_factor_ids);
end;
$$;
revoke all on function public.guardar_registro(uuid, uuid, timestamptz, text, smallint, uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.guardar_registro(uuid, uuid, timestamptz, text, smallint, uuid, uuid[]) to authenticated;
notify pgrst, 'reload schema';
commit;
