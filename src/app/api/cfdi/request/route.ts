import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/cfdi/request?invoice=<invoice_id>
 * Request CFDI (Mexican fiscal invoice) for a paid invoice.
 * Requires: authenticated user, Trust Level 3, RFC in profile.
 * Integration: Facturapi.io (configure FACTURAPI_API_KEY when ready).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const invoiceId = request.nextUrl.searchParams.get('invoice');
  if (!invoiceId) {
    return NextResponse.json({ error: 'Falta el ID de factura' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('trust_level, rfc')
    .eq('user_id', user.id)
    .single();

  const trustLevel = (profile?.trust_level ?? 0) as number;
  if (trustLevel < 3) {
    return NextResponse.json(
      { error: 'Requieres verificación completa (Trust Level 3) para solicitar facturas CFDI.' },
      { status: 403 }
    );
  }

  if (!profile?.rfc?.trim()) {
    return NextResponse.json(
      { error: 'Agrega tu RFC en tu perfil para solicitar facturas.' },
      { status: 400 }
    );
  }

  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .select('id, status, cfdi_uuid, user_id')
    .eq('id', invoiceId)
    .single();

  if (invErr || !invoice) {
    return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
  }

  if (invoice.user_id !== user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  if (invoice.status !== 'paid') {
    return NextResponse.json({ error: 'Solo se pueden facturar pagos completados' }, { status: 400 });
  }

  if (invoice.cfdi_uuid) {
    return NextResponse.redirect(new URL('/facturacion', request.url));
  }

  if (!process.env.FACTURAPI_API_KEY) {
    return NextResponse.json(
      {
        error: 'Solicitud de CFDI no disponible temporalmente. Próximamente podrás solicitar tu factura desde esta página.',
        code: 'CFDI_COMING_SOON',
      },
      { status: 501 }
    );
  }

  try {
    const res = await fetch('https://api.facturapi.io/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FACTURAPI_API_KEY}`,
      },
      body: JSON.stringify({
        customer: {
          legal_name: profile?.rfc ? undefined : undefined,
          tax_id: profile.rfc,
          email: user.email,
        },
        items: [
          {
            product: { description: 'Suscripción DeepLux' },
            quantity: 1,
            unit_price: 0,
          },
        ],
        payment_form: '99',
        series: 'F',
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('Facturapi error:', errData);
      return NextResponse.json(
        { error: 'Error al procesar la solicitud de factura. Intenta más tarde.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const cfdiUuid = data?.id ?? data?.uuid ?? data?.cfdi_uuid;

    if (cfdiUuid) {
      await supabase
        .from('invoices')
        .update({
          cfdi_uuid: cfdiUuid,
          cfdi_facturapi_id: data.id,
          cfdi_requested_at: new Date().toISOString(),
          cfdi_pdf_url: data?.pdf_url ?? null,
          cfdi_xml_url: data?.xml_url ?? null,
        })
        .eq('id', invoiceId);
    }

    return NextResponse.redirect(new URL('/facturacion', request.url));
  } catch (err) {
    console.error('CFDI request error:', err);
    return NextResponse.json(
      { error: 'Error al solicitar la factura. Intenta más tarde.' },
      { status: 500 }
    );
  }
}
