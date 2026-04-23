-- Migration: Service Requests (Conexiones - Servicios de Tecnología Personalizados)
-- Tabla para que profesionales de salud soliciten servicios tech personalizados.
-- El super_admin revisa, acepta, deniega o propone cambios.

CREATE TABLE IF NOT EXISTS public.service_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quien solicita (puede ser anónimo o autenticado)
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  requester_name  TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  requester_role  TEXT NOT NULL,           -- 'medico' | 'clinica' | 'empresa' | 'otro'
  requester_specialty TEXT,                -- especialidad médica si aplica
  requester_city  TEXT,

  -- Descripción del servicio
  service_type    TEXT NOT NULL,           -- 'landing_page' | 'app_personalizada' | 'automatizacion' | 'edicion_video' | 'otro'
  service_title   TEXT,                    -- título libre que el usuario da a su proyecto
  service_description TEXT NOT NULL,
  target_audience TEXT,                    -- a quién va dirigido el servicio resultante
  budget_range    TEXT,                    -- '$5,000-$15,000' | '$15,000-$50,000' | etc.
  timeline        TEXT,                    -- '1-2 semanas' | '1 mes' | '3+ meses' | 'flexible'
  has_branding    BOOLEAN DEFAULT false,   -- ya tiene logo/identidad visual
  extra_details   TEXT,                    -- campo abierto adicional

  -- Revisión del super_admin
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','reviewing','accepted','accepted_with_details','changes_proposed','denied')),
  admin_notes     TEXT,                    -- respuesta o notas del super_admin
  reviewed_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.service_requests IS
  'Solicitudes de servicios de tecnología personalizada enviadas desde /conexiones/solicitar. Revisadas por super_admin.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id  ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status   ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created  ON public.service_requests(created_at DESC);

-- Updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_service_requests_updated_at ON public.service_requests;
CREATE TRIGGER trg_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (formulario público)
CREATE POLICY "service_requests_insert_public"
  ON public.service_requests FOR INSERT
  WITH CHECK (true);

-- El propietario puede ver su propia solicitud
CREATE POLICY "service_requests_select_own"
  ON public.service_requests FOR SELECT
  USING (auth.uid() = user_id);

-- El super_admin (service role) puede ver y modificar todo; se aplica vía service client
