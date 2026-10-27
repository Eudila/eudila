-- Contraseñas de los roles internos de Supabase. Se ejecuta una sola vez, al crear la base.
\set pgpass `echo "$POSTGRES_PASSWORD"`
SELECT set_config('eudila.pgpass', :'pgpass', false);
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['postgres', 'authenticator', 'pgbouncer', 'supabase_auth_admin',
    'supabase_storage_admin', 'supabase_functions_admin', 'supabase_replication_admin', 'supabase_read_only_user'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('ALTER USER %I WITH PASSWORD %L', r, current_setting('eudila.pgpass'));
    END IF;
  END LOOP;
END $$;
