import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null;

// Helper to ensure stripe is initialized
export function getStripe() {
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return stripe;
}

