# Stripe Integration Guide for Shrobe

This guide outlines how to set up and use the Stripe payment integration for the Shrobe marketplace.

## Overview

The Stripe integration allows users to:
- Make secure payments for clothing items
- Process credit/debit cards, Apple Pay, and Google Pay
- Create order records in the database
- View order confirmations and history

## Setup

1. Create an account on [Stripe Dashboard](https://dashboard.stripe.com)
2. Copy your API keys from the dashboard
3. Create a `.env.local` file in the project root with the following:

```
# Stripe API keys - Replace with your own keys from the Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key

# Stripe Webhook Secret for handling events (optional for local development)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_if_needed

# Domain URL for webhooks and success/cancel URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the Supabase migration to create the orders tables

## Components

### Client Side
- `lib/stripe.ts` - Configures the Stripe client
- `components/checkout/checkout-form.tsx` - Stripe Elements form component
- `app/checkout/page.tsx` - Checkout page with order summary
- `app/checkout/success/page.tsx` - Success page after payment

### Server Side
- `app/api/payment/create-intent/route.ts` - API route for creating payment intents
- `lib/commerce.ts` - Functions for processing checkout and order creation
- `supabase/migrations/20240701000000_create_order_tables.sql` - Database tables for orders

## Local Testing

For testing Apple Pay and Google Pay locally, you need to run the site over HTTPS. You can use the Stripe CLI to set up a local HTTPS proxy:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run `stripe listen --forward-to localhost:3000/api/webhook`
3. Use the provided webhook secret in your `.env.local` file

## Development Notes

### Supported Payment Methods
- Credit/Debit cards
- Apple Pay (requires HTTPS)
- Google Pay (requires HTTPS)

### Webhooks
For production, configure webhooks in the Stripe dashboard to ensure order fulfillment in case of client-side errors during payment completion.

### Testing Cards
Use Stripe's test cards for development:
- Success: `4242 4242 4242 4242`
- Requires Authentication: `4000 0027 6000 3184`
- Declined: `4000 0000 0000 0002`

Full test card list: [Stripe Test Cards](https://stripe.com/docs/testing#cards)

## Customization

The Stripe Elements UI is customized to match Shrobe's design using the following configuration in `app/checkout/page.tsx`:

```javascript
options={{
  clientSecret,
  appearance: {
    theme: 'night',
    variables: {
      colorPrimary: '#FF5CB1',
      borderRadius: '12px',
    },
  },
}}
```

You can further customize the appearance by modifying these options.

## Troubleshooting

- **"Stripe not initialized" error**: Check that your environment variables are set correctly
- **Payment methods not appearing**: For Apple/Google Pay, ensure you're running on HTTPS
- **Order not created**: Check the Supabase logs and ensure database tables are created
- **Payment failed**: Review the error message in the Stripe Dashboard

## Production Considerations

1. Use `sk_live_` and `pk_live_` keys in production
2. Set up proper webhook handling
3. Implement proper error handling and notifications
4. Consider adding fraud prevention measures
5. Test thoroughly with real payments in Stripe test mode 