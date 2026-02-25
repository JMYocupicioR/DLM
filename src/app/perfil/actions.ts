'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ProfileFormState = {
  success?: boolean;
  error?: string;
};

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const cedulaProfesional = (formData.get('cedula_profesional') as string)?.trim() || null;
  const cedulaEspecialidad = (formData.get('cedula_especialidad') as string)?.trim() || null;
  const specialty = (formData.get('specialty') as string)?.trim() || null;
  const subspecialty = (formData.get('subspecialty') as string)?.trim() || null;
  const institutionAffiliation = (formData.get('institution_affiliation') as string)?.trim() || null;
  const graduationYearVal = formData.get('graduation_year');
  const parsedYear = graduationYearVal && String(graduationYearVal).trim()
    ? parseInt(String(graduationYearVal), 10)
    : NaN;
  const graduationYear = Number.isFinite(parsedYear) ? parsedYear : null;
  const rfc = (formData.get('rfc') as string)?.trim()?.toUpperCase() || null;
  const curp = (formData.get('curp') as string)?.trim()?.toUpperCase() || null;
  const regionCode = (formData.get('region_code') as string)?.trim() || null;
  const bio = (formData.get('bio') as string)?.trim() || null;
  const profilePhotoUrl = (formData.get('profile_photo_url') as string)?.trim() || null;
  const rawSlug = (formData.get('public_profile_slug') as string)?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || null;
  const isPublicProfile = formData.get('is_public_profile') === 'on';

  const payload = {
    cedula_profesional: cedulaProfesional,
    cedula_especialidad: cedulaEspecialidad,
    specialty,
    subspecialty,
    institution_affiliation: institutionAffiliation,
    graduation_year: graduationYear,
    rfc,
    curp,
    region_code: regionCode,
    bio,
    profile_photo_url: profilePhotoUrl,
    public_profile_slug: rawSlug,
    is_public_profile: isPublicProfile,
  };

  const { error } = await supabase
    .from('professional_profiles')
    .upsert(
      { user_id: user.id, ...payload },
      { onConflict: 'user_id' }
    );

  if (error) return { error: error.message };

  revalidatePath('/perfil');
  revalidatePath('/dashboard');
  return { success: true };
}
