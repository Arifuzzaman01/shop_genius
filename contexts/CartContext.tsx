"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface CartItem {
  _id?: string; // Add MongoDB _id for deletion
  productId: string;
  productName: string;
  productImage: string[];
  price: number;
  quantity: number;
  stock: number;
  brand?: string;
  category: string[];
  discount?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (productId: string) => void;
  removeItemPermanently: (itemId: string) => Promise<void>; // New function for permanent deletion
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addToCart?userEmail=${session?.user?.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const cartData = await response.json();
        // Transform the data to match our CartItem structure
        const transformedItems = cartData.map((item: any) => ({
          _id: item._id, // Store the MongoDB _id for deletion
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          price: item.price,
          quantity: item.quantity || 1,
          stock: item.stock || 0,
          brand: item.brand,
          category: item.category,
          discount: item.discount
        }));
        setCartItems(transformedItems);
      } else {
        console.error("Failed to load cart:", response.status, response.statusText);
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
          stock: product.stock,
          brand: product.brand,
          category: product.category,
          discount: product.discount
        };
        updatedCartItems = [...cartItems, newItem];
      }
      
      setCartItems(updatedCartItems);
      
      // Send to backend
      if (session?.user?.email) {
        const cartItemData = {
          buyerName: session.user.name || "Anonymous",
          userEmail: session.user.email,
          productId: product._id,
          productName: product.productName,
          brand: product.brand,
          category: product.category,
          discount: product.discount,
          price: product.price,
          productImage: product.productImage
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addToCart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cartItemData),
        });
        
        if (response.ok) {
          toast.success(`${product.productName} added to cart!`);
        } else {
          console.error("Failed to add item to cart:", response.status, response.statusText);
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

  // Soft remove from local state only
  const removeFromCart = (productId: string) => {
    const updatedCartItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCartItems);
  };

  // Permanent removal from server
  const removeItemPermanently = async (itemId: string) => {
    try {
      setIsLoading(true);
      
      // Call DELETE API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addToCart/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        // Remove from local state
        const updatedCartItems = cartItems.filter(item => item._id !== itemId);
        setCartItems(updatedCartItems);
        toast.success("Item removed from cart!");
      } else {
        console.error("Failed to remove item:", response.status, response.statusText);
        toast.error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("An error occurred while removing the item");
    } finally {
      setIsLoading(false);
    }
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
        removeItemPermanently, // Export the new function
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