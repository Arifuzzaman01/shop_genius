# Stripe Integration Guide

This document explains how to set up and configure Stripe payment processing in your ShopGenius application.

## Prerequisites

1. Create a Stripe account at [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Obtain your API keys from the Stripe Dashboard:
   - Publishable Key (for frontend)
   - Secret Key (for backend)
   - Webhook Signing Secret (for webhook verification)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## How It Works

1. Users add products to their cart
2. When ready to checkout, they navigate to `/checkout`
3. The checkout page calculates the total and creates a Stripe session
4. Users are redirected to Stripe's secure payment page
5. After payment, users are redirected back to the success page
6. Webhooks handle payment confirmations and order fulfillment

## File Structure

```
/lib/stripe.ts                 # Stripe initialization
/app/api/checkout/sessions/route.ts    # Creates checkout sessions
/app/api/webhooks/stripe/route.ts      # Handles Stripe webhooks
/app/(main)/checkout/page.tsx          # Checkout page UI
/app/(main)/checkout/success/page.tsx  # Success page UI
```

## Testing Payments

1. Use Stripe's test cards for development:
   - Card Number: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

2. For webhook testing, use the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Customization

You can customize the payment flow by modifying:
- `/app/(main)/checkout/page.tsx` for UI changes
- `/app/api/checkout/sessions/route.ts` for checkout session parameters
- `/app/api/webhooks/stripe/route.ts` for webhook handling logic

## Security Notes

- Never expose your secret keys in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Sanitize and validate all user inputs