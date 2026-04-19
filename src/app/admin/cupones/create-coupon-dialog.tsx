'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

type PlanRow = { id: string; slug: string; name: string; plan_type: string };

type PlanType = 'individual' | 'clinic' | 'empresa';

export function CreateCouponDialog({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [percentOff, setPercentOff] = useState<string>('20');
  const [amountOffMXN, setAmountOffMXN] = useState<string>('100');
  const [duration, setDuration] = useState<'once' | 'repeating' | 'forever'>('once');
  const [durationInMonths, setDurationInMonths] = useState<string>('3');
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [maxRedemptions, setMaxRedemptions] = useState<string>('');
  const [redeemBy, setRedeemBy] = useState<string>('');
  const [planTypes, setPlanTypes] = useState<PlanType[]>([]);
  const [intervals, setIntervals] = useState<('monthly' | 'annual')[]>([]);
  const [planIds, setPlanIds] = useState<string[]>([]);

  const togglePlanType = (t: PlanType) =>
    setPlanTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const toggleInterval = (i: 'monthly' | 'annual') =>
    setIntervals((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  const togglePlanId = (id: string) =>
    setPlanIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const resetForm = () => {
    setCode(''); setName(''); setDescription('');
    setDiscountType('percentage'); setPercentOff('20'); setAmountOffMXN('100');
    setDuration('once'); setDurationInMonths('3');
    setFirstTimeOnly(false); setMaxRedemptions(''); setRedeemBy('');
    setPlanTypes([]); setIntervals([]); setPlanIds([]);
  };

  const handleSubmit = () => {
    if (!code.trim() || !name.trim()) {
      toast({ variant: 'destructive', title: 'Código y nombre son obligatorios' });
      return;
    }

    const payload: Record<string, unknown> = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || null,
      discount_type: discountType,
      duration,
      applies_to_plan_ids: planIds,
      applies_to_plan_types: planTypes,
      allowed_billing_intervals: intervals,
      first_time_only: firstTimeOnly,
    };

    if (discountType === 'percentage') {
      const pct = Number(percentOff);
      if (!pct || pct <= 0 || pct > 100) {
        toast({ variant: 'destructive', title: 'Porcentaje inválido (1-100)' });
        return;
      }
      payload.percent_off = pct;
    } else {
      const cents = Math.round(Number(amountOffMXN) * 100);
      if (!cents || cents <= 0) {
        toast({ variant: 'destructive', title: 'Monto inválido' });
        return;
      }
      payload.amount_off_cents = cents;
    }

    if (duration === 'repeating') {
      const months = Number(durationInMonths);
      if (!months || months <= 0) {
        toast({ variant: 'destructive', title: 'Meses inválidos para duración repetida' });
        return;
      }
      payload.duration_in_months = months;
    }

    if (maxRedemptions) {
      const mr = Number(maxRedemptions);
      if (mr > 0) payload.max_redemptions = mr;
    }

    if (redeemBy) {
      payload.redeem_by = new Date(redeemBy).toISOString();
    }

    startTransition(async () => {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Error al crear cupón', description: json.error ?? 'Intenta de nuevo.' });
        return;
      }
      toast({ title: 'Cupón creado', description: `${code.toUpperCase()} está listo para usarse.` });
      resetForm();
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nuevo cupón</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear cupón</DialogTitle>
          <DialogDescription>
            Se replicará automáticamente en Stripe. El descuento se aplica en el checkout del cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div>
            <Label>Código</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="LANZAMIENTO50"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">Lo que escribirá el usuario al pagar.</p>
          </div>
          <div>
            <Label>Nombre interno</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lanzamiento agosto 2026" />
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas internas sobre la campaña"
              rows={2}
            />
          </div>
        </div>

        <div className="border-t border-border/40 pt-4">
          <h3 className="text-sm font-semibold mb-3">Descuento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed_amount')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                  <SelectItem value="fixed_amount">Monto fijo (MXN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {discountType === 'percentage' ? (
              <div>
                <Label>Porcentaje (%)</Label>
                <Input type="number" min={1} max={100} value={percentOff} onChange={(e) => setPercentOff(e.target.value)} />
              </div>
            ) : (
              <div>
                <Label>Monto (MXN)</Label>
                <Input type="number" min={1} value={amountOffMXN} onChange={(e) => setAmountOffMXN(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Duración</Label>
              <Select value={duration} onValueChange={(v) => setDuration(v as 'once' | 'repeating' | 'forever')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Sólo la primera factura</SelectItem>
                  <SelectItem value="repeating">Varios meses</SelectItem>
                  <SelectItem value="forever">Permanente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {duration === 'repeating' && (
              <div>
                <Label>Meses</Label>
                <Input type="number" min={1} max={60} value={durationInMonths} onChange={(e) => setDurationInMonths(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border/40 pt-4">
          <h3 className="text-sm font-semibold mb-3">Restricciones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Máximo de usos (total)</Label>
              <Input type="number" min={1} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} placeholder="Ilimitado" />
            </div>
            <div>
              <Label>Expira en</Label>
              <Input type="datetime-local" value={redeemBy} onChange={(e) => setRedeemBy(e.target.value)} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <Checkbox id="first-time" checked={firstTimeOnly} onCheckedChange={(v) => setFirstTimeOnly(v === true)} />
              <Label htmlFor="first-time" className="cursor-pointer">Sólo para clientes nuevos (1ª compra)</Label>
            </div>
          </div>

          <div className="mt-4">
            <Label>Tipos de plan aplicables</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(['individual', 'clinic', 'empresa'] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer px-3 py-1.5 border border-border/60 rounded-md text-sm">
                  <Checkbox checked={planTypes.includes(t)} onCheckedChange={() => togglePlanType(t)} />
                  {t}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Vacío = todos los tipos.</p>
          </div>

          <div className="mt-3">
            <Label>Periodicidades aplicables</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(['monthly', 'annual'] as const).map((i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer px-3 py-1.5 border border-border/60 rounded-md text-sm">
                  <Checkbox checked={intervals.includes(i)} onCheckedChange={() => toggleInterval(i)} />
                  {i === 'monthly' ? 'Mensual' : 'Anual'}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Vacío = ambas.</p>
          </div>

          <div className="mt-3">
            <Label>Planes específicos (opcional)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {plans.map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer px-3 py-1.5 border border-border/60 rounded-md text-sm">
                  <Checkbox checked={planIds.includes(p.id)} onCheckedChange={() => togglePlanId(p.id)} />
                  {p.name}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Vacío = cualquier plan que cumpla los otros filtros.</p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Creando…' : 'Crear cupón'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
