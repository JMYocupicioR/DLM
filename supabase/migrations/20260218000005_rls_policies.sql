-- Migration: Row Level Security Policies
-- Enforces data isolation per user and clinic
-- Idempotent: uses DO $$ blocks to skip existing policies

-- ─────────────────────────────────────────────
-- Helper: is_clinic_admin(clinic_id)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_clinic_admin(target_clinic_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_user_relationships cur
    WHERE cur.clinic_id = target_clinic_id
      AND cur.user_id = auth.uid()
      AND cur.role_in_clinic IN ('admin', 'owner')
      AND cur.is_active = true
  );
$$;

-- ─────────────────────────────────────────────
-- Helper macro: create policy only if it does not exist
-- ─────────────────────────────────────────────
DO $$
DECLARE
  _tbl TEXT;
  _pol TEXT;
BEGIN
  -- user_types
  ALTER TABLE public.user_types ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_types' AND policyname='user_types_public_read') THEN
    CREATE POLICY "user_types_public_read" ON public.user_types FOR SELECT USING (is_active = true);
  END IF;

  -- professional_profiles
  ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='professional_profiles' AND policyname='professional_profiles_owner_all') THEN
    CREATE POLICY "professional_profiles_owner_all" ON public.professional_profiles FOR ALL USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='professional_profiles' AND policyname='professional_profiles_public_select') THEN
    CREATE POLICY "professional_profiles_public_select" ON public.professional_profiles FOR SELECT USING (is_public_profile = true AND trust_level >= 3);
  END IF;

  -- license_verifications
  ALTER TABLE public.license_verifications ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='license_verifications' AND policyname='license_verifications_owner_read') THEN
    CREATE POLICY "license_verifications_owner_read" ON public.license_verifications FOR SELECT USING (profile_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='license_verifications' AND policyname='license_verifications_owner_insert') THEN
    CREATE POLICY "license_verifications_owner_insert" ON public.license_verifications FOR INSERT WITH CHECK (profile_id = auth.uid());
  END IF;

  -- clinic_profiles
  ALTER TABLE public.clinic_profiles ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clinic_profiles' AND policyname='clinic_profiles_member_read') THEN
    CREATE POLICY "clinic_profiles_member_read" ON public.clinic_profiles FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.clinic_user_relationships cur WHERE cur.clinic_id = clinic_profiles.clinic_id AND cur.user_id = auth.uid() AND cur.is_active = true)
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clinic_profiles' AND policyname='clinic_profiles_admin_write') THEN
    CREATE POLICY "clinic_profiles_admin_write" ON public.clinic_profiles FOR ALL USING (public.is_clinic_admin(clinic_id));
  END IF;

  -- products
  ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='products_public_read') THEN
    CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (is_active = true);
  END IF;

  -- subscription_plans
  ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscription_plans' AND policyname='subscription_plans_public_read') THEN
    CREATE POLICY "subscription_plans_public_read" ON public.subscription_plans FOR SELECT USING (is_active = true);
  END IF;

  -- plan_products
  ALTER TABLE public.plan_products ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='plan_products' AND policyname='plan_products_public_read') THEN
    CREATE POLICY "plan_products_public_read" ON public.plan_products FOR SELECT USING (true);
  END IF;

  -- subscriptions
  ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='subscriptions_user_read') THEN
    CREATE POLICY "subscriptions_user_read" ON public.subscriptions FOR SELECT USING (
      (subscriber_type = 'user' AND user_id = auth.uid()) OR
      (subscriber_type = 'clinic' AND public.is_clinic_admin(clinic_id))
    );
  END IF;

  -- subscription_seats
  ALTER TABLE public.subscription_seats ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscription_seats' AND policyname='subscription_seats_user_read') THEN
    CREATE POLICY "subscription_seats_user_read" ON public.subscription_seats FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscription_seats' AND policyname='subscription_seats_admin_all') THEN
    CREATE POLICY "subscription_seats_admin_all" ON public.subscription_seats FOR ALL USING (
      EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.id = subscription_seats.subscription_id AND s.subscriber_type = 'clinic' AND public.is_clinic_admin(s.clinic_id))
    );
  END IF;

  -- user_product_access
  ALTER TABLE public.user_product_access ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_product_access' AND policyname='user_product_access_owner_read') THEN
    CREATE POLICY "user_product_access_owner_read" ON public.user_product_access FOR SELECT USING (user_id = auth.uid());
  END IF;

  -- invoices
  ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='invoices' AND policyname='invoices_user_read') THEN
    CREATE POLICY "invoices_user_read" ON public.invoices FOR SELECT USING (
      user_id = auth.uid() OR (clinic_id IS NOT NULL AND public.is_clinic_admin(clinic_id))
    );
  END IF;

  -- onboarding_sessions
  ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='onboarding_sessions' AND policyname='onboarding_sessions_owner_all') THEN
    CREATE POLICY "onboarding_sessions_owner_all" ON public.onboarding_sessions FOR ALL USING (user_id = auth.uid());
  END IF;

  -- registration_flows
  ALTER TABLE public.registration_flows ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='registration_flows' AND policyname='registration_flows_public_read') THEN
    CREATE POLICY "registration_flows_public_read" ON public.registration_flows FOR SELECT USING (is_active = true);
  END IF;

  -- registration_questions
  ALTER TABLE public.registration_questions ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='registration_questions' AND policyname='registration_questions_public_read') THEN
    CREATE POLICY "registration_questions_public_read" ON public.registration_questions FOR SELECT USING (is_active = true);
  END IF;

  -- registration_responses
  ALTER TABLE public.registration_responses ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='registration_responses' AND policyname='registration_responses_owner_all') THEN
    CREATE POLICY "registration_responses_owner_all" ON public.registration_responses FOR ALL USING (user_id = auth.uid());
  END IF;

  -- audit_log: service_role only
  ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

  -- profile_completion_tasks: public read
  ALTER TABLE public.profile_completion_tasks ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profile_completion_tasks' AND policyname='profile_completion_tasks_public_read') THEN
    CREATE POLICY "profile_completion_tasks_public_read" ON public.profile_completion_tasks FOR SELECT USING (true);
  END IF;

  -- webhook_events: service_role only
  ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

END $$;
