"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // In a real application, you might want to fetch order details from your API
    // For now, we'll just display the order ID from the URL
    if (sessionId) {
      setOrderDetails({
        orderId: sessionId,
        orderDate: new Date().toLocaleDateString(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          
          {orderDetails && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md text-left">
              <h3 className="font-bold text-lg mb-2">Order Details</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Order ID:</span> {orderDetails.orderId}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Order Date:</span> {orderDetails.orderDate}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Estimated Delivery:</span> {orderDetails.estimatedDelivery}
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-8 space-y-4">
            <Link href="/" className="block">
              <Button className="w-full bg-shop_dark_green hover:bg-shop_btn_dark_green py-3">
                Continue Shopping
              </Button>
            </Link>
            
            <button 
              onClick={() => router.push('/orders')}
              className="w-full py-3 text-shop_dark_green font-medium hover:underline"
            >
              View Order History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}