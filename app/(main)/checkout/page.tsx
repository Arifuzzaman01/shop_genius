"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
    const { cartItems, cartCount, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string>('');
    
    // Refs for form inputs
    const streetRef = useRef<HTMLInputElement>(null);
    const cityRef = useRef<HTMLInputElement>(null);
    const stateRef = useRef<HTMLInputElement>(null);
    const zipCodeRef = useRef<HTMLInputElement>(null);
    const countryRef = useRef<HTMLInputElement>(null);
    const cardNumberRef = useRef<HTMLInputElement>(null);
    const cardExpiryRef = useRef<HTMLInputElement>(null);
    const cardCvcRef = useRef<HTMLInputElement>(null);
    const cardNameRef = useRef<HTMLInputElement>(null);

    // Handle successful payment
    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            // Payment was successful, clear the cart
            clearCart();
            // Generate a unique order ID
            setOrderId(sessionId);
        }
    }, [searchParams, clearCart]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate user is logged in
            if (!session?.user?.email) {
                throw new Error('You must be logged in to complete checkout');
            }

            // Validate shipping address fields
            if (!streetRef.current?.value || !cityRef.current?.value || 
                !stateRef.current?.value || !zipCodeRef.current?.value || 
                !countryRef.current?.value) {
                throw new Error('Please fill in all shipping address fields');
            }

            // Validate card details
            if (!cardNumberRef.current?.value || !cardExpiryRef.current?.value || 
                !cardCvcRef.current?.value || !cardNameRef.current?.value) {
                throw new Error('Please fill in all card details');
            }

            // Validate card number format (simple validation)
            const cardNumber = cardNumberRef.current.value.replace(/\s/g, '');
            if (cardNumber.length < 13 || cardNumber.length > 19 || isNaN(Number(cardNumber))) {
                throw new Error('Please enter a valid card number');
            }

            // Prepare shipping address
            const shippingAddress = {
                street: streetRef.current.value,
                city: cityRef.current.value,
                state: stateRef.current.value,
                zipCode: zipCodeRef.current.value,
                country: countryRef.current.value
            };

            // Prepare payment data according to the schema
            const paymentData = {
                userEmail: session.user.email,
                orderId: `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                amount: calculateTotal(),
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
                // billingAddress: shippingAddress // Using same address for billing
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

            // On successful payment creation, redirect to success page
            clearCart();
            router.push(`/checkout/success?session_id=${result.orderId || paymentData.orderId}`);
        } catch (err) {
            console.error('Error during checkout:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // If cart is empty, redirect to cart page
    useEffect(() => {
        if (cartItems.length === 0) {
            router.push('/card');
        }
    }, [cartItems, router]);

    // If cart is empty, show nothing while redirecting
    if (cartItems.length === 0) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <form onSubmit={handleCheckout}>
                <div className="">  // grid grid-cols-1 lg:grid-cols-3 gap-8
                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 border-b border-gray-400 mb-5 pb-5'>
                                    {cartItems.map((item, index) => (
                                        <div key={index} className="flex justify-between py-4 border-b border-dashed border-gray-500">
                                            <div>
                                                <h3 className="font-medium">{item.productName}</h3>
                                                <p className="text-gray-600">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className='md:flex md:items-center md:justify-between gap-7'>
                                    <div className='flex-1'>
                                        <h3 className="font-bold py-3">Shipping Address</h3>
                                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 '>
                                            <div>
                                                <label className='font-medium text-sm'>Street</label>
                                                <input 
                                                    type="text" 
                                                    name="street" 
                                                    ref={streetRef}
                                                    placeholder="Street Address" 
                                                    className="w-full px-2 py-1 border" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className='font-medium text-sm'>City</label>
                                                <input 
                                                    type="text" 
                                                    name="city" 
                                                    ref={cityRef}
                                                    placeholder="City" 
                                                    className="w-full px-2 py-1 border" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className='font-medium text-sm'>State</label>
                                                <input 
                                                    type="text" 
                                                    name="state" 
                                                    ref={stateRef}
                                                    placeholder="State" 
                                                    className="w-full px-2 py-1 border" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className='font-medium text-sm'>Zip Code</label>
                                                <input 
                                                    type="text" 
                                                    name="zipCode" 
                                                    ref={zipCodeRef}
                                                    placeholder="Zip Code" 
                                                    className="w-full px-2 py-1 border" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className='font-medium text-sm'>Country</label>
                                                <input 
                                                    type="text" 
                                                    name="country" 
                                                    ref={countryRef}
                                                    placeholder="Country" 
                                                    className="w-full px-2 py-1 border" 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        <h3 className="font-bold py-3 mt-6">Payment Information</h3>
                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                            <div className="md:col-span-1">
                                                <label className='font-medium text-sm'>Cardholder Name</label>
                                                <input 
                                                    type="text" 
                                                    name="cardName" 
                                                    ref={cardNameRef}
                                                    placeholder="Full Name" 
                                                    className="w-full px-2 py-1 border" 
                                                    required 
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className='font-medium text-sm'>Card Number</label>
                                                <input 
                                                    type="text" 
                                                    name="cardNumber" 
                                                    ref={cardNumberRef}
                                                    placeholder="1234 5678 9012 3456" 
                                                    className="w-full px-2 py-1 border" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className='font-medium text-sm'>Expiry Date</label>
                                                <input 
                                                    type="text" 
                                                    name="cardExpiry" 
                                                    ref={cardExpiryRef}
                                                    placeholder="MM/YY" 
                                                    className="w-full px-2 py-1 border" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className='font-medium text-sm'>CVC</label>
                                                <input 
                                                    type="text" 
                                                    name="cardCvc" 
                                                    ref={cardCvcRef}
                                                    placeholder="123" 
                                                    className="w-full px-2 py-1 border" 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* ...
                                    <div className="mt-6 pt-4 border-t border-gray-400 flex-1">
                                        <div className="flex justify-between mb-2">
                                            <span>Subtotal</span>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>Shipping</span>
                                            <span>Free</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>Tax</span>
                                            <span>$0.00</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-400">
                                            <span>Total</span>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <div className="flex gap-2 items-center">
                                <h2 className="text-xl font-bold mb-4">Payment Details</h2>
                                <p> <span>Total Quantity: {cartItems.reduce((total, item) => total + item.quantity, 0)}</span>, <span>Amount: {calculateTotal().toFixed(2)} BDT</span></p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    disabled={loading || !session?.user?.email}
                                    className="w-full bg-shop_dark_green hover:bg-shop_btn_dark_green py-6 text-lg"
                                >
                                    {loading ? 'Processing...' : 'Pay Now'}
                                </Button>

                                {!session?.user?.email && (
                                    <p className="text-red-500 text-sm">You must be logged in to complete checkout</p>
                                )}

                                <button
                                    type="button"
                                    onClick={() => router.push('/card')}
                                    className="w-full py-3 text-shop_dark_green font-medium hover:underline"
                                >
                                    Back to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}