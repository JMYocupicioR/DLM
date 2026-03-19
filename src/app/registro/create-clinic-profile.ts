'use server';

import { createServiceClient } from '@/lib/supabase/server';

interface ClinicOnboardingData {
  clinicType: string;
  clinicName: string;
  address: string;
  city: string;
  regionCode: string;
  phone: string;
  institutionalEmail: string;
  razonSocial: string;
  rfc: string;
  cfdiRegime: string;
  cofeprisNumber: string;
  reprisNumber: string;
  directorName: string;
  directorCedula: string;
  staffSize: string;
  specialties: string;
}

export async function createClinicFromOnboarding(
  userId: string,
  formData: ClinicOnboardingData
): Promise<{ clinicId?: string; error?: string }> {
  const supabase = await createServiceClient();

  // 1. Create the clinic record
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .insert({
      name: formData.clinicName,
      type: formData.clinicType || 'clinic',
      address: formData.address || null,
      phone: formData.phone || null,
      email: formData.institutionalEmail || null,
      director_name: formData.directorName || null,
      director_license: formData.directorCedula || null,
      tax_id: formData.rfc || null,
      is_active: false, // Pending approval
      settings: {
        city: formData.city || null,
        region_code: formData.regionCode || null,
        razon_social: formData.razonSocial || null,
        cfdi_regime: formData.cfdiRegime || null,
        cofepris_number: formData.cofeprisNumber || null,
        repris_number: formData.reprisNumber || null,
        staff_size: formData.staffSize || null,
        specialties_offered: formData.specialties || null,
      },
    })
    .select('id')
    .single();

  if (clinicError || !clinic) {
    console.error('createClinicFromOnboarding: clinic insert error:', clinicError);
    return { error: clinicError?.message || 'Error al crear la clínica' };
  }

  // 2. Create clinic_user_relationships (owner, pending approval)
  const { error: relationError } = await supabase
    .from('clinic_user_relationships')
    .insert({
      clinic_id: clinic.id,
      user_id: userId,
      role_in_clinic: 'owner',
      status: 'pending',
      is_active: true,
    });

  if (relationError) {
    console.error('createClinicFromOnboarding: relationship insert error:', relationError);
    // Non-fatal: clinic was created, continue
  }

  // 3. Update user profile: link to clinic + mark access_requested
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      clinic_id: clinic.id,
      additional_info: { access_requested: true, clinic_registration: true },
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (profileError) {
    console.error('createClinicFromOnboarding: profile update error:', profileError);
    // Non-fatal: clinic and relationship were created
  }

  return { clinicId: clinic.id };
}
