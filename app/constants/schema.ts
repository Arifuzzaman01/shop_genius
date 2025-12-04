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
