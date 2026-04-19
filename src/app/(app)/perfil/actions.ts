'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ProfileFormState = {
  success?: boolean;
  error?: string;
};

export type ProfileSection = 'cedula' | 'profesional' | 'fiscal' | 'publico';

export async function updateProfileSection(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const section = formData.get('section') as ProfileSection;
  if (!['cedula', 'profesional', 'fiscal', 'publico'].includes(section)) {
    return { error: 'Sección inválida' };
  }

  const { data: existing } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const base: Record<string, unknown> = {
    user_id: user.id,
    ...(existing as Record<string, unknown> | null),
  };
  delete base.id;
  delete base.created_at;
  delete base.updated_at;

  let patch: Record<string, unknown> = {};

  if (section === 'cedula') {
    const cedulaProfesional = (formData.get('cedula_profesional') as string)?.trim() || null;
    const cedulaEspecialidad = (formData.get('cedula_especialidad') as string)?.trim() || null;
    patch = { cedula_profesional: cedulaProfesional, cedula_especialidad: cedulaEspecialidad };
  } else if (section === 'profesional') {
    const specialty = (formData.get('specialty') as string)?.trim() || null;
    const subspecialty = (formData.get('subspecialty') as string)?.trim() || null;
    const institutionAffiliation = (formData.get('institution_affiliation') as string)?.trim() || null;
    const graduationYearVal = formData.get('graduation_year');
    const parsedYear =
      graduationYearVal && String(graduationYearVal).trim()
        ? parseInt(String(graduationYearVal), 10)
        : NaN;
    const graduationYear = Number.isFinite(parsedYear) ? parsedYear : null;
    patch = {
      specialty,
      subspecialty,
      institution_affiliation: institutionAffiliation,
      graduation_year: graduationYear,
    };
  } else if (section === 'fiscal') {
    const rfc = (formData.get('rfc') as string)?.trim()?.toUpperCase() || null;
    const curp = (formData.get('curp') as string)?.trim()?.toUpperCase() || null;
    const regionCode = (formData.get('region_code') as string)?.trim() || null;
    patch = { rfc, curp, region_code: regionCode };
  } else if (section === 'publico') {
    const bio = (formData.get('bio') as string)?.trim() || null;
    const profilePhotoUrl = (formData.get('profile_photo_url') as string)?.trim() || null;
    const rawSlug =
      (formData.get('public_profile_slug') as string)
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || null;
    const isPublicProfile = formData.get('is_public_profile') === 'on';
    patch = {
      bio,
      profile_photo_url: profilePhotoUrl,
      public_profile_slug: rawSlug,
      is_public_profile: isPublicProfile,
    };
  }

  const payload: Record<string, unknown> = { ...base, ...patch };

  if (!existing) {
    payload.country_code = payload.country_code ?? 'MX';
    payload.conacem_certified = payload.conacem_certified ?? false;
    payload.trust_level = typeof payload.trust_level === 'number' ? payload.trust_level : 1;
    if (payload.is_public_profile === undefined) payload.is_public_profile = false;
  }

  const { error } = await supabase.from('professional_profiles').upsert(payload, {
    onConflict: 'user_id',
  });

  if (error) return { error: error.message };

  revalidatePath('/perfil');
  revalidatePath('/dashboard');
  const slug = patch.public_profile_slug as string | null | undefined;
  if (slug) revalidatePath(`/dr/${slug}`);
  return { success: true };
}

export async function uploadProfilePhoto(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const file = formData.get('photo') as File | null;
  if (!file || file.size === 0) return { error: 'Selecciona una imagen' };
  if (file.size > 2 * 1024 * 1024) return { error: 'La imagen debe pesar menos de 2 MB' };
  if (!file.type.startsWith('image/')) return { error: 'Solo imágenes (JPG, PNG, WebP)' };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const path = `${user.id}/${Date.now()}.${safeExt}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage.from('avatars').upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (upErr) return { error: upErr.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  const { data: existing } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const base: Record<string, unknown> = {
    user_id: user.id,
    ...(existing as Record<string, unknown> | null),
    profile_photo_url: publicUrl,
  };
  delete base.id;
  delete base.created_at;
  delete base.updated_at;

  if (!existing) {
    base.country_code = 'MX';
    base.conacem_certified = false;
    base.trust_level = 1;
    base.is_public_profile = false;
  }

  const { error } = await supabase.from('professional_profiles').upsert(base, {
    onConflict: 'user_id',
  });

  if (error) return { error: error.message };

  revalidatePath('/perfil');
  revalidatePath('/dashboard');
  return { success: true };
}
