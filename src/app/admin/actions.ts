'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getUserRole, isAdminUser } from '@/lib/user-role';
import { insertUserNotification } from '@/lib/notifications-server';

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

  await insertUserNotification(serviceClient, verification.profile_id, {
    type: 'verification',
    title: 'Cédula verificada',
    body: 'Tu perfil profesional fue verificado por el equipo DeepLux.',
    href: '/perfil',
  });

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

  const trimmedReason = reason?.trim();
  if (!trimmedReason || trimmedReason.length < 3) {
    return { error: 'Indica un motivo de rechazo (mínimo 3 caracteres).' };
  }

  const serviceClient = await createServiceClient();

  const { data: pendingRow, error: fetchErr } = await serviceClient
    .from('license_verifications')
    .select('profile_id')
    .eq('id', verificationId)
    .eq('status', 'pending')
    .maybeSingle();

  if (fetchErr || !pendingRow) {
    return { error: 'Verificación no encontrada o ya procesada' };
  }

  const { error } = await serviceClient
    .from('license_verifications')
    .update({
      status: 'rejected',
      verified_by: user.id,
      rejection_reason: trimmedReason,
    })
    .eq('id', verificationId)
    .eq('status', 'pending');

  if (error) {
    return { error: error.message };
  }

  await insertUserNotification(serviceClient, pendingRow.profile_id, {
    type: 'verification',
    title: 'Verificación rechazada',
    body: trimmedReason,
    href: '/perfil',
  });

  revalidatePath('/admin');
  return { success: true };
}
