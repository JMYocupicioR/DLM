import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type ServiceClient = SupabaseClient<Database>;

export async function insertUserNotification(
  supabase: ServiceClient,
  userId: string,
  payload: {
    type: string;
    title: string;
    body?: string | null;
    href?: string | null;
  }
) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type: payload.type,
    title: payload.title,
    body: payload.body ?? null,
    href: payload.href ?? null,
  });
  if (error) {
    console.warn('insertUserNotification:', error.message);
  }
}
