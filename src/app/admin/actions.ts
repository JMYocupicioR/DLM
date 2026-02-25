'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getUserRole, isAdminUser } from '@/lib/user-role';

export type AdminActionResult = { error?: string; success?: boolean };

export async function approveLicenseVerification(
  verificationId: string
): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const role = await getUserRole(supabase, user.id, user);
  if (!isAdminUser(role, user.email)) {
    return { error: 'No autorizado' };
  }

  const serviceClient = await createServiceClient();

  const { data: verification, error: fetchErr } = await serviceClient
    .from('license_verifications')
    .select('id, profile_id')
    .eq('id', verificationId)
    .eq('status', 'pending')
    .single();

  if (fetchErr || !verification) {
    return { error: 'Verificación no encontrada o ya procesada' };
  }

  const { error: updateVerifErr } = await serviceClient
    .from('license_verifications')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      verified_by: user.id,
      review_notes: null,
      rejection_reason: null,
    })
    .eq('id', verificationId);

  if (updateVerifErr) {
    return { error: updateVerifErr.message };
  }

  const { error: updateProfileErr } = await serviceClient
    .from('professional_profiles')
    .update({ trust_level: 3 })
    .eq('user_id', verification.profile_id);

  if (updateProfileErr) {
    console.error('Failed to update professional_profiles trust_level:', updateProfileErr);
    return { error: 'Verificación aprobada pero falló actualizar perfil' };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function rejectLicenseVerification(
  verificationId: string,
  reason?: string
): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const role = await getUserRole(supabase, user.id, user);
  if (!isAdminUser(role, user.email)) {
    return { error: 'No autorizado' };
  }

  const serviceClient = await createServiceClient();

  const { error } = await serviceClient
    .from('license_verifications')
    .update({
      status: 'rejected',
      verified_by: user.id,
      rejection_reason: reason ?? 'Rechazado por el equipo de revisión',
    })
    .eq('id', verificationId)
    .eq('status', 'pending');

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}
