-- Migration: Subscription Runtime
-- Tables: subscriptions, subscription_items, subscription_seats, user_product_access

-- ─────────────────────────────────────────────
-- 1. subscriptions (central subscription record)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Who pays: either a user OR a clinic (never both)
  subscriber_type TEXT NOT NULL CHECK (subscriber_type IN ('user', 'clinic')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (
    status IN ('trialing', 'active', 'past_due', 'canceled', 'expired', 'incomplete')
  ),
  billing_interval TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annual', 'free')),
  trial_ends_at TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  -- Payment processor fields (dual processor support)
  payment_processor TEXT CHECK (payment_processor IN ('stripe', 'conekta', NULL)),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  conekta_subscription_id TEXT UNIQUE,
  conekta_customer_id TEXT,
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Constraints
  CONSTRAINT chk_subscriber_has_owner CHECK (
    (subscriber_type = 'user' AND user_id IS NOT NULL AND clinic_id IS NULL) OR
    (subscriber_type = 'clinic' AND clinic_id IS NOT NULL AND user_id IS NULL)
  )
);

COMMENT ON TABLE public.subscriptions IS 'Registro central de suscripciones. Un usuario o clinica puede tener una suscripcion activa.';
COMMENT ON COLUMN public.subscriptions.grace_period_ends_at IS 'Cuando vence el grace period tras past_due. Acceso read-only hasta que expire.';

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_clinic_id ON public.subscriptions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_conekta_sub ON public.subscriptions(conekta_subscription_id);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 2. subscription_items (product breakdown for flexible bundles)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  plan_id UUID REFERENCES public.subscription_plans(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_mxn_cents INTEGER NOT NULL DEFAULT 0,
  access_level TEXT NOT NULL DEFAULT 'full' CHECK (access_level IN ('full', 'limited', 'readonly')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (subscription_id, product_id)
);

COMMENT ON TABLE public.subscription_items IS 'Desglose de productos incluidos en una suscripcion. Util para bundles flexibles.';

CREATE INDEX IF NOT EXISTS idx_subscription_items_sub_id ON public.subscription_items(subscription_id);

-- ─────────────────────────────────────────────
-- 3. subscription_seats (seat allocation for clinic plans)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE (subscription_id, user_id)
);

COMMENT ON TABLE public.subscription_seats IS 'Asignacion de asientos en planes de clinica. Un asiento = un usuario puede usar la suscripcion de la clinica.';

CREATE INDEX IF NOT EXISTS idx_subscription_seats_sub_id ON public.subscription_seats(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_seats_user_id ON public.subscription_seats(user_id);

-- ─────────────────────────────────────────────
-- 4. user_product_access (O(1) access cache for each app)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  has_access BOOLEAN NOT NULL DEFAULT false,
  access_level TEXT NOT NULL DEFAULT 'full' CHECK (access_level IN ('full', 'limited', 'readonly', 'none')),
  access_source TEXT NOT NULL DEFAULT 'subscription' CHECK (
    access_source IN ('subscription', 'seat', 'trial', 'manual', 'free_tier')
  ),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, product_id)
);

COMMENT ON TABLE public.user_product_access IS 'Cache de acceso rapido O(1) por usuario y producto. Recomputado por webhooks y reconciliacion nocturna.';

CREATE INDEX IF NOT EXISTS idx_user_product_access_user_id ON public.user_product_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_product_access_lookup ON public.user_product_access(user_id, product_id, has_access);
CREATE INDEX IF NOT EXISTS idx_user_product_access_expires ON public.user_product_access(expires_at) WHERE expires_at IS NOT NULL;

-- ─────────────────────────────────────────────
-- 5. Function: recompute_user_product_access
-- Recalculates access for a user based on their active subscriptions and seats
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recompute_user_product_access(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_product RECORD;
  v_access_level TEXT;
  v_access_source TEXT;
  v_sub_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- For each product, determine access
  FOR v_product IN SELECT id, slug FROM public.products WHERE is_active = true LOOP
    v_access_level := 'none';
    v_access_source := 'free_tier';
    v_sub_id := NULL;
    v_expires_at := NULL;

    -- Check: direct user subscription
    SELECT
      s.id,
      pp.access_level,
      s.current_period_end
    INTO v_sub_id, v_access_level, v_expires_at
    FROM public.subscriptions s
    JOIN public.plan_products pp ON pp.plan_id = s.plan_id AND pp.product_id = v_product.id
    WHERE s.user_id = p_user_id
      AND s.status IN ('active', 'trialing', 'past_due')
      AND (s.grace_period_ends_at IS NULL OR s.grace_period_ends_at > now())
    LIMIT 1;

    IF v_sub_id IS NOT NULL THEN
      v_access_source := CASE
        WHEN (SELECT status FROM public.subscriptions WHERE id = v_sub_id) = 'trialing' THEN 'trial'
        ELSE 'subscription'
      END;
    ELSE
      -- Check: clinic seat
      SELECT
        s.id,
        pp.access_level,
        s.current_period_end
      INTO v_sub_id, v_access_level, v_expires_at
      FROM public.subscription_seats ss
      JOIN public.subscriptions s ON s.id = ss.subscription_id
      JOIN public.plan_products pp ON pp.plan_id = s.plan_id AND pp.product_id = v_product.id
      WHERE ss.user_id = p_user_id
        AND ss.is_active = true
        AND s.status IN ('active', 'trialing', 'past_due')
        AND (s.grace_period_ends_at IS NULL OR s.grace_period_ends_at > now())
      LIMIT 1;

      IF v_sub_id IS NOT NULL THEN
        v_access_source := 'seat';
      ELSE
        -- Check: free tier (escalas-dlm is always accessible)
        IF v_product.slug = 'escalas-dlm' THEN
          v_access_level := 'readonly';
          v_access_source := 'free_tier';
        END IF;
      END IF;
    END IF;

    -- Upsert access record
    INSERT INTO public.user_product_access (
      user_id, product_id, has_access, access_level, access_source, subscription_id, expires_at, updated_at
    )
    VALUES (
      p_user_id,
      v_product.id,
      CASE WHEN v_access_level != 'none' THEN true ELSE false END,
      v_access_level,
      v_access_source,
      v_sub_id,
      v_expires_at,
      now()
    )
    ON CONFLICT (user_id, product_id) DO UPDATE SET
      has_access = EXCLUDED.has_access,
      access_level = EXCLUDED.access_level,
      access_source = EXCLUDED.access_source,
      subscription_id = EXCLUDED.subscription_id,
      expires_at = EXCLUDED.expires_at,
      updated_at = now();
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.recompute_user_product_access IS 'Recalcula user_product_access para un usuario. Llamado desde webhooks y reconciliacion nocturna.';
