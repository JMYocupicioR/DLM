-- Seed: Catalog data - user_types, products, plans, plan_products, registration flows

-- ─────────────────────────────────────────────
-- 1. user_types
-- ─────────────────────────────────────────────
INSERT INTO public.user_types (slug, label_es, requires_cedula, requires_specialty, default_plan_slug) VALUES
  ('specialist',       'Especialista Médico',           true,  true,  'suite-medica'),
  ('general_physician','Médico General / Internista',   true,  false, 'profesional-basico'),
  ('resident',         'Médico Residente',              true,  true,  'profesional-basico'),
  ('intern',           'Pasante de Servicio Social',    false, false, 'libre'),
  ('student',          'Estudiante de Medicina',        false, false, 'libre'),
  ('researcher',       'Investigador',                  true,  false, 'investigador'),
  ('physiotherapist',  'Fisioterapeuta / Rehabilitador',true,  false, 'profesional-basico'),
  ('clinic_admin',     'Administrador de Clínica',      true,  false, 'clinica-starter'),
  ('other',            'Otro Profesional de la Salud',  false, false, 'profesional-basico')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. products (6 apps)
-- ─────────────────────────────────────────────
INSERT INTO public.products (slug, name, description, short_description, target_audience, app_url, color_hex, sort_order) VALUES
  ('escalas-dlm',    'Escalas-DLM',       'Repositorio completo de escalas médicas y herramientas de evaluación clínica para diagnóstico preciso.', 'Escalas médicas y evaluaciones', 'both', 'https://www.escalas-dlm.com', '#41E2BA', 1),
  ('expediente-dlm', 'Expediente-DLM',    'Sistema de expediente clínico electrónico seguro y eficiente para optimizar la gestión de pacientes.', 'Expediente clínico electrónico', 'both', 'https://expediente-dlm.netlify.app/', '#2E3192', 2),
  ('toxina-dlm',     'Toxina-DLM',        'Gestión especializada de aplicaciones de toxina botulínica: dosis, sitios de inyección y seguimiento.', 'Gestión de toxina botulínica', 'both', NULL, '#6C63FF', 3),
  ('cognitivapp-dlm','CognitivApp-DLM',   'Plataforma innovadora para rehabilitación cognitiva, diseñada para mejorar la función cerebral de pacientes.', 'Rehabilitación cognitiva', 'both', NULL, '#FF6B6B', 4),
  ('physio-dlm',     'Physio-DLM',        'Telerehabilitación con videos, seguimiento en línea y cursos de educación médica continua.', 'Telerehabilitación y CME', 'both', NULL, '#FFA600', 5),
  ('portal-3d',      'Portal Manufactura 3D', 'Modelos anatómicos 3D, prótesis e implantes a medida para cirugía planificada.', 'Manufactura médica 3D', 'clinic', NULL, '#00C9A7', 6)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 3. subscription_plans (7 plans)
-- ─────────────────────────────────────────────
INSERT INTO public.subscription_plans (
  slug, name, description, plan_type, billing_interval,
  price_mxn_cents, price_usd_cents,
  price_mxn_annual_cents, price_usd_annual_cents,
  max_seats, trial_days, grace_period_days,
  features, is_featured, sort_order
) VALUES
  -- Individual: Free
  ('libre',
   'Libre',
   'Para estudiantes y pasantes. Acceso limitado a EscalasDLM sin costo.',
   'individual', 'free',
   0, 0, 0, 0,
   NULL, 0, 0,
   '["Escalas médicas (solo lectura)", "Perfil en formación", "Sin tarjeta de crédito"]',
   false, 1),

  -- Individual: Profesional Basico
  ('profesional-basico',
   'Profesional Básico',
   'Expediente clínico y escalas completas para médicos generales, residentes e internistas.',
   'individual', 'monthly',
   29900, 1500,
   299000, 14900,
   NULL, 14, 3,
   '["Expediente-DLM completo", "Escalas-DLM completo", "14 días de prueba gratis", "Soporte por email"]',
   false, 2),

  -- Individual: Suite Medica
  ('suite-medica',
   'Suite Médica',
   'Todas las apps del ecosistema. Para especialistas que quieren el conjunto completo.',
   'individual', 'monthly',
   59900, 2999,
   599000, 29990,
   NULL, 14, 3,
   '["Todas las apps del ecosistema", "Expediente + Escalas + Toxina + CognitivApp + Physio", "Perfil público verificado", "Soporte prioritario"]',
   true, 3),

  -- Individual: Investigador
  ('investigador',
   'Investigador',
   'Suite Médica más funciones avanzadas de exportación de datos y plantillas de investigación.',
   'individual', 'monthly',
   39900, 1999,
   399000, 19990,
   NULL, 14, 3,
   '["Todo en Suite Médica", "Exportación de datos anonimizados", "Plantillas de investigación", "API de acceso a datos"]',
   false, 4),

  -- Clinic: Starter
  ('clinica-starter',
   'Clínica Starter',
   'Para consultorios pequeños. Hasta 3 médicos con Expediente y Escalas.',
   'clinic', 'monthly',
   89900, 4499,
   899000, 44990,
   3, 14, 3,
   '["Hasta 3 asientos", "Expediente-DLM + Escalas-DLM", "Panel de administración", "14 días de prueba"]',
   false, 5),

  -- Clinic: Pro
  ('clinica-pro',
   'Clínica Pro',
   'Para clínicas en crecimiento. Hasta 10 médicos con acceso a todo el ecosistema.',
   'clinic', 'monthly',
   249900, 12499,
   2499000, 124990,
   10, 14, 3,
   '["Hasta 10 asientos", "Todas las apps del ecosistema", "Portal Manufactura 3D", "Soporte dedicado", "CFDI automático"]',
   true, 6),

  -- Clinic: Enterprise
  ('clinica-enterprise',
   'Clínica Enterprise',
   'Asientos ilimitados, integraciones personalizadas y soporte dedicado para hospitales y grandes redes.',
   'clinic', 'monthly',
   0, 0, -- pricing negotiated
   0, 0,
   NULL, 14, 7,
   '["Asientos ilimitados", "Todas las apps del ecosistema", "Integraciones custom", "SLA garantizado", "Gerente de cuenta dedicado", "CFDI automático"]',
   false, 7)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 4. plan_products (which apps each plan includes)
-- ─────────────────────────────────────────────
-- Helper to insert plan_products by slug
DO $$
DECLARE
  v_plan_id UUID;
  v_product_id UUID;
BEGIN
  -- LIBRE: escalas readonly
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'libre';
  SELECT id INTO v_product_id FROM public.products WHERE slug = 'escalas-dlm';
  INSERT INTO public.plan_products (plan_id, product_id, access_level)
  VALUES (v_plan_id, v_product_id, 'readonly') ON CONFLICT DO NOTHING;

  -- PROFESIONAL BASICO: escalas + expediente (full)
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'profesional-basico';
  INSERT INTO public.plan_products (plan_id, product_id, access_level)
  SELECT v_plan_id, id, 'full' FROM public.products WHERE slug IN ('escalas-dlm', 'expediente-dlm')
  ON CONFLICT DO NOTHING;

  -- SUITE MEDICA: all individual apps (not portal-3d)
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'suite-medica';
  INSERT INTO public.plan_products (plan_id, product_id, access_level)
  SELECT v_plan_id, id, 'full' FROM public.products WHERE slug IN ('escalas-dlm','expediente-dlm','toxina-dlm','cognitivapp-dlm','physio-dlm')
  ON CONFLICT DO NOTHING;

  -- INVESTIGADOR: all individual apps + export level
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'investigador';
  INSERT INTO public.plan_products (plan_id, product_id, access_level)
  SELECT v_plan_id, id, 'full' FROM public.products WHERE slug IN ('escalas-dlm','expediente-dlm','toxina-dlm','cognitivapp-dlm','physio-dlm')
  ON CONFLICT DO NOTHING;

  -- CLINICA STARTER: escalas + expediente
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'clinica-starter';
  INSERT INTO public.plan_products (plan_id, product_id, access_level)
  SELECT v_plan_id, id, 'full' FROM public.products WHERE slug IN ('escalas-dlm', 'expediente-dlm')
  ON CONFLICT DO NOTHING;

  -- CLINICA PRO: all apps including portal-3d
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'clinica-pro';
  INSERT INTO public.plan_products (plan_id, product_id, access_level)
  SELECT v_plan_id, id, 'full' FROM public.products
  ON CONFLICT DO NOTHING;

  -- CLINICA ENTERPRISE: all apps
  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'clinica-enterprise';
  INSERT INTO public.plan_products (plan_id, product_id, access_level)
  SELECT v_plan_id, id, 'full' FROM public.products
  ON CONFLICT DO NOTHING;
END;
$$;

-- ─────────────────────────────────────────────
-- 5. registration_flows
-- ─────────────────────────────────────────────
INSERT INTO public.registration_flows (flow_type, version, name, description, steps) VALUES
  ('professional', 1, 'Registro Profesional de la Salud', 'Flujo de registro para médicos y profesionales de la salud independientes.',
   '[
     {"step": 1, "name": "Tipo de profesional", "description": "¿Cómo ejerces la medicina?"},
     {"step": 2, "name": "Datos personales", "description": "Información básica de identificación"},
     {"step": 3, "name": "Credenciales profesionales", "description": "Cédula y certificaciones"},
     {"step": 4, "name": "Formación y afiliación", "description": "Especialidad e institución"},
     {"step": 5, "name": "Elige tu plan", "description": "Selecciona el plan que se adapta a ti"},
     {"step": 6, "name": "Pago", "description": "Activa tu suscripción"}
   ]'::jsonb),
  ('clinic', 1, 'Registro de Clínica / Institución', 'Flujo de registro para clínicas, consultorios y hospitales.',
   '[
     {"step": 1, "name": "Tipo de organización", "description": "¿Qué tipo de institución eres?"},
     {"step": 2, "name": "Datos de la organización", "description": "Información básica de la clínica"},
     {"step": 3, "name": "Datos fiscales", "description": "RFC, razón social y CFDI"},
     {"step": 4, "name": "Registro sanitario", "description": "COFEPRIS y permisos"},
     {"step": 5, "name": "Médico director", "description": "Cédula del responsable médico"},
     {"step": 6, "name": "Tu equipo", "description": "Número de médicos y especialidades"},
     {"step": 7, "name": "Elige tu plan", "description": "Plan para tu institución"},
     {"step": 8, "name": "Pago", "description": "Activa tu suscripción"}
   ]'::jsonb)
ON CONFLICT (flow_type, version) DO NOTHING;

-- ─────────────────────────────────────────────
-- 6. profile_completion_tasks
-- ─────────────────────────────────────────────
INSERT INTO public.profile_completion_tasks (task_key, label_es, description_es, unlocks_action, is_required, sort_order) VALUES
  ('confirm_email',    'Confirmar correo electrónico',    'Verifica tu dirección de email para activar el trial.',                          NULL,          true,  1),
  ('add_profile_photo','Agregar foto de perfil',          'Una foto profesional aumenta la confianza de tus pacientes.',                    'public_profile', false, 2),
  ('add_cedula',       'Agregar cédula profesional',      'Número de cédula de la Dirección General de Profesiones (SEP).',                 'prescribe',   true,  3),
  ('upload_cedula_doc','Subir documento de cédula',       'Sube una foto de tu cédula profesional para verificación.',                      'prescribe',   true,  4),
  ('add_specialty',    'Agregar especialidad',            'Indica tu especialidad o subespecialidad principal.',                            NULL,          false, 5),
  ('complete_fiscal',  'Completar datos fiscales',        'RFC y régimen fiscal para emitir y recibir facturas CFDI.',                      'issue_cfdi',  false, 6),
  ('add_institution',  'Agregar institución de adscripción', 'Hospital o clínica donde ejerces principalmente.',                           NULL,          false, 7),
  ('verify_cedula',    'Verificación aprobada',           'Tu cédula ha sido verificada por el equipo DeepLux.',                           'export_data', true,  8)
ON CONFLICT DO NOTHING;
