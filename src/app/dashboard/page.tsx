import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserRole, getDashboardRoute } from '@/lib/user-role';

/** Fallback: redirects /dashboard to role-specific dashboard. Middleware handles most cases. */
export default async function DashboardRouterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const role = await getUserRole(supabase, user.id, user);
  redirect(getDashboardRoute(role));
}
