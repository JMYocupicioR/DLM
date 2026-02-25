'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const DOCUMENT_VERSION = '2025-02-01';

export async function logComplianceAcceptance(
  userId: string,
  documentType: 'terminos' | 'privacidad'
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return { error: 'No autorizado' };
  }

  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() ?? realIp ?? null;
  const userAgent = headersList.get('user-agent');

  const { error } = await supabase.from('compliance_audit_logs').insert({
    user_id: userId,
    document_type: documentType,
    document_version: DOCUMENT_VERSION,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    console.error('compliance_audit_logs insert error:', error);
    return { error: error.message };
  }
  return {};
}
