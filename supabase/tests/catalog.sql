-- SPDX-License-Identifier: AGPL-3.0-only
create function pg_temp.expect_error(statement text, expected_state text)
returns void language plpgsql as $$
begin
  begin
    execute statement;
  exception when others then
    if sqlstate = expected_state then return; end if;
    raise;
  end;
  raise exception 'Expected SQLSTATE %, statement succeeded: %', expected_state, statement;
end;
$$;

create temporary table expected_catalog as select :'catalog'::jsonb as data;

do $$
declare
  catalog jsonb := (select data from expected_catalog);
begin
  if (select count(*) from public.emociones) <> 21 then
    raise exception 'Expected 21 emotions';
  end if;
  if (select count(*) from public.factores_vida) <> 15 then
    raise exception 'Expected 15 factors';
  end if;
  if (select count(*) from public.emociones where sugerida) <> 6 then
    raise exception 'Expected 6 suggested emotions';
  end if;
  if exists (
    (select id, nombre, sugerida from public.emociones
     except select id, nombre, sugerida from jsonb_populate_recordset(null::public.emociones, catalog -> 'emociones'))
    union all
    (select id, nombre, sugerida from jsonb_populate_recordset(null::public.emociones, catalog -> 'emociones')
     except select id, nombre, sugerida from public.emociones)
  ) then raise exception 'Emotion rows differ from the approved JSON'; end if;
  if exists (
    (select id, nombre from public.factores_vida
     except select id, nombre from jsonb_populate_recordset(null::public.factores_vida, catalog -> 'factores_vida'))
    union all
    (select id, nombre from jsonb_populate_recordset(null::public.factores_vida, catalog -> 'factores_vida')
     except select id, nombre from public.factores_vida)
  ) then raise exception 'Factor rows differ from the approved JSON'; end if;
end;
$$;

set role anon;
do $$
begin
  if (select count(*) from public.emociones) <> 21
     or (select count(*) from public.factores_vida) <> 15 then
    raise exception 'Anonymous catalog reads must expose the approved public labels';
  end if;
end;
$$;
select pg_temp.expect_error($query$insert into public.emociones values ('00000000-0000-0000-0000-000000000001', 'Synthetic', false)$query$, '42501');
select pg_temp.expect_error($query$update public.factores_vida set nombre = 'Synthetic'$query$, '42501');
reset role;

set role authenticated;
do $$
begin
  if (select count(*) from public.emociones) <> 21
     or (select count(*) from public.factores_vida) <> 15 then
    raise exception 'Authenticated catalog reads must expose the same public labels';
  end if;
end;
$$;
select pg_temp.expect_error($query$delete from public.emociones$query$, '42501');
select pg_temp.expect_error($query$truncate public.factores_vida$query$, '42501');
reset role;

do $$
declare
  role_name text;
  table_name text;
  command text;
begin
  foreach role_name in array array['anon', 'authenticated'] loop
    foreach table_name in array array['public.emociones', 'public.factores_vida'] loop
      if not (select relrowsecurity from pg_class where oid = table_name::regclass) then
        raise exception 'Catalog row-level security must stay enabled';
      end if;
      foreach command in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] loop
        if has_table_privilege(role_name, table_name, command) then
          raise exception 'Catalog writes must stay unavailable to app roles';
        end if;
      end loop;
    end loop;
  end loop;
end;
$$;

select pg_temp.expect_error($query$insert into public.emociones values ('not-a-uuid', 'Synthetic', false)$query$, '22P02');
select pg_temp.expect_error($query$insert into public.emociones values ('00000000-0000-0000-0000-000000000001', ' ', false)$query$, '23514');
select pg_temp.expect_error($query$insert into public.emociones values ('00000000-0000-0000-0000-000000000001', 'Synthetic', null)$query$, '23502');
select pg_temp.expect_error($query$insert into public.emociones values ('00000000-0000-0000-0000-000000000001', ' ALEGRÍA ', false)$query$, '23505');
select pg_temp.expect_error($query$insert into public.factores_vida values ('00000000-0000-0000-0000-000000000002', null)$query$, '23502');
select pg_temp.expect_error($query$insert into public.factores_vida values ('00000000-0000-0000-0000-000000000002', '')$query$, '23514');
select pg_temp.expect_error($query$insert into public.factores_vida values ('00000000-0000-0000-0000-000000000002', ' TRABAJO ')$query$, '23505');

create table catalog_reference (
  emotion_id uuid references public.emociones(id),
  factor_id uuid references public.factores_vida(id)
);
insert into catalog_reference
select (data -> 'emociones' -> 0 ->> 'id')::uuid,
       (data -> 'factores_vida' -> 0 ->> 'id')::uuid
from expected_catalog;

insert into public.emociones values ('00000000-0000-0000-0000-000000000001', 'Synthetic extra emotion', false);
insert into public.factores_vida values ('00000000-0000-0000-0000-000000000002', 'Synthetic extra factor');
update public.emociones set nombre = 'Synthetic old emotion'
where id = (select emotion_id from catalog_reference);

\ir ../seed.sql
\ir ../seed.sql

do $$
begin
  if (select count(*) from public.emociones) <> 22
     or (select count(*) from public.factores_vida) <> 16 then
    raise exception 'Repeated seeds must preserve unrelated rows';
  end if;
  if (select nombre from public.emociones where id = (select emotion_id from catalog_reference)) <> 'Alegría' then
    raise exception 'Seed must update the label without changing its UUID or references';
  end if;
end;
$$;

update public.emociones set nombre = 'Synthetic old emotion'
where id = (select emotion_id from catalog_reference);
update public.factores_vida set nombre = 'Synthetic old factor'
where id = (select factor_id from catalog_reference);
insert into public.factores_vida
select '00000000-0000-0000-0000-000000000003'::uuid, data -> 'factores_vida' -> 0 ->> 'nombre'
from expected_catalog;
