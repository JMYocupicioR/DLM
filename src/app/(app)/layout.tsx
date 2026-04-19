import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/user-role';
import { AuthenticatedAppShell } from '@/components/app-shell/authenticated-app-shell';

export default async function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const role = await getUserRole(supabase, user.id, user);
  const { data: prof } = await supabase
    .from('professional_profiles')
    .select('public_profile_slug')
    .eq('user_id', user.id)
    .maybeSingle();

  const email = user.email ?? undefined;
  const initials =
    (email?.split('@')[0]?.slice(0, 2).toUpperCase() ??
      user.id.slice(0, 2).toUpperCase());

  return (
    <AuthenticatedAppShell
      role={role}
      userEmail={email}
      publicProfileSlug={prof?.public_profile_slug ?? null}
      initials={initials}
    >
      {children}
    </AuthenticatedAppShell>
  );
}
