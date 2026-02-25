import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign, TrendingUp, Building2, CreditCard, Activity,
  AlertTriangle, CheckCircle2, Clock, Stethoscope, ChevronRight
} from 'lucide-react';
import { formatMXN } from '@/lib/utils';
import { PLAN_BADGES } from '@/lib/constants';
import { getUserRole } from '@/lib/user-role';

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const role = await getUserRole(supabase, user.id, user);
  if (role !== 'super_admin') redirect(role === 'clinic_admin' ? '/dashboard/clinica' : '/dashboard/doctor');

  const service = await createServiceClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: activeCount },
    { count: trialingCount },
    { count: pastDueCount },
    { count: canceledCount },
    { data: subsByPlan },
    { data: activeClinicSubs },
    { data: mrrInvoices },
    { data: recentInvoices },
  ] = await Promise.all([
    service.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    service.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trialing'),
    service.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'past_due'),
    service.from('subscriptions').select('*', { count: 'exact', head: true }).in('status', ['canceled', 'expired']),
    service
      .from('subscriptions')
      .select('subscription_plans(slug, name), status')
      .in('status', ['active', 'trialing', 'past_due']),
    service
      .from('subscriptions')
      .select('id, clinic_id, status, subscription_plans(slug, name), current_period_end')
      .eq('subscriber_type', 'clinic')
      .in('status', ['active', 'trialing', 'past_due']),
    service
      .from('invoices')
      .select('amount_cents, currency')
      .eq('status', 'paid')
      .gte('created_at', monthStart),
    service
      .from('invoices')
      .select('id, billing_name, amount_cents, currency, status, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(15),
  ]);

  const clinicIds = clinicIdsFromSubs(activeClinicSubs);
  const { data: clinicProfiles } = clinicIds.length > 0
    ? await service
        .from('clinic_profiles')
        .select('clinic_id, razon_social, clinic_type, region_code')
        .in('clinic_id', clinicIds)
    : { data: [] };

  const mrr = mrrInvoices?.reduce((sum, i) => sum + (i.currency === 'MXN' ? i.amount_cents : 0), 0) ?? 0;
  const arr = mrr * 12;

  const planCounts = (subsByPlan ?? []).reduce(
    (acc, s) => {
      const plan = s.subscription_plans as { slug: string; name: string } | null;
      const slug = plan?.slug ?? 'unknown';
      if (!acc[slug]) acc[slug] = { count: 0, name: plan?.name ?? slug };
      acc[slug].count++;
      return acc;
    },
    {} as Record<string, { count: number; name: string }>
  );

  const clinicMap = new Map((clinicProfiles ?? []).map((c) => [c.clinic_id, c]));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/dashboard/super-admin" className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-accent" />
            <span className="font-headline text-lg font-bold">DeepLux</span>
            <Badge variant="outline" className="text-xs ml-1 border-amber-500/50 text-amber-500">CEO</Badge>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <Activity className="h-4 w-4 mr-1.5" />
                Admin
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/doctor">
                <ChevronRight className="h-4 w-4 mr-1.5 rotate-180" />
                Vista Doctor
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="font-headline text-2xl font-bold mb-6">Dashboard CEO</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'MRR', value: formatMXN(mrr), icon: DollarSign, color: 'text-emerald-400' },
            { label: 'ARR', value: formatMXN(arr), icon: TrendingUp, color: 'text-accent' },
            { label: 'Activas', value: activeCount ?? 0, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Trials', value: trialingCount ?? 0, icon: Clock, color: 'text-yellow-400' },
            { label: 'Past due', value: pastDueCount ?? 0, icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Canceladas', value: canceledCount ?? 0, icon: CreditCard, color: 'text-muted-foreground' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="bg-card border-border/60">
                <CardContent className="p-4">
                  <div className={`flex items-center gap-2 mb-1 ${s.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="font-bold text-lg text-foreground">
                    {typeof s.value === 'string' ? s.value : s.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Suscripciones por plan */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-base">Suscripciones activas por plan</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(planCounts).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Sin suscripciones activas</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(planCounts)
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([slug, { count, name }]) => (
                      <div key={slug} className="flex justify-between items-center py-1">
                        <span className="text-sm text-foreground">
                          {PLAN_BADGES[slug] ?? name}
                        </span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clínicas activas */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-base">Clínicas activas</CardTitle>
                <Badge variant="outline" className="text-xs">{activeClinicSubs?.length ?? 0}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!activeClinicSubs?.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">Sin clínicas activas</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeClinicSubs.map((sub) => {
                    const plan = sub.subscription_plans as { slug: string; name: string } | null;
                    const profile = clinicMap.get(sub.clinic_id);
                    return (
                      <div key={sub.id} className="flex justify-between items-start py-1.5">
                        <div>
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {profile?.razon_social ?? `Clínica ${sub.clinic_id.slice(0, 8)}...`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {PLAN_BADGES[plan?.slug ?? ''] ?? plan?.name ?? 'Plan'} ·{' '}
                            {profile?.region_code ?? '—'}
                          </p>
                        </div>
                        <Badge variant={sub.status === 'active' ? 'default' : sub.status === 'trialing' ? 'secondary' : 'destructive'} className="text-xs">
                          {sub.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pagos recientes */}
        <Card className="bg-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-headline text-base">Pagos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentInvoices?.length ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sin pagos recientes</p>
            ) : (
              <div className="space-y-2">
                {recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {inv.billing_name ?? '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString('es-MX')} · {inv.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatMXN(inv.amount_cents)}
                      </p>
                      <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'pending' ? 'secondary' : 'destructive'} className="text-xs">
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function clinicIdsFromSubs(
  subs: { clinic_id: string | null }[] | null
): string[] {
  if (!subs) return [];
  const ids = subs.map((s) => s.clinic_id).filter(Boolean) as string[];
  return [...new Set(ids)];
}
