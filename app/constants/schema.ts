export interface Product {
    _id: string;
    productName: string;
    slug: string;
    productImage: string[];
    description?: string;
    price: number;
    discount?: number;
    category: string[];
    stock: number;
    brand?: string;
    rating?: number;
    status?: "sales" | "hot" | "new" | "out of stock";
    variant?: "gadget" | "appliances" | "refrigerators" | "others";
    featured?: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface Category {
    categoryId: string;
    categoryName: string;
    slug: string;
    image?: {
        asset: {
            url: string;
        };
    }
    productCount: number;
}

// Management-specific interfaces
export interface CreateCategoryInput {
    categoryName: string;
    description?: string;
    status?: "active" | "inactive";
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
    categoryId: string;
}

export interface CreateProductInput {
    productName: string;
    description?: string;
    price: number;
    stock: number;
    minStockThreshold?: number;
    category: string[]; // Array of category IDs
    brand?: string;
    productImage?: string[];
    status?: "active" | "out_of_stock";
    discount?: number;
    featured?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
    _id: string;
}

export interface ProductFormData {
    productName: string;
    description: string;
    price: string;
    stock: string;
    minStockThreshold: string;
    category: string[];
    brand: string;
    productImage: string;
    status: "active" | "out_of_stock";
    discount: string;
    featured: boolean;
}

export interface CategoryFormData {
    categoryName: string;
    description: string;
    status: "active" | "inactive";
}
