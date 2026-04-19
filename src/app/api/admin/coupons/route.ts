import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { requireSuperAdmin } from '@/lib/admin-guard';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

const CreateCouponSchema = z.object({
  code: z.string().trim().min(3).max(64).regex(/^[A-Z0-9_-]+$/i, 'Sólo letras, números, - y _'),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  percent_off: z.number().min(0.01).max(100).optional().nullable(),
  amount_off_cents: z.number().int().positive().optional().nullable(),
  currency: z.string().length(3).default('MXN'),
  duration: z.enum(['once', 'repeating', 'forever']).default('once'),
  duration_in_months: z.number().int().positive().max(60).optional().nullable(),
  applies_to_plan_ids: z.array(z.string().uuid()).default([]),
  applies_to_plan_types: z.array(z.enum(['individual', 'clinic', 'empresa'])).default([]),
  first_time_only: z.boolean().default(false),
  min_amount_cents: z.number().int().positive().optional().nullable(),
  allowed_billing_intervals: z.array(z.enum(['monthly', 'annual'])).default([]),
  max_redemptions: z.number().int().positive().optional().nullable(),
  redeem_by: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/admin/coupons
 * Lists all coupons (super_admin only).
 */
export async function GET() {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.response;

  const service = await createServiceClient();
  const { data, error } = await service
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ coupons: data ?? [] });
}

/**
 * POST /api/admin/coupons
 * Creates a coupon locally and replicates it to Stripe (coupon + promotion_code).
 */
export async function POST(request: NextRequest) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.response;

  const parsed = CreateCouponSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  if (body.discount_type === 'percentage' && body.percent_off == null) {
    return NextResponse.json({ error: 'percent_off requerido para descuento porcentual' }, { status: 400 });
  }
  if (body.discount_type === 'fixed_amount' && body.amount_off_cents == null) {
    return NextResponse.json({ error: 'amount_off_cents requerido para descuento fijo' }, { status: 400 });
  }
  if (body.duration === 'repeating' && body.duration_in_months == null) {
    return NextResponse.json({ error: 'duration_in_months requerido para duration=repeating' }, { status: 400 });
  }

  const service = await createServiceClient();

  // 1. Create the Stripe coupon + promotion code FIRST (so we can persist the IDs atomically).
  let stripeCouponId: string | null = null;
  let stripePromoCodeId: string | null = null;

  try {
    const stripe = getStripe();

    const stripeCouponParams: Stripe.CouponCreateParams = {
      name: body.name,
      duration: body.duration,
      ...(body.duration === 'repeating' ? { duration_in_months: body.duration_in_months! } : {}),
      metadata: {
        source: 'deeplux-admin',
        code: body.code,
      },
    };
    if (body.discount_type === 'percentage') {
      stripeCouponParams.percent_off = body.percent_off!;
    } else {
      stripeCouponParams.amount_off = body.amount_off_cents!;
      stripeCouponParams.currency = body.currency.toLowerCase();
    }
    if (body.redeem_by) {
      stripeCouponParams.redeem_by = Math.floor(new Date(body.redeem_by).getTime() / 1000);
    }
    if (body.max_redemptions) {
      stripeCouponParams.max_redemptions = body.max_redemptions;
    }
    const stripeCoupon = await stripe.coupons.create(stripeCouponParams);
    stripeCouponId = stripeCoupon.id;

    const promoParams: Stripe.PromotionCodeCreateParams = {
      promotion: { type: 'coupon', coupon: stripeCoupon.id },
      code: body.code,
      active: true,
      metadata: { source: 'deeplux-admin' },
    };
    if (body.first_time_only) {
      promoParams.restrictions = { first_time_transaction: true };
    }
    if (body.min_amount_cents) {
      promoParams.restrictions = {
        ...(promoParams.restrictions ?? {}),
        minimum_amount: body.min_amount_cents,
        minimum_amount_currency: body.currency.toLowerCase(),
      };
    }
    if (body.max_redemptions) {
      promoParams.max_redemptions = body.max_redemptions;
    }
    if (body.redeem_by) {
      promoParams.expires_at = Math.floor(new Date(body.redeem_by).getTime() / 1000);
    }
    const promoCode = await stripe.promotionCodes.create(promoParams);
    stripePromoCodeId = promoCode.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error creando cupón en Stripe';
    console.error('Stripe coupon create error:', err);
    return NextResponse.json({ error: `Stripe: ${msg}` }, { status: 502 });
  }

  // 2. Insert into Supabase.
  const { data: inserted, error: insertError } = await service
    .from('coupons')
    .insert({
      code: body.code,
      name: body.name,
      description: body.description ?? null,
      discount_type: body.discount_type,
      percent_off: body.percent_off ?? null,
      amount_off_cents: body.amount_off_cents ?? null,
      currency: body.currency,
      duration: body.duration,
      duration_in_months: body.duration_in_months ?? null,
      applies_to_plan_ids: body.applies_to_plan_ids,
      applies_to_plan_types: body.applies_to_plan_types,
      first_time_only: body.first_time_only,
      min_amount_cents: body.min_amount_cents ?? null,
      allowed_billing_intervals: body.allowed_billing_intervals,
      max_redemptions: body.max_redemptions ?? null,
      redeem_by: body.redeem_by ?? null,
      stripe_coupon_id: stripeCouponId,
      stripe_promotion_code_id: stripePromoCodeId,
      created_by: guard.user.id,
    })
    .select('*')
    .single();

  if (insertError) {
    // Best-effort rollback in Stripe.
    try {
      const stripe = getStripe();
      if (stripePromoCodeId) await stripe.promotionCodes.update(stripePromoCodeId, { active: false });
      if (stripeCouponId) await stripe.coupons.del(stripeCouponId);
    } catch (rollbackErr) {
      console.error('Stripe rollback failed:', rollbackErr);
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await service.from('audit_log').insert({
    actor_id: guard.user.id,
    action: 'coupon_created',
    target_type: 'coupon',
    target_id: inserted.id,
    after: inserted as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ coupon: inserted }, { status: 201 });
}
