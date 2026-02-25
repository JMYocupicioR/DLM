import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CreditCard, ExternalLink, Calendar, Users, Stethoscope,
  ChevronRight, Briefcase, CheckCircle2, Lock, Building2
} from 'lucide-react';
import { formatMXN } from '@/lib/utils';
import { PLAN_BADGES } from '@/lib/constants';
import { getUserRole } from '@/lib/user-role';

const APP_ICONS: Record<string, string> = {
  'escalas-dlm':    '📊',
  'expediente-dlm': '📋',
  'toxina-dlm':     '💉',
  'cognitivapp-dlm':'🧠',
  'physio-dlm':     '🏃',
  'portal-3d':      '🖨️',
};

const STATUS_LABELS: Record<string, string> = {
  active:     'Activa',
  trialing:   'En prueba',
  past_due:   'Pago pendiente',
  canceled:   'Cancelada',
  expired:    'Expirada',
  incomplete: 'Incompleta',
};

export default async function EmpresaDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const role = await getUserRole(supabase, user.id, user);
  if (role !== 'empresa_admin') {
    redirect(role === 'super_admin' ? '/dashboard/super-admin' : role === 'clinic_admin' ? '/dashboard/clinica' : '/dashboard/doctor');
  }

  // Empresa profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: empresaProfile } = await (supabase.from as any)('empresa_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Active subscription (empresa plan)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(name, slug, max_seats, features)')
    .eq('subscriber_type', 'user')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 py-4 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-accent" />
              <span className="font-headline text-lg font-bold">DeepLux</span>
              <Badge variant="outline" className="text-xs ml-1 border-emerald-500/50 text-emerald-400">Empresa</Badge>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/perfil"><ChevronRight className="h-4 w-4 mr-1.5 rotate-180" />Perfil</Link>
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-headline text-xl font-bold mb-2">Sin suscripción activa</h1>
          <p className="text-muted-foreground mb-6">
            No tienes un plan empresarial activo. Elige el plan que mejor se adapte a tu organización.
          </p>
          <Button asChild>
            <Link href="/pricing">Ver planes para empresas</Link>
          </Button>
        </main>
      </div>
    );
  }

  const plan = subscription.subscription_plans as {
    name: string; slug: string; max_seats: number | null; features: unknown
  } | null;
  const planSlug = plan?.slug ?? 'unknown';
  const maxSeats = plan?.max_seats ?? null;

  const [{ data: seats }, { data: products }, { data: accessList }, { data: recentInvoices }] = await Promise.all([
    supabase
      .from('subscription_seats')
      .select('id, user_id, is_active, assigned_at')
      .eq('subscription_id', subscription.id),
    supabase.from('products').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('user_product_access').select('*').eq('user_id', user.id),
    supabase
      .from('invoices')
      .select('id, amount_cents, status, period_end, created_at')
      .eq('user_id', user.id)
      .in('status', ['pending', 'paid'])
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const activeSeats = seats?.filter((s) => s.is_active).length ?? 0;
  const accessMap = new Map(accessList?.map((a) => [a.product_id, a]) ?? []);
  const accessibleApps = (products ?? []).filter((p) => accessMap.get(p.id)?.has_access);

  const nextPayment = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('es-MX')
    : '—';

  const trialEndsAt = subscription.trial_ends_at
    ? new Date(subscription.trial_ends_at).toLocaleDateString('es-MX')
    : null;

  const statusLabel = STATUS_LABELS[subscription.status] ?? subscription.status;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/dashboard/empresa" className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-accent" />
            <span className="font-headline text-lg font-bold">DeepLux</span>
            <Badge variant="outline" className="text-xs ml-1 border-emerald-500/50 text-emerald-400">Empresa</Badge>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/suscripcion"><CreditCard className="h-4 w-4 mr-1.5" />Suscripción</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/perfil"><ChevronRight className="h-4 w-4 mr-1.5 rotate-180" />Perfil</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="font-headline text-2xl font-bold">
            {empresaProfile?.razon_social
              ? `Dashboard · ${empresaProfile.razon_social}`
              : 'Dashboard Empresa'}
          </h1>
          {empresaProfile?.industry && (
            <p className="text-muted-foreground text-sm mt-0.5">
              {empresaProfile.industry}
              {empresaProfile.region_code ? ` · ${empresaProfile.region_code}` : ''}
            </p>
          )}
        </div>

        {/* Trial / past_due alerts */}
        {subscription.status === 'trialing' && trialEndsAt && (
          <div className="mb-6 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-400">
            Tu período de prueba termina el <strong>{trialEndsAt}</strong>. Activa tu plan para no perder el acceso.
            <Link href="/suscripcion" className="underline ml-2">Activar ahora</Link>
          </div>
        )}
        {subscription.status === 'past_due' && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            Tu pago está pendiente. Actualiza tu método de pago para mantener el acceso de tu equipo.
            <Link href="/suscripcion" className="underline ml-2">Actualizar pago</Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Plan', value: PLAN_BADGES[planSlug] ?? plan?.name ?? 'Plan', icon: Briefcase },
            { label: 'Estado', value: statusLabel, icon: ExternalLink },
            { label: 'Asientos activos', value: `${activeSeats} / ${maxSeats ?? '∞'}`, icon: Users },
            { label: 'Próximo pago', value: nextPayment, icon: Calendar },
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
          {/* Apps disponibles */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-base">Apps disponibles para tu equipo</CardTitle>
                <Link href="/pricing" className="text-xs text-accent hover:underline">Ver planes</Link>
              </div>
            </CardHeader>
            <CardContent>
              {!products?.length ? (
                <p className="text-sm text-muted-foreground">Sin apps configuradas</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {products.map((p) => {
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
                          <p className="text-xs font-medium truncate">{p.name}</p>
                          {hasAccess ? (
                            <div className="flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="h-3 w-3 text-accent" />
                              <span className="text-xs text-accent">Activa</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Bloqueada</span>
                            </div>
                          )}
                        </div>
                        {hasAccess && p.app_url && (
                          <a
                            href={p.app_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline text-xs flex-shrink-0"
                          >
                            Abrir
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {accessibleApps.length === 0 && (
                <div className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-3">
                  <p className="text-xs text-muted-foreground">
                    Activa tu suscripción para desbloquear las apps para tu equipo.
                  </p>
                  <Link href="/suscripcion" className="text-xs text-accent hover:underline mt-1 block">
                    Gestionar suscripción →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Empresa profile info */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-base">Datos de la empresa</CardTitle>
                <Link href="/perfil" className="text-xs text-accent hover:underline">Editar</Link>
              </div>
            </CardHeader>
            <CardContent>
              {!empresaProfile ? (
                <div className="text-center py-4">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Completa los datos de tu empresa</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/perfil">Completar perfil</Link>
                  </Button>
                </div>
              ) : (
                <dl className="space-y-2 text-sm">
                  {[
                    { label: 'Razón social', value: empresaProfile.razon_social },
                    { label: 'RFC', value: empresaProfile.rfc },
                    { label: 'Industria', value: empresaProfile.industry },
                    { label: 'Tamaño', value: empresaProfile.employee_count_range ? `${empresaProfile.employee_count_range} empleados` : null },
                    { label: 'Contacto', value: empresaProfile.contact_name },
                    { label: 'Correo', value: empresaProfile.contact_email },
                    { label: 'Médicos estimados', value: empresaProfile.num_medicos_estimado ? `${empresaProfile.num_medicos_estimado} profesionales` : null },
                  ].filter((item) => item.value).map((item) => (
                    <div key={item.label} className="flex justify-between gap-2">
                      <dt className="text-muted-foreground shrink-0">{item.label}</dt>
                      <dd className="text-foreground text-right truncate max-w-[60%]">{item.value}</dd>
                    </div>
                  ))}
                  {empresaProfile.trust_level !== undefined && (
                    <div className="flex justify-between gap-2 pt-1 border-t border-border/40">
                      <dt className="text-muted-foreground">Verificación</dt>
                      <dd>
                        <Badge
                          variant={empresaProfile.verification_status === 'verified' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {empresaProfile.verification_status === 'verified' ? 'Verificada' : 'Pendiente'}
                        </Badge>
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Equipo + Facturas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipo médico */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-base">
                  Equipo médico ({activeSeats} / {maxSeats ?? '∞'} asientos)
                </CardTitle>
                <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
                  Gestión · Próximamente
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!seats?.length ? (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">Sin profesionales asignados aún</p>
                  <p className="text-xs text-muted-foreground">
                    Podrás invitar médicos y asignarles asientos desde aquí pronto.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {seats.filter((s) => s.is_active).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/20 last:border-0">
                      <span className="text-muted-foreground font-mono text-xs">
                        {s.user_id.slice(0, 8)}...
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Activo</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(s.assigned_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {maxSeats && activeSeats >= maxSeats && (
                <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
                  <p className="text-xs text-amber-400">
                    Has alcanzado el límite de asientos de tu plan.{' '}
                    <Link href="/suscripcion" className="underline">Ampliar plan →</Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facturas recientes */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-base">Facturas recientes</CardTitle>
                <Link href="/facturacion" className="text-xs text-accent hover:underline">Ver todas</Link>
              </div>
            </CardHeader>
            <CardContent>
              {!recentInvoices?.length ? (
                <p className="text-sm text-muted-foreground">Sin facturas registradas aún</p>
              ) : (
                <div className="space-y-2">
                  {recentInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{formatMXN(inv.amount_cents)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(inv.created_at).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <Badge
                        variant={inv.status === 'paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {inv.status === 'paid' ? 'Pagada' : 'Pendiente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
