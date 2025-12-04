"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCart } from "@/contexts/CartContext";

function CardIcon() {
  const { cartCount } = useCart();
  
  return (
    <Link href={"/card"} className="relative group">
      <ShoppingBag className="w-5 h-5 hover:text-shop_light_green hoverEffect" />
      <span className="absolute -top-1 -right-1 bg-shop_dark_green text-white h-3.5 w-3.5 rounded-full text-xs flex justify-center items-center font-semibold">
        {cartCount}
      </span>
    </Link>
  );
}

export default CardIcon;