-- Migration: Coupons system
-- Tables: coupons, coupon_redemptions
-- Fuente de verdad en Supabase; sincronizado con Stripe (stripe_coupon_id + stripe_promotion_code_id)
-- Editable desde UI admin por super_admin.

-- ─────────────────────────────────────────────
-- Helper: is_super_admin()
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'super_admin'
  ) OR EXISTS (
    SELECT 1
    FROM public.professional_profiles pp
    JOIN public.user_types ut ON ut.id = pp.user_type_id
    WHERE pp.user_id = auth.uid() AND ut.slug = 'super_admin'
  );
$$;

COMMENT ON FUNCTION public.is_super_admin IS 'Devuelve true si el usuario autenticado es super_admin (CEO). Chequea profiles.role y user_types.slug.';

-- ─────────────────────────────────────────────
-- 1. coupons (editable desde admin UI; sync con Stripe)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identidad
  code TEXT NOT NULL UNIQUE,              -- código que canjea el usuario (ej. "LANZAMIENTO50")
  name TEXT NOT NULL,                     -- nombre interno visible en admin
  description TEXT,

  -- Tipo y valor del descuento (espejo del modelo de Stripe)
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  percent_off NUMERIC(5,2),               -- 0-100 si discount_type = 'percentage'
  amount_off_cents INTEGER,               -- centavos si 'fixed_amount'
  currency TEXT NOT NULL DEFAULT 'MXN',

  -- Duración del descuento (igual a Stripe coupon.duration)
  duration TEXT NOT NULL DEFAULT 'once' CHECK (duration IN ('once', 'repeating', 'forever')),
  duration_in_months INTEGER,             -- solo si duration = 'repeating'

  -- Restricciones de aplicabilidad
  applies_to_plan_ids UUID[] NOT NULL DEFAULT '{}',    -- vacío = cualquier plan
  applies_to_plan_types TEXT[] NOT NULL DEFAULT '{}',  -- ['individual','clinic','empresa'] - vacío = cualquiera
  first_time_only BOOLEAN NOT NULL DEFAULT false,      -- solo para clientes nuevos
  min_amount_cents INTEGER,                            -- monto mínimo del plan en MXN
  allowed_billing_intervals TEXT[] NOT NULL DEFAULT '{}', -- ['monthly','annual'] - vacío = ambos

  -- Límites de uso
  max_redemptions INTEGER,                -- NULL = ilimitado
  times_redeemed INTEGER NOT NULL DEFAULT 0,
  redeem_by TIMESTAMPTZ,                  -- fecha de expiración del cupón

  -- Sync con Stripe (fuente: Supabase; espejo: Stripe)
  stripe_coupon_id TEXT UNIQUE,
  stripe_promotion_code_id TEXT UNIQUE,

  -- Estado y auditoría
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Integridad: debe haber un valor de descuento coherente con el tipo
  CONSTRAINT chk_discount_value CHECK (
    (discount_type = 'percentage'   AND percent_off IS NOT NULL AND percent_off > 0 AND percent_off <= 100 AND amount_off_cents IS NULL) OR
    (discount_type = 'fixed_amount' AND amount_off_cents IS NOT NULL AND amount_off_cents > 0 AND percent_off IS NULL)
  ),
  CONSTRAINT chk_repeating_has_months CHECK (
    duration <> 'repeating' OR duration_in_months IS NOT NULL
  )
);

COMMENT ON TABLE public.coupons IS 'Cupones de descuento. Fuente de verdad en Supabase; replicados a Stripe al crear/actualizar.';
COMMENT ON COLUMN public.coupons.code IS 'Código que el usuario introduce al pagar (case-insensitive por convención).';
COMMENT ON COLUMN public.coupons.stripe_promotion_code_id IS 'ID del promotion_code de Stripe (el objeto canjeable asociado al coupon).';

CREATE INDEX IF NOT EXISTS idx_coupons_code_lower ON public.coupons ((LOWER(code)));
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons (is_active, redeem_by);

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON public.coupons;
CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 2. coupon_redemptions (histórico de uso)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE RESTRICT,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  -- Snapshot del descuento aplicado
  amount_discounted_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MXN',
  -- Stripe references
  stripe_invoice_id TEXT,
  stripe_checkout_session_id TEXT,
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.coupon_redemptions IS 'Registro histórico de redenciones de cupones. Una fila por aplicación del descuento en una factura.';

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_subscription_id ON public.coupon_redemptions(subscription_id);

-- ─────────────────────────────────────────────
-- 3. Extender audit_log.action CHECK para incluir acciones de cupones
-- ─────────────────────────────────────────────
ALTER TABLE public.audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;
ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_action_check CHECK (
  action IN (
    'plan_upgrade', 'plan_downgrade', 'plan_cancel', 'plan_restore',
    'access_granted', 'access_revoked',
    'verification_approved', 'verification_rejected', 'verification_submitted',
    'seat_assigned', 'seat_removed',
    'subscription_created', 'subscription_expired',
    'trust_level_changed',
    'cfdi_issued', 'refund_issued',
    'coupon_created', 'coupon_updated', 'coupon_deactivated', 'coupon_redeemed'
  )
);

-- ─────────────────────────────────────────────
-- 4. RLS policies
-- ─────────────────────────────────────────────
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- super_admin: CRUD completo sobre cupones
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='coupons_super_admin_all') THEN
    CREATE POLICY "coupons_super_admin_all" ON public.coupons
      FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
  END IF;

  -- authenticated: SELECT sólo cupones vigentes para validar códigos en checkout
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='coupons_authenticated_read_active') THEN
    CREATE POLICY "coupons_authenticated_read_active" ON public.coupons
      FOR SELECT TO authenticated
      USING (is_active = true AND (redeem_by IS NULL OR redeem_by > now()));
  END IF;

  -- coupon_redemptions: super_admin ve todo
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupon_redemptions' AND policyname='coupon_redemptions_super_admin_all') THEN
    CREATE POLICY "coupon_redemptions_super_admin_all" ON public.coupon_redemptions
      FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
  END IF;

  -- coupon_redemptions: usuario ve sus propias redenciones
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupon_redemptions' AND policyname='coupon_redemptions_owner_select') THEN
    CREATE POLICY "coupon_redemptions_owner_select" ON public.coupon_redemptions
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 5. Función: validate_coupon(code, plan_id, billing_interval, user_id)
-- Valida aplicabilidad y devuelve el descuento calculado en centavos.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_plan_id UUID,
  p_billing_interval TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  valid BOOLEAN,
  reason TEXT,
  coupon_id UUID,
  discount_type TEXT,
  percent_off NUMERIC,
  amount_off_cents INTEGER,
  discount_cents INTEGER,
  final_price_cents INTEGER,
  stripe_promotion_code_id TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_coupon public.coupons;
  v_plan public.subscription_plans;
  v_base_price INTEGER;
  v_already_redeemed INTEGER;
BEGIN
  -- Buscar cupón por código (case-insensitive)
  SELECT * INTO v_coupon FROM public.coupons WHERE LOWER(code) = LOWER(p_code) LIMIT 1;

  IF v_coupon.id IS NULL THEN
    RETURN QUERY SELECT false, 'Cupón no existe', NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::INTEGER, 0, 0, NULL::TEXT;
    RETURN;
  END IF;

  IF NOT v_coupon.is_active THEN
    RETURN QUERY SELECT false, 'Cupón inactivo', v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, 0, 0, v_coupon.stripe_promotion_code_id;
    RETURN;
  END IF;

  IF v_coupon.redeem_by IS NOT NULL AND v_coupon.redeem_by < now() THEN
    RETURN QUERY SELECT false, 'Cupón expirado', v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, 0, 0, v_coupon.stripe_promotion_code_id;
    RETURN;
  END IF;

  IF v_coupon.max_redemptions IS NOT NULL AND v_coupon.times_redeemed >= v_coupon.max_redemptions THEN
    RETURN QUERY SELECT false, 'Cupón agotado', v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, 0, 0, v_coupon.stripe_promotion_code_id;
    RETURN;
  END IF;

  SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id LIMIT 1;
  IF v_plan.id IS NULL THEN
    RETURN QUERY SELECT false, 'Plan no existe', v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, 0, 0, v_coupon.stripe_promotion_code_id;
    RETURN;
  END IF;

  -- Restricción por plan_ids
  IF array_length(v_coupon.applies_to_plan_ids, 1) IS NOT NULL AND NOT (p_plan_id = ANY(v_coupon.applies_to_plan_ids)) THEN
    RETURN QUERY SELECT false, 'Cupón no aplicable a este plan', v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, 0, 0, v_coupon.stripe_promotion_code_id;
    RETURN;
  END IF;

  -- Restricción por plan_types
  IF array_length(v_coupon.applies_to_plan_types, 1) IS NOT NULL AND NOT (v_plan.plan_type = ANY(v_coupon.applies_to_plan_types)) THEN
    RETURN QUERY SELECT false, 'Cupón no aplicable a este tipo de plan', v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, 0, 0, v_coupon.stripe_promotion_code_id;
    RETURN;
  END IF;

  -- Restricción por billing_interval
  IF array_length(v_coupon.allowed_billing_intervals, 1) IS NOT NULL AND NOT (p_billing_interval = ANY(v_coupon.allowed_billing_intervals)) THEN
    RETURN QUERY SELECT false, 'Cupón no aplicable a esta periodicidad', v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, 0, 0, v_coupon.stripe_promotion_code_id;
    RETURN;
  END IF;

  -- Precio base según periodicidad
  v_base_price := CASE
    WHEN p_billing_interval = 'annual' THEN COALESCE(v_plan.price_mxn_annual_cents, v_plan.price_mxn_cents * 12)
    ELSE v_plan.price_mxn_cents
  END;

  IF v_coupon.min_amount_cents IS NOT NULL AND v_base_price < v_coupon.min_amount_cents THEN
    RETURN QUERY SELECT false, 'Monto mínimo no alcanzado', v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, 0, v_base_price, v_coupon.stripe_promotion_code_id;
    RETURN;
  END IF;

  -- Restricción first_time_only
  IF v_coupon.first_time_only AND p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_already_redeemed
    FROM public.subscriptions
    WHERE user_id = p_user_id AND status IN ('active','trialing','past_due','canceled','expired');
    IF v_already_redeemed > 0 THEN
      RETURN QUERY SELECT false, 'Sólo para clientes nuevos', v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, 0, v_base_price, v_coupon.stripe_promotion_code_id;
      RETURN;
    END IF;
  END IF;

  -- Calcular descuento
  DECLARE
    v_discount_cents INTEGER;
    v_final_price INTEGER;
  BEGIN
    IF v_coupon.discount_type = 'percentage' THEN
      v_discount_cents := (v_base_price * v_coupon.percent_off / 100)::INTEGER;
    ELSE
      v_discount_cents := LEAST(v_coupon.amount_off_cents, v_base_price);
    END IF;
    v_final_price := GREATEST(v_base_price - v_discount_cents, 0);

    RETURN QUERY SELECT true, 'ok'::TEXT, v_coupon.id, v_coupon.discount_type, v_coupon.percent_off, v_coupon.amount_off_cents, v_discount_cents, v_final_price, v_coupon.stripe_promotion_code_id;
  END;
END;
$$;

COMMENT ON FUNCTION public.validate_coupon IS 'Valida un cupón para un plan+periodicidad+usuario y devuelve el descuento calculado.';

GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT, UUID, TEXT, UUID) TO authenticated, anon;

-- ─────────────────────────────────────────────
-- 6. Función: increment_coupon_redemption
-- Incrementa el contador times_redeemed atómicamente y crea la fila de redemption.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_coupon_redemption(
  p_coupon_id UUID,
  p_subscription_id UUID,
  p_user_id UUID,
  p_clinic_id UUID,
  p_amount_discounted_cents INTEGER,
  p_currency TEXT,
  p_stripe_invoice_id TEXT,
  p_stripe_checkout_session_id TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_redemption_id UUID;
BEGIN
  UPDATE public.coupons
  SET times_redeemed = times_redeemed + 1,
      updated_at = now()
  WHERE id = p_coupon_id;

  INSERT INTO public.coupon_redemptions (
    coupon_id, subscription_id, user_id, clinic_id,
    amount_discounted_cents, currency, stripe_invoice_id, stripe_checkout_session_id
  ) VALUES (
    p_coupon_id, p_subscription_id, p_user_id, p_clinic_id,
    COALESCE(p_amount_discounted_cents, 0), COALESCE(p_currency, 'MXN'),
    p_stripe_invoice_id, p_stripe_checkout_session_id
  ) RETURNING id INTO v_redemption_id;

  RETURN v_redemption_id;
END;
$$;

COMMENT ON FUNCTION public.increment_coupon_redemption IS 'Incrementa times_redeemed y registra la redemption. Llamado desde el webhook de Stripe.';
