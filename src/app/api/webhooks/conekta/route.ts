import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';

// Conekta webhook signature verification
function verifyConektaSignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  return expected === signature;
}

interface ConektaEvent {
  type: string;
  id: string;
  data: {
    object: Record<string, unknown>;
  };
}

interface ConektaOrder {
  id: string;
  status: string;
  customer_info: { customer_id: string };
  metadata?: Record<string, string>;
  charges?: { data: Array<{ amount: number; currency: string; payment_method: { type: string } }> };
}

interface ConektaSubscription {
  id: string;
  status: string;
  customer_id: string;
  plan_id: string;
  current_period_start: number;
  current_period_end: number;
  trial_end?: number;
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-conekta-webhook-signature') ?? '';
  const secret = process.env.CONEKTA_WEBHOOK_SECRET!;

  if (secret && !verifyConektaSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: ConektaEvent;
  try {
    event = JSON.parse(rawBody) as ConektaEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // ── Idempotency check ─────────────────────────────────────────────
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id, status')
    .eq('processor', 'conekta')
    .eq('event_id', event.id)
    .single();

  if (existingEvent?.status === 'processed') {
    return NextResponse.json({ received: true, skipped: true });
  }

  const { data: webhookRecord } = await supabase
    .from('webhook_events')
    .upsert({
      processor: 'conekta',
      event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
      status: 'processing',
    }, { onConflict: 'processor,event_id' })
    .select('id')
    .single();

  try {
    await handleConektaEvent(event, supabase);

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
    console.error('Conekta webhook error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function handleConektaEvent(
  event: ConektaEvent,
  supabase: Awaited<ReturnType<typeof createServiceClient>>
) {
  switch (event.type) {
    case 'order.paid': {
      const order = event.data.object as unknown as ConektaOrder;
      const meta = order.metadata ?? {};
      const userId = meta.supabase_user_id;
      const planId = meta.plan_id;
      const subscriptionId = meta.subscription_id; // If pre-created

      if (!userId || !planId) break;

      if (subscriptionId) {
        // Update existing subscription
        await supabase
          .from('subscriptions')
          .update({ status: 'active', grace_period_ends_at: null })
          .eq('id', subscriptionId);

        // Create invoice
        const charge = order.charges?.data[0];
        if (charge) {
          await supabase.from('invoices').insert({
            subscription_id: subscriptionId,
            user_id: userId,
            amount_cents: charge.amount,
            currency: charge.currency.toUpperCase(),
            status: 'paid',
            payment_processor: 'conekta',
            processor_invoice_id: order.id,
          });
        }
      } else {
        // New subscription via OXXO or SPEI
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('trial_days')
          .eq('id', planId)
          .single();

        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const { data: sub } = await supabase
          .from('subscriptions')
          .insert({
            subscriber_type: 'user',
            user_id: userId,
            plan_id: planId,
            status: 'active',
            billing_interval: 'monthly',
            payment_processor: 'conekta',
            conekta_customer_id: order.customer_info.customer_id,
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd.toISOString(),
            trial_ends_at: plan?.trial_days
              ? new Date(Date.now() + (plan.trial_days * 86400000)).toISOString()
              : null,
          })
          .select('id')
          .single();

        if (sub) {
          const charge = order.charges?.data[0];
          if (charge) {
            await supabase.from('invoices').insert({
              subscription_id: sub.id,
              user_id: userId,
              amount_cents: charge.amount,
              currency: charge.currency.toUpperCase(),
              status: 'paid',
              payment_processor: 'conekta',
              processor_invoice_id: order.id,
            });
          }
        }
      }

      await supabase.rpc('recompute_user_product_access', { p_user_id: userId });
      break;
    }

    case 'subscription.paid': {
      const sub = event.data.object as unknown as ConektaSubscription;
      const meta = sub.metadata ?? {};
      const userId = meta.supabase_user_id;

      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('conekta_subscription_id', sub.id)
        .single();

      if (!dbSub) break;

      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          grace_period_ends_at: null,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq('id', dbSub.id);

      if (userId || dbSub.user_id) {
        await supabase.rpc('recompute_user_product_access', { p_user_id: userId ?? dbSub.user_id });
      }
      break;
    }

    case 'subscription.payment_failed': {
      const sub = event.data.object as unknown as ConektaSubscription;

      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_id')
        .eq('conekta_subscription_id', sub.id)
        .single();

      if (!dbSub) break;

      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('grace_period_days')
        .eq('id', dbSub.plan_id)
        .single();

      const graceDays = plan?.grace_period_days ?? 3;
      const gracePeriodEndsAt = new Date();
      gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + graceDays);

      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          grace_period_ends_at: gracePeriodEndsAt.toISOString(),
        })
        .eq('id', dbSub.id);

      if (dbSub.user_id) {
        await supabase.rpc('recompute_user_product_access', { p_user_id: dbSub.user_id });
      }
      break;
    }

    case 'subscription.canceled': {
      const sub = event.data.object as unknown as ConektaSubscription;

      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('conekta_subscription_id', sub.id)
        .single();

      if (!dbSub) break;

      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', canceled_at: new Date().toISOString() })
        .eq('id', dbSub.id);

      if (dbSub.user_id) {
        await supabase.rpc('recompute_user_product_access', { p_user_id: dbSub.user_id });
      }
      break;
    }
  }
}
