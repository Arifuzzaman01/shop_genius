/**
 * Category API Utilities
 * Handles all category-related API calls
 */

import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/app/constants/schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/products/by-category`);
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Categories endpoint not found. Please check API configuration.");
      }
      if (res.status >= 500) {
        throw new Error("Server temporarily unavailable. Please try again later.");
      }
      throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
    }

    // Check content type
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("API returned non-JSON response:", res.status);
      throw new Error("Invalid response from server");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

/**
 * Create a new category
 */
export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  try {
    const response = await fetch(`${API_URL}/categories`, {
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
          throw new Error("Categories endpoint not found. Please check API configuration.");
        }
        throw new Error(`Server returned status ${response.status}. Please try again.`);
      }

      const errorData = await response.json();
      
      if (response.status === 409) {
        throw new Error("A category with this name already exists.");
      }
      if (response.status === 400) {
        throw new Error(errorData.message || "Invalid category data.");
      }
      throw new Error(errorData.message || "Failed to create category.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(data: UpdateCategoryInput): Promise<Category> {
  try {
    const response = await fetch(`${API_URL}/categories/${data.categoryId}`, {
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
          throw new Error("Category not found.");
        }
        throw new Error(`Server returned status ${response.status}.`);
      }

      const errorData = await response.json();
      
      if (response.status === 404) {
        throw new Error("Category not found.");
      }
      if (response.status === 400) {
        throw new Error(errorData.message || "Invalid category data.");
      }
      throw new Error(errorData.message || "Failed to update category.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Category not found.");
      }
      if (response.status === 400) {
        throw new Error("Cannot delete category with associated products.");
      }
      throw new Error(`Failed to delete category: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}
