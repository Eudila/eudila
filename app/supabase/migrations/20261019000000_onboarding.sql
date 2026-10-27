-- SPDX-License-Identifier: AGPL-3.0-only
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or (char_length(display_name) between 1 and 60 and display_name !~ '[[:cntrl:]]')),
  onboarding_completed_at timestamptz
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Create own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create table public.emociones (
  id uuid primary key,
  nombre text not null check (length(trim(nombre)) > 0),
  sugerida boolean not null
);
create table public.factores_vida (
  id uuid primary key,
  nombre text not null check (length(trim(nombre)) > 0)
);
alter table public.emociones enable row level security;
alter table public.factores_vida enable row level security;
revoke all on public.emociones, public.factores_vida from anon, authenticated;
grant select on public.emociones, public.factores_vida to anon, authenticated;
create policy "Public emotion catalog" on public.emociones for select to anon, authenticated using (true);
create policy "Public factor catalog" on public.factores_vida for select to anon, authenticated using (true);
