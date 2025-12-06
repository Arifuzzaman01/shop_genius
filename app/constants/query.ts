import { useQuery } from "@tanstack/react-query";
import { Category, Product } from "./schema";

// Define a proper async function to fetch categories data
export async function fetchCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${baseUrl}/products/by-category`);

    if (!res.ok) {
      // Handle specific error cases
      if (res.status === 503 || res.status === 500) {
        throw new Error(`Service temporarily unavailable. Please try again later.`);
      }
      throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (err: any) {
    console.error("Error fetching categories:", err);
    
    // Check if it's a database connection error
    if (err.message && err.message.includes("Database connection not ready")) {
      throw new Error("The server is currently unavailable. Please try again in a few moments.");
    }
    
    // Return empty array as fallback but re-throw the error for proper error handling
    throw err;
  }
}

// Define a proper async function to fetch products


// Define a custom hook for using categories with TanStack Query
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });
}

export function useCategoryById(id: string) {
  return useQuery<Category>({
    queryKey: ["category", id],
    queryFn: async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/products/by-category/${id}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch category: ${res.status} ${res.statusText}`);
        }

        return res.json();
      } catch (err) {
        console.error("Error fetching category:", err);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Define a custom hook for using products with TanStack Query
