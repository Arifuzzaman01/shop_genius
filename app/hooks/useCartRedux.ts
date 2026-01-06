"use client";

import { useDispatch, useSelector } from "react-redux";
import { 
  addToCart, 
  removeFromCart, 
  removeItemPermanently, 
  updateQuantity, 
  clearCart, 
  setLoading,
  setCartItems 
} from "../redux/cart/cartSlice";
import { RootState } from "../redux/store";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

export interface CartItem {
  _id?: string;
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

interface BackendCartItem {
  _id?: string;
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

interface Product {
  _id: string;
  productName: string;
  productImage: string[];
  price: number;
  stock: number;
  brand?: string;
  category: string[];
  discount?: number;
}

export const useCart = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { cartItems, isLoading } = useSelector((state: RootState) => state.cart);

  // Calculate total cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Load cart from backend when user logs in
  const loadCartFromBackend = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addToCart?userEmail=${session?.user?.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const cartData: BackendCartItem[] = await response.json();
        // Transform the data to match our CartItem structure
        const transformedItems = cartData.map((item: BackendCartItem) => ({
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
        dispatch(setCartItems(transformedItems));
      } else {
        console.error("Failed to load cart:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Load cart when session changes
  useEffect(() => {
    if (session?.user?.email) {
      loadCartFromBackend();
    }
  }, [session?.user?.email]); // Only run when email changes

  const handleAddToCart = async (product: Product) => {
    try {
      dispatch(setLoading(true));
      
      // Check if product already exists in cart
      const existingItem = cartItems.find(item => item.productId === product._id);
      
      if (existingItem) {
        // Update quantity if product exists
        const newQuantity = existingItem.quantity + 1;
        
        // Check stock availability
        if (newQuantity <= product.stock) {
          dispatch(updateQuantity({ productId: product._id, quantity: newQuantity }));
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
        
        dispatch(addToCart(newItem));
      }
      
      // Send to backend
      if (session?.user?.email) {
        const cartItemData = {
          buyerName: session.user.name || "Anonymous",
          userEmail: session.user.email,
          productId: product._id,
          productName: product.productName,
          brand: product.brand,
          stock: product.stock,
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
      dispatch(setLoading(false));
    }
  };

  // Soft remove from local state only
  const handleRemoveFromCart = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  // Permanent removal from server
  const handleRemoveItemPermanently = async (itemId: string) => {
    try {
      dispatch(setLoading(true));
      
      // Call DELETE API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addToCart/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        // Remove from Redux state
        dispatch(removeItemPermanently(itemId));
        toast.success("Item removed from cart!");
      } else {
        console.error("Failed to remove item:", response.status, response.statusText);
        toast.error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("An error occurred while removing the item");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    dispatch(updateQuantity({ productId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return {
    cartItems,
    cartCount,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    removeItemPermanently: handleRemoveItemPermanently,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    isLoading,
  };
};