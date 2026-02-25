-- Migration: Empresa/Business profile support
-- Adds empresa_profiles table, empresa user type, empresa subscription plans,
-- registration flow, and expands onboarding_sessions.user_type CHECK.

-- ─────────────────────────────────────────────
-- 1. empresa_profiles table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.empresa_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Empresa classification
  empresa_type          TEXT CHECK (empresa_type IN ('startup','pyme','corporativo','hospital_privado','aseguradora','gobierno','otro')),
  razon_social          TEXT,
  rfc                   TEXT,
  industry              TEXT,
  employee_count_range  TEXT CHECK (employee_count_range IN ('1-10','11-50','51-200','201-1000','1000+')),

  -- Primary contact
  contact_name          TEXT,
  contact_email         TEXT,
  contact_phone         TEXT,
  cargo_contacto        TEXT,

  -- Platform usage intent
  apps_interest         JSONB DEFAULT '[]'::jsonb,
  num_medicos_estimado  INTEGER,

  -- Web / branding
  website_url           TEXT,
  logo_url              TEXT,

  -- Location
  country_code          CHAR(2) NOT NULL DEFAULT 'MX',
  region_code           TEXT,

  -- Trust & verification
  trust_level           INTEGER NOT NULL DEFAULT 0 CHECK (trust_level BETWEEN 0 AND 3),
  verification_status   TEXT NOT NULL DEFAULT 'pending'
                          CHECK (verification_status IN ('pending','verified','rejected','needs_review')),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT empresa_profiles_user_id_unique UNIQUE (user_id)
);

-- Trigger: keep updated_at fresh
CREATE TRIGGER trg_empresa_profiles_updated_at
  BEFORE UPDATE ON public.empresa_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 2. Expand onboarding_sessions.user_type CHECK to include 'empresa'
-- ─────────────────────────────────────────────
ALTER TABLE public.onboarding_sessions
  DROP CONSTRAINT IF EXISTS onboarding_sessions_user_type_check;

ALTER TABLE public.onboarding_sessions
  ADD CONSTRAINT onboarding_sessions_user_type_check
    CHECK (user_type IN ('clinic', 'professional', 'empresa'));

-- ─────────────────────────────────────────────
-- 3. Expand subscription_plans.plan_type CHECK to include 'empresa'
-- ─────────────────────────────────────────────
ALTER TABLE public.subscription_plans
  DROP CONSTRAINT IF EXISTS subscription_plans_plan_type_check;

ALTER TABLE public.subscription_plans
  ADD CONSTRAINT subscription_plans_plan_type_check
    CHECK (plan_type IN ('individual', 'clinic', 'bundle', 'empresa'));

-- ─────────────────────────────────────────────
-- 3b. Expand registration_flows.flow_type CHECK to include 'empresa'
-- ─────────────────────────────────────────────
ALTER TABLE public.registration_flows
  DROP CONSTRAINT IF EXISTS registration_flows_flow_type_check;

ALTER TABLE public.registration_flows
  ADD CONSTRAINT registration_flows_flow_type_check
    CHECK (flow_type IN ('clinic', 'professional', 'empresa'));

-- ─────────────────────────────────────────────
-- 4. Seed: empresa user type
-- ─────────────────────────────────────────────
INSERT INTO public.user_types (slug, label_es, requires_cedula, requires_specialty, default_plan_slug)
VALUES ('empresa', 'Empresa / Institución Privada', false, false, 'empresa-basico')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 5. Seed: empresa subscription plans
-- ─────────────────────────────────────────────
INSERT INTO public.subscription_plans (
  slug, name, description, plan_type, billing_interval,
  price_mxn_cents, price_usd_cents,
  price_mxn_annual_cents, price_usd_annual_cents,
  max_seats, trial_days, grace_period_days,
  features, is_featured, sort_order
) VALUES
  (
    'empresa-basico',
    'Empresa Básico',
    'Para empresas pequeñas. Hasta 5 profesionales de salud con acceso al ecosistema DeepLux.',
    'empresa', 'monthly',
    149900, 7499,
    1499000, 74990,
    5, 14, 3,
    '["Hasta 5 asientos", "Expediente-DLM + Escalas-DLM", "Panel de empresa", "14 días de prueba", "Soporte por email"]',
    false, 8
  ),
  (
    'empresa-pro',
    'Empresa Pro',
    'Para equipos medianos. Hasta 25 médicos con todas las apps del ecosistema.',
    'empresa', 'monthly',
    349900, 17499,
    3499000, 174990,
    25, 14, 3,
    '["Hasta 25 asientos", "Todas las apps del ecosistema", "Panel avanzado de empresa", "Reportes de uso", "Soporte dedicado", "CFDI automático"]',
    true, 9
  ),
  (
    'empresa-enterprise',
    'Empresa Enterprise',
    'Asientos ilimitados para grandes corporativos, aseguradoras y redes hospitalarias.',
    'empresa', 'monthly',
    0, 0,
    0, 0,
    NULL, 14, 7,
    '["Asientos ilimitados", "Todas las apps del ecosistema", "Integraciones custom", "SLA garantizado", "Gerente de cuenta dedicado", "CFDI automático", "Portal de salud corporativa"]',
    false, 10
  )
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 6. plan_products for empresa plans
-- ─────────────────────────────────────────────
DO $$
DECLARE
  v_plan_id UUID;
BEGIN
  -- EMPRESA BASICO: escalas + expediente
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'empresa-basico';
  IF v_plan_id IS NOT NULL THEN
    INSERT INTO public.plan_products (plan_id, product_id, access_level)
    SELECT v_plan_id, id, 'full' FROM public.products WHERE slug IN ('escalas-dlm', 'expediente-dlm')
    ON CONFLICT DO NOTHING;
  END IF;

  -- EMPRESA PRO: all apps
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'empresa-pro';
  IF v_plan_id IS NOT NULL THEN
    INSERT INTO public.plan_products (plan_id, product_id, access_level)
    SELECT v_plan_id, id, 'full' FROM public.products
    ON CONFLICT DO NOTHING;
  END IF;

  -- EMPRESA ENTERPRISE: all apps
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'empresa-enterprise';
  IF v_plan_id IS NOT NULL THEN
    INSERT INTO public.plan_products (plan_id, product_id, access_level)
    SELECT v_plan_id, id, 'full' FROM public.products
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- ─────────────────────────────────────────────
-- 7. Seed: empresa registration flow
-- ─────────────────────────────────────────────
INSERT INTO public.registration_flows (flow_type, version, name, description, steps)
VALUES (
  'empresa', 1,
  'Registro de Empresa / Institución Privada',
  'Flujo de registro para empresas, aseguradoras, corporativos y redes hospitalarias privadas.',
  '[
    {"step": 1, "name": "Tipo de organización",   "description": "¿Qué tipo de empresa u organización eres?"},
    {"step": 2, "name": "Datos generales",         "description": "Información de la empresa y datos fiscales"},
    {"step": 3, "name": "Contacto responsable",    "description": "Persona a cargo de la cuenta"},
    {"step": 4, "name": "Uso de la plataforma",    "description": "¿Para qué usarás DeepLux en tu empresa?"},
    {"step": 5, "name": "Elige tu plan",           "description": "Plan para tu organización"},
    {"step": 6, "name": "Pago",                    "description": "Activa tu suscripción empresarial"}
  ]'::jsonb
)
ON CONFLICT (flow_type, version) DO NOTHING;

-- ─────────────────────────────────────────────
-- 8. RLS for empresa_profiles
-- ─────────────────────────────────────────────
ALTER TABLE public.empresa_profiles ENABLE ROW LEVEL SECURITY;

-- Owner: full access
CREATE POLICY "empresa_profiles_owner_all" ON public.empresa_profiles
  FOR ALL USING (user_id = auth.uid());

-- Staff (service_role): can read all for verification — handled via service_role bypass
