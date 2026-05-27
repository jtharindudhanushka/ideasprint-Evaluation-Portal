-- Migration: 015_evaluation_lock.sql
-- Seeds the evaluations_locked toggle into system_settings.
-- Run in the Supabase SQL Editor (once).
--
-- Default: 'true' (locked) — deadline has passed.
-- Admin can toggle this via the dashboard.

INSERT INTO public.system_settings (key, value)
VALUES ('evaluations_locked', to_jsonb('true'::text))
ON CONFLICT (key) DO NOTHING;
