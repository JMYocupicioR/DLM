import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SubscriptionActions } from './subscription-actions';
import { formatMXN } from '@/lib/utils';
import { PLAN_BADGES } from '@/lib/constants';

const statusConfig: Record<string, { label: string; color: string; description: string }> = {
  active: { label: 'Activa', color: 'text-green-400', description: 'Tu suscripción está activa.' },
  trialing: { label: 'Período de prueba', color: 'text-yellow-400', description: 'Estás en tu período de prueba gratuita.' },
  past_due: { label: 'Pago pendiente', color: 'text-red-400', description: 'Hay un problema con tu método de pago.' },
  canceled: { label: 'Cancelada', color: 'text-muted-foreground', description: 'Tu suscripción será cancelada al final del período.' },
  expired: { label: 'Expirada', color: 'text-muted-foreground', description: 'Tu suscripción ha expirado.' },
};

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/suscripcion');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscriptionRaw } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*, plan_products(*, products(*)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = subscriptionRaw as any;

  const plan = subscription?.subscription_plans as {
    name: string; slug: string; price_mxn_cents: number; price_mxn_annual_cents: number;
    billing_interval: string; plan_type: string; max_seats: number | null;
    features: string[]; trial_days: number;
    plan_products: Array<{ access_level: string; products: { name: string; slug: string; color_hex: string } }>;
  } | null;

  const status = subscription?.status ?? 'expired';
  const statusInfo = statusConfig[status] ?? statusConfig.expired;
  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  const gracePeriodEndsAt = subscription?.grace_period_ends_at ? new Date(subscription.grace_period_ends_at) : null;
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end ?? false;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 py-4 px-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="font-headline text-xl font-bold">Mi Suscripción</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {!subscription || status === 'expired' ? (
          <Card className="bg-card border-border/60">
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h2 className="font-headline text-xl font-bold mb-2">Sin plan activo</h2>
              <p className="text-muted-foreground mb-6">Elige un plan para acceder a todo el ecosistema DeepLux.</p>
              <Button asChild>
                <Link href="/pricing">Ver planes y precios</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {/* Current plan */}
            <Card className="bg-card border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline text-lg">
                    {plan?.name ?? 'Plan actual'}
                  </CardTitle>
                  <Badge variant="outline" className={`${statusInfo.color} border-current/40`}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Status description */}
                <p className="text-sm text-muted-foreground mb-4">{statusInfo.description}</p>

                {status === 'past_due' && gracePeriodEndsAt && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">
                      Grace period hasta {gracePeriodEndsAt.toLocaleDateString('es-MX')}. Actualiza tu método de pago para evitar interrupciones.
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="space-y-2">
                  {status === 'trialing' && trialEndsAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Prueba gratuita hasta
                      </span>
                      <span className="font-medium text-foreground">
                        {trialEndsAt.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {periodEnd && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {cancelAtPeriodEnd ? 'Cancela el' : 'Próxima renovación'}
                      </span>
                      <span className={`font-medium ${cancelAtPeriodEnd ? 'text-amber-400' : 'text-foreground'}`}>
                        {periodEnd.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {plan && plan.price_mxn_cents > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        Cargo
                      </span>
                      <span className="font-medium text-foreground">
                        {formatMXN(plan.price_mxn_cents)}/mes
                        {subscription.payment_processor && (
                          <span className="text-xs text-muted-foreground ml-1.5">
                            vía {subscription.payment_processor}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Apps included */}
                {plan?.plan_products && plan.plan_products.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Apps incluidas</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.plan_products.map((pp) => pp.products && (
                        <Badge key={pp.products.slug} variant="outline" className="text-xs gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5 text-accent" />
                          {pp.products.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-card border-border/60">
              <SubscriptionActions
                status={status}
                stripeSubscriptionId={subscription.stripe_subscription_id}
                paymentProcessor={subscription.payment_processor}
                cancelAtPeriodEnd={cancelAtPeriodEnd}
              />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
