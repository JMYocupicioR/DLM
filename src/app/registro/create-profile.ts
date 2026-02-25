'use server';

import { createServiceClient } from '@/lib/supabase/server';

interface ProfessionalFormData {
  fullName: string;
  userTypeSlug: string;
  curp?: string;
  rfc?: string;
  cedulaProfesional?: string;
  cedulaEspecialidad?: string;
  specialty?: string;
  subspecialty?: string;
  institutionAffiliation?: string;
  regionCode?: string;
  graduationYear?: string;
  professionalStage?: string;
}

export async function createProfessionalProfileFromOnboarding(
  userId: string,
  formData: ProfessionalFormData
): Promise<{ error?: string }> {
  const supabase = await createServiceClient();

  const { data: userType } = await supabase
    .from('user_types')
    .select('id')
    .eq('slug', formData.userTypeSlug)
    .single();

  const gradYear = formData.graduationYear ? parseInt(formData.graduationYear, 10) : null;
  const isValidYear = gradYear && gradYear >= 1970 && gradYear <= new Date().getFullYear();

  const { error } = await supabase.from('professional_profiles').upsert(
    {
      user_id: userId,
      user_type_id: userType?.id ?? null,
      specialty: formData.specialty || null,
      subspecialty: formData.subspecialty || null,
      institution_affiliation: formData.institutionAffiliation || null,
      region_code: formData.regionCode || null,
      graduation_year: isValidYear ? gradYear : null,
      professional_stage: formData.professionalStage || null,
      cedula_profesional: formData.cedulaProfesional || null,
      cedula_especialidad: formData.cedulaEspecialidad || null,
      curp: formData.curp || null,
      rfc: formData.rfc || null,
      trust_level: 1,
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('createProfessionalProfileFromOnboarding:', error);
    return { error: error.message };
  }

  return {};
}
