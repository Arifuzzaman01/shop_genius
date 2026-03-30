/**
 * Product API Utilities
 * Handles all product-related API calls
 */

import { Product, CreateProductInput, UpdateProductInput } from "@/app/constants/schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Fetch all products
 */
export async function fetchProducts(type?: string): Promise<Product[]> {
  try {
    const url = type 
      ? `${API_URL}/products?type=${type.toLowerCase()}`
      : `${API_URL}/products`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Products endpoint not found. Please check API configuration.");
      }
      if (res.status >= 500) {
        throw new Error("Server temporarily unavailable. Please try again later.");
      }
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }

    // Check content type
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("API returned non-JSON response:", res.status);
      throw new Error("Invalid response from server");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`);
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Product not found.");
      }
      if (res.status >= 500) {
        throw new Error("Server temporarily unavailable. Please try again later.");
      }
      throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("API returned non-JSON response:", res.status);
      throw new Error("Invalid response from server");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

/**
 * Create a new product
 */
export async function createProduct(data: CreateProductInput): Promise<Product> {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        if (response.status === 404) {
          throw new Error("Products endpoint not found. Please check API configuration.");
        }
        throw new Error(`Server returned status ${response.status}. Please try again.`);
      }

      const errorData = await response.json();
      
      if (response.status === 409) {
        throw new Error("A product with this name already exists.");
      }
      if (response.status === 400) {
        throw new Error(errorData.message || "Invalid product data.");
      }
      throw new Error(errorData.message || "Failed to create product.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(data: UpdateProductInput): Promise<Product> {
  try {
    const response = await fetch(`${API_URL}/products/${data._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        if (response.status === 404) {
          throw new Error("Product not found.");
        }
        throw new Error(`Server returned status ${response.status}.`);
      }

      const errorData = await response.json();
      
      if (response.status === 404) {
        throw new Error("Product not found.");
      }
      if (response.status === 400) {
        throw new Error(errorData.message || "Invalid product data.");
      }
      throw new Error(errorData.message || "Failed to update product.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Product not found.");
      }
      throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

/**
 * Update product stock
 */
export async function updateProductStock(productId: string, stock: number): Promise<Product> {
  try {
    const response = await fetch(`${API_URL}/products/${productId}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stock }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        if (response.status === 404) {
          throw new Error("Product not found.");
        }
        throw new Error(`Server returned status ${response.status}.`);
      }

      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update product stock.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
}
