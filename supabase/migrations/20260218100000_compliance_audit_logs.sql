-- Migration: compliance_audit_logs for legal document acceptance tracking
-- Stores timestamp, IP, user_id when user accepts Terms, Privacy Policy, etc.

CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL, -- 'terminos', 'privacidad', 'eula', 'baa', etc.
  document_version TEXT, -- e.g. '2025-02-01' for version tracking
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.compliance_audit_logs IS 'Registro de aceptación de documentos legales (LFPDPPP, GDPR). Timestamp, IP y versión para auditoría.';

CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_user_id ON public.compliance_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_document_type ON public.compliance_audit_logs(document_type);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_accepted_at ON public.compliance_audit_logs(accepted_at);

-- RLS: users can read their own logs; inserts via service role or authenticated user
ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_audit_logs_owner_read" ON public.compliance_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "compliance_audit_logs_owner_insert" ON public.compliance_audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
