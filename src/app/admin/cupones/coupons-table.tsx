'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatMXN } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

type CouponRow = {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed_amount';
  percent_off: number | null;
  amount_off_cents: number | null;
  duration: 'once' | 'repeating' | 'forever';
  duration_in_months: number | null;
  times_redeemed: number;
  max_redemptions: number | null;
  redeem_by: string | null;
  is_active: boolean;
  first_time_only: boolean;
  applies_to_plan_types: string[];
  allowed_billing_intervals: string[];
  created_at: string;
};

export function CouponsTable({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [toggling, setToggling] = useState<string | null>(null);

  const toggleActive = (id: string, next: boolean) => {
    setToggling(id);
    startTransition(async () => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: next }),
      });
      setToggling(null);
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Error' }));
        toast({ variant: 'destructive', title: 'No se pudo actualizar', description: error });
        return;
      }
      toast({ title: next ? 'Cupón activado' : 'Cupón desactivado' });
      router.refresh();
    });
  };

  const deleteCoupon = (id: string, code: string) => {
    if (!confirm(`¿Desactivar definitivamente el cupón "${code}"? Se desactivará en Stripe también.`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Error' }));
        toast({ variant: 'destructive', title: 'Error', description: error });
        return;
      }
      toast({ title: 'Cupón desactivado' });
      router.refresh();
    });
  };

  if (coupons.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-muted-foreground">
        No hay cupones. Crea el primero con el botón &quot;Nuevo cupón&quot; arriba.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Descuento</TableHead>
          <TableHead>Duración</TableHead>
          <TableHead>Uso</TableHead>
          <TableHead>Restricciones</TableHead>
          <TableHead>Expira</TableHead>
          <TableHead>Activo</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <div className="font-mono font-semibold">{c.code}</div>
              <div className="text-xs text-muted-foreground">{c.name}</div>
            </TableCell>
            <TableCell>
              {c.discount_type === 'percentage'
                ? <Badge variant="secondary">{c.percent_off}% off</Badge>
                : <Badge variant="secondary">{formatMXN(c.amount_off_cents ?? 0)} off</Badge>}
            </TableCell>
            <TableCell className="text-xs">
              {c.duration === 'once' && 'Una vez'}
              {c.duration === 'forever' && 'Permanente'}
              {c.duration === 'repeating' && `${c.duration_in_months} meses`}
            </TableCell>
            <TableCell className="text-xs">
              {c.times_redeemed}{c.max_redemptions ? ` / ${c.max_redemptions}` : ''}
            </TableCell>
            <TableCell className="text-xs space-x-1">
              {c.first_time_only && <Badge variant="outline" className="text-xs">1ª compra</Badge>}
              {c.applies_to_plan_types.length > 0 && (
                <Badge variant="outline" className="text-xs">{c.applies_to_plan_types.join(', ')}</Badge>
              )}
              {c.allowed_billing_intervals.length > 0 && (
                <Badge variant="outline" className="text-xs">{c.allowed_billing_intervals.join(', ')}</Badge>
              )}
            </TableCell>
            <TableCell className="text-xs">
              {c.redeem_by ? new Date(c.redeem_by).toLocaleDateString('es-MX') : '—'}
            </TableCell>
            <TableCell>
              <Switch
                checked={c.is_active}
                onCheckedChange={(v) => toggleActive(c.id, v)}
                disabled={isPending && toggling === c.id}
              />
            </TableCell>
            <TableCell>
              <Button
                variant="ghost" size="icon"
                onClick={() => deleteCoupon(c.id, c.code)}
                disabled={isPending}
                title="Desactivar cupón"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
