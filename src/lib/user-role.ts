import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

/** Role slugs that map to dashboard routes */
export type DashboardRole = 'super_admin' | 'clinic_admin' | 'empresa_admin' | 'doctor';

/**
 * Resolves the user type slug to a dashboard role.
 * super_admin -> super_admin, clinic_admin -> clinic_admin,
 * empresa / empresa_admin -> empresa_admin, rest -> doctor
 */
export function slugToDashboardRole(slug: string | null): DashboardRole {
  if (slug === 'super_admin') return 'super_admin';
  if (slug === 'clinic_admin') return 'clinic_admin';
  if (slug === 'empresa' || slug === 'empresa_admin') return 'empresa_admin';
  return 'doctor';
}

/**
 * Gets the dashboard route for a given role.
 */
export function getDashboardRoute(role: DashboardRole): string {
  switch (role) {
    case 'super_admin':
      return '/dashboard/super-admin';
    case 'clinic_admin':
      return '/dashboard/clinica';
    case 'empresa_admin':
      return '/dashboard/empresa';
    case 'doctor':
      return '/dashboard/doctor';
    default:
      return '/dashboard/doctor';
  }
}

/**
 * Fetches role from public.profiles (role column).
 * Tries id first, then uuid (some setups use profiles.uuid = auth.users.id).
 */
async function getRoleFromProfiles(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  for (const column of ['id', 'uuid'] as const) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq(column, userId)
      .maybeSingle();

    if (!error && data) {
      const role = (data as { role?: string | null })?.role;
      if (typeof role === 'string') return role;
    }
  }
  return null;
}

/**
 * Fetches the user type slug from professional_profiles JOIN user_types.
 * Returns null if no profile exists (e.g. new user before onboarding).
 */
export async function getUserTypeSlug(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('professional_profiles')
    .select('user_types(slug)')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  const slug = (data as { user_types: { slug: string } | null })?.user_types?.slug;
  return slug ?? null;
}

/**
 * Gets role from auth metadata (app_metadata.role or user_metadata.role).
 * Returns null if not set.
 */
function getRoleFromMetadata(user: User | null): string | null {
  if (!user) return null;
  const appRole = (user.app_metadata as Record<string, unknown>)?.role;
  const userRole = (user.user_metadata as Record<string, unknown>)?.role;
  const role = appRole ?? userRole;
  return typeof role === 'string' ? role : null;
}

/**
 * Checks if the user is an admin (super_admin role or listed in ADMIN_EMAILS).
 */
export function isAdminUser(
  role: DashboardRole,
  email: string | undefined
): boolean {
  if (role === 'super_admin') return true;
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes((email ?? '').toLowerCase());
}

/**
 * Gets the dashboard role for the current user.
 * Priority: 1) auth metadata, 2) public.profiles.role, 3) professional_profiles JOIN user_types.
 * Defaults to 'doctor' if no profile.
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
  user?: User | null
): Promise<DashboardRole> {
  const metadataRole = getRoleFromMetadata(user ?? null);
  if (metadataRole === 'super_admin' || metadataRole === 'clinic_admin' || metadataRole === 'empresa_admin') {
    return metadataRole as DashboardRole;
  }

  const profilesRole = await getRoleFromProfiles(supabase, userId);
  if (profilesRole === 'super_admin' || profilesRole === 'clinic_admin' || profilesRole === 'empresa_admin') {
    return profilesRole as DashboardRole;
  }

  const slug = await getUserTypeSlug(supabase, userId);
  return slugToDashboardRole(slug);
}
