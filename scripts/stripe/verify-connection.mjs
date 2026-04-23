import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
  process.env.STRIPE_PUBLISHABLE_KEY?.trim();

if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY in .env.local or .env');
  process.exit(1);
}

if (!publishableKey) {
  console.error('Missing STRIPE_PUBLISHABLE_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  process.exit(1);
}

const stripe = new Stripe(secretKey, { apiVersion: '2026-01-28.clover' });

async function run() {
  const account = await stripe.accounts.retrieve();
  const prices = await stripe.prices.list({ active: true, limit: 5 });
  const products = await stripe.products.list({ active: true, limit: 5 });

  console.log('Stripe connection verified.');
  console.log(`Account id: ${account.id}`);
  console.log(`Account country: ${account.country ?? 'n/a'}`);
  console.log(`Active prices found: ${prices.data.length}`);
  console.log(`Active products found: ${products.data.length}`);
  console.log(`Publishable key prefix: ${publishableKey.slice(0, 12)}...`);
}

run().catch((error) => {
  console.error('Stripe connection check failed:', error?.message ?? error);
  process.exit(1);
});
