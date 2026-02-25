'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionActionsProps {
  status: string;
  stripeSubscriptionId: string | null;
  paymentProcessor: string | null;
  cancelAtPeriodEnd: boolean;
}

export function SubscriptionActions({
  status,
  stripeSubscriptionId,
  paymentProcessor,
  cancelAtPeriodEnd,
}: SubscriptionActionsProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const hasStripe = !!stripeSubscriptionId && paymentProcessor === 'stripe';

  async function handleUpdatePayment() {
    if (!hasStripe) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast({ variant: 'destructive', title: 'Error', description: data.error ?? 'No se pudo abrir el portal.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo conectar.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Cancelación programada', description: 'Tu suscripción se cancelará al final del período actual.' });
        router.refresh();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error ?? 'No se pudo procesar.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo conectar.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleReactivate() {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription/reactivate', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Suscripción reactivada', description: 'Tu suscripción continuará renovándose normalmente.' });
        router.refresh();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error ?? 'No se pudo procesar.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo conectar.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <CardContent className="pt-5 space-y-3">
      {status === 'past_due' && (
        <Button
          className="w-full"
          variant="destructive"
          onClick={handleUpdatePayment}
          disabled={!hasStripe || loading}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {loading ? 'Abriendo...' : 'Actualizar método de pago'}
        </Button>
      )}

      <Button variant="outline" className="w-full" asChild>
        <Link href="/pricing">
          <ExternalLink className="mr-2 h-4 w-4" />
          Ver otros planes / Actualizar
        </Link>
      </Button>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/facturacion">
          <CreditCard className="mr-2 h-4 w-4" />
          Ver historial de pagos
        </Link>
      </Button>

      {status === 'active' && !cancelAtPeriodEnd && (
        <>
          <Separator />
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-destructive text-sm"
            onClick={handleCancel}
            disabled={!hasStripe || loading}
          >
            {loading ? 'Procesando...' : 'Cancelar suscripción al final del período'}
          </Button>
        </>
      )}

      {cancelAtPeriodEnd && (
        <Button
          variant="outline"
          className="w-full text-accent border-accent/40"
          onClick={handleReactivate}
          disabled={!hasStripe || loading}
        >
          {loading ? 'Procesando...' : 'Reactivar suscripción'}
        </Button>
      )}
    </CardContent>
  );
}
