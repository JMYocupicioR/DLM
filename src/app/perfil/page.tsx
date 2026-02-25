import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Stethoscope, ArrowLeft } from 'lucide-react';
import { ProfileForm } from './profile-form';
import { getUserRole, getDashboardRoute } from '@/lib/user-role';

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/perfil');

  const role = await getUserRole(supabase, user.id, user);
  const dashboardPath = getDashboardRoute(role);

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const isSuperAdmin = role === 'super_admin';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href={dashboardPath}><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-accent" />
              <span className="font-headline text-lg font-bold">DeepLux</span>
              {isSuperAdmin && (
                <span className="text-xs px-2 py-0.5 rounded border border-amber-500/50 text-amber-500">CEO</span>
              )}
            </Link>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/suscripcion"><CreditCard className="h-4 w-4 mr-1.5" />Suscripción</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={dashboardPath}>Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-headline text-2xl font-bold mb-2">Mi perfil</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Completa tu información profesional para desbloquear todas las funciones clínicas.
        </p>

        <Card className="bg-card border-border/60">
          <CardHeader>
            <CardTitle className="font-headline text-base">Datos del perfil</CardTitle>
            <p className="text-sm text-muted-foreground">
              Email: {user.email}
            </p>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
