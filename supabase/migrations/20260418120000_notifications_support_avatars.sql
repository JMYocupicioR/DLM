-- Notifications, support tickets, and public avatar storage (DeepLuxMed UX)

-- ── notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_select_own'
  ) THEN
    CREATE POLICY "notifications_select_own" ON public.notifications
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_update_own'
  ) THEN
    CREATE POLICY "notifications_update_own" ON public.notifications
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- Inserts from application webhooks use service role (bypasses RLS).

-- ── support_tickets ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets (user_id, created_at DESC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'support_tickets_insert_own'
  ) THEN
    CREATE POLICY "support_tickets_insert_own" ON public.support_tickets
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'support_tickets_select_own'
  ) THEN
    CREATE POLICY "support_tickets_select_own" ON public.support_tickets
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

-- ── Storage: avatars (public read, authenticated write own folder) ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_public_read'
  ) THEN
    CREATE POLICY "avatars_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_authenticated_insert'
  ) THEN
    CREATE POLICY "avatars_authenticated_insert" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_authenticated_update'
  ) THEN
    CREATE POLICY "avatars_authenticated_update" ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_authenticated_delete'
  ) THEN
    CREATE POLICY "avatars_authenticated_delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
