import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Lock,
  CreditCard, User, Bell, ChevronRight, Stethoscope
} from 'lucide-react';
import { getTrustConfig } from '@/lib/trust';
import type { TrustLevel } from '@/types/database';
import { TRUST_LEVEL_LABELS, PLAN_BADGES } from '@/lib/constants';
import { getUserRole } from '@/lib/user-role';

const APP_ICONS: Record<string, string> = {
  'escalas-dlm': '📊',
  'expediente-dlm': '📋',
  'toxina-dlm': '💉',
  'cognitivapp-dlm': '🧠',
  'physio-dlm': '🏃',
  'portal-3d': '🖨️',
};

const UPSELL_MAP: Record<string, { planName: string; planSlug: string; price: number }> = {
  'expediente-dlm': { planName: 'Profesional Básico', planSlug: 'profesional-basico', price: 299 },
  'toxina-dlm': { planName: 'Suite Médica', planSlug: 'suite-medica', price: 599 },
  'cognitivapp-dlm': { planName: 'Suite Médica', planSlug: 'suite-medica', price: 599 },
  'physio-dlm': { planName: 'Suite Médica', planSlug: 'suite-medica', price: 599 },
  'portal-3d': { planName: 'Clínica Pro', planSlug: 'clinica-pro', price: 2499 },
};

export default async function DoctorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const role = await getUserRole(supabase, user.id, user);
  if (role !== 'doctor') redirect(`/dashboard/${role === 'super_admin' ? 'super-admin' : 'clinica'}`);

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('*, user_types(label_es)')
    .eq('user_id', user.id)
    .single();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(name, slug, features)')
    .eq('user_id', user.id)
    .eq('subscriber_type', 'user')
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  const { data: accessList } = await supabase
    .from('user_product_access')
    .select('*')
    .eq('user_id', user.id);

  const accessMap = new Map(accessList?.map((a) => [a.product_id, a]) ?? []);

  const trustLevel = (profile?.trust_level ?? 1) as TrustLevel;
  const trustConfig = getTrustConfig(trustLevel);
  const planName = subscription?.subscription_plans
    ? (subscription.subscription_plans as { name: string }).name
    : 'Sin plan activo';
  const planSlug = subscription?.subscription_plans
    ? (subscription.subscription_plans as { slug: string }).slug
    : null;

  const isTrialing = subscription?.status === 'trialing';
  const isPastDue = subscription?.status === 'past_due';

  const displayName = profile
    ? (user.user_metadata?.full_name as string) || user.email
    : user.email;

  const nextPayment = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('es-MX')
    : '—';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-accent" />
            <span className="font-headline text-lg font-bold">DeepLux</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/suscripcion"><CreditCard className="h-4 w-4 mr-1.5" />Suscripción</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/perfil"><User className="h-4 w-4 mr-1.5" />Perfil</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-headline text-2xl font-bold text-foreground">
              Hola, {typeof displayName === 'string' ? displayName.split(' ')[0] : 'Doctor'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {planSlug && (
                <Badge variant="secondary" className="text-xs">
                  {PLAN_BADGES[planSlug] ?? planName}
                </Badge>
              )}
              <Badge variant={trustConfig.badgeVariant} className="text-xs">
                {trustConfig.badgeText}
              </Badge>
              {isTrialing && subscription?.trial_ends_at && (
                <span className="text-xs text-muted-foreground">
                  Trial hasta {new Date(subscription.trial_ends_at).toLocaleDateString('es-MX')}
                </span>
              )}
            </div>
          </div>
          <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        </div>

        <div className="space-y-3 mb-6">
          {trustConfig.alertMessage && (
            <Alert className="border-amber-500/40 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200">
                {trustConfig.alertMessage}{' '}
                <Link href="/perfil" className="underline font-medium">Completar perfil →</Link>
              </AlertDescription>
            </Alert>
          )}
          {isPastDue && (
            <Alert className="border-destructive/40 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                Tu suscripción tiene un pago pendiente. Actualiza tu método de pago para evitar interrupciones.{' '}
                <Link href="/suscripcion" className="underline font-medium">Actualizar →</Link>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Plan activo', value: planName, icon: CreditCard },
            { label: 'Estado', value: TRUST_LEVEL_LABELS[trustLevel], icon: CheckCircle2 },
            { label: 'Apps disponibles', value: `${accessList?.filter((a) => a.has_access).length ?? 0} / ${products?.length ?? 6}`, icon: ExternalLink },
            { label: 'Próximo pago', value: nextPayment, icon: User },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-card border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{stat.label}</span>
                  </div>
                  <p className="font-semibold text-sm text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold">Tus aplicaciones</h2>
            <Link href="/pricing" className="text-sm text-accent hover:underline flex items-center gap-1">
              Ver planes <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products?.map((product) => {
              const access = accessMap.get(product.id);
              const hasAccess = access?.has_access ?? false;
              const upsell = UPSELL_MAP[product.slug];
              const emoji = APP_ICONS[product.slug] ?? '📱';

              return (
                <Card
                  key={product.id}
                  className={`bg-card border-border/60 transition-all ${hasAccess ? 'hover:border-accent/60' : 'opacity-75'}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${product.color_hex}20` }}
                        >
                          {emoji}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{product.name}</p>
                          {hasAccess ? (
                            <Badge variant="outline" className="text-xs text-green-400 border-green-400/40 mt-0.5">
                              Activa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground mt-0.5">
                              <Lock className="h-2.5 w-2.5 mr-1" />
                              Bloqueada
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{product.short_description}</p>

                    {hasAccess ? (
                      product.app_url ? (
                        <Button size="sm" className="w-full" asChild>
                          <a href={product.app_url} target="_blank" rel="noopener noreferrer">
                            Abrir app <ExternalLink className="ml-1.5 h-3 w-3" />
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full" disabled>
                          Próximamente
                        </Button>
                      )
                    ) : upsell ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Disponible en <span className="text-accent font-medium">{upsell.planName}</span>
                        </p>
                        <Button size="sm" variant="outline" className="w-full border-accent/40 text-accent hover:bg-accent/10" asChild>
                          <Link href={`/pricing?highlight=${upsell.planSlug}`}>
                            Ver plan ${upsell.price}/mes <ArrowRight className="ml-1.5 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {trustLevel < 3 && (
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-headline">Completa tu perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Confirmar correo electrónico', done: trustLevel >= 1, href: '/perfil' },
                  { key: 'cedula', label: 'Agregar cédula profesional', done: !!profile?.cedula_profesional, href: '/perfil#cedula' },
                  { key: 'upload_cedula', label: 'Subir documento de cédula para verificación', done: trustLevel >= 2, href: '/perfil#cedula' },
                  { key: 'specialty', label: 'Agregar especialidad e institución', done: !!profile?.specialty || !!profile?.institution_affiliation, href: '/perfil#profesional' },
                ].map((task) => (
                  <Link key={task.key} href={task.href} className="flex items-center gap-3 group">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${task.done ? 'bg-accent/20' : 'border border-border/60'}`}>
                      {task.done && <CheckCircle2 className="h-3 w-3 text-accent" />}
                    </div>
                    <span className={`text-sm ${task.done ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-accent transition-colors'}`}>
                      {task.label}
                    </span>
                    {!task.done && <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto group-hover:text-accent" />}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
