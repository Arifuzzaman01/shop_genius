/**
 * Product & Category Validation Utilities
 */

import { CreateProductInput, CreateCategoryInput, ProductFormData, CategoryFormData } from "@/app/constants/schema";

export interface ProductValidationErrors {
  productName?: string;
  price?: string;
  stock?: string;
  minStockThreshold?: string;
  category?: string;
  brand?: string;
  productImage?: string;
  discount?: string;
}

export interface CategoryValidationErrors {
  categoryName?: string;
  description?: string;
}

/**
 * Validate product form data
 */
export function validateProductForm(data: ProductFormData): { isValid: boolean; errors: ProductValidationErrors } {
  const errors: ProductValidationErrors = {};
  
  // Product Name validation
  if (!data.productName || data.productName.trim().length === 0) {
    errors.productName = "Product name is required";
  } else if (data.productName.trim().length < 2) {
    errors.productName = "Product name must be at least 2 characters";
  } else if (data.productName.trim().length > 100) {
    errors.productName = "Product name must not exceed 100 characters";
  }

  // Price validation
  if (!data.price) {
    errors.price = "Price is required";
  } else {
    const price = parseFloat(data.price);
    if (isNaN(price)) {
      errors.price = "Price must be a valid number";
    } else if (price < 0) {
      errors.price = "Price cannot be negative";
    } else if (price > 1000000) {
      errors.price = "Price seems too high";
    }
  }

  // Stock validation
  if (!data.stock) {
    errors.stock = "Stock quantity is required";
  } else {
    const stock = parseInt(data.stock);
    if (isNaN(stock)) {
      errors.stock = "Stock must be a valid number";
    } else if (stock < 0) {
      errors.stock = "Stock cannot be negative";
    }
  }

  // Minimum Stock Threshold validation
  if (data.minStockThreshold) {
    const threshold = parseInt(data.minStockThreshold);
    if (isNaN(threshold)) {
      errors.minStockThreshold = "Minimum stock threshold must be a valid number";
    } else if (threshold < 0) {
      errors.minStockThreshold = "Minimum stock threshold cannot be negative";
    }
  }

  // Category validation
  if (!data.category || data.category.length === 0) {
    errors.category = "At least one category is required";
  }

  // Brand validation (optional)
  if (data.brand && data.brand.trim().length > 50) {
    errors.brand = "Brand name must not exceed 50 characters";
  }

  // Product Image URL validation (optional)
  if (data.productImage) {
    try {
      new URL(data.productImage);
    } catch {
      errors.productImage = "Please enter a valid image URL";
    }
  }

  // Discount validation (optional)
  if (data.discount) {
    const discount = parseFloat(data.discount);
    if (isNaN(discount)) {
      errors.discount = "Discount must be a valid number";
    } else if (discount < 0 || discount > 100) {
      errors.discount = "Discount must be between 0 and 100";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate category form data
 */
export function validateCategoryForm(data: CategoryFormData): { isValid: boolean; errors: CategoryValidationErrors } {
  const errors: CategoryValidationErrors = {};
  
  // Category Name validation
  if (!data.categoryName || data.categoryName.trim().length === 0) {
    errors.categoryName = "Category name is required";
  } else if (data.categoryName.trim().length < 2) {
    errors.categoryName = "Category name must be at least 2 characters";
  } else if (data.categoryName.trim().length > 50) {
    errors.categoryName = "Category name must not exceed 50 characters";
  }

  // Description validation (optional)
  if (data.description && data.description.length > 500) {
    errors.description = "Description must not exceed 500 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate CreateProductInput object
 */
export function validateCreateProductInput(data: CreateProductInput): string[] {
  const errors: string[] = [];
  
  if (!data.productName || data.productName.trim().length < 2) {
    errors.push("Product name must be at least 2 characters");
  }
  
  if (!data.price || data.price < 0) {
    errors.push("Price must be a positive number");
  }
  
  if (data.stock === undefined || data.stock < 0) {
    errors.push("Stock must be a non-negative number");
  }
  
  if (!data.category || data.category.length === 0) {
    errors.push("At least one category is required");
  }

  if (data.discount !== undefined && (data.discount < 0 || data.discount > 100)) {
    errors.push("Discount must be between 0 and 100");
  }

  return errors;
}

/**
 * Validate CreateCategoryInput object
 */
export function validateCreateCategoryInput(data: CreateCategoryInput): string[] {
  const errors: string[] = [];
  
  if (!data.categoryName || data.categoryName.trim().length < 2) {
    errors.push("Category name must be at least 2 characters");
  }
  
  if (data.description && data.description.length > 500) {
    errors.push("Description must not exceed 500 characters");
  }

  return errors;
}

/**
 * Check if product is out of stock based on minimum threshold
 */
export function isProductOutOfStock(stock: number, minStockThreshold?: number): boolean {
  const threshold = minStockThreshold || 0;
  return stock <= threshold;
}

/**
 * Get product status based on stock
 */
export function getProductStatus(stock: number, minStockThreshold?: number): "active" | "out_of_stock" {
  return isProductOutOfStock(stock, minStockThreshold) ? "out_of_stock" : "active";
}
