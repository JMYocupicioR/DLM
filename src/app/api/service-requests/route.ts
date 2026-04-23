import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      requester_name,
      requester_email,
      requester_phone,
      requester_role,
      requester_specialty,
      requester_city,
      service_type,
      service_title,
      service_description,
      target_audience,
      budget_range,
      timeline,
      has_branding,
      extra_details,
    } = body;

    if (!requester_name || !requester_email || !requester_role || !service_type || !service_description) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    // Try to attach user_id if authenticated
    let user_id: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) user_id = user.id;
    } catch { /* anonymous is ok */ }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[service-requests POST] Missing SUPABASE_SERVICE_ROLE_KEY');
      const message =
        process.env.NODE_ENV === 'development'
          ? 'Falta SUPABASE_SERVICE_ROLE_KEY en el entorno. Añádela en .env.local (Supabase → Project Settings → API → service_role secret).'
          : 'Error de configuración del servidor.';
      return NextResponse.json({ error: message }, { status: 503 });
    }

    const service = await createServiceClient();

    const { error } = await service.from('service_requests').insert({
      user_id,
      requester_name,
      requester_email,
      requester_phone: requester_phone || null,
      requester_role,
      requester_specialty: requester_specialty || null,
      requester_city: requester_city || null,
      service_type,
      service_title: service_title || null,
      service_description,
      target_audience: target_audience || null,
      budget_range: budget_range || null,
      timeline: timeline || null,
      has_branding: !!has_branding,
      extra_details: extra_details || null,
      status: 'pending',
    });

    if (error) {
      console.error('[service-requests POST]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[service-requests POST] unexpected', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
