import Stripe from 'stripe';

const STRIPE_API_VERSION = '2026-01-28.clover';
const DEFAULT_SITE_URL = 'http://localhost:9002';

/**
 * Returns a singleton Stripe instance. Fails fast if STRIPE_SECRET_KEY is missing.
 */
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY no está configurado. Añádelo a .env.local para cobros con tarjeta.'
    );
  }
  _stripe = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
  return _stripe;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET no está configurado. Configúralo con `stripe listen --forward-to ...`.'
    );
  }
  return secret;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
}

export { STRIPE_API_VERSION };
