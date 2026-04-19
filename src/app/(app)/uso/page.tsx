import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserRole, getDashboardRoute } from '@/lib/user-role';
import { BarChart3 } from 'lucide-react';

export default async function UsoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/uso');

  const role = await getUserRole(supabase, user.id, user);
  const dashboard = getDashboardRoute(role);

  const { data: accessRows } = await supabase
    .from('user_product_access')
    .select('product_id, has_access, updated_at, products(name, slug)')
    .eq('user_id', user.id);

  const activeApps = (accessRows ?? []).filter((r) => r.has_access).length;
  const totalApps = accessRows?.length ?? 0;

  let seatsLabel: string | null = null;
  if (role === 'clinic_admin') {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, subscription_plans(max_seats)')
      .eq('subscriber_type', 'clinic')
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub?.id) {
      const { count } = await supabase
        .from('subscription_seats')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_id', sub.id)
        .eq('is_active', true);
      const maxSeats = (sub.subscription_plans as { max_seats: number | null } | null)?.max_seats;
      seatsLabel = `${count ?? 0} / ${maxSeats ?? '∞'} asientos en uso`;
    }
  } else if (role === 'empresa_admin') {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, subscription_plans(max_seats)')
      .eq('subscriber_type', 'user')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub?.id) {
      const { count } = await supabase
        .from('subscription_seats')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_id', sub.id)
        .eq('is_active', true);
      const maxSeats = (sub.subscription_plans as { max_seats: number | null } | null)?.max_seats;
      seatsLabel = `${count ?? 0} / ${maxSeats ?? '∞'} asientos en uso`;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Uso del producto</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Resumen de acceso a aplicaciones y asientos. Vuelve a tu{' '}
          <Link href={dashboard} className="text-primary underline font-medium">
            inicio
          </Link>{' '}
          para abrir cada app.
        </p>

        <div className="grid gap-4 mb-8">
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-headline">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Apps con acceso activo:</span>{' '}
                <strong>{activeApps}</strong>
                {totalApps ? ` de ${totalApps} registradas en tu cuenta` : ''}
              </p>
              {seatsLabel && (
                <p>
                  <span className="text-muted-foreground">Equipo:</span> <strong>{seatsLabel}</strong>
                </p>
              )}
              <p className="text-xs text-muted-foreground pt-2">
                La fecha de &quot;acceso recalculado&quot; refleja cuando se actualizó tu permiso (pago, asiento o
                plan), no sesiones dentro de cada app.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-headline">Por aplicación</CardTitle>
          </CardHeader>
          <CardContent>
            {!accessRows?.length ? (
              <p className="text-sm text-muted-foreground">Sin registros de acceso aún.</p>
            ) : (
              <div className="space-y-3">
                {accessRows.map((row) => {
                  const prod = row.products as { name: string; slug: string } | null;
                  const updated = row.updated_at
                    ? new Date(row.updated_at).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : '—';
                  return (
                    <div
                      key={row.product_id}
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3 last:border-0 last:pb-0"
                    >
                      <span className="font-medium text-sm">{prod?.name ?? 'Producto'}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={row.has_access ? 'default' : 'secondary'} className="text-xs">
                          {row.has_access ? 'Acceso' : 'Sin acceso'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Recalculado: {updated}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
