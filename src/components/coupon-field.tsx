'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { formatMXN } from '@/lib/utils';

export type CouponValidationResult = {
  valid: boolean;
  reason: string;
  couponId: string | null;
  discountType: 'percentage' | 'fixed_amount' | null;
  percentOff: number | null;
  amountOffCents: number | null;
  discountCents: number;
  finalPriceCents: number;
  code: string;
};

interface CouponFieldProps {
  planSlug: string;
  billingInterval: 'monthly' | 'annual';
  onValidCoupon?: (result: CouponValidationResult) => void;
  onClearCoupon?: () => void;
}

/**
 * Reusable coupon-entry field that validates the code against /api/coupons/validate
 * and notifies the parent with the calculated discount (or null when cleared).
 */
export function CouponField({
  planSlug,
  billingInterval,
  onValidCoupon,
  onClearCoupon,
}: CouponFieldProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouponValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), planSlug, billingInterval }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'No se pudo validar');
        setResult(null);
        return;
      }
      if (!data.valid) {
        setError(data.reason ?? 'Cupón no válido');
        setResult(null);
        return;
      }
      const validated: CouponValidationResult = { ...data, code: code.trim() };
      setResult(validated);
      onValidCoupon?.(validated);
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setCode('');
    setResult(null);
    setError(null);
    onClearCoupon?.();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">¿Tienes un código de descuento?</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') validate(); }}
          placeholder="Introduce tu código"
          className="font-mono"
          disabled={loading || !!result}
        />
        {!result ? (
          <Button onClick={validate} disabled={loading || !code.trim()} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
          </Button>
        ) : (
          <Button onClick={clear} variant="ghost">Quitar</Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <XCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-md border border-accent/40 bg-accent/5 p-3 text-sm space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-semibold">Cupón aplicado</span>
            {result.discountType === 'percentage' && result.percentOff != null && (
              <Badge variant="secondary">{result.percentOff}% off</Badge>
            )}
            {result.discountType === 'fixed_amount' && result.amountOffCents != null && (
              <Badge variant="secondary">{formatMXN(result.amountOffCents)} off</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Ahorras {formatMXN(result.discountCents)} · Total a pagar: <span className="text-foreground font-semibold">{formatMXN(result.finalPriceCents)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
