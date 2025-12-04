"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface CartItem {
  productId: string;
  productName: string;
  productImage: string[];
  price: number;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  // Calculate total cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Load cart from backend when user logs in
  useEffect(() => {
    if (session?.user?.email) {
      loadCartFromBackend();
    }
  }, [session]);

  const loadCartFromBackend = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/addToCart?email=${session?.user?.email}`);
      if (response.ok) {
        const cartData = await response.json();
        // Transform the data to match our CartItem structure
        const transformedItems = cartData.map((item: any) => ({
          productId: item.productId || item._id,
          productName: item.productName || item.name,
          productImage: item.productImage || [],
          price: item.price,
          quantity: item.quantity || 1,
          stock: item.stock || 0
        }));
        setCartItems(transformedItems);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: any) => {
    try {
      setIsLoading(true);
      
      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.productId === product._id);
      
      let updatedCartItems;
      if (existingItemIndex >= 0) {
        // Update quantity if product exists
        updatedCartItems = [...cartItems];
        const newQuantity = updatedCartItems[existingItemIndex].quantity + 1;
        
        // Check stock availability
        if (newQuantity <= product.stock) {
          updatedCartItems[existingItemIndex].quantity = newQuantity;
        } else {
          toast.error("Not enough stock available!");
          return;
        }
      } else {
        // Add new product to cart
        if (product.stock <= 0) {
          toast.error("Product is out of stock!");
          return;
        }
        
        const newItem: CartItem = {
          productId: product._id,
          productName: product.productName,
          productImage: product.productImage,
          price: product.price,
          quantity: 1,
          stock: product.stock
        };
        updatedCartItems = [...cartItems, newItem];
      }
      
      setCartItems(updatedCartItems);
      
      // Send to backend
      if (session?.user?.email) {
        const response = await fetch("http://localhost:5000/addToCart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email,
            productId: product._id,
            productName: product.productName,
            productImage: product.productImage,
            price: product.price,
            quantity: existingItemIndex >= 0 ? 
              updatedCartItems[existingItemIndex].quantity : 1,
            stock: product.stock
          }),
        });
        
        if (response.ok) {
          toast.success(`${product.productName} added to cart!`);
        } else {
          toast.error("Failed to add item to cart");
        }
      } else {
        toast.success(`${product.productName} added to cart!`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred while adding to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = (productId: string) => {
    const updatedCartItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCartItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCartItems = cartItems.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    );
    setCartItems(updatedCartItems);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};