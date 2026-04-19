import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getUserRole, isAdminUser } from '@/lib/user-role';

export type AdminGuardResult =
  | { ok: true; user: User; supabase: SupabaseClient }
  | { ok: false; response: NextResponse };

/**
 * Guard for super-admin-only API routes.
 * Returns either an authenticated + authorized context, or a ready-to-return 401/403 response.
 */
export async function requireSuperAdmin(): Promise<AdminGuardResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    };
  }

  const role = await getUserRole(supabase, user.id, user);
  if (!isAdminUser(role, user.email)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }),
    };
  }

  return { ok: true, user, supabase };
}
