-- Migration: Identity & Professional Verification
-- Tables: user_types, professional_profiles, license_verifications, clinic_profiles, profile_completion_tasks

-- ─────────────────────────────────────────────
-- 1. user_types (catalog, extensible without migration)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label_es TEXT NOT NULL,
  requires_cedula BOOLEAN DEFAULT false,
  requires_specialty BOOLEAN DEFAULT false,
  default_plan_slug TEXT DEFAULT 'libre',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.user_types IS 'Catalogo de tipos de usuario profesional. Tabla en lugar de enum para extender sin migraciones.';

-- ─────────────────────────────────────────────
-- 2. professional_profiles (extends profiles for medical professionals)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_type_id UUID REFERENCES public.user_types(id),
  professional_stage TEXT, -- e.g. "3er año de residencia", "Adscrito IMSS"
  cedula_profesional TEXT,
  cedula_especialidad TEXT,
  specialty TEXT,
  subspecialty TEXT,
  institution_affiliation TEXT,
  graduation_year INTEGER,
  conacem_certified BOOLEAN DEFAULT false,
  conacem_expiry_year INTEGER,
  -- trust_level: 0=unverified 1=email_confirmed 2=docs_submitted 3=verified
  trust_level INTEGER NOT NULL DEFAULT 0 CHECK (trust_level BETWEEN 0 AND 3),
  curp TEXT,
  rfc TEXT,
  country_code CHAR(2) NOT NULL DEFAULT 'MX',
  region_code TEXT, -- e.g. 'CDMX', 'JAL', 'NLE'
  public_profile_slug TEXT UNIQUE,
  profile_photo_url TEXT,
  bio TEXT,
  is_public_profile BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

COMMENT ON TABLE public.professional_profiles IS 'Datos extendidos de identidad profesional medica. 1:1 con profiles.';
COMMENT ON COLUMN public.professional_profiles.trust_level IS '0=sin verificar, 1=email confirmado, 2=documentos enviados, 3=verificado por DeepLux';

CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id ON public.professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_slug ON public.professional_profiles(public_profile_slug);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_trust_level ON public.professional_profiles(trust_level);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_specialty ON public.professional_profiles(specialty);

-- ─────────────────────────────────────────────
-- 3. license_verifications (audit trail for credential verifications)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.license_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_type TEXT NOT NULL CHECK (license_type IN ('cedula_profesional', 'cedula_especialidad', 'conacem', 'cofepris', 'institutional')),
  license_number TEXT,
  source TEXT NOT NULL DEFAULT 'manual_upload' CHECK (source IN ('manual_upload', 'sep_api', 'conacem_api', 'staff_review')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'needs_review')),
  evidence JSONB DEFAULT '[]'::jsonb, -- Array of {url, type, uploaded_at}
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  rejection_reason TEXT,
  expires_at DATE, -- For certifications with expiry
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.license_verifications IS 'Trazabilidad completa de verificaciones de credenciales profesionales.';
COMMENT ON COLUMN public.license_verifications.evidence IS 'Array de {url, type, uploaded_at}. URLs a Supabase Storage.';

CREATE INDEX IF NOT EXISTS idx_license_verifications_profile_id ON public.license_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_license_verifications_status ON public.license_verifications(status);

-- ─────────────────────────────────────────────
-- 4. clinic_profiles (extends clinics with MX-specific org data)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clinic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  clinic_type TEXT NOT NULL DEFAULT 'clinica' CHECK (clinic_type IN ('hospital', 'clinica', 'consultorio', 'laboratorio', 'rehabilitacion', 'otro')),
  cofepris_number TEXT,
  repris_number TEXT,
  rfc TEXT,
  razon_social TEXT,
  cfdi_regime TEXT, -- SAT fiscal regime code
  director_cedula TEXT,
  director_name TEXT,
  specialties JSONB DEFAULT '[]'::jsonb, -- Array of specialty slugs offered
  staff_size INTEGER,
  trust_level INTEGER NOT NULL DEFAULT 0 CHECK (trust_level BETWEEN 0 AND 3),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs_review')),
  country_code CHAR(2) NOT NULL DEFAULT 'MX',
  region_code TEXT, -- e.g. 'CDMX'
  website_url TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (clinic_id)
);

COMMENT ON TABLE public.clinic_profiles IS 'Datos extendidos de clinica/organizacion con campos especificos para Mexico.';

CREATE INDEX IF NOT EXISTS idx_clinic_profiles_clinic_id ON public.clinic_profiles(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_profiles_trust_level ON public.clinic_profiles(trust_level);

-- ─────────────────────────────────────────────
-- 5. profile_completion_tasks (progressive unlock checklist)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_completion_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type_id UUID REFERENCES public.user_types(id),
  -- NULL user_type_id = applies to all types
  task_key TEXT NOT NULL,
  label_es TEXT NOT NULL,
  description_es TEXT,
  unlocks_action TEXT, -- 'prescribe', 'export_data', 'issue_cfdi', 'public_profile'
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.profile_completion_tasks IS 'Checklist de tareas que desbloquean acciones especificas al completarse.';

-- ─────────────────────────────────────────────
-- 6. Triggers: updated_at automation
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_professional_profiles_updated_at
  BEFORE UPDATE ON public.professional_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_license_verifications_updated_at
  BEFORE UPDATE ON public.license_verifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_clinic_profiles_updated_at
  BEFORE UPDATE ON public.clinic_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
