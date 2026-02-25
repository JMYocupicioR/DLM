-- Migration: Add super_admin user type and clinic_financials for income/expense tracking
-- Extends user_types and creates clinic_financials for clinic owner dashboards

-- ─────────────────────────────────────────────
-- 1. Add super_admin to user_types (only if table exists)
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_types') THEN
    INSERT INTO public.user_types (slug, label_es, requires_cedula, requires_specialty, default_plan_slug, is_active) VALUES
      ('super_admin', 'Super Administrador (CEO)', false, false, 'libre', true)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 2. clinic_financials (income and expense tracking for clinic owners)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clinic_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense')),
  category TEXT NOT NULL, -- e.g. 'consultas', 'procedimientos', 'nómina', 'renta', 'suministros'
  amount_mxn_cents INTEGER NOT NULL, -- Positive for income, negative for expense (or store abs and use entry_type)
  description TEXT,
  reference_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.clinic_financials IS 'Registro de ingresos y gastos internos de clínicas para dashboard de administración.';

CREATE INDEX IF NOT EXISTS idx_clinic_financials_clinic_id ON public.clinic_financials(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_financials_entry_type ON public.clinic_financials(entry_type);
CREATE INDEX IF NOT EXISTS idx_clinic_financials_reference_date ON public.clinic_financials(reference_date);

DROP TRIGGER IF EXISTS trg_clinic_financials_updated_at ON public.clinic_financials;
CREATE TRIGGER trg_clinic_financials_updated_at
  BEFORE UPDATE ON public.clinic_financials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 3. RLS policies for clinic_financials
-- ─────────────────────────────────────────────
ALTER TABLE public.clinic_financials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clinic_financials' AND policyname = 'clinic_financials_admin_all'
  ) THEN
    CREATE POLICY "clinic_financials_admin_all" ON public.clinic_financials
      FOR ALL USING (public.is_clinic_admin(clinic_id));
  END IF;
END $$;
