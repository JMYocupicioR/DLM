-- Migration: Subscription Catalog
-- Tables: products, subscription_plans, plan_products

-- ─────────────────────────────────────────────
-- 1. products (app catalog)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  target_audience TEXT NOT NULL DEFAULT 'both' CHECK (target_audience IN ('individual', 'clinic', 'both')),
  icon_url TEXT,
  app_url TEXT,
  color_hex TEXT DEFAULT '#41E2BA',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Catalogo de aplicaciones del ecosistema DeepLux.';

-- ─────────────────────────────────────────────
-- 2. subscription_plans (plan definitions)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL DEFAULT 'individual' CHECK (plan_type IN ('individual', 'clinic', 'bundle')),
  billing_interval TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annual', 'lifetime', 'free')),
  price_mxn_cents INTEGER NOT NULL DEFAULT 0,
  price_usd_cents INTEGER NOT NULL DEFAULT 0,
  price_mxn_annual_cents INTEGER, -- annual price if different
  price_usd_annual_cents INTEGER,
  max_seats INTEGER, -- NULL = unlimited, only for clinic plans
  stripe_price_id TEXT,
  stripe_price_id_annual TEXT,
  conekta_plan_id TEXT,
  conekta_plan_id_annual TEXT,
  features JSONB DEFAULT '[]'::jsonb, -- Array of feature strings for marketing display
  grace_period_days INTEGER NOT NULL DEFAULT 3,
  trial_days INTEGER NOT NULL DEFAULT 14,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.subscription_plans IS 'Definicion de planes de suscripcion. Soporta facturacion mensual y anual.';
COMMENT ON COLUMN public.subscription_plans.price_mxn_cents IS 'Precio en centavos MXN para evitar errores de punto flotante.';

CREATE TRIGGER trg_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 3. plan_products (M2M: which products each plan includes)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'full' CHECK (access_level IN ('full', 'limited', 'readonly')),
  UNIQUE (plan_id, product_id)
);

COMMENT ON TABLE public.plan_products IS 'Relacion M2M entre planes y productos. Define que apps incluye cada plan.';

CREATE INDEX IF NOT EXISTS idx_plan_products_plan_id ON public.plan_products(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_products_product_id ON public.plan_products(product_id);
