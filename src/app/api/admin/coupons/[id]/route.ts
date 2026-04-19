import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin } from '@/lib/admin-guard';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

const PatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  is_active: z.boolean().optional(),
  applies_to_plan_ids: z.array(z.string().uuid()).optional(),
  applies_to_plan_types: z.array(z.enum(['individual', 'clinic', 'empresa'])).optional(),
  allowed_billing_intervals: z.array(z.enum(['monthly', 'annual'])).optional(),
});

async function getCoupon(id: string) {
  const service = await createServiceClient();
  const { data, error } = await service.from('coupons').select('*').eq('id', id).single();
  return { service, data, error };
}

/**
 * PATCH /api/admin/coupons/[id]
 * Mutable fields only: name/description (synced to Stripe), is_active (deactivates promo_code in Stripe),
 * and the applies_to_* / allowed_billing_intervals restrictions (local-only, enforced by our validator).
 *
 * Discount amount/type/duration are IMMUTABLE in Stripe. To "change" them, create a new coupon.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const parsed = PatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  const { service, data: existing, error: findError } = await getCoupon(id);
  if (findError || !existing) {
    return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
  }

  try {
    const stripe = getStripe();

    if ((body.name !== undefined || body.description !== undefined) && existing.stripe_coupon_id) {
      await stripe.coupons.update(existing.stripe_coupon_id, {
        ...(body.name !== undefined ? { name: body.name } : {}),
        metadata: body.description !== undefined ? { description: body.description ?? '' } : undefined,
      });
    }

    if (body.is_active !== undefined && existing.stripe_promotion_code_id) {
      await stripe.promotionCodes.update(existing.stripe_promotion_code_id, {
        active: body.is_active,
      });
    }
  } catch (err) {
    console.error('Stripe update error:', err);
    return NextResponse.json(
      { error: 'Error sincronizando con Stripe' },
      { status: 502 }
    );
  }

  const { data: updated, error: updateError } = await service
    .from('coupons')
    .update({
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
      ...(body.applies_to_plan_ids !== undefined ? { applies_to_plan_ids: body.applies_to_plan_ids } : {}),
      ...(body.applies_to_plan_types !== undefined ? { applies_to_plan_types: body.applies_to_plan_types } : {}),
      ...(body.allowed_billing_intervals !== undefined ? { allowed_billing_intervals: body.allowed_billing_intervals } : {}),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await service.from('audit_log').insert({
    actor_id: guard.user.id,
    action: body.is_active === false ? 'coupon_deactivated' : 'coupon_updated',
    target_type: 'coupon',
    target_id: id,
    before: existing as unknown as Record<string, unknown>,
    after: updated as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ coupon: updated });
}

/**
 * DELETE /api/admin/coupons/[id]
 * Soft-delete: sets is_active=false and deactivates the promotion_code in Stripe.
 * The underlying Stripe coupon is kept (Stripe doesn't allow deleting a used coupon cleanly).
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const { service, data: existing, error: findError } = await getCoupon(id);
  if (findError || !existing) {
    return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
  }

  try {
    if (existing.stripe_promotion_code_id) {
      await getStripe().promotionCodes.update(existing.stripe_promotion_code_id, { active: false });
    }
  } catch (err) {
    console.error('Stripe deactivate error:', err);
  }

  const { error: updateError } = await service
    .from('coupons')
    .update({ is_active: false })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await service.from('audit_log').insert({
    actor_id: guard.user.id,
    action: 'coupon_deactivated',
    target_type: 'coupon',
    target_id: id,
    before: existing as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ success: true });
}
