import { loadStripe, Stripe } from '@stripe/stripe-js'

// Ensure the Stripe publishable key is available
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}

// Initialize Stripe with the publishable key
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}; 