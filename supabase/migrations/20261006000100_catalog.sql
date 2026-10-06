-- SPDX-License-Identifier: AGPL-3.0-only
begin;

create table public.emociones (
  id uuid primary key,
  nombre text not null check (btrim(nombre) <> ''),
  sugerida boolean not null
);

create unique index emociones_nombre_unique on public.emociones (lower(btrim(nombre)));

create table public.factores_vida (
  id uuid primary key,
  nombre text not null check (btrim(nombre) <> '')
);

create unique index factores_vida_nombre_unique on public.factores_vida (lower(btrim(nombre)));

alter table public.emociones enable row level security;
alter table public.factores_vida enable row level security;

revoke all on public.emociones, public.factores_vida from public, anon, authenticated;
grant select on public.emociones, public.factores_vida to anon, authenticated;

create policy emociones_read on public.emociones
for select to anon, authenticated using (true);

create policy factores_vida_read on public.factores_vida
for select to anon, authenticated using (true);

commit;
