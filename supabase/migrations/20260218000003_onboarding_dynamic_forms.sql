-- Migration: Dynamic Onboarding Forms
-- Tables: registration_flows, registration_questions, registration_responses, onboarding_sessions

-- ─────────────────────────────────────────────
-- 1. registration_flows (step definitions by registration type)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registration_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_type TEXT NOT NULL CHECK (flow_type IN ('clinic', 'professional')),
  version INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {step_number, name, description}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (flow_type, version)
);

COMMENT ON TABLE public.registration_flows IS 'Define los pasos del proceso de registro por tipo. Versionado para iterar sin migraciones.';

-- ─────────────────────────────────────────────
-- 2. registration_questions (versioned question bank)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registration_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES public.registration_flows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  field_key TEXT NOT NULL,
  label_es TEXT NOT NULL,
  placeholder_es TEXT,
  helper_text_es TEXT,
  input_type TEXT NOT NULL DEFAULT 'text' CHECK (
    input_type IN ('text', 'email', 'tel', 'number', 'select', 'multiselect', 'radio', 'checkbox', 'file', 'textarea', 'date')
  ),
  options JSONB DEFAULT '[]'::jsonb, -- Array of {value, label} for select/radio/checkbox
  validation_rules JSONB DEFAULT '{}'::jsonb, -- {required, minLength, maxLength, pattern, min, max}
  required_for_user_types JSONB DEFAULT '[]'::jsonb, -- Array of user_type slugs; empty = all
  excluded_for_user_types JSONB DEFAULT '[]'::jsonb, -- Array of user_type slugs that skip this question
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (flow_id, step_number, field_key)
);

COMMENT ON TABLE public.registration_questions IS 'Banco de preguntas del registro. Editable sin nuevas migraciones de schema.';

CREATE INDEX IF NOT EXISTS idx_registration_questions_flow_step ON public.registration_questions(flow_id, step_number);

-- ─────────────────────────────────────────────
-- 3. registration_responses (answers per user)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registration_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flow_id UUID NOT NULL REFERENCES public.registration_flows(id),
  question_id UUID NOT NULL REFERENCES public.registration_questions(id),
  response_value JSONB, -- flexible: string, array, object
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, question_id)
);

COMMENT ON TABLE public.registration_responses IS 'Respuestas del usuario durante el registro. Persiste entre sesiones.';

CREATE INDEX IF NOT EXISTS idx_registration_responses_user_flow ON public.registration_responses(user_id, flow_id);

CREATE TRIGGER trg_registration_responses_updated_at
  BEFORE UPDATE ON public.registration_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 4. onboarding_sessions (progress tracking and partial data cache)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES public.registration_flows(id),
  user_type TEXT NOT NULL CHECK (user_type IN ('clinic', 'professional')),
  current_step INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL DEFAULT 6,
  completed_steps JSONB DEFAULT '[]'::jsonb, -- Array of completed step numbers
  form_data JSONB DEFAULT '{}'::jsonb, -- Partial form data cache for resuming
  selected_user_type_slug TEXT, -- e.g. 'specialist', 'resident'
  selected_plan_slug TEXT, -- chosen plan before payment
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

COMMENT ON TABLE public.onboarding_sessions IS 'Progreso del registro. Permite retomar el proceso en cualquier paso.';

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id ON public.onboarding_sessions(user_id);

CREATE TRIGGER trg_onboarding_sessions_updated_at
  BEFORE UPDATE ON public.onboarding_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
