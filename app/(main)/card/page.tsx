"use client";

import React, { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingCart } from "lucide-react";
import Link from "next/link";
import productImg from "@/public/image/products/product_14.jpg";
const CartPage = () => {
  const { cartItems, cartCount, removeFromCart, removeItemPermanently, updateQuantity, isLoading } = useCart();

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemPermanently(itemId);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shop_light_green"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet</p>
        <Link href="/">
          <Button className="bg-shop_dark_green hover:bg-shop_btn_dark_green">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart ({cartCount} items)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
                {/* Product Image */}
                <div className="w-24 h-24 shrink-0 mr-4">
                  {item.productImage && item.productImage.length > 0 ? (
                    <Image
                      src={productImg}
                      alt={item.productName}
                      width={100}
                      height={100}
                      className="object-cover w-full h-full rounded-md"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
                  )}
                </div>
                
                {/* Product Info */}
                <div className="grow">
                  <h3 className="font-semibold text-lg">{item.productName}</h3>
                  <p className="text-shop_light_green font-bold">BDT {item.price.toFixed(2)}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 p-0 hover:bg-shop_orange hover:text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="mx-2 w-8 text-center">{item.quantity}</span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="h-8 w-8 p-0 hover:bg-shop_orange hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    <span className="ml-2 text-sm text-gray-500">
                      {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>
                
                {/* Item Total & Remove */}
                <div className="flex flex-col items-end">
                  <p className="font-bold">BDT {(item.price * item.quantity).toFixed(2)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveItem(item._id || item.productId)} // Use _id for deletion if available
                    className="mt-2 text-red-500 hover:text-red-700 hover:bg-shop_orange"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>BDT {calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>BDT0.00</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>BDT {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Link href="/checkout">
              <Button className="w-full bg-shop_dark_green hover:bg-shop_btn_dark_green py-6 text-lg">
                Proceed to Checkout
              </Button>
            </Link>            
            <Link href="/" className="block mt-4 text-center text-shop_dark_green hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;