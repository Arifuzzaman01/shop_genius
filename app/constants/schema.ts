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
    _id?: string;
    categoryId?: string;
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

// Order Management interfaces
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    price: number;
    discount?: number;
}

export interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    orderItems?: OrderItem[];
    items?: OrderItem[];
    subtotal: number;
    tax?: number;
    shippingCost?: number;
    total: number;
    status: OrderStatus;
    shippingAddress?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateOrderInput {
    customerName: string;
    customerEmail?: string;
    orderItems?: OrderItem[];
    items?: OrderItem[];
    shippingAddress?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    notes?: string;
}

export interface UpdateOrderInput extends Partial<CreateOrderInput> {
    _id: string;
    status?: OrderStatus;
}

export interface OrderFormData {
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    status: OrderStatus;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    notes: string;
}

// Activity Log interfaces
export type ActivityType = "order_created" | "order_updated" | "order_cancelled" | "stock_updated" | "product_added" | "product_updated" | "restock_queued" | "restock_completed";

export interface ActivityLog {
    _id: string;
    type: ActivityType;
    title: string;
    description: string;
    userId?: string;
    userName?: string;
    relatedEntityId?: string; // order ID, product ID, etc.
    relatedEntityType?: string; // "order", "product", etc.
    metadata?: { [key: string]: string | number | boolean | null };
    createdAt: Date;
}

// Restock Queue interfaces
export type RestockPriority = "high" | "medium" | "low";

export interface RestockQueueItem {
    _id: string;
    productId: string;
    productName: string;
    productImage?: string;
    currentStock: number;
    minStockThreshold: number;
    suggestedRestockQuantity: number;
    priority: RestockPriority;
    addedAt: Date;
    restockedAt?: Date;
    status: "pending" | "restocked" | "removed";
}
