-- ===========================================================
-- ideasprint 2026 — Backup System SQL
-- Run in the Supabase SQL Editor (once)
-- ===========================================================

-- ── PREREQUISITE ────────────────────────────────────────────
-- Create two PRIVATE storage buckets in Supabase Dashboard:
--   • snapshots        (private, no public access)
--   • nightly-backups  (private, no public access)
-- ===========================================================

-- ── STORAGE RLS POLICIES ────────────────────────────────────
-- Authenticated users may INSERT into 'snapshots'.
-- The actual upload is done server-side via the service role
-- key through /api/snapshot, so RLS for that bucket is only
-- a defence-in-depth measure. For nightly-backups the upload
-- also uses the service role key via /api/nightly-backup.

-- Allow any authenticated user to INSERT objects into 'snapshots'
-- (the API route verifies session before calling storage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND policyname = 'Evaluators can upload snapshots'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Evaluators can upload snapshots"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'snapshots');
    $p$;
  END IF;
END $$;

-- Allow admins to READ from both private buckets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND policyname = 'Admins can read all storage'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can read all storage"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id IN ('snapshots', 'nightly-backups')
        AND (SELECT public.get_user_role()) = 'admin'
      );
    $p$;
  END IF;
END $$;

-- ── BACKUP LOG TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.backup_logs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    backup_type TEXT        NOT NULL,   -- 'snapshot' | 'nightly'
    status      TEXT        NOT NULL,   -- 'ok' | 'failed'
    filename    TEXT
);

ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'backup_logs'
      AND policyname = 'Admins can view backup logs'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can view backup logs" ON public.backup_logs
        FOR SELECT USING ((SELECT public.get_user_role()) = 'admin');
    $p$;
  END IF;
END $$;

-- ── NIGHTLY BACKUP SCHEDULE (pg_cron) ───────────────────────
-- This calls the /api/nightly-backup Next.js route every midnight UTC.
-- Replace <YOUR_APP_URL> with your actual Vercel deployment URL.
-- Replace <YOUR_BACKUP_SECRET> with the value you set in BACKUP_SECRET env var.
--
-- Run this block ONLY after pg_cron is enabled:
--   SELECT cron.schedule(
--     'nightly-backup',
--     '0 0 * * *',
--     $$
--       SELECT net.http_post(
--         url     := 'https://<YOUR_APP_URL>/api/nightly-backup',
--         headers := '{"Content-Type":"application/json","x-backup-secret":"<YOUR_BACKUP_SECRET>"}'::jsonb,
--         body    := '{}'::jsonb
--       )
--     $$
--   );

-- ── DATA EXPORT VIEW ────────────────────────────────────────
-- Use this view in the Supabase Table Editor to quickly inspect
-- or export a snapshot of all critical data.
CREATE OR REPLACE VIEW public.system_backup_data AS
SELECT 'proposals'           AS table_name, json_agg(p.*)  AS data FROM proposals p
UNION ALL
SELECT 'evaluations'         AS table_name, json_agg(e.*)  AS data FROM evaluations e
UNION ALL
SELECT 'profiles'            AS table_name, json_agg(pr.*) AS data FROM profiles pr
UNION ALL
SELECT 'proposal_assignments' AS table_name, json_agg(a.*) AS data FROM proposal_assignments a;
