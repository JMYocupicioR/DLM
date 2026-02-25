import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' });
}

// This route is called by a cron job (e.g., Vercel Cron or GitHub Actions).
// It reconciles the local subscription state with the actual state in Stripe/Conekta.
// Protects against webhook failures, network issues, or replays.

export async function POST(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = getStripe();
  const supabase = await createServiceClient();
  const results = { checked: 0, updated: 0, errors: 0 };

  // ── 1. Reconcile Stripe subscriptions ───────────────────────────
  const { data: stripeSubscriptions } = await supabase
    .from('subscriptions')
    .select('id, user_id, clinic_id, stripe_subscription_id, status, plan_id')
    .eq('payment_processor', 'stripe')
    .in('status', ['active', 'trialing', 'past_due'])
    .not('stripe_subscription_id', 'is', null);

  for (const sub of stripeSubscriptions ?? []) {
    results.checked++;
    try {
      const stripeSubscriptionRaw = await stripe.subscriptions.retrieve(
        sub.stripe_subscription_id!
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stripeSubscription = stripeSubscriptionRaw as any;

      const newStatus = mapStripeStatus(stripeSubscription.status as Stripe.Subscription.Status);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (newStatus !== (sub as any).status) {
        await supabase
          .from('subscriptions')
          .update({
            status: newStatus,
            current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          })
          .eq('id', (sub as any).id);

        // Recompute access for affected user
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((sub as any).user_id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await supabase.rpc('recompute_user_product_access', { p_user_id: (sub as any).user_id });
        }

        results.updated++;
      }
    } catch (err) {
      console.error(`Failed to reconcile Stripe sub ${sub.stripe_subscription_id}:`, err);
      results.errors++;
    }
  }

  // ── 2. Expire grace periods that have passed ─────────────────────
  const { data: pastDueSubs } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('status', 'past_due')
    .lt('grace_period_ends_at', new Date().toISOString());

  for (const sub of pastDueSubs ?? []) {
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('id', sub.id);

    if (sub.user_id) {
      await supabase.rpc('recompute_user_product_access', { p_user_id: sub.user_id });
    }
    results.updated++;
  }

  // ── 3. Expire trials that have ended without upgrading ───────────
  const { data: expiredTrials } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_id')
    .eq('status', 'trialing')
    .lt('trial_ends_at', new Date().toISOString())
    .is('stripe_subscription_id', null); // Only self-managed trials

  for (const sub of expiredTrials ?? []) {
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('billing_interval')
      .eq('id', sub.plan_id)
      .single();

    if (plan?.billing_interval === 'free') continue; // Free plans don't expire

    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('id', sub.id);

    if (sub.user_id) {
      await supabase.rpc('recompute_user_product_access', { p_user_id: sub.user_id });
    }
    results.updated++;
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active': return 'active';
    case 'trialing': return 'trialing';
    case 'past_due': return 'past_due';
    case 'canceled': return 'canceled';
    case 'unpaid': return 'past_due';
    case 'incomplete': return 'incomplete';
    case 'incomplete_expired': return 'expired';
    case 'paused': return 'past_due';
    default: return 'expired';
  }
}
