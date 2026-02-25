import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // ── Idempotency check ─────────────────────────────────────────────
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id, status')
    .eq('processor', 'stripe')
    .eq('event_id', event.id)
    .single();

  if (existingEvent?.status === 'processed') {
    return NextResponse.json({ received: true, skipped: true });
  }

  // Record webhook event
  const { data: webhookRecord } = await supabase
    .from('webhook_events')
    .upsert({
      processor: 'stripe',
      event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
      status: 'processing',
    }, { onConflict: 'processor,event_id' })
    .select('id')
    .single();

  try {
    await handleStripeEvent(event, supabase, stripe);

    // Mark as processed
    if (webhookRecord?.id) {
      await supabase
        .from('webhook_events')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('id', webhookRecord.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (webhookRecord?.id) {
      await supabase
        .from('webhook_events')
        .update({ status: 'failed', error_message: errorMessage })
        .eq('id', webhookRecord.id);
    }
    console.error('Stripe webhook error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function handleStripeEvent(
  event: Stripe.Event,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  stripe: Stripe
) {
  switch (event.type) {
    case 'checkout.session.completed': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = event.data.object as any;
      if (session.mode !== 'subscription') break;

      const meta = session.subscription_data?.metadata ?? {};
      const userId = meta.supabase_user_id;
      const planId = meta.plan_id;
      const billingInterval = meta.billing_interval ?? 'monthly';
      const clinicId = meta.clinic_id || null;

      if (!userId || !planId) break;

      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = stripeSubscription as any;

      const subscriberType = clinicId ? 'clinic' : 'user';

      await supabase.from('subscriptions').upsert({
        subscriber_type: subscriberType,
        user_id: subscriberType === 'user' ? userId : null,
        clinic_id: subscriberType === 'clinic' ? clinicId : null,
        plan_id: planId,
        status: sub.status === 'trialing' ? 'trialing' : 'active',
        billing_interval: billingInterval,
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer as string,
        payment_processor: 'stripe',
        trial_ends_at: sub.trial_end
          ? new Date(sub.trial_end * 1000).toISOString()
          : null,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'stripe_subscription_id' });

      await supabase.rpc('recompute_user_product_access', { p_user_id: userId });

      await supabase.from('audit_log').insert({
        actor_id: userId,
        action: 'subscription_created',
        target_type: 'subscription',
        after: { plan_id: planId, status: 'active', processor: 'stripe' },
      });
      break;
    }

    case 'invoice.payment_succeeded': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any;
      const stripeSubId = invoice.subscription as string;
      if (!stripeSubId) break;

      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('id, user_id, clinic_id')
        .eq('stripe_subscription_id', stripeSubId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbSubData = dbSub as any;
      if (!dbSubData) break;

      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stripeSubAny = stripeSub as any;

      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          grace_period_ends_at: null,
          current_period_start: new Date(stripeSubAny.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubAny.current_period_end * 1000).toISOString(),
        })
        .eq('id', dbSubData.id);

      await supabase.from('invoices').insert({
        subscription_id: dbSubData.id,
        user_id: dbSubData.user_id,
        clinic_id: dbSubData.clinic_id,
        amount_cents: invoice.amount_paid,
        currency: (invoice.currency as string).toUpperCase(),
        tax_cents: invoice.tax ?? 0,
        status: 'paid',
        payment_processor: 'stripe',
        processor_invoice_id: invoice.id,
        period_start: new Date(stripeSubAny.current_period_start * 1000).toISOString(),
        period_end: new Date(stripeSubAny.current_period_end * 1000).toISOString(),
      });

      if (dbSubData.user_id) {
        await supabase.rpc('recompute_user_product_access', { p_user_id: dbSubData.user_id });
      }
      break;
    }

    case 'invoice.payment_failed': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any;
      const stripeSubId = invoice.subscription as string;
      if (!stripeSubId) break;

      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_id')
        .eq('stripe_subscription_id', stripeSubId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbSubData = dbSub as any;
      if (!dbSubData) break;

      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('grace_period_days')
        .eq('id', dbSubData.plan_id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const planData = plan as any;
      const graceDays = planData?.grace_period_days ?? 3;
      const gracePeriodEndsAt = new Date();
      gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + graceDays);

      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          grace_period_ends_at: gracePeriodEndsAt.toISOString(),
        })
        .eq('id', dbSubData.id);

      if (dbSubData.user_id) {
        await supabase.rpc('recompute_user_product_access', { p_user_id: dbSubData.user_id });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = event.data.object as any;

      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbSubData = dbSub as any;
      if (!dbSubData) break;

      await supabase
        .from('subscriptions')
        .update({ status: 'expired', canceled_at: new Date().toISOString() })
        .eq('id', dbSubData.id);

      if (dbSubData.user_id) {
        await supabase.rpc('recompute_user_product_access', { p_user_id: dbSubData.user_id });
      }

      await supabase.from('audit_log').insert({
        action: 'subscription_expired',
        target_type: 'subscription',
        target_id: dbSubData.id,
        after: { status: 'expired', processor: 'stripe' },
      });
      break;
    }

    case 'customer.subscription.updated': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = event.data.object as any;

      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbSubData = dbSub as any;
      if (!dbSubData) break;

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status as string,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', dbSubData.id);

      if (dbSubData.user_id) {
        await supabase.rpc('recompute_user_product_access', { p_user_id: dbSubData.user_id });
      }
      break;
    }
  }
}
