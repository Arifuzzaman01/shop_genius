# Payment System Integration Guide

This document explains how the payment system works with your server's `/payments` endpoint.

## How It Works

1. Users add products to their cart
2. When ready to checkout, they navigate to `/checkout`
3. The checkout page collects the cart items and user information
4. Payment data is sent to your server's `/payments` endpoint
5. After payment processing, users are redirected to the success page

## Payment Schema

The system sends data to your server endpoint (`/payments`) in the following format:

```json
{
  "userEmail": "String (required)",
  "orderId": "String (required, unique)",
  "amount": "Number (required, min: 0)",
  "currency": "String (required, default: 'USD')",
  "paymentMethod": "String (required)",
  "paymentStatus": "String (required, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending')",
  "transactionId": "String (optional)",
  "items": [
    {
      "productId": "String (required)",
      "productName": "String (required)",
      "quantity": "Number (required, min: 1)",
      "price": "Number (required, min: 0)"
    }
  ],
  "shippingAddress": {
    "street": "String",
    "city": "String",
    "state": "String",
    "zipCode": "String",
    "country": "String"
  },
  "billingAddress": {
    "street": "String",
    "city": "String",
    "state": "String",
    "zipCode": "String",
    "country": "String"
  }
}
```

## File Structure

```
/app/(main)/checkout/page.tsx          # Checkout page UI
/app/(main)/checkout/success/page.tsx  # Success page UI
/app/api/checkout/sessions/route.ts    # Creates payment requests
/app/api/webhooks/stripe/route.ts      # Handles payment status updates (webhooks)
```

## Webhook Handling

Your server should send webhook notifications to `/api/webhooks/stripe` when payment statuses change:

- `payment.completed` - When a payment is successfully processed
- `payment.failed` - When a payment fails
- `payment.refunded` - When a payment is refunded

## Customization

You can customize the payment flow by modifying:
- `/app/(main)/checkout/page.tsx` for UI changes
- `/app/api/checkout/sessions/route.ts` for payment request parameters
- `/app/api/webhooks/stripe/route.ts` for webhook handling logic

## Testing

For testing, you can simulate payments by sending POST requests to your `/payments` endpoint with the schema above.