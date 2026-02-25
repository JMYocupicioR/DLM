import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserRole, isAdminUser, getDashboardRoute } from '@/lib/user-role';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp, Users, AlertTriangle, CheckCircle2, Clock,
  DollarSign, Activity, Stethoscope, ChevronRight, ShieldCheck
} from 'lucide-react';
import { formatMXN } from '@/lib/utils';
import { PLAN_BADGES } from '@/lib/constants';
import { approveLicenseVerification, rejectLicenseVerification } from './actions';
import { VerificationActions } from './verification-actions';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin');

  const role = await getUserRole(supabase, user.id, user);
  if (!isAdminUser(role, user.email)) {
    redirect(getDashboardRoute(role));
  }

  // ── Stats queries ──────────────────────────────────────────────
  const [
    { count: totalUsers },
    { count: verifiedUsers },
    { count: pendingVerifications },
    { count: activeSubscriptions },
    { count: pastDueSubs },
    { count: trialSubs },
    { data: recentSubs },
    { data: pendingVerifs },
    { data: mrrData },
  ] = await Promise.all([
    supabase.from('professional_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('professional_profiles').select('*', { count: 'exact', head: true }).eq('trust_level', 3),
    supabase.from('license_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'past_due'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trialing'),
    supabase
      .from('subscriptions')
      .select('*, subscription_plans(name, slug, price_mxn_cents), profiles:user_id(full_name, email)')
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('license_verifications')
      .select('*, profiles:profile_id(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10),
    supabase
      .from('invoices')
      .select('amount_cents, currency')
      .eq('status', 'paid')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const mrr = mrrData?.reduce((sum, i) => sum + (i.currency === 'MXN' ? i.amount_cents : 0), 0) ?? 0;

  const stats = [
    { label: 'Usuarios registrados', value: totalUsers ?? 0, icon: Users, color: 'text-blue-400' },
    { label: 'Usuarios verificados', value: verifiedUsers ?? 0, icon: ShieldCheck, color: 'text-green-400' },
    { label: 'Suscripciones activas', value: activeSubscriptions ?? 0, icon: Activity, color: 'text-accent' },
    { label: 'Trials activos', value: trialSubs ?? 0, icon: Clock, color: 'text-yellow-400' },
    { label: 'Pago pendiente (past_due)', value: pastDueSubs ?? 0, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Verificaciones pendientes', value: pendingVerifications ?? 0, icon: CheckCircle2, color: 'text-orange-400' },
    { label: 'MRR este mes (MXN)', value: formatMXN(mrr), icon: DollarSign, color: 'text-emerald-400', isString: true },
    { label: 'Tasa de verificación', value: `${totalUsers ? Math.round(((verifiedUsers ?? 0) / totalUsers) * 100) : 0}%`, icon: TrendingUp, color: 'text-purple-400', isString: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-accent" />
            <div>
              <span className="font-headline text-lg font-bold">DeepLux Admin</span>
              <Badge variant="outline" className="ml-2 text-xs">Staff only</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard"><ChevronRight className="h-4 w-4 mr-1 rotate-180" />Mi cuenta</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="font-headline text-2xl font-bold mb-6">Dashboard Operativo</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-card border-border/60">
                <CardContent className="p-4">
                  <div className={`flex items-center gap-2 mb-2 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="font-bold text-2xl text-foreground">
                    {stat.isString ? stat.value : stat.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Verifications */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-base">Verificaciones pendientes</CardTitle>
                <Badge variant="destructive" className="text-xs">{pendingVerifications ?? 0}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!pendingVerifs?.length ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-400" />
                  <p className="text-sm text-muted-foreground">No hay verificaciones pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingVerifs.map((verif) => {
                    const profileData = verif.profiles as { full_name: string; email: string } | null;
                    return (
                      <div key={verif.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {profileData?.full_name ?? 'Usuario'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {verif.license_type} · {new Date(verif.created_at).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                        <VerificationActions verificationId={verif.id} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Subscriptions */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-base">Suscripciones recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {!recentSubs?.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">Sin suscripciones recientes</p>
              ) : (
                <div className="space-y-0">
                  {recentSubs.map((sub, i) => {
                    const planData = sub.subscription_plans as { name: string; slug: string; price_mxn_cents: number } | null;
                    const profileData = sub.profiles as { full_name: string; email: string } | null;
                    return (
                      <div key={sub.id}>
                        {i > 0 && <Separator className="my-2" />}
                        <div className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                              {profileData?.full_name ?? profileData?.email ?? 'Usuario'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">
                                {planData?.slug ? (PLAN_BADGES[planData.slug] ?? planData.name) : 'Plan'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(sub.created_at).toLocaleDateString('es-MX')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={sub.status === 'active' ? 'default' : sub.status === 'trialing' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {sub.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatMXN(planData?.price_mxn_cents ?? 0)}/mes
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Past Due Warning */}
        {(pastDueSubs ?? 0) > 0 && (
          <Card className="mt-6 border-red-500/40 bg-red-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-medium text-foreground">{pastDueSubs} suscripción(es) en estado past_due</p>
                <p className="text-sm text-muted-foreground">
                  Estas suscripciones tienen pagos fallidos y están en grace period. Si no se resuelven, pasarán a modo read-only y luego se suspenderán.
                </p>
              </div>
              <Button size="sm" variant="outline" className="border-red-400/40 text-red-400 flex-shrink-0">
                Ver detalles
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
