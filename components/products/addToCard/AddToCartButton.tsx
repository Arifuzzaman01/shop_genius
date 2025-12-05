"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Product } from "@/app/constants/schema";
import { ShoppingBag } from "lucide-react";
import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addToCart, isLoading } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const outOfStock = product.stock === 0;
  
  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!session) {
      // Redirect to login page with callback URL to current page
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    await addToCart(product);
  }
  
  return (
    <div>
      <Button
        onClick={handleAddToCart}
        disabled={outOfStock || isLoading}
        className={cn(
          "bg-shop_btn_dark_green/80 w-full text-shop_light_bg shadow-none border border-shop_dark_green/80 font-semibold tracking-wider hover:text-white hover:bg-shop_dark_green hover:border-shop_dark_green hoverEffect"
        )}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        {isLoading ? "Adding..." : outOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
};

export default AddToCartButton;