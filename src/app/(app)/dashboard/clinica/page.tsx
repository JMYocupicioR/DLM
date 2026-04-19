import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CreditCard, Calendar, DollarSign, TrendingUp,
  TrendingDown, Users, Building2, Activity, AlertCircle,
} from 'lucide-react';
import { formatMXN } from '@/lib/utils';
import { PLAN_BADGES } from '@/lib/constants';
import { getUserRole, getDashboardRoute } from '@/lib/user-role';
import { subscriptionStatusLabel, invoiceStatusLabel } from '@/lib/subscription-status';

const APP_ICONS: Record<string, string> = {
  'escalas-dlm': '📊',
  'expediente-dlm': '📋',
  'toxina-dlm': '💉',
  'cognitivapp-dlm': '🧠',
  'physio-dlm': '🏃',
  'portal-3d': '🖨️',
};

export default async function ClinicaDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const role = await getUserRole(supabase, user.id, user);
  if (role !== 'clinic_admin') redirect(getDashboardRoute(role));

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(name, slug, max_seats, features)')
    .eq('subscriber_type', 'clinic')
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-headline text-xl font-bold mb-2">Sin suscripción activa</h1>
          <p className="text-muted-foreground mb-6">
            No tienes una suscripción de clínica activa. Elige un plan para comenzar.
          </p>
          <Button asChild>
            <Link href="/pricing">Ver planes</Link>
          </Button>
        </main>
      </div>
    );
  }

  const plan = subscription.subscription_plans as { name: string; slug: string; max_seats: number | null; features: unknown } | null;
  const planSlug = plan?.slug ?? 'unknown';
  const maxSeats = plan?.max_seats ?? 0;
  const clinicId = subscription.clinic_id;

  const [{ data: seats }, { data: products }, { data: accessList }, { data: upcomingInvoices }, { data: financials }] = await Promise.all([
    supabase
      .from('subscription_seats')
      .select('id, user_id, is_active')
      .eq('subscription_id', subscription.id),
    supabase.from('products').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('user_product_access').select('*').eq('user_id', user.id),
    supabase
      .from('invoices')
      .select('id, amount_cents, status, period_end, created_at')
      .eq('clinic_id', clinicId)
      .in('status', ['pending', 'paid'])
      .order('created_at', { ascending: false })
      .limit(5),
    clinicId
      ? supabase
          .from('clinic_financials')
          .select('*')
          .eq('clinic_id', clinicId)
          .order('reference_date', { ascending: false })
          .limit(20)
      : { data: [] },
  ]);

  const activeSeats = seats?.filter((s) => s.is_active).length ?? 0;
  const accessMap = new Map(accessList?.map((a) => [a.product_id, a]) ?? []);

  const totalIncome = (financials ?? [])
    .filter((f) => f.entry_type === 'income')
    .reduce((sum, f) => sum + f.amount_mxn_cents, 0);
  const totalExpense = (financials ?? [])
    .filter((f) => f.entry_type === 'expense')
    .reduce((sum, f) => sum + Math.abs(f.amount_mxn_cents), 0);

  const nextPayment = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('es-MX')
    : '—';

  const activeSeatUserIds = [
    ...new Set((seats ?? []).filter((s) => s.is_active).map((s) => s.user_id)),
  ];
  const { data: memberProfiles } = activeSeatUserIds.length
    ? await supabase.from('profiles').select('id, email, full_name').in('id', activeSeatUserIds)
    : { data: [] as { id: string; email: string | null; full_name: string | null }[] };
  const memberById = new Map((memberProfiles ?? []).map((p) => [p.id, p]));

  const trialEndsAt = subscription.trial_ends_at
    ? new Date(subscription.trial_ends_at).toLocaleDateString('es-MX')
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h1 className="font-headline text-2xl font-bold">Dashboard Clínica</h1>
          <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600 dark:text-blue-400">
            Clínica
          </Badge>
        </div>

        {subscription.status === 'trialing' && trialEndsAt && (
          <div className="mb-6 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            Tu período de prueba termina el <strong>{trialEndsAt}</strong>.{' '}
            <Link href="/suscripcion" className="underline font-medium">
              Gestionar suscripción
            </Link>
          </div>
        )}
        {subscription.status === 'past_due' && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Hay un problema con el pago de la clínica.{' '}
              <Link href="/suscripcion" className="underline font-medium">
                Actualizar pago
              </Link>
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Plan', value: PLAN_BADGES[planSlug] ?? plan?.name ?? 'Plan', icon: CreditCard },
            { label: 'Próximo pago', value: nextPayment, icon: Calendar },
            { label: 'Asientos', value: `${activeSeats} / ${maxSeats || '∞'}`, icon: Users },
            {
              label: 'Estado',
              value: subscriptionStatusLabel(subscription.status),
              icon: Activity,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="bg-card border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{s.label}</span>
                  </div>
                  <p className="font-semibold text-sm text-foreground truncate">{s.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Apps */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-base">Apps disponibles</CardTitle>
                <Link href="/pricing" className="text-xs text-accent hover:underline">Ver planes</Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {products?.map((p) => {
                  const access = accessMap.get(p.id);
                  const hasAccess = access?.has_access ?? false;
                  const emoji = APP_ICONS[p.slug] ?? '📱';
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-2 p-2 rounded-lg ${hasAccess ? 'bg-accent/10' : 'bg-muted/30'}`}
                    >
                      <span className="text-lg">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <Badge variant={hasAccess ? 'default' : 'outline'} className="text-xs">
                          {hasAccess ? 'Activa' : 'Bloqueada'}
                        </Badge>
                      </div>
                      {hasAccess && p.app_url && (
                        <a
                          href={p.app_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline text-xs"
                        >
                          Abrir
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ingresos / Gastos */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-base">Ingresos y gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Ingresos</span>
                  </div>
                  <p className="font-bold text-lg text-foreground">{formatMXN(totalIncome)}</p>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400 mb-1">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-xs">Gastos</span>
                  </div>
                  <p className="font-bold text-lg text-foreground">{formatMXN(totalExpense)}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Balance: <span className="font-semibold text-foreground">{formatMXN(totalIncome - totalExpense)}</span>
              </p>
              {(!financials || financials.length === 0) ? (
                <p className="text-xs text-muted-foreground">Sin registros de ingresos o gastos aún.</p>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {financials.slice(0, 5).map((f) => (
                    <div key={f.id} className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground truncate max-w-[140px]">{f.category} · {f.description ?? '—'}</span>
                      <span className={f.entry_type === 'income' ? 'text-green-400' : 'text-red-400'}>
                        {f.entry_type === 'income' ? '+' : '-'}{formatMXN(Math.abs(f.amount_mxn_cents))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Próximos pagos + Equipo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-base">Pagos recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {!upcomingInvoices?.length ? (
                <p className="text-sm text-muted-foreground">Sin facturas recientes</p>
              ) : (
                <div className="space-y-2">
                  {upcomingInvoices.map((inv) => (
                    <div key={inv.id} className="flex justify-between py-1">
                      <span className="text-sm">{formatMXN(inv.amount_cents)}</span>
                      <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                        {invoiceStatusLabel(inv.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-base">Equipo ({activeSeats} / {maxSeats || '∞'})</CardTitle>
                <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
                  Gestionar equipo · Próximamente
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!seats?.length ? (
                <p className="text-sm text-muted-foreground">Sin miembros asignados aún</p>
              ) : (
                <div className="space-y-1">
                  {seats.filter((s) => s.is_active).map((s) => {
                    const m = memberById.get(s.user_id);
                    const label =
                      m?.full_name?.trim() ||
                      m?.email ||
                      `Usuario ${s.user_id.slice(0, 8)}…`;
                    return (
                      <div key={s.id} className="text-sm text-muted-foreground py-0.5">
                        {label}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
