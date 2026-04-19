import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const BodySchema = z.object({
  code: z.string().trim().min(1).max(64),
  planSlug: z.string().trim().min(1).max(64),
  billingInterval: z.enum(['monthly', 'annual']),
});

type ValidateRow = {
  valid: boolean;
  reason: string;
  coupon_id: string | null;
  discount_type: 'percentage' | 'fixed_amount' | null;
  percent_off: number | null;
  amount_off_cents: number | null;
  discount_cents: number;
  final_price_cents: number;
  stripe_promotion_code_id: string | null;
};

/**
 * POST /api/coupons/validate
 * Public endpoint used by the checkout UI to preview the discount before creating the Stripe session.
 * Does NOT redeem the coupon.
 */
export async function POST(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }
  const { code, planSlug, billingInterval } = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id, name, price_mxn_cents, price_mxn_annual_cents')
    .eq('slug', planSlug)
    .eq('is_active', true)
    .single();

  if (!plan) {
    return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
  }

  const { data, error } = await supabase.rpc('validate_coupon', {
    p_code: code,
    p_plan_id: plan.id,
    p_billing_interval: billingInterval,
    p_user_id: user?.id ?? null,
  });

  if (error) {
    console.error('validate_coupon RPC error:', error);
    return NextResponse.json({ error: 'No se pudo validar el cupón' }, { status: 500 });
  }

  const row = Array.isArray(data) ? (data[0] as ValidateRow | undefined) : (data as ValidateRow | undefined);
  if (!row) {
    return NextResponse.json({ valid: false, reason: 'Cupón no existe' }, { status: 200 });
  }

  return NextResponse.json({
    valid: row.valid,
    reason: row.reason,
    couponId: row.coupon_id,
    discountType: row.discount_type,
    percentOff: row.percent_off,
    amountOffCents: row.amount_off_cents,
    discountCents: row.discount_cents,
    finalPriceCents: row.final_price_cents,
  });
}
