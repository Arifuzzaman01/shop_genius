"use client";

import { useEffect } from "react";
import { useCart } from "@/app/hooks/useCartRedux";

const CartCountUpdater = () => {
  const { cartCount } = useCart();

  useEffect(() => {
    // Update the cart count in the DOM
    const placeholder = document.getElementById('cart-count-placeholder');
    if (placeholder) {
      placeholder.textContent = cartCount.toString();
    }
  }, [cartCount]);

  return null; // This component doesn't render anything
};

export default CartCountUpdater;