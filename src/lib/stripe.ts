import Stripe from 'stripe';

const STRIPE_API_VERSION = '2026-01-28.clover';

/**
 * Returns a singleton Stripe instance. Fails fast if STRIPE_SECRET_KEY is missing.
 */
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY no está configurado. Añádelo a .env.local para cobros con tarjeta.'
    );
  }
  _stripe = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
  return _stripe;
}

export { STRIPE_API_VERSION };
