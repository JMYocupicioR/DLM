import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' });
}

/**
 * POST /api/subscription/cancel
 * Set subscription to cancel at period end.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, stripe_subscription_id')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!sub?.stripe_subscription_id) {
    return NextResponse.json(
      { error: 'No hay suscripción activa para cancelar' },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('id', sub.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    return NextResponse.json(
      { error: 'Error al procesar la cancelación' },
      { status: 500 }
    );
  }
}
