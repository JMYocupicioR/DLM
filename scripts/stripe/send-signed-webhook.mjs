import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
const webhookUrl =
  process.env.STRIPE_WEBHOOK_URL?.trim() ||
  'http://localhost:9002/api/webhooks/stripe';

if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY in .env.local or .env');
  process.exit(1);
}

if (!webhookSecret) {
  console.error('Missing STRIPE_WEBHOOK_SECRET in .env.local or .env');
  process.exit(1);
}

const stripe = new Stripe(secretKey, { apiVersion: '2026-01-28.clover' });
const eventType = process.argv[2]?.trim() || 'customer.subscription.updated';

const mockEvent = {
  id: `evt_local_${Date.now()}`,
  object: 'event',
  api_version: '2026-01-28.clover',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: `sub_local_${Date.now()}`,
      object: 'subscription',
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      metadata: { source: 'local-script' },
    },
  },
  livemode: false,
  pending_webhooks: 1,
  request: { id: null, idempotency_key: null },
  type: eventType,
};

const payload = JSON.stringify(mockEvent);
const signature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: webhookSecret,
});

async function run() {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': signature,
    },
    body: payload,
  });

  const text = await response.text();

  console.log(`POST ${webhookUrl}`);
  console.log(`Event type: ${eventType}`);
  console.log(`HTTP ${response.status}`);
  console.log(text);

  if (!response.ok) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error('Signed webhook test failed:', error?.message ?? error);
  process.exit(1);
});
