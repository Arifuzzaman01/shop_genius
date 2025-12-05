import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CartItem } from '@/contexts/CartContext';

export async function POST(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { cartItems, shippingAddress }: { cartItems: CartItem[], shippingAddress: any } = await req.json();

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      return new Response(
        JSON.stringify({ error: 'Shipping address is incomplete' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Prepare payment data according to your schema
    const paymentData = {
      userEmail: session.user?.email,
      orderId: `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      amount: totalAmount,
      currency: 'BDT',
      paymentMethod: 'card',
      paymentStatus: 'completed',
      transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: shippingAddress,
      billingAddress: shippingAddress // Using same address for billing
    };

    // Send payment data to your server endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to process payment');
    }

    return new Response(
      JSON.stringify({ orderId: result.orderId || paymentData.orderId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}