import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the raw body as text
    const rawBody = await req.text();
    
    // Try to parse as JSON
    let eventData;
    try {
      eventData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Webhook body parsing failed.', parseError);
      return new Response(`Webhook Error: Invalid JSON`, {
        status: 400,
      });
    }
    
    // Extract event type and data
    const eventType = eventData.type || 'unknown';
    const data = eventData.data || eventData;
    
    // Handle different event types from your payment system
    switch (eventType) {
      case 'payment.completed':
        // Handle successful payment
        console.log('✅ Payment completed!', data);
        
        // Here you would typically:
        // 1. Update your database to mark the order as paid
        // 2. Send confirmation emails
        // 3. Reserve inventory
        // 4. Trigger any other fulfillment processes
        
        // Example of what you might do:
        // const orderId = data.orderId;
        // const userEmail = data.userEmail;
        // await updateOrderStatus(orderId, 'completed');
        // await sendConfirmationEmail(userEmail, orderId);
        break;
        
      case 'payment.failed':
        // Handle failed payment
        console.log('❌ Payment failed!', data);
        
        // Update order status to failed
        // const orderId = data.orderId;
        // await updateOrderStatus(orderId, 'failed');
        break;
        
      case 'payment.refunded':
        // Handle refunded payment
        console.log('↩️ Payment refunded!', data);
        
        // Update order status to refunded
        // const orderId = data.orderId;
        // await updateOrderStatus(orderId, 'refunded');
        break;
        
      default:
        console.log(`Unhandled event type ${eventType}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}