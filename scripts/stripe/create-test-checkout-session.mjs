import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
let priceId = process.env.STRIPE_TEST_PRICE_ID?.trim();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:9002';

if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY in .env.local or .env');
  process.exit(1);
}

const stripe = new Stripe(secretKey, { apiVersion: '2026-01-28.clover' });
const email = process.argv[2]?.trim() || `stripe-test-${Date.now()}@deeplux.local`;

async function run() {
  if (!priceId) {
    const existingPrices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      limit: 1,
    });
    if (existingPrices.data[0]?.id) {
      priceId = existingPrices.data[0].id;
      console.log(`Using existing recurring price: ${priceId}`);
    } else {
      const product = await stripe.products.create({
        name: `DeepLux Test Plan ${Date.now()}`,
        metadata: { source: 'create-test-checkout-session-script' },
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1000,
        currency: 'mxn',
        recurring: { interval: 'month' },
        metadata: { source: 'create-test-checkout-session-script' },
      });
      priceId = price.id;
      console.log(`Created test recurring price: ${priceId}`);
    }
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      source: 'create-test-checkout-session-script',
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?payment=success&source=stripe-script`,
    cancel_url: `${siteUrl}/pricing?payment=cancelled&source=stripe-script`,
    allow_promotion_codes: true,
    metadata: {
      source: 'create-test-checkout-session-script',
    },
  });

  console.log('Checkout session created.');
  console.log(`Customer: ${customer.id}`);
  console.log(`Session: ${session.id}`);
  console.log(`URL: ${session.url}`);
}

run().catch((error) => {
  console.error('Failed to create checkout test session:', error?.message ?? error);
  process.exit(1);
});
