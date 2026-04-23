import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/user-role';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth guard: only super_admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

    const role = await getUserRole(supabase, user.id, user);
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Sin permisos.' }, { status: 403 });
    }

    const body = await req.json();
    const { status, admin_notes } = body;

    const validStatuses = [
      'reviewing',
      'accepted',
      'accepted_with_details',
      'changes_proposed',
      'denied',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
    }

    const service = await createServiceClient();
    const { error } = await service
      .from('service_requests')
      .update({
        status,
        admin_notes: admin_notes ?? null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('[service-requests PATCH]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[service-requests PATCH] unexpected', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
