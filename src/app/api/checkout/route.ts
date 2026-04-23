import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl, getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as {
    planSlug: string;
    billingInterval: 'monthly' | 'annual';
    processor: 'stripe' | 'conekta';
    clinicId?: string;
    couponCode?: string;
  };

  const { planSlug, billingInterval, processor, clinicId, couponCode } = body;

  // Fetch plan
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('slug', planSlug)
    .eq('is_active', true)
    .single();

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  if (plan.billing_interval === 'free') {
    // Free plan - create subscription directly
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already has active subscription' }, { status: 400 });
    }

    await supabase.from('subscriptions').insert({
      subscriber_type: 'user',
      user_id: user.id,
      plan_id: plan.id,
      status: 'active',
      billing_interval: 'free',
      current_period_start: new Date().toISOString(),
      current_period_end: null,
    });

    await supabase.rpc('recompute_user_product_access', { p_user_id: user.id });

    return NextResponse.json({ success: true, redirect: '/dashboard' });
  }

  if (processor === 'stripe') {
    const priceId = billingInterval === 'annual'
      ? plan.stripe_price_id_annual
      : plan.stripe_price_id;

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price not configured for this plan' }, { status: 400 });
    }

    // Validate coupon (if provided) and resolve its Stripe promotion_code id.
    let stripePromotionCodeId: string | null = null;
    let couponId: string | null = null;
    if (couponCode && couponCode.trim().length > 0) {
      const { data: validationData, error: validationError } = await supabase.rpc('validate_coupon', {
        p_code: couponCode.trim(),
        p_plan_id: plan.id,
        p_billing_interval: billingInterval,
        p_user_id: user.id,
      });
      if (validationError) {
        console.error('validate_coupon error:', validationError);
        return NextResponse.json({ error: 'Error validando cupón' }, { status: 500 });
      }
      const row = Array.isArray(validationData) ? validationData[0] : validationData;
      if (!row || !row.valid) {
        return NextResponse.json(
          { error: `Cupón inválido: ${row?.reason ?? 'desconocido'}` },
          { status: 400 }
        );
      }
      stripePromotionCodeId = row.stripe_promotion_code_id;
      couponId = row.coupon_id;
    }

    // Get or create Stripe customer
    let stripeCustomerId: string | undefined;
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .single();

    const stripe = getStripe();
    if (existingSub?.stripe_customer_id) {
      stripeCustomerId = existingSub.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id, clinic_id: clinicId ?? '' },
      });
      stripeCustomerId = customer.id;
    }

    const siteUrl = getSiteUrl();
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        supabase_user_id: user.id,
        plan_id: plan.id,
        plan_slug: planSlug,
        clinic_id: clinicId ?? '',
        billing_interval: billingInterval,
        coupon_id: couponId ?? '',
      },
      subscription_data: {
        trial_period_days: plan.trial_days ?? 14,
        metadata: {
          supabase_user_id: user.id,
          plan_id: plan.id,
          plan_slug: planSlug,
          clinic_id: clinicId ?? '',
          billing_interval: billingInterval,
          coupon_id: couponId ?? '',
        },
      },
      success_url: `${siteUrl}/dashboard?payment=success`,
      cancel_url: `${siteUrl}/pricing?payment=canceled`,
    };

    if (stripePromotionCodeId) {
      sessionParams.discounts = [{ promotion_code: stripePromotionCodeId }];
    } else {
      // allow_promotion_codes lets the user paste a code directly in Stripe Checkout
      // even if they didn't pre-enter one in our UI.
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  }

  // Conekta checkout (OXXO / SPEI) - prioridad Stripe; Conekta en roadmap
  return NextResponse.json({
    error: 'OXXO y SPEI próximamente. Usa tarjeta con Stripe por ahora.',
  }, { status: 501 });
}
