import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from './profile-form';

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/perfil');

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-headline text-2xl font-bold mb-2">Mi perfil</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Completa tu información profesional para desbloquear todas las funciones clínicas.
        </p>

        <Card className="bg-card border-border/60">
          <CardHeader>
            <CardTitle className="font-headline text-base">Datos del perfil</CardTitle>
            <p className="text-sm text-muted-foreground">Email: {user.email}</p>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} publicSlug={profile?.public_profile_slug ?? null} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
