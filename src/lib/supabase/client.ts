import { createBrowserClient } from '@supabase/ssr';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key && url !== PLACEHOLDER_URL;
}

export function createClient() {
  // Fallback placeholders allow the build to succeed without env vars at build time.
  // At runtime, NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? PLACEHOLDER_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  );
}
// Note: Run `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.gen.ts`
// after applying migrations to get full type safety.

