-- Migration: 010_system_settings.sql
-- Create a system settings table for global configurations like "Days Left"

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Anyone can read system settings"
    ON public.system_settings
    FOR SELECT
    USING (true);

-- Only admins can update settings
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
CREATE POLICY "Admins can update system settings"
    ON public.system_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Seed default evaluation_deadline setting (e.g., 14 days from now)
INSERT INTO public.system_settings (key, value)
VALUES ('evaluation_deadline', to_jsonb((now() + interval '14 days')::text))
ON CONFLICT (key) DO NOTHING;
