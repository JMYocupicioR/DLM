import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' });
}

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
  };

  const { planSlug, billingInterval, processor, clinicId } = body;

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
      current_period_end: null, // No expiry for free plan
    });

    // Recompute access
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

    // Get or create Stripe customer
    let stripeCustomerId: string | undefined;
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .single();

    if (existingSub?.stripe_customer_id) {
      stripeCustomerId = existingSub.stripe_customer_id;
    } else {
      const stripe = getStripe();
    const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id, clinic_id: clinicId ?? '' },
      });
      stripeCustomerId = customer.id;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:9002';
    const session = await getStripe().checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: plan.trial_days ?? 14,
        metadata: {
          supabase_user_id: user.id,
          plan_id: plan.id,
          plan_slug: planSlug,
          clinic_id: clinicId ?? '',
          billing_interval: billingInterval,
        },
      },
      success_url: `${siteUrl}/dashboard?payment=success`,
      cancel_url: `${siteUrl}/pricing?payment=canceled`,
    });

    return NextResponse.json({ url: session.url });
  }

  // Conekta checkout (OXXO / SPEI) - prioridad Stripe; Conekta en roadmap
  return NextResponse.json({
    error: 'OXXO y SPEI próximamente. Usa tarjeta con Stripe por ahora.',
  }, { status: 501 });
}
