-- Migration: Billing, Audit Log, and Webhook Idempotency
-- Tables: invoices, webhook_events, audit_log

-- ─────────────────────────────────────────────
-- 1. invoices (payment history with CFDI support)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id),
  -- Who was billed
  user_id UUID REFERENCES public.profiles(id),
  clinic_id UUID REFERENCES public.clinics(id),
  -- Amounts
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN',
  tax_cents INTEGER DEFAULT 0,
  subtotal_cents INTEGER,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'paid', 'failed', 'refunded', 'voided')
  ),
  -- Payment processor
  payment_processor TEXT CHECK (payment_processor IN ('stripe', 'conekta')),
  processor_invoice_id TEXT,
  processor_charge_id TEXT,
  -- CFDI (Mexican fiscal invoice)
  cfdi_uuid TEXT, -- UUID del SAT
  cfdi_serie TEXT,
  cfdi_folio TEXT,
  cfdi_pdf_url TEXT,
  cfdi_xml_url TEXT,
  cfdi_requested_at TIMESTAMPTZ,
  cfdi_issued_at TIMESTAMPTZ,
  cfdi_facturapi_id TEXT, -- Facturapi.io internal ID
  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  -- Billing details snapshot (at time of payment)
  billing_name TEXT,
  billing_rfc TEXT,
  billing_address JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.invoices IS 'Historial de cobros con soporte para facturas CFDI del SAT.';
COMMENT ON COLUMN public.invoices.cfdi_uuid IS 'UUID del Comprobante Fiscal Digital por Internet (SAT Mexico).';

CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_clinic_id ON public.invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 2. webhook_events (idempotency and traceability)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor TEXT NOT NULL CHECK (processor IN ('stripe', 'conekta')),
  event_id TEXT NOT NULL, -- ID from the payment processor (UNIQUE per processor)
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'received' CHECK (
    status IN ('received', 'processing', 'processed', 'failed', 'skipped')
  ),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (processor, event_id) -- Idempotency key
);

COMMENT ON TABLE public.webhook_events IS 'Registro de eventos de webhooks para idempotencia. Evita dobles cobros por reintentos.';
COMMENT ON COLUMN public.webhook_events.event_id IS 'ID del evento del procesador de pago. Con (processor, event_id) como clave de idempotencia.';

CREATE INDEX IF NOT EXISTS idx_webhook_events_processor_event ON public.webhook_events(processor, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at);

-- ─────────────────────────────────────────────
-- 3. audit_log (critical change traceability)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- who made the change
  action TEXT NOT NULL CHECK (
    action IN (
      'plan_upgrade', 'plan_downgrade', 'plan_cancel', 'plan_restore',
      'access_granted', 'access_revoked',
      'verification_approved', 'verification_rejected', 'verification_submitted',
      'seat_assigned', 'seat_removed',
      'subscription_created', 'subscription_expired',
      'trust_level_changed',
      'cfdi_issued', 'refund_issued'
    )
  ),
  target_type TEXT NOT NULL, -- 'subscription', 'user', 'clinic', 'license_verification', 'seat'
  target_id UUID,
  before JSONB, -- state before the change
  after JSONB,  -- state after the change
  ip_address INET,
  user_agent TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.audit_log IS 'Trazabilidad completa de cambios criticos en suscripciones, accesos y verificaciones.';

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON public.audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
